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
        <el-form-item label="就诊号" prop="visitNumber">
          <el-input
            v-model="searchForm.visitNumber"
            placeholder="请输入就诊号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="开具日期" prop="treatmentDate">
          <el-date-picker
            v-model="searchForm.treatmentDate"
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
        <el-table-column prop="visitNumber" label="就诊号" width="120" />
        <el-table-column prop="treatmentDate" label="开具日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.treatmentDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="diagnosis" label="诊断信息" min-width="200" show-overflow-tooltip />
        <el-table-column prop="doctorName" label="医生姓名" width="120" />
        <el-table-column prop="department" label="科室" width="120" />
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="{ row }">
            ¥{{ row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
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
            <el-form-item label="开具日期" prop="treatmentDate">
              <el-date-picker
                v-model="form.treatmentDate"
                type="date"
                placeholder="请选择开具日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
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
            <el-form-item label="诊断信息" prop="diagnosis">
              <el-input v-model="form.diagnosis" placeholder="请输入诊断信息" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 服务项目列表 -->
        <el-form-item label="服务项目" prop="items">
          <el-table :data="form.items" border style="width: 100%">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column label="项目名称" min-width="200">
              <template #default="{ row }">
                <el-select
                  v-model="row.treatmentId"
                  filterable
                  remote
                  :remote-method="searchTreatments"
                  placeholder="请选择项目"
                  style="width: 100%"
                  @change="handleTreatmentChange($event, row)"
                >
                  <el-option
                    v-for="item in treatmentOptions"
                    :key="item.id"
                    :label="item.projectName"
                    :value="item.id"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="specification" label="规格" width="120" />
            <el-table-column prop="unit" label="单位" width="80" />
            <el-table-column prop="price" label="单价" width="120">
              <template #default="{ row }">
                ¥{{ row.price?.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="数量" width="120">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.quantity"
                  :min="1"
                  :precision="0"
                  style="width: 100%"
                  @change="calculateItemAmount(row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="{ row }">
                ¥{{ row.amount?.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ $index }">
                <el-button type="danger" link @click="removeItem($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top: 10px">
            <el-button type="primary" @click="addItem">
              <el-icon><Plus /></el-icon>
              添加项目
            </el-button>
          </div>
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
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { request } from '@/utils/request'
import dayjs from 'dayjs'

// 接口定义
interface Treatment {
  id: number
  projectName: string
  specification: string
  unit: string
  price: number
}

interface TreatmentItem {
  id?: number
  treatmentId: number
  projectName?: string
  specification?: string
  unit?: string
  price?: number
  quantity: number
  amount?: number
}

interface TreatmentRecord {
  id: number
  patientName: string
  visitNumber: string
  treatmentDate: string
  diagnosis: string
  doctorName: string
  department: string
  totalAmount: number
  status: number
  items: TreatmentItem[]
  remarks?: string
  createTime: string
  updateTime: string
}

// 搜索表单
const searchForm = reactive({
  patientName: '',
  visitNumber: '',
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
const tableData = ref<TreatmentRecord[]>([])

// 项目选项
const treatmentOptions = ref<Treatment[]>([])

// 表单数据
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit' | 'view'>('add')
const formRef = ref<FormInstance>()
const form = reactive<Partial<TreatmentRecord>>({
  patientName: '',
  visitNumber: '',
  treatmentDate: '',
  diagnosis: '',
  department: '',
  items: [],
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
  treatmentDate: [
    { required: true, message: '请选择开具日期', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请选择科室', trigger: 'change' }
  ],
  diagnosis: [
    { required: true, message: '请输入诊断信息', trigger: 'blur' }
  ],
  items: [
    { required: true, message: '请添加服务项目', trigger: 'change' }
  ]
}

// 获取医疗服务项目列表
const fetchTreatmentRecords = async () => {
  loading.value = true
  try {
    const { list, total } = await request.get<{ list: TreatmentRecord[], total: number }>('/api/doctor/treatment', {
      ...searchForm,
      ...pagination,
      startDate: searchForm.treatmentDate?.[0],
      endDate: searchForm.treatmentDate?.[1]
    })
    tableData.value = list
    pagination.total = total
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
      const { list } = await request.get<{ list: Treatment[] }>('/api/insurance/treatments/search', {
        projectName: query
      })
      treatmentOptions.value = list
    } catch (error) {
      console.error('搜索项目失败:', error)
    }
  } else {
    treatmentOptions.value = []
  }
}

// 处理项目选择变化
const handleTreatmentChange = (treatmentId: number, row: TreatmentItem) => {
  const treatment = treatmentOptions.value.find(item => item.id === treatmentId)
  if (treatment) {
    row.projectName = treatment.projectName
    row.specification = treatment.specification
    row.unit = treatment.unit
    row.price = treatment.price
    calculateItemAmount(row)
  }
}

// 计算项目金额
const calculateItemAmount = (row: TreatmentItem) => {
  if (row.price && row.quantity) {
    row.amount = row.price * row.quantity
  }
}

// 添加项目
const addItem = () => {
  if (!form.items) {
    form.items = []
  }
  form.items.push({
    treatmentId: 0,
    quantity: 1
  })
}

// 移除项目
const removeItem = (index: number) => {
  form.items?.splice(index, 1)
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
    visitNumber: '',
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
const handleEdit = (row: TreatmentRecord) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理查看
const handleView = (row: TreatmentRecord) => {
  dialogType.value = 'view'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row: TreatmentRecord) => {
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
      await request.delete(`/api/doctor/treatment/${row.id}`)
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
          await request.post('/api/doctor/treatment', form)
          ElMessage.success('新增成功')
        } else {
          await request.put(`/api/doctor/treatment/${form.id}`, form)
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
    visitNumber: '',
    treatmentDate: '',
    diagnosis: '',
    department: '',
    items: [],
    remarks: ''
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
  return dayjs(date).format('YYYY-MM-DD')
}

// 状态
const treatmentStatusType = (status: number) => {
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

const treatmentStatusText = (status: number) => {
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
