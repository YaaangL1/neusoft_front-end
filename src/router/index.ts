import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '../layout/index.vue'
import { useUserStore } from '../stores/user'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { title: '首页', icon: 'HomeFilled' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      }
    ]
  },
  // 医疗保险基本信息维护
  {
    path: '/insurance',
    component: Layout,
    redirect: '/insurance/drugs',
    meta: { title: '基础信息管理', icon: 'Files' },
    children: [
      {
        path: 'drugs',
        name: 'Drugs',
        component: () => import('../views/insurance/drugs/index.vue'),
        meta: { title: '药品信息管理' }
      },
      {
        path: 'treatments',
        name: 'Treatments',
        component: () => import('../views/insurance/treatments/index.vue'),
        meta: { title: '诊疗项目管理' }
      },
      {
        path: 'ratios',
        name: 'Ratios',
        component: () => import('../views/insurance/ratios/index.vue'),
        meta: { title: '报销比例管理' }
      }
    ]
  },
  // 医院住院医生站
  {
    path: '/doctor',
    component: Layout,
    redirect: '/doctor/diagnosis',
    meta: { title: '医生工作站', icon: 'User' },
    children: [
      {
        path: 'diagnosis',
        name: 'Diagnosis',
        component: () => import('../views/doctor/diagnosis/index.vue'),
        meta: { title: '诊断信息管理' }
      },
      {
        path: 'prescription',
        name: 'Prescription',
        component: () => import('../views/doctor/prescription/index.vue'),
        meta: { title: '处方管理' }
      },
      {
        path: 'treatment',
        name: 'Treatment',
        component: () => import('../views/doctor/treatment/index.vue'),
        meta: { title: '医疗服务项目' }
      },
      {
        path: 'service',
        name: 'Service',
        component: () => import('../views/doctor/service/index.vue'),
        meta: { title: '医疗服务记录' }
      }
    ]
  },
  // 医保中心报销管理
  {
    path: '/reimbursement',
    component: Layout,
    redirect: '/reimbursement/person',
    meta: { title: '报销管理', icon: 'Money' },
    children: [
      {
        path: 'person',
        name: 'Person',
        component: () => import('../views/reimbursement/person/index.vue'),
        meta: { title: '个人报销管理' }
      },
      {
        path: 'expense',
        name: 'Expense',
        component: () => import('../views/reimbursement/expense/index.vue'),
        meta: { title: '费用统计' }
      },
      {
        path: 'report',
        name: 'Report',
        component: () => import('../views/reimbursement/report/index.vue'),
        meta: { title: '报表管理' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
// 测试阶段注释登录验证
// router.beforeEach((to, from, next) => {
//   const userStore = useUserStore()
  
//   // 白名单路径直接放行
//   if (['/login'].includes(to.path)) {
//     next()
//     return
//   }

//   // 未登录跳转到登录页
//   if (!userStore.token) {
//     next(`/login?redirect=${to.path}`)
//     return
//   }

//   next()
// })

export default router