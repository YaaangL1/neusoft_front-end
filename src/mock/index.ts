import Mock from 'mockjs'

// 仪表盘数据
Mock.mock('/api/dashboard/statistics', 'get', {
  code: 200,
  data: {
    todayApplications: Mock.Random.integer(50, 200),
    applicationGrowth: Mock.Random.float(-30, 30),
    todayAmount: Mock.Random.float(10000, 50000),
    amountGrowth: Mock.Random.float(-20, 40),
    pendingReviews: Mock.Random.integer(10, 50),
    reviewGrowth: Mock.Random.float(-10, 20),
    monthlyAmount: Mock.Random.float(100000, 500000),
    monthlyGrowth: Mock.Random.float(-15, 25)
  }
})

// 活动记录
Mock.mock('/api/dashboard/activities', 'get', {
  code: 200,
  data: [
    {
      id: 1,
      content: '张三提交了报销申请',
      time: '2024-03-11 10:00:00',
      type: 'primary'
    },
    {
      id: 2,
      content: '李四的报销申请已审核通过',
      time: '2024-03-11 09:30:00',
      type: 'success'
    }
  ]
})