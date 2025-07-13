import Mock from 'mockjs'
import { mockStatistics, mockActivities } from './dashboard'

// 设置延迟时间
Mock.setup({
  timeout: '200-600'
})

// 拦截 dashboard 相关请求
Mock.mock(/\/api\/dashboard\/statistics/, 'get', mockStatistics)
Mock.mock(/\/api\/dashboard\/activities/, 'get', mockActivities)

export default Mock