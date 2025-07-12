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
        <el-form-item label="就诊号" prop="visitNumber">
          <el-input
            v-model="searchForm.visitNumber"
            placeholder="请输入就诊号"
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
            value-format="YYYY-MM-DD"
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
        <el-table-column prop="visitNumber" label="就诊号" width="120" />
        <el-table-column prop="prescriptionDate" label="开具日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.prescriptionDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="prescriptionType" label="处方类型" width="120">
          <template #default="{ row }">
            <el-tag :type="prescriptionTypeTag(row.prescriptionType)">
              {{ prescriptionTypeText(row.prescriptionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="diagnosis" label="诊断信息" min-width="200" show-overflow-tooltip />
        <el-table-column prop="doctorName" label="医生姓名" width="120" />
        <el-table-column prop="department" label="科室" width="120" />
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
      width="900px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        :disabled="dialogType === 'view'"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="患者姓名" prop="patientName">
              <el-input v-model="form.patientName" placeholder="请输入患者姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="就诊号" prop="visitNumber">
              <el-input v-model="form.visitNumber" placeholder="请输入就诊号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="处方类型" prop="prescriptionType">
              <el-select v-model="form.prescriptionType" placeholder="请选择处方类型" style="width: 100%">
                <el-option label="西药" :value="1" />
                <el-option label="中成药" :value="2" />
                <el-option label="中药" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="开具日期" prop="prescriptionDate">
              <el-date-picker
                v-model="form.prescriptionDate"
                type="date"
                placeholder="请选择开具日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="科室" prop="department">
              <el-select v-model="form.department" placeholder="请选择科室" style="width: 100%">
                <el-option label="内科" value="内科" />
                <el-option label="外科" value="外科" />
                <el-option label="儿科" value="儿科" />
                <el-option label="妇产科" value="妇产科" />
                <el-option label="眼科" value="眼科" />
                <el-option label="耳鼻喉科" value="耳鼻喉科" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="诊断信息" prop="diagnosis">
              <el-input v-model="form.diagnosis" placeholder="请输入诊断信息" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 药品列表 -->
        <el-form-item label="药品列表" prop="medicines">
          <el-table :data="form.medicines" border style="width: 100%">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column label="药品名称" min-width="200">
              <template #default="{ row }">
                <el-select
                  v-model="row.drugId"
                  filterable
                  remote
                  :remote-method="searchDrugs"
                  placeholder="请选择药品"
                  style="width: 100%"
                  @change="handleDrugChange($event, row)"
                >
                  <el-option
                    v-for="item in drugOptions"
                    :key="item.id"
                    :label="item.drugName"
                    :value="item.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="specification" label="规格" width="120" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column label="用法" width="150">
              <template #default="{ row }">
                <el-select v-model="row.usage" placeholder="请选择用法" style="width: 100%">
                  <el-option label="口服" value="口服" />
                  <el-option label="静脉注射" value="静脉注射" />
                  <el-option label="肌肉注射" value="肌肉注射" />
                  <el-option label="外用" value="外用" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="用量" width="120">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.dosage"
                  :min="0"
                  :precision="2"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="频次" width="150">
              <template #default="{ row }">
                <el-select v-model="row.frequency" placeholder="请选择频次" style="width: 100%">
                  <el-option label="每日一次" value="每日一次" />
                  <el-option label="每日两次" value="每日两次" />
                  <el-option label="每日三次" value="每日三次" />
                  <el-option label="每日四次" value="每日四次" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="天数" width="100">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.days"
                  :min="1"
                  :precision="0"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ $index }">
                <el-button type="danger" link @click="removeMedicine($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 10px">
            <el-button type="primary" @click="addMedicine">
              <el-icon><Plus /></el-icon>
              添加药品
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="医嘱" prop="instructions">
          <el-input
            v-model="form.instructions"
            type="textarea"
            rows="3"
            placeholder="请输入医嘱"
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
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { request } from '@/utils/request'
import dayjs from 'dayjs'

// 接口定义
interface Drug {
  id: number
  drugName: string
  specification: string
  unit: string
  price: number
}

interface PrescriptionMedicine {
  id?: number
  drugId: number
  drugName?: string
  specification?: string
  unit?: string
  usage: string
  dosage: number
  frequency: string
  days: number
}

interface Prescription {
  id: number
  patientName: string
  visitNumber: string
  prescriptionDate: string
  prescriptionType: number
  diagnosis: string
  doctorName: string
  department: string
  status: number
  medicines: PrescriptionMedicine[]
  instructions?: string
  createTime: string
  updateTime: string
}

// 搜索表单
const searchForm = reactive({
  patientName: '',
  visitNumber: '',
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
const tableData = ref<Prescription[]>([])

// 药品选项
const drugOptions = ref<Drug[]>([])

// 表单数据
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit' | 'view'>('add')
const formRef = ref<FormInstance>()
const form = reactive<Partial<Prescription>>({
  patientName: '',
  visitNumber: '',
  prescriptionDate: '',
  prescriptionType: undefined,
  diagnosis: '',
  department: '',
  medicines: [],
  instructions: ''
})

// 表单校验规则
const rules: FormRules = {
  patientName: [
    { required: true, message: '请输入患者姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  visitNumber: [
    { required: true, message: '请输入就诊号', trigger: 'blur' }
  ],
  prescriptionDate: [
    { required: true, message: '请选择开具日期', trigger: 'change' }
  ],
  prescriptionType: [
    { required: true, message: '请选择处方类型', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请选择科室', trigger: 'change' }
  ],
  diagnosis: [
    { required: true, message: '请输入诊断信息', trigger: 'blur' }
  ],
  medicines: [
    { required: true, message: '请添加药品', trigger: 'change' }
  ]
}

// 获取处方列表
const fetchPrescriptions = async () => {
  loading.value = true
  try {
    const { list, total } = await request.get<{ list: Prescription[], total: number }>('/api/doctor/prescription', {
      ...searchForm,
      ...pagination,
      startDate: searchForm.prescriptionDate?.[0],
      endDate: searchForm.prescriptionDate?.[1]
    })
    tableData.value = list
    pagination.total = total
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
      const { list } = await request.get<{ list: Drug[] }>('/api/insurance/drugs/search', {
        drugName: query
      })
      drugOptions.value = list
    } catch (error) {
      console.error('搜索药品失败:', error)
    }
  } else {
    drugOptions.value = []
  }
}

// 处理药品选择变化
const handleDrugChange = (drugId: number, row: PrescriptionMedicine) => {
  const drug = drugOptions.value.find(item => item.id === drugId)
  if (drug) {
    row.drugName = drug.drugName
    row.specification = drug.specification
    row.unit = drug.unit
  }
}

// 添加药品
const addMedicine = () => {
  if (!form.medicines) {
    form.medicines = []
  }
  form.medicines.push({
    drugId: 0,
    usage: '',
    dosage: 0,
    frequency: '',
    days: 1
  })
}

// 移除药品
const removeMedicine = (index: number) => {
  form.medicines?.splice(index, 1)
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
    visitNumber: '',
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
const handleEdit = (row: Prescription) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理查看
const handleView = (row: Prescription) => {
  dialogType.value = 'view'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理打印
const handlePrint = (row: Prescription) => {
  // TODO: 实现打印功能
  ElMessage.info('打印功能开发中')
}

// 处理删除
const handleDelete = (row: Prescription) => {
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
      await request.delete(`/api/doctor/prescription/${row.id}`)
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
          await request.post('/api/doctor/prescription', form)
          ElMessage.success('新增成功')
        } else {
          await request.put(`/api/doctor/prescription/${form.id}`, form)
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
    visitNumber: '',
    prescriptionDate: '',
    prescriptionType: undefined,
    diagnosis: '',
    department: '',
    medicines: [],
    instructions: ''
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
  return dayjs(date).format('YYYY-MM-DD')
}

// 处方类型
const prescriptionTypeTag = (type: number) => {
  switch (type) {
    case 1:
      return ''
    case 2:
      return 'warning'
    case 3:
      return 'success'
    default:
      return 'info'
  }
}

const prescriptionTypeText = (type: number) => {
  switch (type) {
    case 1:
      return '西药'
    case 2:
      return '中成药'
    case 3:
      return '中药'
    default:
      return '未知'
  }
}

// 处方状态
const prescriptionStatusType = (status: number) => {
  switch (status) {
    case 1:
      return 'success'
    case 2:
      return 'warning'
    case 3:
      return 'danger'
    default:
      return 'info'
  }
}

const prescriptionStatusText = (status: number) => {
  switch (status) {
    case 1:
      return '已完成'
    case 2:
      return '待审核'
    case 3:
      return '已作废'
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
