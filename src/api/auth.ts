import request from '@/utils/request'
import type { LoginParams, Result, LoginResult } from '@/types'

export const authApi = {
  // 检查用户名是否存在
  checkUsername(loginName: string): Promise<Result<boolean>> {
    return request.get('/api/auth/check-username', {
      params: { loginName }
    })
  },

  // 登录
  login(data: LoginParams): Promise<Result<LoginResult>> {
    return request.post('/api/auth/login', data)
  },

  // 登出
  logout(): Promise<Result<void>> {
    return request.post('/api/auth/logout')
  },

  // 验证token
  verify(): Promise<Result<LoginResult>> {
    return request.get('/api/auth/verify')
  }
} 