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
        <el-table-column prop="diseaseCategory" label="疾病类别" width="120" />
        <el-table-column prop="diseaseTypeName" label="诊断类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.diseaseType === 1 ? 'primary' : row.diseaseType === 2 ? 'success' : 'info'">
              {{ row.diseaseTypeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderTime" label="诊断时间" width="180" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '停用' }}
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
          <el-col :span="12">
            <el-form-item label="患者姓名" prop="patientName">
              <el-input v-model="form.patientName" placeholder="请输入患者姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="疾病名称" prop="diseaseName">
              <el-input v-model="form.diseaseName" placeholder="请输入疾病名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="疾病类别" prop="diseaseCategory">
              <el-input v-model="form.diseaseCategory" placeholder="请输入疾病类别" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="诊断类型" prop="diseaseType">
              <el-select v-model="form.diseaseType" placeholder="请选择诊断类型">
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
              <el-input v-model="form.diseaseCode" placeholder="请输入疾病编码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="ICD编码" prop="diseaseICD">
              <el-input v-model="form.diseaseICD" placeholder="请输入ICD编码" />
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
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { diagnosisApi } from '@/api/doctor'
import type { PatientDiagnosisVO } from '@/types/doctor'
import dayjs from 'dayjs'

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
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error) {
    console.error('获取诊断列表失败:', error)
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
  patientName: '',
  diseaseName: '',
  diseaseType: 1,
  diseaseCategory: '',
  orderTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  status: 1
})

// 表单校验规则
const rules: FormRules = {
  patientName: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
  diseaseName: [{ required: true, message: '请输入疾病名称', trigger: 'blur' }],
  diseaseType: [{ required: true, message: '请选择诊断类型', trigger: 'change' }],
  diseaseCategory: [{ required: true, message: '请输入疾病类别', trigger: 'blur' }]
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    patientName: '',
    diseaseName: '',
    diseaseType: 1,
    diseaseCategory: '',
    orderTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    status: 1
  })
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
        if (dialogType.value === 'add') {
          await diagnosisApi.add(form)
          ElMessage.success('新增成功')
        } else {
          await diagnosisApi.update(form.id!, form)
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
fetchDiagnosis()
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

