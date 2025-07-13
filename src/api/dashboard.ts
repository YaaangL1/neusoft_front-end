import request from '@/utils/request'
import type { Result } from '@/types'

export interface DashboardStatistics {
  totalAmount: number
  totalCount: number
  drugAmount: number
  drugCount: number
  treatmentAmount: number
  treatmentCount: number
  serviceAmount: number
  serviceCount: number
}

export interface DashboardActivity {
  id: number
  title: string
  content: string
  type: string
  createdTime: string
}

export const dashboardApi = {
  // 获取统计数据
  getStatistics(timeRange: string = 'month'): Promise<Result<DashboardStatistics>> {
    return request.get('/api/dashboard/statistics', {
      params: { timeRange }
    })
  },

  // 获取活动记录
  getActivities(): Promise<Result<DashboardActivity[]>> {
    return request.get('/api/dashboard/activities')
  }
} 