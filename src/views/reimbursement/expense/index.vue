<template>
  <div class="expense-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <el-form-item label="统计时间" prop="dateRange">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="费用类型" prop="expenseType">
          <el-select v-model="searchForm.expenseType" placeholder="请选择费用类型" clearable>
            <el-option label="门诊费用" :value="1" />
            <el-option label="住院费用" :value="2" />
            <el-option label="药品费用" :value="3" />
            <el-option label="检查费用" :value="4" />
          </el-select>
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

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :span="6">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>总申请金额</span>
              <el-tag size="small" type="info">累计</el-tag>
            </div>
          </template>
          <div class="statistics-value">
            <span class="number">¥{{ formatAmount(statistics.totalAmount) }}</span>
          </div>
          <div class="statistics-compare">
            较上月
            <span :class="statistics.amountGrowth >= 0 ? 'up' : 'down'">
              {{ Math.abs(statistics.amountGrowth).toFixed(2) }}%
              <el-icon>
                <component :is="statistics.amountGrowth >= 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>总报销金额</span>
              <el-tag size="small" type="success">累计</el-tag>
            </div>
          </template>
          <div class="statistics-value">
            <span class="number">¥{{ formatAmount(statistics.totalReimbursement) }}</span>
          </div>
          <div class="statistics-compare">
            较上月
            <span :class="statistics.reimbursementGrowth >= 0 ? 'up' : 'down'">
              {{ Math.abs(statistics.reimbursementGrowth).toFixed(2) }}%
              <el-icon>
                <component :is="statistics.reimbursementGrowth >= 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>报销比例</span>
              <el-tag size="small" type="warning">平均</el-tag>
            </div>
          </template>
          <div class="statistics-value">
            <span class="number">{{ statistics.averageRatio.toFixed(2) }}%</span>
          </div>
          <div class="statistics-compare">
            较上月
            <span :class="statistics.ratioGrowth >= 0 ? 'up' : 'down'">
              {{ Math.abs(statistics.ratioGrowth).toFixed(2) }}%
              <el-icon>
                <component :is="statistics.ratioGrowth >= 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>申请人数</span>
              <el-tag size="small" type="danger">累计</el-tag>
            </div>
          </template>
          <div class="statistics-value">
            <span class="number">{{ statistics.totalPeople }}</span>
          </div>
          <div class="statistics-compare">
            较上月
            <span :class="statistics.peopleGrowth >= 0 ? 'up' : 'down'">
              {{ Math.abs(statistics.peopleGrowth).toFixed(2) }}%
              <el-icon>
                <component :is="statistics.peopleGrowth >= 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
            </span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表展示 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>费用类型分布</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>报销金额趋势</span>
            </div>
          </template>
          <div ref="lineChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 明细表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>费用明细</span>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出Excel
          </el-button>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="expenseType" label="费用类型" width="120">
          <template #default="{ row }">
            {{ expenseTypeText(row.expenseType) }}
          </template>
        </el-table-column>
        <el-table-column prop="expenseDate" label="费用日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.expenseDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="patientName" label="患者姓名" width="120" />
        <el-table-column prop="amount" label="费用金额" width="120">
          <template #default="{ row }">
            ¥{{ formatAmount(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="reimbursementAmount" label="报销金额" width="120">
          <template #default="{ row }">
            ¥{{ formatAmount(row.reimbursementAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="ratio" label="报销比例" width="120">
          <template #default="{ row }">
            {{ row.ratio }}%
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { request } from '@/utils/request'
import dayjs from 'dayjs'
import * as echarts from 'echarts'

// 接口定义
interface Statistics {
  totalAmount: number
  totalReimbursement: number
  averageRatio: number
  totalPeople: number
  amountGrowth: number
  reimbursementGrowth: number
  ratioGrowth: number
  peopleGrowth: number
}

interface ExpenseDetail {
  expenseType: number
  expenseDate: string
  patientName: string
  amount: number
  reimbursementAmount: number
  ratio: number
  description: string
}

// 搜索表单
const searchForm = reactive({
  dateRange: [] as string[],
  expenseType: undefined as number | undefined
})

// 统计数据
const statistics = reactive<Statistics>({
  totalAmount: 0,
  totalReimbursement: 0,
  averageRatio: 0,
  totalPeople: 0,
  amountGrowth: 0,
  reimbursementGrowth: 0,
  ratioGrowth: 0,
  peopleGrowth: 0
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const loading = ref(false)
const tableData = ref<ExpenseDetail[]>([])

// 图表实例
const pieChartRef = ref<HTMLElement>()
const lineChartRef = ref<HTMLElement>()
let pieChart: echarts.ECharts | null = null
let lineChart: echarts.ECharts | null = null

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const data = await request.get<Statistics>('/api/reimbursement/expense/statistics', {
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1],
      expenseType: searchForm.expenseType
    })
    Object.assign(statistics, data)
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取费用明细
const fetchExpenseDetails = async () => {
  loading.value = true
  try {
    const { list, total } = await request.get<{ list: ExpenseDetail[], total: number }>('/api/reimbursement/expense/details', {
      ...searchForm,
      ...pagination,
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1]
    })
    tableData.value = list
    pagination.total = total
  } catch (error) {
    console.error('获取费用明细失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '费用类型',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 0, name: '门诊费用' },
          { value: 0, name: '住院费用' },
          { value: 0, name: '药品费用' },
          { value: 0, name: '检查费用' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  pieChart.setOption(option)
}

// 初始化折线图
const initLineChart = () => {
  if (!lineChartRef.value) return

  lineChart = echarts.init(lineChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['申请金额', '报销金额']
    },
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '申请金额',
        type: 'line',
        data: []
      },
      {
        name: '报销金额',
        type: 'line',
        data: []
      }
    ]
  }
  lineChart.setOption(option)
}

// 更新图表数据
const updateCharts = async () => {
  try {
    // 获取饼图数据
    const pieData = await request.get('/api/reimbursement/expense/type-distribution')
    if (pieChart) {
      pieChart.setOption({
        series: [{
          data: pieData
        }]
      })
    }

    // 获取折线图数据
    const lineData = await request.get('/api/reimbursement/expense/trend')
    if (lineChart) {
      lineChart.setOption({
        xAxis: {
          data: lineData.dates
        },
        series: [
          {
            data: lineData.amounts
          },
          {
            data: lineData.reimbursements
          }
        ]
      })
    }
  } catch (error) {
    console.error('更新图表数据失败:', error)
  }
}

// 处理查询
const handleSearch = () => {
  pagination.pageNum = 1
  Promise.all([
    fetchStatistics(),
    fetchExpenseDetails(),
    updateCharts()
  ])
}

// 重置查询
const resetSearch = () => {
  Object.assign(searchForm, {
    dateRange: [],
    expenseType: undefined
  })
  handleSearch()
}

// 处理导出
const handleExport = async () => {
  try {
    const blob = await request.get('/api/reimbursement/expense/export', {
      ...searchForm,
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1],
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '费用明细.xlsx'
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 处理分页变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchExpenseDetails()
}

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  fetchExpenseDetails()
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toFixed(2)
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 费用类型文本
const expenseTypeText = (type: number) => {
  switch (type) {
    case 1:
      return '门诊费用'
    case 2:
      return '住院费用'
    case 3:
      return '药品费用'
    case 4:
      return '检查费用'
    default:
      return '未知'
  }
}

// 监听窗口大小变化
const handleResize = () => {
  pieChart?.resize()
  lineChart?.resize()
}

onMounted(() => {
  initPieChart()
  initLineChart()
  handleSearch()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
  lineChart?.dispose()
})
</script>

<style scoped>
.expense-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.statistics-row {
  margin-bottom: 20px;
}

.statistics-card {
  height: 180px;
}

.statistics-value {
  text-align: center;
  padding: 20px 0;
}

.statistics-value .number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.statistics-compare {
  text-align: center;
  font-size: 14px;
  color: #909399;
}

.statistics-compare .up {
  color: #67c23a;
}

.statistics-compare .down {
  color: #f56c6c;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
}

.chart {
  height: 100%;
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
