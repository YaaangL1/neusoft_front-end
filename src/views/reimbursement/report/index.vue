<template>
  <div class="report-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <el-form-item label="报表类型" prop="reportType">
          <el-select v-model="searchForm.reportType" placeholder="请选择报表类型">
            <el-option label="月度报表" value="monthly" />
            <el-option label="季度报表" value="quarterly" />
            <el-option label="年度报表" value="yearly" />
          </el-select>
        </el-form-item>
        <el-form-item label="统计时间" prop="dateRange">
          <el-date-picker
            v-model="searchForm.dateRange"
            :type="datePickerType"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleGenerate">
            <el-icon><DocumentAdd /></el-icon>
            生成报表
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 报表列表 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>报表列表</span>
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
        <el-table-column prop="reportName" label="报表名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="reportType" label="报表类型" width="120">
          <template #default="{ row }">
            <el-tag :type="reportTypeTag(row.reportType)">
              {{ reportTypeText(row.reportType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.startDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="endDate" label="结束日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.endDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="总金额" width="150">
          <template #default="{ row }">
            ¥{{ formatAmount(row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="totalReimbursement" label="报销金额" width="150">
          <template #default="{ row }">
            ¥{{ formatAmount(row.totalReimbursement) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="生成时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleView(row)">
                查看
              </el-button>
              <el-button type="success" link @click="handleDownload(row)">
                下载
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

    <!-- 报表预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="报表预览"
      width="80%"
      top="5vh"
    >
      <div v-loading="previewLoading" class="preview-container">
        <div class="preview-header">
          <h2>{{ previewData.reportName }}</h2>
          <p>统计时间：{{ formatDate(previewData.startDate) }} 至 {{ formatDate(previewData.endDate) }}</p>
        </div>

        <!-- 统计概览 -->
        <el-descriptions title="统计概览" :column="4" border>
          <el-descriptions-item label="报销申请总数">
            {{ previewData.totalApplications }}
          </el-descriptions-item>
          <el-descriptions-item label="申请总金额">
            ¥{{ formatAmount(previewData.totalAmount) }}
          </el-descriptions-item>
          <el-descriptions-item label="报销总金额">
            ¥{{ formatAmount(previewData.totalReimbursement) }}
          </el-descriptions-item>
          <el-descriptions-item label="平均报销比例">
            {{ previewData.averageRatio }}%
          </el-descriptions-item>
        </el-descriptions>

        <!-- 费用类型分布 -->
        <div class="preview-section">
          <h3>费用类型分布</h3>
          <el-table :data="previewData.expenseTypeDistribution" border>
            <el-table-column prop="type" label="费用类型" />
            <el-table-column prop="amount" label="金额">
              <template #default="{ row }">
                ¥{{ formatAmount(row.amount) }}
              </template>
            </el-table-column>
            <el-table-column prop="percentage" label="占比">
              <template #default="{ row }">
                {{ row.percentage }}%
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 报销趋势 -->
        <div class="preview-section">
          <h3>报销趋势</h3>
          <div ref="trendChartRef" class="trend-chart"></div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleDownload(currentPreviewReport)">
            下载报表
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { request } from '@/utils/request'
import dayjs from 'dayjs'
import * as echarts from 'echarts'

// 接口定义
interface Report {
  id: number
  reportName: string
  reportType: string
  startDate: string
  endDate: string
  totalAmount: number
  totalReimbursement: number
  createTime: string
}

interface ReportPreview {
  reportName: string
  startDate: string
  endDate: string
  totalApplications: number
  totalAmount: number
  totalReimbursement: number
  averageRatio: number
  expenseTypeDistribution: {
    type: string
    amount: number
    percentage: number
  }[]
  trend: {
    dates: string[]
    amounts: number[]
    reimbursements: number[]
  }
}

// 搜索表单
const searchForm = reactive({
  reportType: 'monthly',
  dateRange: [] as string[]
})

// 日期选择器类型
const datePickerType = computed(() => {
  switch (searchForm.reportType) {
    case 'monthly':
      return 'month'
    case 'quarterly':
      return 'month'
    case 'yearly':
      return 'year'
    default:
      return 'date'
  }
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const loading = ref(false)
const tableData = ref<Report[]>([])

// 预览相关
const previewVisible = ref(false)
const previewLoading = ref(false)
const previewData = ref<ReportPreview>({
  reportName: '',
  startDate: '',
  endDate: '',
  totalApplications: 0,
  totalAmount: 0,
  totalReimbursement: 0,
  averageRatio: 0,
  expenseTypeDistribution: [],
  trend: {
    dates: [],
    amounts: [],
    reimbursements: []
  }
})
const currentPreviewReport = ref<Report | null>(null)
const trendChartRef = ref<HTMLElement>()
let trendChart: echarts.ECharts | null = null

// 获取报表列表
const fetchReports = async () => {
  loading.value = true
  try {
    const { list, total } = await request.get<{ list: Report[], total: number }>('/api/reimbursement/report', {
      ...pagination
    })
    tableData.value = list
    pagination.total = total
  } catch (error) {
    console.error('获取报表列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 生成报表
const handleGenerate = async () => {
  if (!searchForm.dateRange?.length) {
    ElMessage.warning('请选择统计时间')
    return
  }

  try {
    await request.post('/api/reimbursement/report/generate', {
      reportType: searchForm.reportType,
      startDate: searchForm.dateRange[0],
      endDate: searchForm.dateRange[1]
    })
    ElMessage.success('报表生成成功')
    fetchReports()
  } catch (error) {
    console.error('生成报表失败:', error)
  }
}

// 查看报表
const handleView = async (row: Report) => {
  previewLoading.value = true
  previewVisible.value = true
  currentPreviewReport.value = row

  try {
    const data = await request.get<ReportPreview>(`/api/reimbursement/report/${row.id}`)
    previewData.value = data
    
    // 初始化趋势图
    nextTick(() => {
      if (!trendChartRef.value) return

      if (!trendChart) {
        trendChart = echarts.init(trendChartRef.value)
      }

      const option = {
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['申请金额', '报销金额']
        },
        xAxis: {
          type: 'category',
          data: data.trend.dates
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '申请金额',
            type: 'line',
            data: data.trend.amounts
          },
          {
            name: '报销金额',
            type: 'line',
            data: data.trend.reimbursements
          }
        ]
      }
      trendChart.setOption(option)
    })
  } catch (error) {
    console.error('获取报表详情失败:', error)
  } finally {
    previewLoading.value = false
  }
}

// 下载报表
const handleDownload = async (row: Report) => {
  try {
    const blob = await request.get(`/api/reimbursement/report/${row.id}/download`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = row.reportName
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载报表失败:', error)
    ElMessage.error('下载失败')
  }
}

// 删除报表
const handleDelete = (row: Report) => {
  ElMessageBox.confirm(
    `确认删除报表"${row.reportName}"吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await request.delete(`/api/reimbursement/report/${row.id}`)
      ElMessage.success('删除成功')
      fetchReports()
    } catch (error) {
      console.error('删除失败:', error)
    }
  })
}

// 处理分页变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchReports()
}

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  fetchReports()
}

// 格式化金额
const formatAmount = (amount: number) => {
  return amount.toFixed(2)
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 格式化日期时间
const formatDateTime = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 报表类型
const reportTypeTag = (type: string) => {
  switch (type) {
    case 'monthly':
      return ''
    case 'quarterly':
      return 'warning'
    case 'yearly':
      return 'success'
    default:
      return 'info'
  }
}

const reportTypeText = (type: string) => {
  switch (type) {
    case 'monthly':
      return '月度报表'
    case 'quarterly':
      return '季度报表'
    case 'yearly':
      return '年度报表'
    default:
      return '未知'
  }
}

// 监听窗口大小变化
const handleResize = () => {
  trendChart?.resize()
}

onMounted(() => {
  fetchReports()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
})
</script>

<style scoped>
.report-container {
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

.preview-container {
  padding: 20px;
}

.preview-header {
  text-align: center;
  margin-bottom: 30px;
}

.preview-header h2 {
  margin: 0 0 10px;
}

.preview-header p {
  margin: 0;
  color: #909399;
}

.preview-section {
  margin-top: 30px;
}

.preview-section h3 {
  margin: 0 0 20px;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}

.trend-chart {
  height: 400px;
  margin-top: 20px;
}
</style>
