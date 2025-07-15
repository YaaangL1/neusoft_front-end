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
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
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
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>费用类型分布</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 明细表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>费用类型明细</span>
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
        :data="expenseTypeData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="categoryName" label="费用类型" width="150" />
        <el-table-column prop="amount" label="费用金额" width="150">
          <template #default="{ row }">
            ¥{{ formatAmount(row.amount) }}
          </template>
        </el-table-column>
        <el-table-column prop="percentage" label="占比" width="100">
          <template #default="{ row }">
            {{ row.percentage }}%
          </template>
        </el-table-column>
        <el-table-column prop="itemCount" label="项目数量" width="100" />
      </el-table>
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
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined,
})

// 日期范围
const dateRange = ref<[string, string] | null>(null)

// 处理日期变化
const handleDateChange = (val: [string, string] | null) => {
  if (val) {
    searchForm.startDate = val[0]
    searchForm.endDate = val[1]
  } else {
    searchForm.startDate = undefined
    searchForm.endDate = undefined
  }
}

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
const expenseTypeData = ref<{categoryName: string; amount: number; percentage: number; itemCount: number}[]>([])

// 图表实例
const pieChartRef = ref<HTMLElement>()
let pieChart: echarts.ECharts | null = null

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

// 获取费用数据
const fetchExpenses = async () => {
  if (!searchForm.personId) {
    ElMessage.warning('请选择参保人')
    return
  }

  loading.value = true
  try {
    // 获取费用明细数据
    const res = await expenseApi.getExpenses({
      personId: searchForm.personId,
      startDate: searchForm.startDate,
      endDate: searchForm.endDate,
      expenseType: 'drug' // 默认查询药品费用
    })
    tableData.value = res
    
    // 渲染图表和更新统计数据（在renderCharts方法中使用综合报告数据更新统计信息）
    await nextTick()
    await renderCharts()
  } catch (error) {
    console.error('获取费用数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 更新统计数据（注：此方法已不再使用，统计数据现在从综合报告API获取）
const updateStatistics = () => {
  // 此方法保留但不再使用，统计数据现在从综合报告API获取并在renderCharts方法中更新
  // 以下代码仅作为备份
  /*
  statistics.totalAmount = tableData.value.reduce((sum: number, item: ExpenseDetail) => sum + item.amount, 0)
  statistics.drugAmount = tableData.value
    .filter((item: ExpenseDetail) => item.expenseType === 'drug')
    .reduce((sum: number, item: ExpenseDetail) => sum + item.amount, 0)
  statistics.treatmentAmount = tableData.value
    .filter((item: ExpenseDetail) => item.expenseType === 'treatment')
    .reduce((sum: number, item: ExpenseDetail) => sum + item.amount, 0)
  */
}

// 渲染图表
const renderCharts = async () => {
  try {
    // 费用类型分布图
    if (!searchForm.personId) return;
    
    // 获取综合报告数据
    const reportResponse = await expenseApi.getComprehensiveReport(
      searchForm.personId,
      searchForm.startDate,
      searchForm.endDate
    );
    
    console.log('综合报告数据:', reportResponse);
    
    if (reportResponse && reportResponse.data) {
      const reportData = reportResponse.data;
      
      // 更新统计数据
      if (reportData.expenseSummary) {
        // 设置总金额
        statistics.totalAmount = reportData.expenseSummary.totalAmount || 0;
        
        // 累加各类药品费用
        statistics.drugAmount = 
          (reportData.expenseSummary.categoryADrugAmount || 0) + 
          (reportData.expenseSummary.categoryBDrugAmount || 0) + 
          (reportData.expenseSummary.categoryCDrugAmount || 0);
        
        // 获取诊疗费用
        statistics.treatmentAmount = reportData.expenseSummary.treatmentAmount || 0;
      }
      
      // 从费用类型比例中获取药品费用（如果上面的方法没有获取到数据）
      if (statistics.drugAmount === 0 && reportData.expenseTypeRatio) {
        const drugTypeData = reportData.expenseTypeRatio.find(item => 
          item.categoryName === '药品费用' || item.categoryName === '药品');
        if (drugTypeData) {
          statistics.drugAmount = drugTypeData.amount || 0;
        }
      }
      
      // 更新费用类型饼图
      if (pieChart && reportData.expenseTypeRatio && Array.isArray(reportData.expenseTypeRatio) && reportData.expenseTypeRatio.length > 0) {
        console.log('费用类型分布数据:', reportData.expenseTypeRatio);
        
        // 构建饼图数据
        const pieData = reportData.expenseTypeRatio.map(item => ({
          name: item.categoryName || '未知类型',
          value: item.amount || 0
        }));
        
        // 更新饼图
        pieChart.setOption({
          series: [{
            data: pieData
          }]
        });
      } else {
        console.warn('费用类型分布数据为空或格式不正确');
        if (pieChart) {
          pieChart.setOption({
            series: [{
              data: [
                { name: '暂无数据', value: 0 }
              ]
            }]
          });
        }
      }
      
      // 更新药品分类饼图（如果需要）
      if (reportData.drugCategoryRatio && Array.isArray(reportData.drugCategoryRatio) && reportData.drugCategoryRatio.length > 0) {
        console.log('药品分类占比数据:', reportData.drugCategoryRatio);
        // 此处可以添加另一个饼图来显示药品分类占比
      }
      
      // 更新费用类型数据表格
      if (reportData.expenseTypeRatio && Array.isArray(reportData.expenseTypeRatio)) {
        expenseTypeData.value = reportData.expenseTypeRatio;
      }
    }
  } catch (error) {
    console.error('渲染图表失败:', error);
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

// 处理查询
const handleSearch = () => {
  pagination.pageNum = 1
  fetchExpenses()
}

// 重置搜索
const resetSearch = () => {
  searchForm.personId = undefined
  searchForm.startDate = undefined
  searchForm.endDate = undefined
  dateRange.value = null
  personOptions.value = []
  handleSearch()
}

// 导出Excel
const handleExport = async () => {
  if (!searchForm.personId) {
    ElMessage.warning('请选择参保人')
    return
  }

  try {
    const blob = await expenseApi.exportExpenses(searchForm.personId, {
      expenseType: 'drug', // 默认导出药品费用
      startDate: searchForm.startDate,
      endDate: searchForm.endDate
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `费用明细_${dayjs().format('YYYY-MM-DD')}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出Excel失败:', error)
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
const formatAmount = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) {
    return '0.00'
  }
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
}

onMounted(() => {
  // 使用 nextTick 确保 DOM 已经渲染
  nextTick(() => {
    initPieChart()
  })
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
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
