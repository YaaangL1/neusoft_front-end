<template>
  <div class="person-container">
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
        <el-form-item label="身份证号" prop="idCard">
          <el-input
            v-model="searchForm.idCard"
            placeholder="请输入身份证号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="报销状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择报销状态" clearable>
            <el-option label="待审核" :value="1" />
            <el-option label="审核通过" :value="2" />
            <el-option label="审核拒绝" :value="3" />
            <el-option label="已报销" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请日期" prop="applyDate">
          <el-date-picker
            v-model="searchForm.applyDate"
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
          <span>个人报销申请列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增申请
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
        <el-table-column prop="idCard" label="身份证号" width="180" />
        <el-table-column prop="totalAmount" label="总金额" width="120">
          <template #default="{ row }">
            ¥{{ formatAmount(row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="reimbursementAmount" label="报销金额" width="120">
          <template #default="{ row }">
            ¥{{ formatAmount(row.reimbursementAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="applyDate" label="申请日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.applyDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="reimbursementStatusType(row.status)">
              {{ reimbursementStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="success" link @click="handleView(row)">
                查看
              </el-button>
              <el-button type="warning" link @click="handleAudit(row)" v-if="row.status === 1">
                审核
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
      :title="dialogType === 'add' ? '新增报销申请' : dialogType === 'edit' ? '编辑报销申请' : '查看报销申请'"
      width="800px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        :disabled="dialogType === 'view'"
      >
        <!-- 基本信息 -->
        <el-divider>基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="患者姓名" prop="patientName">
              <el-input v-model="form.patientName" placeholder="请输入患者姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 费用信息 -->
        <el-divider>费用信息</el-divider>
        <el-table :data="form.expenseItems" border>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="expenseType" label="费用类型" width="150">
            <template #default="{ row, $index }">
              <el-select v-model="row.expenseType" placeholder="请选择费用类型">
                <el-option label="门诊费用" :value="1" />
                <el-option label="住院费用" :value="2" />
                <el-option label="药品费用" :value="3" />
                <el-option label="检查费用" :value="4" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="expenseDate" label="费用日期" width="150">
            <template #default="{ row }">
              <el-date-picker
                v-model="row.expenseDate"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column prop="amount" label="金额" width="150">
            <template #default="{ row }">
              <el-input-number
                v-model="row.amount"
                :precision="2"
                :step="0.01"
                :min="0"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column prop="description" label="说明">
            <template #default="{ row }">
              <el-input v-model="row.description" placeholder="请输入说明" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ $index }">
              <el-button type="danger" link @click="removeExpenseItem($index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="expense-footer">
          <el-button type="primary" @click="addExpenseItem">
            <el-icon><Plus /></el-icon>
            添加费用项
          </el-button>
          <div class="expense-total">
            总金额：<span class="amount">¥{{ calculateTotal() }}</span>
          </div>
        </div>

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

    <!-- 审核对话框 -->
    <el-dialog
      v-model="auditDialogVisible"
      title="报销审核"
      width="500px"
    >
      <el-form
        ref="auditFormRef"
        :model="auditForm"
        :rules="auditRules"
        label-width="100px"
      >
        <el-form-item label="审核结果" prop="status">
          <el-radio-group v-model="auditForm.status">
            <el-radio :label="2">通过</el-radio>
            <el-radio :label="3">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="报销比例" prop="ratio" v-if="auditForm.status === 2">
          <el-input-number
            v-model="auditForm.ratio"
            :min="0"
            :max="100"
            :step="5"
          />
          <span class="ratio-unit">%</span>
        </el-form-item>
        <el-form-item label="审核意见" prop="auditRemarks">
          <el-input
            v-model="auditForm.auditRemarks"
            type="textarea"
            rows="3"
            placeholder="请输入审核意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="auditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAuditSubmit">确定</el-button>
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
interface ExpenseItem {
  expenseType: number
  expenseDate: string
  amount: number
  description: string
}

interface ReimbursementRecord {
  id: number
  patientName: string
  idCard: string
  totalAmount: number
  reimbursementAmount: number
  applyDate: string
  status: number
  remarks?: string
  expenseItems: ExpenseItem[]
  createTime: string
  updateTime: string
}

// 搜索表单
const searchForm = reactive({
  patientName: '',
  idCard: '',
  status: undefined as number | undefined,
  applyDate: [] as string[]
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const loading = ref(false)
const tableData = ref<ReimbursementRecord[]>([])

// 表单数据
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit' | 'view'>('add')
const formRef = ref<FormInstance>()
const form = reactive<Partial<ReimbursementRecord>>({
  patientName: '',
  idCard: '',
  remarks: '',
  expenseItems: []
})

// 审核表单数据
const auditDialogVisible = ref(false)
const auditFormRef = ref<FormInstance>()
const auditForm = reactive({
  id: 0,
  status: 2,
  ratio: 70,
  auditRemarks: ''
})

// 表单校验规则
const rules: FormRules = {
  patientName: [
    { required: true, message: '请输入患者姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ]
}

// 审核表单校验规则
const auditRules: FormRules = {
  status: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ],
  ratio: [
    { required: true, message: '请输入报销比例', trigger: 'blur' }
  ],
  auditRemarks: [
    { required: true, message: '请输入审核意见', trigger: 'blur' }
  ]
}

// 获取报销记录列表
const fetchReimbursementRecords = async () => {
  loading.value = true
  try {
    const { list, total } = await request.get<{ list: ReimbursementRecord[], total: number }>('/api/reimbursement/person', {
      ...searchForm,
      ...pagination,
      startDate: searchForm.applyDate?.[0],
      endDate: searchForm.applyDate?.[1]
    })
    tableData.value = list
    pagination.total = total
  } catch (error) {
    console.error('获取报销记录列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理查询
const handleSearch = () => {
  pagination.pageNum = 1
  fetchReimbursementRecords()
}

// 重置查询
const resetSearch = () => {
  Object.assign(searchForm, {
    patientName: '',
    idCard: '',
    status: undefined,
    applyDate: []
  })
  handleSearch()
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  form.expenseItems = []
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = (row: ReimbursementRecord) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理查看
const handleView = (row: ReimbursementRecord) => {
  dialogType.value = 'view'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 处理删除
const handleDelete = (row: ReimbursementRecord) => {
  ElMessageBox.confirm(
    `确认删除患者"${row.patientName}"的报销申请吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await request.delete(`/api/reimbursement/person/${row.id}`)
      ElMessage.success('删除成功')
      fetchReimbursementRecords()
    } catch (error) {
      console.error('删除失败:', error)
    }
  })
}

// 处理审核
const handleAudit = (row: ReimbursementRecord) => {
  auditForm.id = row.id
  auditForm.status = 2
  auditForm.ratio = 70
  auditForm.auditRemarks = ''
  auditDialogVisible.value = true
}

// 处理审核提交
const handleAuditSubmit = async () => {
  if (!auditFormRef.value) return

  await auditFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.post(`/api/reimbursement/person/audit/${auditForm.id}`, auditForm)
        ElMessage.success('审核成功')
        auditDialogVisible.value = false
        fetchReimbursementRecords()
      } catch (error) {
        console.error('审核失败:', error)
      }
    }
  })
}

// 添加费用项
const addExpenseItem = () => {
  form.expenseItems?.push({
    expenseType: 1,
    expenseDate: dayjs().format('YYYY-MM-DD'),
    amount: 0,
    description: ''
  })
}

// 移除费用项
const removeExpenseItem = (index: number) => {
  form.expenseItems?.splice(index, 1)
}

// 计算总金额
const calculateTotal = () => {
  return form.expenseItems?.reduce((total, item) => total + (item.amount || 0), 0).toFixed(2) || '0.00'
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      if (!form.expenseItems?.length) {
        ElMessage.warning('请至少添加一项费用')
        return
      }

      try {
        if (dialogType.value === 'add') {
          await request.post('/api/reimbursement/person', form)
          ElMessage.success('新增成功')
        } else {
          await request.put(`/api/reimbursement/person/${form.id}`, form)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchReimbursementRecords()
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
    idCard: '',
    remarks: '',
    expenseItems: []
  })
}

// 处理分页变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchReimbursementRecords()
}

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  fetchReimbursementRecords()
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toFixed(2)
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 报销状态
const reimbursementStatusType = (status: number) => {
  switch (status) {
    case 1:
      return 'warning'
    case 2:
      return 'success'
    case 3:
      return 'danger'
    case 4:
      return ''
    default:
      return 'info'
  }
}

const reimbursementStatusText = (status: number) => {
  switch (status) {
    case 1:
      return '待审核'
    case 2:
      return '审核通过'
    case 3:
      return '审核拒绝'
    case 4:
      return '已报销'
    default:
      return '未知'
  }
}

// 初始化
fetchReimbursementRecords()
</script>

<style scoped>
.person-container {
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

.expense-footer {
  margin: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expense-total {
  font-size: 16px;
}

.expense-total .amount {
  color: #f56c6c;
  font-weight: bold;
  margin-left: 10px;
}

.ratio-unit {
  margin-left: 10px;
}
</style>
