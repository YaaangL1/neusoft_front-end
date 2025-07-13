// src/mock/dashboard.ts
import type { DashboardStatistics, DashboardActivity } from '@/api/dashboard'
import type { Result } from '@/types'

// 生成随机数
const random = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// 模拟统计数据
export const mockStatistics: Result<DashboardStatistics> = {
  code: 200,
  message: 'success',
  data: {
    totalAmount: random(100000, 999999),
    totalCount: random(1000, 9999),
    drugAmount: random(50000, 499999),
    drugCount: random(500, 4999),
    treatmentAmount: random(30000, 299999),
    treatmentCount: random(300, 2999),
    serviceAmount: random(20000, 199999),
    serviceCount: random(200, 1999)
  }
}

// 模拟活动记录
const activityTypes = ['primary', 'success', 'warning', 'danger', 'info']
const activityTitles = [
  '新增报销申请',
  '审核通过',
  '报销完成',
  '申请驳回',
  '系统更新'
]

export const mockActivities: Result<DashboardActivity[]> = {
  code: 200,
  message: 'success',
  data: Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    title: activityTitles[random(0, activityTitles.length - 1)],
    content: `这是第 ${index + 1} 条活动记录的详细内容`,
    type: activityTypes[random(0, activityTypes.length - 1)],
    createdTime: new Date(Date.now() - random(0, 7) * 24 * 60 * 60 * 1000).toISOString()
  }))
}