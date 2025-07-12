<template>
    <div class="dashboard-container">
      <!-- 统计卡片 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="statistics-card">
            <template #header>
              <div class="card-header">
                <span>今日报销申请</span>
                <el-tag size="small" type="success">实时</el-tag>
              </div>
            </template>
            <div class="statistics-value">
              <span class="number">{{ statistics.todayApplications }}</span>
              <span class="unit">件</span>
            </div>
            <div class="statistics-compare">
              较昨日
              <span :class="statistics.applicationGrowth >= 0 ? 'up' : 'down'">
                {{ Math.abs(statistics.applicationGrowth) }}%
                <el-icon>
                  <component :is="statistics.applicationGrowth >= 0 ? 'ArrowUp' : 'ArrowDown'" />
                </el-icon>
              </span>
            </div>
          </el-card>
        </el-col>
  
        <el-col :span="6">
          <el-card shadow="hover" class="statistics-card">
            <template #header>
              <div class="card-header">
                <span>今日报销金额</span>
                <el-tag size="small" type="warning">实时</el-tag>
              </div>
            </template>
            <div class="statistics-value">
              <span class="number">{{ formatMoney(statistics.todayAmount) }}</span>
              <span class="unit">元</span>
            </div>
            <div class="statistics-compare">
              较昨日
              <span :class="statistics.amountGrowth >= 0 ? 'up' : 'down'">
                {{ Math.abs(statistics.amountGrowth) }}%
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
                <span>待审核申请</span>
                <el-tag size="small" type="danger">待处理</el-tag>
              </div>
            </template>
            <div class="statistics-value">
              <span class="number">{{ statistics.pendingReviews }}</span>
              <span class="unit">件</span>
            </div>
            <div class="statistics-compare">
              较昨日
              <span :class="statistics.reviewGrowth >= 0 ? 'up' : 'down'">
                {{ Math.abs(statistics.reviewGrowth) }}%
                <el-icon>
                  <component :is="statistics.reviewGrowth >= 0 ? 'ArrowUp' : 'ArrowDown'" />
                </el-icon>
              </span>
            </div>
          </el-card>
        </el-col>
  
        <el-col :span="6">
          <el-card shadow="hover" class="statistics-card">
            <template #header>
              <div class="card-header">
                <span>本月累计报销</span>
                <el-tag size="small" type="info">月度</el-tag>
              </div>
            </template>
            <div class="statistics-value">
              <span class="number">{{ formatMoney(statistics.monthlyAmount) }}</span>
              <span class="unit">元</span>
            </div>
            <div class="statistics-compare">
              较上月
              <span :class="statistics.monthlyGrowth >= 0 ? 'up' : 'down'">
                {{ Math.abs(statistics.monthlyGrowth) }}%
                <el-icon>
                  <component :is="statistics.monthlyGrowth >= 0 ? 'ArrowUp' : 'ArrowDown'" />
                </el-icon>
              </span>
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
                  <el-radio-button label="week">本周</el-radio-button>
                  <el-radio-button label="month">本月</el-radio-button>
                  <el-radio-button label="year">本年</el-radio-button>
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
            :timestamp="activity.time"
            :type="activity.type"
          >
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { request } from '@/utils/request'
  import * as echarts from 'echarts'
  
  // 统计数据接口
  interface Statistics {
    todayApplications: number
    applicationGrowth: number
    todayAmount: number
    amountGrowth: number
    pendingReviews: number
    reviewGrowth: number
    monthlyAmount: number
    monthlyGrowth: number
  }
  
  // 活动记录接口
  interface Activity {
    id: number
    content: string
    time: string
    type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  }
  
  const statistics = ref<Statistics>({
    todayApplications: 0,
    applicationGrowth: 0,
    todayAmount: 0,
    amountGrowth: 0,
    pendingReviews: 0,
    reviewGrowth: 0,
    monthlyAmount: 0,
    monthlyGrowth: 0
  })
  
  const activities = ref<Activity[]>([])
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
      const data = await request.get<Statistics>('/dashboard/statistics')
      statistics.value = data
    } catch (error) {
      console.error('获取统计数据失败:', error)
    }
  }
  
  // 获取活动记录
  const fetchActivities = async () => {
    try {
      const data = await request.get<Activity[]>('/dashboard/activities')
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
          smooth: true,
          data: [10000, 15000, 12000, 18000, 14000, 16000, 13000]
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
            { value: 1048, name: '门诊' },
            { value: 735, name: '住院' },
            { value: 580, name: '药品' },
            { value: 484, name: '检查' }
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
  
  // 监听窗口大小变化
  const handleResize = () => {
    amountChart?.resize()
    typeChart?.resize()
  }
  
  onMounted(() => {
    fetchStatistics()
    fetchActivities()
    initAmountChart()
    initTypeChart()
    window.addEventListener('resize', handleResize)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    amountChart?.dispose()
    typeChart?.dispose()
  })
  </script>
  
  <style scoped>
  .dashboard-container {
    padding: 20px;
  }
  
  .statistics-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    .statistics-value {
      text-align: center;
      margin: 20px 0;
  
      .number {
        font-size: 24px;
        font-weight: bold;
        color: #303133;
      }
  
      .unit {
        margin-left: 4px;
        font-size: 14px;
        color: #909399;
      }
    }
  
    .statistics-compare {
      text-align: center;
      font-size: 14px;
      color: #909399;
  
      .up {
        color: #67c23a;
      }
  
      .down {
        color: #f56c6c;
      }
    }
  }
  
  .chart-row {
    margin-top: 20px;
  }
  
  .chart {
    height: 300px;
  }
  
  .activity-card {
    margin-top: 20px;
  }
  </style>