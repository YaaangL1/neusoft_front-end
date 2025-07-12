import { defineStore } from 'pinia'
import { ref } from 'vue'
import { request } from '@/utils/request'
import router from '@/router'

// 用户信息接口
interface UserInfo {
  id: number
  username: string
  realName: string
  role: string
  email?: string
  phone?: string
  status: number
}

// 登录参数接口
interface LoginParams {
  username: string
  password: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  // 登录
  const login = async (loginParams: LoginParams) => {
    try {
      const { token: newToken } = await request.post<{ token: string }>('/api/auth/login', loginParams)
      token.value = newToken
      localStorage.setItem('token', newToken)
      await router.push('/')
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const data = await request.get<UserInfo>('/api/auth/info')
      userInfo.value = data
      return data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      await request.post('/api/auth/logout')
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      router.push('/login')
    }
  }

  return {
    token,
    userInfo,
    login,
    getUserInfo,
    logout
  }
})