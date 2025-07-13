<template>
    <div class="dashboard-container">
      <!-- 统计卡片 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="statistics-card">
            <template #header>
              <div class="card-header">
              <span>报销申请总数</span>
                <el-tag size="small" type="success">实时</el-tag>
              </div>
            </template>
            <div class="statistics-value">
            <span class="number">{{ statistics.totalCount }}</span>
              <span class="unit">件</span>
            </div>
          </el-card>
        </el-col>
  
        <el-col :span="6">
          <el-card shadow="hover" class="statistics-card">
            <template #header>
              <div class="card-header">
              <span>报销总金额</span>
                <el-tag size="small" type="warning">实时</el-tag>
              </div>
            </template>
            <div class="statistics-value">
            <span class="number">{{ formatMoney(statistics.totalAmount) }}</span>
              <span class="unit">元</span>
            </div>
          </el-card>
        </el-col>
  
        <el-col :span="6">
          <el-card shadow="hover" class="statistics-card">
            <template #header>
              <div class="card-header">
              <span>药品报销金额</span>
              <el-tag size="small" type="danger">实时</el-tag>
              </div>
            </template>
            <div class="statistics-value">
            <span class="number">{{ formatMoney(statistics.drugAmount) }}</span>
            <span class="unit">元</span>
            </div>
          </el-card>
        </el-col>
  
        <el-col :span="6">
          <el-card shadow="hover" class="statistics-card">
            <template #header>
              <div class="card-header">
              <span>诊疗报销金额</span>
              <el-tag size="small" type="info">实时</el-tag>
              </div>
            </template>
            <div class="statistics-value">
            <span class="number">{{ formatMoney(statistics.treatmentAmount) }}</span>
              <span class="unit">元</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
  
      <!-- 图表区域 -->
      <el-row :gutter="20" class="chart-row">
        <el-col :span="16">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>报销金额趋势</span>
                <el-radio-group v-model="timeRange" size="small">
                <el-radio-button value="week">本周</el-radio-button>
                <el-radio-button value="month">本月</el-radio-button>
                <el-radio-button value="year">本年</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="amountChartRef" class="chart"></div>
          </el-card>
        </el-col>
  
        <el-col :span="8">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>报销类型分布</span>
              </div>
            </template>
            <div ref="typeChartRef" class="chart"></div>
          </el-card>
        </el-col>
      </el-row>
  
      <!-- 最新动态 -->
      <el-card shadow="hover" class="activity-card">
        <template #header>
          <div class="card-header">
            <span>最新动态</span>
          </div>
        </template>
        <el-timeline>
          <el-timeline-item
            v-for="activity in activities"
            :key="activity.id"
          :timestamp="activity.createdTime"
            :type="activity.type"
          >
          <h4>{{ activity.title }}</h4>
          <p>{{ activity.content }}</p>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </template>
  
  <script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
  import * as echarts from 'echarts'
import { dashboardApi } from '@/api/dashboard'
import type { DashboardStatistics, DashboardActivity } from '@/api/dashboard'
  
const statistics = ref<DashboardStatistics>({
  totalAmount: 0,
  totalCount: 0,
  drugAmount: 0,
  drugCount: 0,
  treatmentAmount: 0,
  treatmentCount: 0,
  serviceAmount: 0,
  serviceCount: 0
  })
  
const activities = ref<DashboardActivity[]>([])
  const timeRange = ref('week')
  const amountChartRef = ref<HTMLElement>()
  const typeChartRef = ref<HTMLElement>()
  let amountChart: echarts.ECharts | null = null
  let typeChart: echarts.ECharts | null = null
  
  // 格式化金额
  const formatMoney = (amount: number) => {
    return amount.toLocaleString('zh-CN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  
  // 获取统计数据
  const fetchStatistics = async () => {
    try {
    const { data } = await dashboardApi.getStatistics(timeRange.value)
      statistics.value = data
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }
  
  // 获取活动记录
  const fetchActivities = async () => {
    try {
    const { data } = await dashboardApi.getActivities()
      activities.value = data
    } catch (error) {
      console.error('获取活动记录失败:', error)
    }
  }
  
  // 初始化金额趋势图表
  const initAmountChart = () => {
    if (!amountChartRef.value) return
    amountChart = echarts.init(amountChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '报销金额',
          type: 'line',
        data: [150, 230, 224, 218, 135, 147, 260]
        }
      ]
    }
    
    amountChart.setOption(option)
  }
  
  // 初始化类型分布图表
  const initTypeChart = () => {
    if (!typeChartRef.value) return
    typeChart = echarts.init(typeChartRef.value)
    
    const option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '报销类型',
          type: 'pie',
          radius: '50%',
          data: [
          { value: statistics.value.drugAmount, name: '药品费用' },
          { value: statistics.value.treatmentAmount, name: '诊疗费用' },
          { value: statistics.value.serviceAmount, name: '医疗服务' }
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
    
    typeChart.setOption(option)
  }
  
// 监听时间范围变化
watch(timeRange, () => {
  fetchStatistics()
})
  
  onMounted(() => {
    fetchStatistics()
    fetchActivities()
    initAmountChart()
    initTypeChart()
  
  window.addEventListener('resize', () => {
    amountChart?.resize()
    typeChart?.resize()
  })
  })
  
  onUnmounted(() => {
    amountChart?.dispose()
    typeChart?.dispose()
  window.removeEventListener('resize', () => {
    amountChart?.resize()
    typeChart?.resize()
  })
  })
  </script>
  
  <style scoped>
  .dashboard-container {
    padding: 20px;
  }
  
  .statistics-card {
  margin-bottom: 20px;
}

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    .statistics-value {
      text-align: center;
      margin: 20px 0;
}
  
.statistics-value .number {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }
  
.statistics-value .unit {
        font-size: 14px;
        color: #909399;
  margin-left: 5px;
  }
  
  .chart-row {
  margin-bottom: 20px;
  }
  
  .chart {
    height: 300px;
  }
  
  .activity-card {
  margin-bottom: 20px;
}

:deep(.el-timeline-item__content) h4 {
  color: #303133;
  margin: 0 0 8px;
}

:deep(.el-timeline-item__content) p {
  color: #606266;
  margin: 0;
  }
  </style>