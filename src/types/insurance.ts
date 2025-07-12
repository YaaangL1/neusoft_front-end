// 基础分页请求参数
export interface PageQuery {
    pageNum: number
    pageSize: number
    [key: string]: any
  }
  
  // 基础分页响应
  export interface PageResult<T> {
    total: number
    list: T[]
  }
  
  // 药品信息
  export interface Drug {
    id: number
    drugName: string
    brandName?: string
    specification?: string
    unit: string
    manufacturer?: string
    drugCategory: '甲类' | '乙类' | '丙类'
    price: number
    remarks?: string
    status: number
    createTime: string
    updateTime: string
  }
  
  // 诊疗项目
  export interface Treatment {
    id: number
    financialCategory?: string
    projectCode: string
    nationalCode?: string
    projectName: string
    unit: string
    price: number
    status: number
    createTime: string
    updateTime: string
  }
  
  // 医疗服务设施
  export interface MedicalFacility {
    id: number
    financialCategory?: string
    projectCode: string
    nationalCode?: string
    projectName: string
    projectContent?: string
    unit: string
    price: number
    status: number
    createTime: string
    updateTime: string
  }
  
  // 报销比例
  export interface ReimbursementRatio {
    id: number
    drugCategory?: '甲类' | '乙类' | '丙类'
    employeeType: '在职' | '退休'
    minAmount?: number
    maxAmount?: number
    reimbursementRatio: number
    remarks?: string
    status: number
  }