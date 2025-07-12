// 通用响应格式
export interface ApiResponse<T = any> {
    code: number
    message: string
    data: T
  }
  
  // 分页请求参数
  export interface PageQuery {
    pageNum: number
    pageSize: number
    [key: string]: any
  }
  
  // 分页响应数据
  export interface PageResult<T> {
    total: number
    pageNum: number
    pageSize: number
    pages: number
    list: T[]
  }
  
  // 用户信息
  export interface UserInfo {
    id: number
    username: string
    realName: string
    email?: string
    phone?: string
    status: number
    createTime: string
    updateTime: string
  }
  
  // 路由元信息
  export interface RouteMeta {
    title: string
    icon?: string
    hidden?: boolean
    roles?: string[]
  }