import axios, { type InternalAxiosRequestConfig, type AxiosInstance, type AxiosResponse } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 15000
})

// 请求拦截器
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const userStore = useUserStore()
      if (userStore.token) {
        config.headers.Authorization = `Bearer ${userStore.token}`
      }
      console.log('发送请求:', {
        url: config.url,
        method: config.method,
        baseURL: config.baseURL,
        params: config.params
      })
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, message, data } = response.data

    // 请求成功
    if (code === 200) {
      return data
    }

    // token过期
    if (code === 401) {
      ElMessageBox.confirm(
        '登录状态已过期，请重新登录',
        '系统提示',
        {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        const userStore = useUserStore()
        userStore.logout()
      })
      return Promise.reject('登录已过期')
    }

    // 其他错误
    ElMessage.error(message || '系统错误')
    return Promise.reject(message || '系统错误')
  },
  (error) => {
    console.error('响应错误:', error)
    ElMessage.error(error.message || '系统错误')
    return Promise.reject(error)
  }
)

// 封装请求方法
export const request = {
  get<T = any>(url: string, params?: any): Promise<T> {
    return service.get(url, { params })
  },

  post<T = any>(url: string, data?: any): Promise<T> {
    return service.post(url, data)
  },

  put<T = any>(url: string, data?: any): Promise<T> {
    return service.put(url, data)
  },

  delete<T = any>(url: string, params?: any): Promise<T> {
    return service.delete(url, { params })
  }
}

export default service