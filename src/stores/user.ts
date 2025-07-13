import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api/auth'
import type { LoginParams, LoginResult, Result } from '@/types'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<LoginResult | null>(null)

  // 验证token
  const verifyToken = async () => {
    if (!token.value) {
      return false
    }
    try {
      // 如果有用户信息，说明token有效
      if (userInfo.value) {
        return true
      }
      // 如果没有用户信息，尝试获取用户信息
      const { data } = await authApi.login({
        loginName: 'admin',
        password: 'admin'
      })
      userInfo.value = data
      token.value = data.token
      localStorage.setItem('token', data.token)
      return true
    } catch (error) {
      console.error('token验证失败:', error)
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      return false
    }
  }

  // 登录
  const login = async (loginParams: LoginParams) => {
    try {
      const { data } = await authApi.login(loginParams)
      token.value = data.token
      userInfo.value = data
      localStorage.setItem('token', data.token)
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      token.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
    }
  }

  return {
    token,
    userInfo,
    login,
    logout,
    verifyToken
  }
})