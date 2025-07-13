// 患者疾病诊断信息
export interface PatientDiagnosisVO {
  id?: number
  patientId?: number
  patientName?: string
  diseaseId?: number
  diseaseCode?: string
  diseaseName?: string
  diseaseICD?: string
  diseaseCategory?: string
  diseaseType?: number
  diseaseTypeName?: string
  orderTime?: string
  createdTime?: string
  updatedTime?: string
}

// 患者药品处方信息
export interface PatientPrescriptionVO {
  id?: number
  patientId?: number
  patientName?: string
  drugId?: number
  chinaName?: string
  goodsName?: string
  specifications?: string
  drugUnit?: string
  drugPrice?: number
  drugManufacturer?: string
  insuranceType?: string
  doctorOrder?: string
  useMethod?: string
  orderNumber?: number
  startTime?: string
  endTime?: string
  status?: number
  statusName?: string
  createdTime?: string
  updatedTime?: string
}

// 患者诊疗项目信息
export interface PatientTreatmentVO {
  id?: number
  patientId?: number
  patientName?: string
  diagnosisId?: number
  medicalName?: string
  medicalNumber?: string
  medicalType?: string
  medicalUnit?: string
  medicalPrice?: number
  medicalInfo?: string
  medicalExclude?: string
  doctorOrder?: string
  useMethod?: string
  orderTime?: string
  status?: number
  statusName?: string
  createdTime?: string
  updatedTime?: string
}

// 患者医疗服务信息
export interface PatientMedicalServiceVO {
  id?: number
  patientId?: number
  patientName?: string
  medicalId?: number
  medicalName?: string
  medicalNumber?: string
  medicalType?: string
  medicalUnit?: string
  medicalPrice?: number
  medicalInfo?: string
  medicalExclude?: string
  countryNumber?: string
  doctorOrder?: string
  useMethod?: string
  orderTime?: string
  status?: number
  statusName?: string
  createdTime?: string
  updatedTime?: string
}

// 报销计算结果
export interface ReimbursementCalculationVO {
  calculateTime?: string // 计算时间
  caseNumber?: string // 住院号
  patientId?: number // 患者ID
  patientName?: string // 患者姓名
  hospitalLevel?: string // 医院等级
  peopleType?: string // 人员类别：1-在职 0-退休
  peopleTypeName?: string // 人员类别名称
  expenseSummary?: {
    totalAmount: number // 总费用
    totalDrugAmount: number // 总药品费用
    categoryADrugAmount: number // 甲类药品费用
    categoryBDrugAmount: number // 乙类药品费用
    categoryCDrugAmount: number // 丙类药品费用
    treatmentAmount: number // 诊疗项目费用
    serviceAmount: number // 医疗服务费用
  }
  expenseDetails?: Array<{
    itemId: number // 费用项目ID
    itemName: string // 费用项目名称
    expenseType: number // 费用类型：1-药品 2-诊疗项目 3-医疗服务
    expenseTypeName: string // 费用类型名称
    drugCategory?: string // 药品分类（甲类/乙类/丙类）
    unitPrice: number // 单价
    quantity: number // 数量
    totalAmount: number // 费用小计
    reimbursementRatio: number // 报销比例
    reimbursementAmount: number // 报销金额
    selfPayAmount: number // 自付金额
  }>
  reimbursementResult?: {
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
  recordId?: number // 记录ID
  patientId?: number // 患者ID
  patientName?: string // 患者姓名
  caseNumber?: string // 住院号
  totalExpense?: number // 总费用
  reimbursementAmount?: number // 报销金额
  selfPayAmount?: number // 自付金额
  reimbursementTime?: string // 报销时间
  approver?: string // 审批人
  remark?: string // 备注
  status?: number // 报销状态：1-计算完成 2-报销成功 3-报销失败
  statusName?: string // 状态名称
} 