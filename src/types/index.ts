// 基础响应类型
export interface Result<T> {
    code: number
    message: string
    data: T
  }
  
// 分页查询参数
  export interface PageQuery {
    pageNum: number
    pageSize: number
    [key: string]: any
  }
  
// 分页结果
  export interface PageResult<T> {
    total: number
  pages: number
    pageNum: number
    pageSize: number
    list: T[]
  }
  
// 登录参数
export interface LoginParams {
  loginName: string
  password: string
  captcha?: string
}

// 登录响应
export interface LoginResult {
  userId: number
  userName: string
  loginName: string
    email?: string
  token: string
  }
  
// 通用状态枚举
export enum Status {
  Enabled = 1,
  Disabled = 0
}

// 人员类型枚举
export enum PeopleType {
  OnJob = '1',
  Retired = '0'
}

// 医院等级枚举
export enum HospitalLevel {
  Level1 = '一级',
  Level2 = '二级',
  Level3 = '三级'
  }