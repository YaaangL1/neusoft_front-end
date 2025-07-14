import { Status } from './index'
  
  // 药品信息
export interface DrugInfoVO {
    id: number
  chinaName: string
  goodsName?: string
  specifications?: string
  drugUnit: string
  drugManufacturer?: string
  insuranceType: string
  drugPrice: number
    remarks?: string
  createdTime: string
  updatedTime: string
  }
  
  // 诊疗项目
export interface TreatmentVO {
    id: number
  countryNumber?: string
  medicalName: string
  medicalNumber: string
  medicalType: string
  medicalUnit: string
  medicalPrice: number
  medicalInfo?: string
  medicalExclude?: string
  remark?: string
  createdTime: string
  updatedTime: string
  }
  
  // 医疗服务设施
export interface MedicalServiceVO {
  id: number
  countryNumber?: string
  medicalName: string
  medicalNumber: string
  medicalType: string
  medicalUnit: string
  medicalPrice: number
  medicalInfo?: string
  medicalExclude?: string
  remark?: string
  createdTime: string
  updatedTime: string
}

// 医疗服务设施
export interface MedicalFacility {
  id?: number
  projectCode: string
  projectName: string
  nationalCode?: string
  financialCategory?: string
  unit: string
  price: number
  projectContent?: string
  status: number
  createdTime?: string
  updatedTime?: string
}

// 药品报销比例
export interface DrugReimbursementVO {
  id: number
  drugReimbursementType: string
  drugReimbursementProportion: number
  drugReimbursementInfo?: string
  status: number
  createdTime: string
  updatedTime: string
}

// 医院报销比例
export interface HospitalRatioVO {
  id?: number
  hospitalLevel: string
  peopleType: string
  minPayLevel: string
  maxPayLevel: string
  ratio: number
  remarks?: string
  status?: number
}

// 医院报销比例
export interface HospitalReimbursementVO {
  id?: number
  hospitalLevel: string
  peopleType: string
  minPayLevel: string
  maxPayLevel: string
  payProportion: string
  ratio?: number // 报销比例
  status?: number
  remarks?: string
  createdTime?: string
  updatedTime?: string
}

// 参保人员信息
export interface InsuredPerson {
    id: number
  realName: string
  cardNumber: string
  gender: string
  birthday: string
  age: number
  homeAddress?: string
  visitDate: string
  registMethod: string
  peopleType: string // 人员类别（1-在职人员，0-退休人员）
  insuranceStatus: string // 医保状态（1-医保，0-自费）
  caseNumber: string
  createdTime: string
  updatedTime: string
}
  
// 费用信息
export interface ExpenseDetail {
  id: number
  personId: number
  expenseType: 'drug' | 'treatment' | 'service' // 费用类型：药品/诊疗/医疗服务
  expenseDate: string
  amount: number
  description: string
}

// 报销计算结果
export interface ReimbursementCalculation {
  expenseSummary: {
    totalAmount: number
    totalDrugAmount: number
    categoryADrugAmount: number
    categoryBDrugAmount: number
    categoryCDrugAmount: number
    treatmentAmount: number
    serviceAmount: number
  }
  reimbursementResult: {
    deductibleAmount: number // 起付线金额
    aboveDeductibleAmount: number // 超过起付线的费用
    overallReimbursementRatio: number // 报销比例
    totalReimbursementAmount: number // 总报销金额
    totalSelfPayAmount: number // 总自付金额
    insuranceFundAmount: number // 医保基金支付金额
    personalPayAmount: number // 个人支付金额
  }
}

// 报销记录
export interface ReimbursementRecord {
  id: number
  personId: number
  personName: string
  hospitalLevel: string
  totalAmount: number
  reimbursementAmount: number
  selfPayAmount: number
  reimbursementTime: string
  approver: string
  status: 'pending' | 'approved' | 'rejected'
  remark: string
  }
  
// 报销报表
export interface ReimbursementReport {
    id: number
  personId: number
  reportName: string
  reportType: 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  totalAmount: number
  totalReimbursement: number
  createTime: string
  expenseTypeDistribution?: {
    type: string
    amount: number
    percentage: number
  }[]
  trend?: {
    dates: string[]
    amounts: number[]
    reimbursements: number[]
  }
}

// API请求参数类型
export interface InsuredPersonQuery {
  pageNum: number
  pageSize: number
  personName?: string
  insuranceStatus?: string
  peopleType?: string
}

export interface ExpenseQuery {
  personId: number
  expenseType?: string
  startDate?: string
  endDate?: string
}

export interface ReimbursementCalculationParams {
  personId: number
  hospitalLevel: string
  startDate?: string
  endDate?: string
}

export interface ReimbursementExecuteParams extends ReimbursementCalculationParams {
  approver: string
  remark?: string
}

export interface ReportGenerateParams {
  personId: number
  reportType: 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  }