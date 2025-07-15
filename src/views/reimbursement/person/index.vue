<!-- 参保人员报销管理 -->
<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="参保人姓名">
        <el-input v-model="searchForm.personName" placeholder="请输入参保人姓名" clearable />
      </el-form-item>
      <!-- <el-form-item label="参保状态">
        <el-select v-model="searchForm.insuranceStatus" placeholder="请选择参保状态" clearable>
          <el-option label="已参保" value="1" />
          <el-option label="未参保" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="就业状态">
        <el-select v-model="searchForm.peopleType" placeholder="请选择就业状态" clearable>
          <el-option label="在职" value="1" />
          <el-option label="退休" value="0" />
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="tableData" border style="width: 100%">
      <el-table-column prop="realName" label="参保人姓名" />
      <el-table-column prop="cardNumber" label="身份证号" />
      <el-table-column prop="insuranceStatus" label="参保状态">
        <template #default="{ row }">
          <el-tag :type="row.insuranceStatus === '1' ? 'success' : 'danger'">
            {{ row.insuranceStatus === '1' ? '已参保' : '未参保' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="peopleType" label="就业状态">
        <template #default="{ row }">
          <el-tag :type="row.peopleType === '1' ? 'primary' : 'warning'">
            {{ row.peopleType === '1' ? '在职' : '退休' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="success" link @click="openDialog('expense', row)">费用</el-button>
            <el-button type="warning" link @click="openDialog('history', row)">历史</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="pagination.pageNum"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @update:current-page="pagination.pageNum = $event"
      @update:page-size="pagination.pageSize = $event"
    />

    <!-- 弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <template v-if="dialogType === 'expense'">
        <!-- 费用明细展示 -->
        <el-table :data="expenseData" border stripe>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="expenseTypeName" label="费用类型" />
          <el-table-column prop="itemName" label="项目名称" />
          <el-table-column prop="unitPrice" label="单价">
            <template #default="{ row }">
              {{ formatAmount(row.unitPrice) }}
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" />
          <el-table-column prop="totalAmount" label="金额">
            <template #default="{ row }">
              {{ formatAmount(row.totalAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="reimbursementRatio" label="报销比例">
            <template #default="{ row }">
              {{ row.reimbursementRatio }}%
            </template>
          </el-table-column>
          <el-table-column prop="reimbursementAmount" label="报销金额">
            <template #default="{ row }">
              {{ formatAmount(row.reimbursementAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="selfPayAmount" label="自付金额">
            <template #default="{ row }">
              {{ formatAmount(row.selfPayAmount) }}
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-else-if="dialogType === 'history'">
        <!-- 报销历史展示 -->
        <el-table :data="historyData" border stripe>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="reimbursementTime" label="报销时间">
            <template #default="{ row }">
              {{ formatDateTime(row.reimbursementTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalExpense" label="总费用">
            <template #default="{ row }">
              {{ formatAmount(row.totalExpense) }}
            </template>
          </el-table-column>
          <el-table-column prop="reimbursementAmount" label="报销金额">
            <template #default="{ row }">
              {{ formatAmount(row.reimbursementAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="selfPayAmount" label="自付金额">
            <template #default="{ row }">
              {{ formatAmount(row.selfPayAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)">
                {{ statusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="approver" label="审批人" />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </el-table>
      </template>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { insuredPersonApi, expenseApi, reimbursementApi } from '@/api/insurance'
import type {
  InsuredPerson,
  ExpenseDetail,
  ReimbursementCalculation,
  ReimbursementCalculationParams,
  ReimbursementExecuteParams,
  ReimbursementRecord
} from '@/types/insurance'
import dayjs from 'dayjs'

// 搜索表单
const searchForm = reactive({
  personName: ''
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const loading = ref(false)
const tableData = ref<InsuredPerson[]>([])

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref<'expense' | 'history'>('expense')
const dialogTitle = computed(() => {
  switch (dialogType.value) {
    case 'expense':
      return '费用明细'
    case 'history':
      return '报销历史'
    default:
      return ''
  }
})

// 费用明细数据
const expenseData = ref<ExpenseDetail[]>([])

// 报销历史数据
const historyData = ref<ReimbursementRecord[]>([])

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchInsuredPersons()
}

// 重置搜索
const resetSearch = () => {
  searchForm.personName = ''
  handleSearch()
}

// 获取参保人员列表
const fetchInsuredPersons = async () => {
  loading.value = true
  try {
    const res = await insuredPersonApi.getPage({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      personName: searchForm.personName
    })
    tableData.value = res.list
    pagination.total = res.total
  } catch (error) {
    console.error('获取参保人员列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 打开弹窗
const openDialog = (type: 'expense' | 'history', row: InsuredPerson) => {
  dialogType.value = type
  dialogVisible.value = true
  if (type === 'expense') {
    // 获取费用明细
    fetchExpenses(row.id)
  } else if (type === 'history') {
    // 获取报销历史
    fetchHistory(row.id)
  }
}

// 查看费用明细
const fetchExpenses = async (personId: number) => {
  try {
    const res = await expenseApi.getExpenses({
      personId,
      startDate: form.startDate,
      endDate: form.endDate
    })
    expenseData.value = res
  } catch (error) {
    console.error('获取费用明细失败:', error)
  }
}

// 查看报销历史
const fetchHistory = async (personId: number) => {
  try {
    const res = await reimbursementApi.getHistory(personId)
    historyData.value = res
  } catch (error) {
    console.error('获取报销历史失败:', error)
  }
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchInsuredPersons()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  fetchInsuredPersons()
}

// 格式化金额
const formatAmount = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) {
    return '0.00'
  }
  return amount.toFixed(2)
}

// 格式化日期
const formatDate = (date: string | undefined | null) => {
  if (!date) {
    return '未知'
  }
  return dayjs(date).format('YYYY-MM-DD')
}

// 格式化日期时间
const formatDateTime = (date: string | undefined | null) => {
  if (!date) {
    return '未知'
  }
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 状态类型
const statusType = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

// 状态文本
const statusText = (status: string) => {
  switch (status) {
    case 'pending':
      return '待审批'
    case 'approved':
      return '已通过'
    case 'rejected':
      return '已拒绝'
    default:
      return '未知'
  }
}

// 初始化
fetchInsuredPersons()
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-descriptions) {
  margin-bottom: 20px;
}
</style>
