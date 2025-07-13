<!-- 费用查询 -->
<template>
  <div class="expense-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <el-form-item label="参保人">
          <el-select
            v-model="searchForm.personId"
            placeholder="请选择参保人"
            filterable
            remote
            :remote-method="searchPerson"
            :loading="personLoading"
          >
            <el-option
              v-for="item in personOptions"
              :key="item.id"
              :label="item.realName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="费用类型">
          <el-select v-model="searchForm.expenseType" placeholder="请选择费用类型" clearable>
            <el-option label="药品费用" value="drug" />
            <el-option label="诊疗费用" value="treatment" />
            <el-option label="医疗服务费用" value="service" />
          </el-select>
        </el-form-item>
        <el-form-item label="费用日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateRangeChange"
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

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :span="8">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>总费用</span>
              <el-tag size="small" type="info">累计</el-tag>
            </div>
          </template>
          <div class="statistics-value">
            <span class="number">¥{{ formatAmount(statistics.totalAmount) }}</span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>药品费用</span>
              <el-tag size="small" type="success">累计</el-tag>
            </div>
          </template>
          <div class="statistics-value">
            <span class="number">¥{{ formatAmount(statistics.drugAmount) }}</span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="statistics-card">
          <template #header>
            <div class="card-header">
              <span>诊疗费用</span>
              <el-tag size="small" type="warning">累计</el-tag>
            </div>
          </template>
          <div class="statistics-value">
            <span class="number">¥{{ formatAmount(statistics.treatmentAmount) }}</span>
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
              <span>费用趋势</span>
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
          <el-button-group>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出Excel
          </el-button>
          </el-button-group>
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
        <el-table-column prop="amount" label="费用金额" width="120">
          <template #default="{ row }">
            ¥{{ formatAmount(row.amount) }}
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
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { insuredPersonApi, expenseApi } from '@/api/insurance'
import type { InsuredPerson, ExpenseDetail } from '@/types/insurance'
import dayjs from 'dayjs'
import * as echarts from 'echarts'

// 搜索表单
const searchForm = reactive({
  personId: undefined as number | undefined,
  expenseType: undefined as string | undefined,
  dateRange: [] as string[],
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined
})

// 参保人选项
const personLoading = ref(false)
const personOptions = ref<InsuredPerson[]>([])

// 统计数据
const statistics = reactive({
  totalAmount: 0,
  drugAmount: 0,
  treatmentAmount: 0
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

// 搜索参保人
const searchPerson = async (query: string) => {
  if (query) {
    personLoading.value = true
    try {
      const data = await insuredPersonApi.search({ personName: query })
      personOptions.value = data
    } catch (error) {
      console.error('搜索参保人失败:', error)
    } finally {
      personLoading.value = false
    }
  } else {
    personOptions.value = []
  }
}

// 获取费用明细
const fetchExpenses = async () => {
  if (!searchForm.personId) {
    ElMessage.warning('请选择参保人')
    return
  }

  loading.value = true
  try {
    const res = await expenseApi.getExpenses({
      personId: searchForm.personId,
      expenseType: searchForm.expenseType,
      startDate: searchForm.startDate,
      endDate: searchForm.endDate
    })
    tableData.value = res
    pagination.total = res.length

    // 更新统计数据
    statistics.totalAmount = res.reduce((sum: number, item: ExpenseDetail) => sum + item.amount, 0)
    statistics.drugAmount = res
      .filter((item: ExpenseDetail) => item.expenseType === 'drug')
      .reduce((sum: number, item: ExpenseDetail) => sum + item.amount, 0)
    statistics.treatmentAmount = res
      .filter((item: ExpenseDetail) => item.expenseType === 'treatment')
      .reduce((sum: number, item: ExpenseDetail) => sum + item.amount, 0)

    // 更新图表
    updateCharts()
  } catch (error) {
    console.error('获取费用明细失败:', error)
  } finally {
    loading.value = false
  }
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return

  // 确保元素有高度和宽度
  if (pieChartRef.value.clientHeight === 0 || pieChartRef.value.clientWidth === 0) {
    setTimeout(initPieChart, 100)
    return
  }

  if (pieChart) {
    pieChart.dispose()
  }

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
        data: [],
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

  // 确保元素有高度和宽度
  if (lineChartRef.value.clientHeight === 0 || lineChartRef.value.clientWidth === 0) {
    setTimeout(initLineChart, 100)
    return
  }

  if (lineChart) {
    lineChart.dispose()
  }

  lineChart = echarts.init(lineChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['费用金额']
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
        name: '费用金额',
        type: 'line',
        data: []
      }
    ]
  }
  lineChart.setOption(option)
}

// 更新图表数据
const updateCharts = async () => {
  if (!searchForm.personId) return

  try {
    // 更新饼图
    const typeData = await expenseApi.getExpenseTypeChart(
      searchForm.personId,
      searchForm.startDate,
      searchForm.endDate
    )
    if (pieChart) {
      pieChart.setOption({
        series: [{
          data: typeData.map(item => ({
            name: expenseTypeText(item.type),
            value: item.amount
          }))
        }]
      })
    }

    // 更新折线图
    if (lineChart) {
      lineChart.setOption({
        xAxis: {
          data: tableData.value.map(item => formatDate(item.expenseDate))
        },
        series: [{
          data: tableData.value.map(item => item.amount)
        }]
      })
    }
  } catch (error) {
    console.error('更新图表数据失败:', error)
  }
}

// 处理日期范围变化
const handleDateRangeChange = (val: [string, string] | null) => {
  if (val) {
    searchForm.startDate = val[0]
    searchForm.endDate = val[1]
  } else {
    searchForm.startDate = undefined
    searchForm.endDate = undefined
  }
}

// 处理查询
const handleSearch = () => {
  pagination.pageNum = 1
  fetchExpenses()
}

// 重置查询
const resetSearch = () => {
  Object.assign(searchForm, {
    personId: undefined,
    expenseType: undefined,
    dateRange: [],
    startDate: undefined,
    endDate: undefined
  })
  personOptions.value = []
}

// 处理导出
const handleExport = async () => {
  if (!searchForm.personId) {
    ElMessage.warning('请选择参保人')
    return
  }

  try {
    const blob = await expenseApi.exportExpenses(searchForm.personId, {
      expenseType: searchForm.expenseType,
      startDate: searchForm.startDate,
      endDate: searchForm.endDate
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
  fetchExpenses()
}

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  fetchExpenses()
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
const expenseTypeText = (type: string) => {
  switch (type) {
    case 'drug':
      return '药品费用'
    case 'treatment':
      return '诊疗费用'
    case 'service':
      return '医疗服务费用'
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
  // 使用 nextTick 确保 DOM 已经渲染
  nextTick(() => {
    initPieChart()
    initLineChart()
  })
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
  lineChart?.dispose()
})
</script>

<style lang="scss" scoped>
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
  height: 160px;
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

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  height: 400px;
  .chart {
    height: 320px;
  }
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
