import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '../layout/index.vue'
import { useUserStore } from '../stores/user'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
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
        meta: { title: '参保人报销管理' }
      },
      {
        path: 'expense',
        name: 'Expense',
        component: () => import('../views/reimbursement/expense/index.vue'),
        meta: { title: '参保人费用详情报表' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE || '医疗保险报销系统'}`
  
  // 白名单路径直接放行
  if (['/login'].includes(to.path)) {
    if (userStore.token && userStore.userInfo) {
      next('/')
      return
    }
    next()
    return
  }

  // 验证token
  if (userStore.token) {
    const isValid = await userStore.verifyToken()
    if (!isValid) {
    next(`/login?redirect=${to.path}`)
      return
    }
    next()
    return
  }

  // 未登录跳转到登录页
  next(`/login?redirect=${to.path}`)
})

export default router