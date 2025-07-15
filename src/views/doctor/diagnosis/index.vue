<template>
  <div class="diagnosis-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <el-form-item label="疾病名称" prop="diseaseName">
          <el-input
            v-model="searchForm.diseaseName"
            placeholder="请输入疾病名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="患者ID" prop="patientId">
          <el-input
            v-model="searchForm.patientId"
            placeholder="请输入患者ID"
            clearable
            @keyup.enter="handleSearch"
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
          <span>诊断信息列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增诊断
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
        <el-table-column prop="diseaseName" label="疾病名称" width="150" />
        <el-table-column prop="diseaseCode" label="疾病编码" width="120" />
        <el-table-column prop="diseaseICD" label="ICD编码" width="120" />
        <el-table-column prop="diseaseCategory" label="疾病类别" width="120" />
        <el-table-column prop="diseaseTypeName" label="诊断类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.diseaseType === 1 ? 'primary' : row.diseaseType === 2 ? 'success' : 'info'">
              {{ row.diseaseTypeName || getDiseaseTypeName(row.diseaseType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderTime" label="诊断时间" width="180" />
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
      :title="dialogType === 'add' ? '新增诊断' : dialogType === 'edit' ? '编辑诊断' : '查看诊断'"
      width="700px"
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
          <el-col :span="24">
            <el-form-item label="患者" prop="patientId">
              <el-select
                v-model="form.patientId"
                filterable
                remote
                reserve-keyword
                placeholder="请输入并选择患者"
                :remote-method="remotePatientSearch"
                :loading="patientLoading"
                @change="handlePatientSelect"
                style="width: 100%"
                :disabled="dialogType === 'view'"
              >
                <el-option
                  v-for="item in patientOptions"
                  :key="item.id"
                  :label="`${item.realName}（${item.id}）`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="疾病" prop="diseaseId">
              <el-select
                v-model="form.diseaseId"
                filterable
                remote
                reserve-keyword
                placeholder="请输入并选择疾病"
                :remote-method="remoteDiseaseSearch"
                :loading="diseaseLoading"
                @change="handleDiseaseSelect"
                style="width: 100%"
                :disabled="dialogType === 'view'"
              >
                <el-option
                  v-for="item in diseaseOptions"
                  :key="item.diseaseId"
                  :label="`${item.diseaseName}（${item.diseaseCode || '无编码'}）`"
                  :value="item.diseaseId"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="疾病类别" prop="diseaseCategory">
              <el-input v-model="form.diseaseCategory" placeholder="自动填充" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="诊断类型" prop="diseaseType">
              <el-select v-model="form.diseaseType" placeholder="请选择诊断类型" :disabled="dialogType === 'view'">
                <el-option label="入院诊断" :value="1" />
                <el-option label="主要诊断" :value="2" />
                <el-option label="其他诊断" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="疾病编码" prop="diseaseCode">
              <el-input v-model="form.diseaseCode" placeholder="自动填充" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ICD编码" prop="diseaseICD">
              <el-input v-model="form.diseaseICD" placeholder="自动填充" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="诊断时间" prop="orderTime">
              <el-date-picker
                v-model="form.orderTime"
                type="datetime"
                placeholder="请选择诊断时间"
                format="YYYY-MM-DD HH:mm:ss"
                value-format="iso"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
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
import { ref, reactive, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { diagnosisApi } from '@/api/doctor'
import type { PatientDiagnosisVO } from '@/types/doctor'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { insuredPersonApi } from '@/api/insurance'
import type { InsuredPerson } from '@/types/insurance'

let resetForm: () => void // 先声明

// 搜索表单
const searchForm = reactive({
  diseaseName: '',
  patientId: undefined as number | undefined
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const loading = ref(false)
const tableData = ref<PatientDiagnosisVO[]>([])

// 获取诊断类型名称
const getDiseaseTypeName = (type?: number) => {
  switch (type) {
    case 1: return '入院诊断'
    case 2: return '主要诊断'
    case 3: return '其他诊断'
    default: return '未知'
  }
}

// 获取诊断列表
const fetchDiagnosis = async () => {
  try {
    loading.value = true
    const res = await diagnosisApi.getPage({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...searchForm
    })
    if (res.data) {
      tableData.value = res.data.list.map(item => ({
        ...item,
        diseaseTypeName: item.diseaseTypeName || getDiseaseTypeName(item.diseaseType)
      }))
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取诊断列表失败:', error)
    ElMessage.error('获取诊断列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchDiagnosis()
}

// 重置搜索
const resetSearch = () => {
  searchForm.diseaseName = ''
  searchForm.patientId = undefined
  handleSearch()
}

// 处理分页变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchDiagnosis()
}

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  fetchDiagnosis()
}

// 表单数据
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit' | 'view'>('add')
const formRef = ref<FormInstance>()
const form = reactive<Partial<PatientDiagnosisVO>>({
  patientId: undefined,
  patientName: '',
  diseaseId: undefined,
  diseaseName: '',
  diseaseType: 1,
  diseaseCategory: '',
  diseaseCode: '',
  diseaseICD: '',
  orderTime: new Date().toISOString()
})

// 表单校验规则
const rules: FormRules = {
  patientId: [{ required: true, message: '请输入患者ID', trigger: 'blur' }],
  patientName: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
  diseaseId: [{ required: true, message: '请输入疾病ID', trigger: 'blur' }],
  diseaseName: [{ required: true, message: '请输入疾病名称', trigger: 'blur' }],
  diseaseType: [{ required: true, message: '请选择诊断类型', trigger: 'change' }],
  orderTime: [{ required: true, message: '请选择诊断时间', trigger: 'change' }]
}

// 重置表单
const diseaseOptions = ref<PatientDiagnosisVO[]>([])
const diseaseLoading = ref(false)

const remoteDiseaseSearch = async (query: string) => {
  if (!query) {
    diseaseOptions.value = []
    return
  }
  diseaseLoading.value = true
  try {
    const res = await diagnosisApi.search(query)
    if (res.data) {
      diseaseOptions.value = res.data
    } else {
      diseaseOptions.value = []
    }
  } catch (e) {
    diseaseOptions.value = []
  } finally {
    diseaseLoading.value = false
  }
}

const handleDiseaseSelect = (diseaseId: number) => {
  const selected = diseaseOptions.value.find(item => item.diseaseId === diseaseId)
  if (selected) {
    form.diseaseId = selected.diseaseId
    form.diseaseName = selected.diseaseName
    form.diseaseCode = selected.diseaseCode
    form.diseaseICD = selected.diseaseICD
    form.diseaseCategory = selected.diseaseCategory
  }
}

const patientOptions = ref<InsuredPerson[]>([])
const patientLoading = ref(false)

const remotePatientSearch = async (query: string) => {
  if (!query) {
    patientOptions.value = []
    return
  }
  patientLoading.value = true
  try {
    const res = await insuredPersonApi.search({ personName: query })
    if (Array.isArray(res)) {
      patientOptions.value = res
    } else {
      patientOptions.value = []
    }
  } catch (e) {
    patientOptions.value = []
  } finally {
    patientLoading.value = false
  }
}

const handlePatientSelect = (patientId: number) => {
  const selected = patientOptions.value.find(item => item.id === patientId)
  if (selected) {
    form.patientId = selected.id
    form.patientName = selected.realName
  }
}

resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    patientId: undefined,
    patientName: '',
    diseaseId: undefined,
    diseaseName: '',
    diseaseType: 1,
    diseaseCategory: '',
    diseaseCode: '',
    diseaseICD: '',
    orderTime: new Date().toISOString()
  })
  diseaseOptions.value = []
  patientOptions.value = []
}

// 新增诊断
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 编辑诊断
const handleEdit = (row: PatientDiagnosisVO) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 查看诊断
const handleView = (row: PatientDiagnosisVO) => {
  dialogType.value = 'view'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除诊断
const handleDelete = (row: PatientDiagnosisVO) => {
  ElMessageBox.confirm('确认删除该诊断记录?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
  }).then(async () => {
    try {
      await diagnosisApi.delete(row.id!)
      ElMessage.success('删除成功')
      fetchDiagnosis()
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 构造后端需要的数据结构
        const submitData = {
          createdTime: form.createdTime || undefined,
          diseaseId: form.diseaseId,
          diseaseType: form.diseaseType,
          id: form.id,
          orderTime: form.orderTime,
          patientId: form.patientId
        }
        if (dialogType.value === 'add') {
          await diagnosisApi.add(submitData)
          ElMessage.success('新增成功')
        } else {
          await diagnosisApi.update(form.id!, submitData)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchDiagnosis()
      } catch (error) {
        console.error('保存失败:', error)
        ElMessage.error('保存失败')
      }
    }
  })
}

// 初始化
onMounted(() => {
  fetchDiagnosis()
})
</script>

<style scoped>
.diagnosis-container {
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

