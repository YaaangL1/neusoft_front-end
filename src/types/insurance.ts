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

// 药品报销比例
export interface DrugReimbursementVO {
  id: number
  drugReimbursementType: string
  drugReimbursementProportion: number
  drugReimbursementInfo?: string
  status: Status
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
  status?: number
  remarks?: string
  createdTime?: string
  updatedTime?: string
}

// 参保人员信息
export interface InsuredPersonVO {
    id: number
  realName: string
  cardNumber: string
  gender: string
  birthday: string
  age: number
  homeAddress?: string
  caseNumber: string
  visitDate: string
  insuranceStatus: string
  peopleType: string
  registMethod: string
  createdTime: string
  updatedTime: string
}

// 费用明细
export interface ExpenseDetailVO {
  itemId: number
  itemName: string
  expenseType: number
  expenseTypeName: string
  drugCategory?: string
  unitPrice: number
  quantity: number
  totalAmount: number
  orderTime: string
    status: number
  statusName: string
  doctorOrder?: string
  useMethod?: string
}

// 分类占比数据
export interface CategoryRatioData {
  categoryName: string
  amount: number
  itemCount: number
  percentage: number
}

// 费用汇总
export interface ExpenseSummary {
  totalAmount: number
  totalDrugAmount: number
  categoryADrugAmount: number
  categoryBDrugAmount: number
  categoryCDrugAmount: number
  treatmentAmount: number
  serviceAmount: number
  }
  
// 报销计算结果
export interface ReimbursementResult {
  deductibleAmount: number
  aboveDeductibleAmount: number
  overallReimbursementRatio: number
  totalReimbursementAmount: number
  totalSelfPayAmount: number
  insuranceFundAmount: number
  personalPayAmount: number
}

// 报销计算VO
export interface ReimbursementCalculationVO {
  patientId: number
  patientName: string
  caseNumber: string
  hospitalLevel: string
  peopleType: string
  peopleTypeName: string
  calculateTime: string
  expenseSummary: ExpenseSummary
  expenseDetails: ExpenseDetailVO[]
  reimbursementResult: ReimbursementResult
}

// 报销报表
export interface ReimbursementReportVO {
  patientId: number
  patientName: string
  caseNumber: string
  totalAmount: number
  expenseSummary: ExpenseSummary
  drugCategoryRatio: CategoryRatioData[]
  expenseTypeRatio: CategoryRatioData[]
}

// 报销记录
export interface ReimbursementRecord {
  recordId: number
  patientId: number
  patientName: string
  caseNumber: string
  totalExpense: number
  reimbursementAmount: number
  selfPayAmount: number
    status: number
  statusName: string
  approver: string
  remark?: string
  reimbursementTime: string
  }