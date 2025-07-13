<template>
  <div class="prescription-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <el-form-item label="患者姓名" prop="patientName">
          <el-input
            v-model="searchForm.patientName"
            placeholder="请输入患者姓名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="药品名称" prop="drugName">
          <el-input
            v-model="searchForm.drugName"
            placeholder="请输入药品名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="开具日期" prop="prescriptionDate">
          <el-date-picker
            v-model="searchForm.prescriptionDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>处方列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增处方
          </el-button>
        </div>
      </template>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="patientName" label="患者姓名" width="120" />
        <el-table-column prop="chinaName" label="药品名称" width="200" />
        <el-table-column prop="specifications" label="规格" width="120" />
        <el-table-column prop="drugUnit" label="单位" width="80" />
        <el-table-column prop="useMethod" label="用法" width="120" />
        <el-table-column prop="orderNumber" label="频次" width="80" align="center" />
        <el-table-column prop="startTime" label="开始时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="doctorOrder" label="医嘱内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="prescriptionStatusType(row.status)">
              {{ prescriptionStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="success" link @click="handleView(row)">
                查看
              </el-button>
              <el-button type="warning" link @click="handlePrint(row)">
                打印
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增处方' : dialogType === 'edit' ? '编辑处方' : '查看处方'"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        :disabled="dialogType === 'view'"
      >
        <el-form-item label="患者姓名" prop="patientName">
          <el-input v-model="form.patientName" placeholder="请输入患者姓名" />
        </el-form-item>
        <el-form-item label="药品" prop="drugId">
          <el-select
            v-model="form.drugId"
            filterable
            remote
            :remote-method="searchDrugs"
            placeholder="请选择药品"
            style="width: 100%"
            @change="handleDrugChange"
          >
            <el-option
              v-for="item in drugOptions"
              :key="item.id"
              :label="item.chinaName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="规格">
          <el-input v-model="form.specifications" disabled />
        </el-form-item>
        <el-form-item label="单位">
          <el-input v-model="form.drugUnit" disabled />
        </el-form-item>
        <el-form-item label="用法" prop="useMethod">
          <el-input v-model="form.useMethod" placeholder="请输入用法" />
        </el-form-item>
        <el-form-item label="频次" prop="orderNumber">
          <el-input-number
            v-model="form.orderNumber"
            :min="0"
            :precision="0"
            style="width: 100%"
            placeholder="请输入频次（次/天）"
          />
        </el-form-item>
        <el-form-item label="用药时间" prop="startTime">
          <el-date-picker
            v-model="prescriptionDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="医嘱内容" prop="doctorOrder">
          <el-input
            v-model="form.doctorOrder"
            type="textarea"
            rows="3"
            placeholder="请输入医嘱内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" v-if="dialogType !== 'view'">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { prescriptionApi } from '@/api/doctor'
import { drugApi } from '@/api/insurance'
import type { PatientPrescriptionVO } from '@/types/doctor'
import dayjs from 'dayjs'

// 接口定义
interface Drug {
  id: number
  chinaName: string
  specifications: string
  drugUnit: string
  drugPrice: number
}

// 搜索表单
const searchForm = reactive({
  patientName: '',
  drugName: '',
  prescriptionDate: [] as string[]
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const loading = ref(false)
const tableData = ref<PatientPrescriptionVO[]>([])

// 药品选项
const drugOptions = ref<Drug[]>([])

// 表单数据
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit' | 'view'>('add')
const formRef = ref<FormInstance>()
const form = reactive<Partial<PatientPrescriptionVO>>({
  patientName: '',
  patientId: undefined,
  drugId: undefined,
  doctorOrder: '',
  useMethod: '',
  orderNumber: undefined,
  startTime: '',
  endTime: '',
  status: 1
})

// 表单校验规则
const rules: FormRules = {
  patientName: [
    { required: true, message: '请输入患者姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  drugId: [
    { required: true, message: '请选择药品', trigger: 'change' }
  ],
  useMethod: [
    { required: true, message: '请输入用法', trigger: 'blur' }
  ],
  orderNumber: [
    { required: true, message: '请输入医嘱频次', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ]
}

// 处方时间范围
const prescriptionDateRange = computed({
  get: () => {
    return [form.startTime || '', form.endTime || '']
  },
  set: (val: [string, string]) => {
    form.startTime = val[0]
    form.endTime = val[1]
  }
})

// 获取处方列表
const fetchPrescriptions = async () => {
  loading.value = true
  try {
    const { data } = await prescriptionApi.getPage({
      ...searchForm,
      ...pagination,
      startDate: searchForm.prescriptionDate?.[0],
      endDate: searchForm.prescriptionDate?.[1]
    })
    tableData.value = data.list
    pagination.total = data.total
  } catch (error) {
    console.error('获取处方列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索药品
const searchDrugs = async (query: string) => {
  if (query) {
    try {
      const { data } = await drugApi.search(query)
      drugOptions.value = data.map(item => ({
        id: item.id,
        chinaName: item.chinaName,
        specifications: item.specifications || '',
        drugUnit: item.drugUnit,
        drugPrice: item.drugPrice
      }))
    } catch (error) {
      console.error('搜索药品失败:', error)
    }
  } else {
    drugOptions.value = []
  }
}

// 处理药品选择变化
const handleDrugChange = (drugId: number) => {
  const drug = drugOptions.value.find(item => item.id === drugId)
  if (drug) {
    Object.assign(form, {
      drugId: drug.id,
      chinaName: drug.chinaName,
      specifications: drug.specifications,
      drugUnit: drug.drugUnit,
      drugPrice: drug.drugPrice
    })
  }
}

// 处理查询
const handleSearch = () => {
  pagination.pageNum = 1
  fetchPrescriptions()
}

// 重置查询
const resetSearch = () => {
  Object.assign(searchForm, {
    patientName: '',
    drugName: '',
    prescriptionDate: []
  })
  handleSearch()
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = async (row: PatientPrescriptionVO) => {
  dialogType.value = 'edit'
  try {
    const { data } = await prescriptionApi.getById(row.id!)
    Object.assign(form, data)
    dialogVisible.value = true
  } catch (error) {
    console.error('获取处方详情失败:', error)
  }
}

// 处理查看
const handleView = async (row: PatientPrescriptionVO) => {
  dialogType.value = 'view'
  try {
    const { data } = await prescriptionApi.getById(row.id!)
    Object.assign(form, data)
    dialogVisible.value = true
  } catch (error) {
    console.error('获取处方详情失败:', error)
  }
}

// 处理打印
const handlePrint = (row: PatientPrescriptionVO) => {
  // TODO: 实现打印功能
  ElMessage.info('打印功能开发中')
}

// 处理删除
const handleDelete = (row: PatientPrescriptionVO) => {
  ElMessageBox.confirm(
    `确认删除患者"${row.patientName}"的处方吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await prescriptionApi.delete(row.id!)
      ElMessage.success('删除成功')
      fetchPrescriptions()
    } catch (error) {
      console.error('删除失败:', error)
    }
  })
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          await prescriptionApi.add(form)
          ElMessage.success('新增成功')
        } else {
          await prescriptionApi.update(form.id!, form)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchPrescriptions()
      } catch (error) {
        console.error('保存失败:', error)
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    patientName: '',
    patientId: undefined,
    drugId: undefined,
    doctorOrder: '',
    useMethod: '',
    orderNumber: undefined,
    startTime: '',
    endTime: '',
    status: 1
  })
}

// 处理分页变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchPrescriptions()
}

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  fetchPrescriptions()
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 处方状态
const prescriptionStatusType = (status: number) => {
  switch (status) {
    case 1:
      return 'success'
    case 0:
      return 'danger'
    case 2:
      return 'warning'
    default:
      return 'info'
  }
}

const prescriptionStatusText = (status: number) => {
  switch (status) {
    case 1:
      return '正常执行'
    case 0:
      return '已作废'
    case 2:
      return '已停止'
    default:
      return '未知'
  }
}

// 初始化
fetchPrescriptions()
</script>

<style scoped>
.prescription-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
