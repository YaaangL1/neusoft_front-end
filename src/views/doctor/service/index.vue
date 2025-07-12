<template>
  <div class="service-container">
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
        <el-form-item label="服务日期" prop="serviceDate">
          <el-date-picker
            v-model="searchForm.serviceDate"
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
          <span>医疗服务记录列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增记录
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
        <el-table-column prop="serviceDate" label="服务日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.serviceDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="serviceType" label="服务类型" width="120">
          <template #default="{ row }">
            <el-tag :type="serviceTypeTag(row.serviceType)">
              {{ serviceTypeText(row.serviceType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="serviceName" label="服务名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="doctorName" label="医生姓名" width="120" />
        <el-table-column prop="department" label="科室" width="120" />
        <el-table-column prop="serviceResult" label="服务结果" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="serviceStatusType(row.status)">
              {{ serviceStatusText(row.status) }}
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
      :title="dialogType === 'add' ? '新增医疗服务记录' : dialogType === 'edit' ? '编辑医疗服务记录' : '查看医疗服务记录'"
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
            <el-form-item label="就诊号" prop="visitNumber">
              <el-input v-model="form.visitNumber" placeholder="请输入就诊号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="服务日期" prop="serviceDate">
              <el-date-picker
                v-model="form.serviceDate"
                type="date"
                placeholder="请选择服务日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="服务类型" prop="serviceType">
              <el-select v-model="form.serviceType" placeholder="请选择服务类型" style="width: 100%">
                <el-option label="检查" :value="1" />
                <el-option label="化验" :value="2" />
                <el-option label="治疗" :value="3" />
                <el-option label="手术" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
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
          <el-col :span="12">
            <el-form-item label="服务名称" prop="serviceName">
              <el-input v-model="form.serviceName" placeholder="请输入服务名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="服务内容" prop="serviceContent">
          <el-input
            v-model="form.serviceContent"
            type="textarea"
            rows="3"
            placeholder="请输入服务内容"
          />
        </el-form-item>

        <el-form-item label="服务结果" prop="serviceResult">
          <el-input
            v-model="form.serviceResult"
            type="textarea"
            rows="3"
            placeholder="请输入服务结果"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="form.remarks"
            type="textarea"
            rows="3"
            placeholder="请输入备注"
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
interface ServiceRecord {
  id: number
  patientName: string
  visitNumber: string
  serviceDate: string
  serviceType: number
  serviceName: string
  serviceContent: string
  serviceResult: string
  doctorName: string
  department: string
  status: number
  remarks?: string
  createTime: string
  updateTime: string
}

// 搜索表单
const searchForm = reactive({
  patientName: '',
  visitNumber: '',
  serviceDate: [] as string[]
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const loading = ref(false)
const tableData = ref<ServiceRecord[]>([])

// 表单数据
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit' | 'view'>('add')
const formRef = ref<FormInstance>()
const form = reactive<Partial<ServiceRecord>>({
  patientName: '',
  visitNumber: '',
  serviceDate: '',
  serviceType: undefined,
  serviceName: '',
  serviceContent: '',
  serviceResult: '',
  department: '',
  remarks: ''
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
  serviceDate: [
    { required: true, message: '请选择服务日期', trigger: 'change' }
  ],
  serviceType: [
    { required: true, message: '请选择服务类型', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请选择科室', trigger: 'change' }
  ],
  serviceName: [
    { required: true, message: '请输入服务名称', trigger: 'blur' }
  ],
  serviceContent: [
    { required: true, message: '请输入服务内容', trigger: 'blur' }
  ]
}

// 获取医疗服务记录列表
const fetchServiceRecords = async () => {
  loading.value = true
  try {
    const { list, total } = await request.get<{ list: ServiceRecord[], total: number }>('/api/doctor/service', {
      ...searchForm,
      ...pagination,
      startDate: searchForm.serviceDate?.[0],
      endDate: searchForm.serviceDate?.[1]
    })
    tableData.value = list
    pagination.total = total
  } catch (error) {
    console.error('获取医疗服务记录列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理查询
const handleSearch = () => {
  pagination.pageNum = 1
  fetchServiceRecords()
}

// 重置查询
const resetSearch = () => {
  Object.assign(searchForm, {
    patientName: '',
    visitNumber: '',
    serviceDate: []
  })
  handleSearch()
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row: ServiceRecord) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理查看
const handleView = (row: ServiceRecord) => {
  dialogType.value = 'view'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row: ServiceRecord) => {
  ElMessageBox.confirm(
    `确认删除患者"${row.patientName}"的医疗服务记录吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await request.delete(`/api/doctor/service/${row.id}`)
      ElMessage.success('删除成功')
      fetchServiceRecords()
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
          await request.post('/api/doctor/service', form)
          ElMessage.success('新增成功')
        } else {
          await request.put(`/api/doctor/service/${form.id}`, form)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchServiceRecords()
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
    serviceDate: '',
    serviceType: undefined,
    serviceName: '',
    serviceContent: '',
    serviceResult: '',
    department: '',
    remarks: ''
  })
}

// 处理分页变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchServiceRecords()
}

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  fetchServiceRecords()
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 服务类型
const serviceTypeTag = (type: number) => {
  switch (type) {
    case 1:
      return ''
    case 2:
      return 'warning'
    case 3:
      return 'success'
    case 4:
      return 'danger'
    default:
      return 'info'
  }
}

const serviceTypeText = (type: number) => {
  switch (type) {
    case 1:
      return '检查'
    case 2:
      return '化验'
    case 3:
      return '治疗'
    case 4:
      return '手术'
    default:
      return '未知'
  }
}

// 服务状态
const serviceStatusType = (status: number) => {
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

const serviceStatusText = (status: number) => {
  switch (status) {
    case 1:
      return '已完成'
    case 2:
      return '进行中'
    case 3:
      return '已取消'
    default:
      return '未知'
  }
}

// 初始化
fetchServiceRecords()
</script>

<style scoped>
.service-container {
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
