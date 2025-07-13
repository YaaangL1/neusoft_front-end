<template>
  <div class="treatment-container">
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
        <el-form-item label="项目名称" prop="treatmentName">
          <el-input
            v-model="searchForm.treatmentName"
            placeholder="请输入项目名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="开立时间" prop="treatmentDate">
          <el-date-picker
            v-model="searchForm.treatmentDate"
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
          <span>医疗服务项目列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增项目
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
        <el-table-column prop="medicalName" label="项目名称" width="200" />
        <el-table-column prop="medicalNumber" label="项目编码" width="120" />
        <el-table-column prop="medicalType" label="项目类别" width="120" />
        <el-table-column prop="medicalUnit" label="计价单位" width="100" />
        <el-table-column prop="medicalPrice" label="价格" width="120">
          <template #default="{ row }">
            ¥{{ row.medicalPrice?.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="orderTime" label="开立时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.orderTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="doctorOrder" label="医嘱内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="treatmentStatusType(row.status)">
              {{ treatmentStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="success" link @click="handleView(row)">
                查看
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
      :title="dialogType === 'add' ? '新增医疗服务项目' : dialogType === 'edit' ? '编辑医疗服务项目' : '查看医疗服务项目'"
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
        <el-form-item label="诊疗项目" prop="diagnosisId">
                <el-select
            v-model="form.diagnosisId"
                  filterable
                  remote
                  :remote-method="searchTreatments"
            placeholder="请选择诊疗项目"
                  style="width: 100%"
            @change="handleTreatmentChange"
                >
                  <el-option
                    v-for="item in treatmentOptions"
                    :key="item.id"
              :label="item.medicalName"
                    :value="item.id"
                  />
                </el-select>
        </el-form-item>
        <el-form-item label="项目编码">
          <el-input v-model="form.medicalNumber" disabled />
        </el-form-item>
        <el-form-item label="项目类别">
          <el-input v-model="form.medicalType" disabled />
        </el-form-item>
        <el-form-item label="计价单位">
          <el-input v-model="form.medicalUnit" disabled />
        </el-form-item>
        <el-form-item label="价格">
          <el-input v-model="form.medicalPrice" disabled>
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="用法" prop="useMethod">
          <el-input v-model="form.useMethod" placeholder="请输入用法" />
        </el-form-item>
        <el-form-item label="开立时间" prop="orderTime">
          <el-date-picker
            v-model="form.orderTime"
            type="datetime"
            placeholder="请选择开立时间"
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
import { treatmentApi } from '@/api/doctor'
import { treatmentApi as insuranceTreatmentApi } from '@/api/insurance'
import type { PatientTreatmentVO } from '@/types/doctor'
import type { TreatmentVO } from '@/types/insurance'
import dayjs from 'dayjs'

// 搜索表单
const searchForm = reactive({
  patientName: '',
  treatmentName: '',
  treatmentDate: [] as string[]
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const loading = ref(false)
const tableData = ref<PatientTreatmentVO[]>([])

// 项目选项
const treatmentOptions = ref<TreatmentVO[]>([])

// 表单数据
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit' | 'view'>('add')
const formRef = ref<FormInstance>()
const form = reactive<Partial<PatientTreatmentVO>>({
  patientName: '',
  patientId: undefined,
  diagnosisId: undefined,
  doctorOrder: '',
  useMethod: '',
  orderTime: '',
  status: 1
})

// 表单校验规则
const rules: FormRules = {
  patientName: [
    { required: true, message: '请输入患者姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  diagnosisId: [
    { required: true, message: '请选择诊疗项目', trigger: 'change' }
  ],
  useMethod: [
    { required: true, message: '请输入用法', trigger: 'blur' }
  ],
  orderTime: [
    { required: true, message: '请选择开立时间', trigger: 'change' }
  ]
}

// 获取医疗服务项目列表
const fetchTreatmentRecords = async () => {
  loading.value = true
  try {
    const { data } = await treatmentApi.getPage({
      ...searchForm,
      ...pagination,
      startDate: searchForm.treatmentDate?.[0],
      endDate: searchForm.treatmentDate?.[1]
    })
    tableData.value = data.list
    pagination.total = data.total
  } catch (error) {
    console.error('获取医疗服务项目列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索项目
const searchTreatments = async (query: string) => {
  if (query) {
    try {
      const { data } = await insuranceTreatmentApi.search(query)
      treatmentOptions.value = data
    } catch (error) {
      console.error('搜索项目失败:', error)
    }
  } else {
    treatmentOptions.value = []
  }
}

// 处理项目选择变化
const handleTreatmentChange = (treatmentId: number) => {
  const treatment = treatmentOptions.value.find(item => item.id === treatmentId)
  if (treatment) {
    Object.assign(form, {
      diagnosisId: treatment.id,
      medicalName: treatment.medicalName,
      medicalNumber: treatment.medicalNumber,
      medicalType: treatment.medicalType,
      medicalUnit: treatment.medicalUnit,
      medicalPrice: treatment.medicalPrice,
      medicalInfo: treatment.medicalInfo,
      medicalExclude: treatment.medicalExclude
    })
  }
}

// 处理查询
const handleSearch = () => {
  pagination.pageNum = 1
  fetchTreatmentRecords()
}

// 重置查询
const resetSearch = () => {
  Object.assign(searchForm, {
    patientName: '',
    treatmentName: '',
    treatmentDate: []
  })
  handleSearch()
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = async (row: PatientTreatmentVO) => {
  dialogType.value = 'edit'
  try {
    const { data } = await treatmentApi.getById(row.id!)
    Object.assign(form, data)
  dialogVisible.value = true
  } catch (error) {
    console.error('获取医疗服务项目详情失败:', error)
  }
}

// 处理查看
const handleView = async (row: PatientTreatmentVO) => {
  dialogType.value = 'view'
  try {
    const { data } = await treatmentApi.getById(row.id!)
    Object.assign(form, data)
  dialogVisible.value = true
  } catch (error) {
    console.error('获取医疗服务项目详情失败:', error)
  }
}

// 处理删除
const handleDelete = (row: PatientTreatmentVO) => {
  ElMessageBox.confirm(
    `确认删除患者"${row.patientName}"的医疗服务项目记录吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await treatmentApi.delete(row.id!)
      ElMessage.success('删除成功')
      fetchTreatmentRecords()
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
          await treatmentApi.add(form)
          ElMessage.success('新增成功')
        } else {
          await treatmentApi.update(form.id!, form)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchTreatmentRecords()
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
    diagnosisId: undefined,
    doctorOrder: '',
    useMethod: '',
    orderTime: '',
    status: 1
  })
}

// 处理分页变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchTreatmentRecords()
}

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  fetchTreatmentRecords()
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 状态
const treatmentStatusType = (status: number) => {
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

const treatmentStatusText = (status: number) => {
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
fetchTreatmentRecords()
</script>

<style scoped>
.treatment-container {
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
