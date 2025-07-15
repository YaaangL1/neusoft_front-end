import axios, { type InternalAxiosRequestConfig, type AxiosInstance, type AxiosResponse, type AxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '',  // 使用相对路径，让Vite代理处理
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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
        params: config.params,
        data: config.data,
        headers: config.headers
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
    // 如果响应是二进制数据，直接返回
    if (response.config.responseType === 'blob') {
      return response.data
    }

    const { code, message, data } = response.data

    // 请求成功
    if (code === 200) {
      return response.data
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
    if (error.response) {
      const { status, data } = error.response
      // 打印更详细的错误信息
      console.error('错误状态码:', status)
      console.error('错误响应数据:', data)
      
      switch (status) {
        case 400:
          ElMessage.error(data.message || '请求参数错误')
          break
        case 401:
          ElMessage.error('未授权，请重新登录')
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求错误，未找到该资源')
          break
        case 405:
          ElMessage.error('请求方法未允许')
          break
        case 408:
          ElMessage.error('请求超时')
          break
        case 500:
          ElMessage.error('服务器端出错')
          break
        case 501:
          ElMessage.error('网络未实现')
          break
        case 502:
          ElMessage.error('网络错误')
          break
        case 503:
          ElMessage.error('服务不可用')
          break
        case 504:
          ElMessage.error('网络超时')
          break
        case 505:
          ElMessage.error('http版本不支持该请求')
          break
        default:
    ElMessage.error(error.message || '系统错误')
      }
    } else {
      ElMessage.error('连接到服务器失败')
    }
    return Promise.reject(error)
  }
)

// 封装请求方法
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config)
  }
}

export default service