import { request } from '../utils/request'
import type { PageQuery, PageResult, Result } from '@/types'
import type {
  DrugInfoVO,
  TreatmentVO,
  MedicalServiceVO,
  DrugReimbursementVO,
  HospitalReimbursementVO,
  InsuredPersonVO,
  ExpenseDetailVO,
  ReimbursementCalculationVO,
  ReimbursementRecord
} from '@/types/insurance'

// 药品管理API
export const drugApi = {
  // 分页查询
  getPage(params: PageQuery) {
    return request.get<Result<PageResult<DrugInfoVO>>>('/api/drugs/page', { params })
  },
  // 搜索
  search(drugName: string) {
    return request.get<Result<DrugInfoVO[]>>('/api/drugs/search', { params: { drugName } })
  },
  // 获取详情
  getById(drugId: number) {
    return request.get<Result<DrugInfoVO>>(`/api/drugs/${drugId}`)
  },
  // 新增
  add(data: Partial<DrugInfoVO>) {
    return request.post<Result<void>>('/api/drugs', data)
  },
  // 修改
  update(drugId: number, data: Partial<DrugInfoVO>) {
    return request.put<Result<void>>(`/api/drugs/${drugId}`, data)
  },
  // 删除
  delete(drugIds: number[]) {
    return request.delete<Result<void>>('/api/drugs', { data: drugIds })
  }
}

// 诊疗项目API
export const treatmentApi = {
  getPage(params: PageQuery) {
    return request.get<Result<PageResult<TreatmentVO>>>('/api/treatments/page', { params })
  },
  search(treatmentName: string) {
    return request.get<Result<TreatmentVO[]>>('/api/treatments/search', { params: { treatmentName } })
  },
  getById(treatmentId: number) {
    return request.get<Result<TreatmentVO>>(`/api/treatments/${treatmentId}`)
  },
  add(data: Partial<TreatmentVO>) {
    return request.post<Result<void>>('/api/treatments', data)
  },
  update(treatmentId: number, data: Partial<TreatmentVO>) {
    return request.put<Result<void>>(`/api/treatments/${treatmentId}`, data)
  },
  delete(treatmentIds: number[]) {
    return request.delete<Result<void>>('/api/treatments', { data: treatmentIds })
  }
}

// 医疗服务设施API
export const facilityApi = {
  getPage(params: PageQuery) {
    return request.get<Result<PageResult<MedicalServiceVO>>>('/api/medical-facilities/page', { params })
  },
  search(facilityName: string) {
    return request.get<Result<MedicalServiceVO[]>>('/api/medical-facilities/search', { params: { facilityName } })
  },
  getById(facilityId: number) {
    return request.get<Result<MedicalServiceVO>>(`/api/medical-facilities/${facilityId}`)
  },
  add(data: Partial<MedicalServiceVO>) {
    return request.post<Result<void>>('/api/medical-facilities', data)
  },
  update(facilityId: number, data: Partial<MedicalServiceVO>) {
    return request.put<Result<void>>(`/api/medical-facilities/${facilityId}`, data)
  },
  delete(facilityIds: number[]) {
    return request.delete<Result<void>>('/api/medical-facilities', { data: facilityIds })
  }
}

// 报销比例API
export const ratioApi = {
  // 药品报销比例
  getDrugRatios() {
    return request.get<Result<DrugReimbursementVO[]>>('/api/drug-reimbursement-ratios')
  },
  getEnabledDrugRatios() {
    return request.get<Result<DrugReimbursementVO[]>>('/api/drug-reimbursement-ratios/enabled')
  },
  checkDrugType(drugReimbursementType: string, excludeId?: number) {
    return request.get<Result<boolean>>('/api/drug-reimbursement-ratios/check-type', {
      params: { drugReimbursementType, excludeId }
    })
  },
  getDrugRatioById(ratioId: number) {
    return request.get<Result<DrugReimbursementVO>>(`/api/drug-reimbursement-ratios/${ratioId}`)
  },
  addDrugRatio(data: Partial<DrugReimbursementVO>) {
    return request.post<Result<void>>('/api/drug-reimbursement-ratios', data)
  },
  updateDrugRatio(ratioId: number, data: Partial<DrugReimbursementVO>) {
    return request.put<Result<void>>(`/api/drug-reimbursement-ratios/${ratioId}`, data)
  },
  deleteDrugRatio(ratioId: number) {
    return request.delete<Result<void>>(`/api/drug-reimbursement-ratios/${ratioId}`)
  },
  updateDrugRatioStatus(ratioId: number, data: { status: number }) {
    return request.put<Result<void>>(`/api/drug-reimbursement-ratios/${ratioId}/status`, data)
  },

  // 诊疗项目报销比例
  getTreatmentRatios() {
    return request.get<Result<DrugReimbursementVO[]>>('/api/treatment-reimbursement-ratios')
  },
  getEnabledTreatmentRatios() {
    return request.get<Result<DrugReimbursementVO[]>>('/api/treatment-reimbursement-ratios/enabled')
  },
  checkTreatmentType(treatmentType: string, excludeId?: number) {
    return request.get<Result<boolean>>('/api/treatment-reimbursement-ratios/check-type', {
      params: { treatmentType, excludeId }
    })
  },
  getTreatmentRatioById(ratioId: number) {
    return request.get<Result<DrugReimbursementVO>>(`/api/treatment-reimbursement-ratios/${ratioId}`)
  },
  addTreatmentRatio(data: Partial<DrugReimbursementVO>) {
    return request.post<Result<void>>('/api/treatment-reimbursement-ratios', data)
  },
  updateTreatmentRatio(ratioId: number, data: Partial<DrugReimbursementVO>) {
    return request.put<Result<void>>(`/api/treatment-reimbursement-ratios/${ratioId}`, data)
  },
  deleteTreatmentRatio(ratioId: number) {
    return request.delete<Result<void>>(`/api/treatment-reimbursement-ratios/${ratioId}`)
  },
  updateTreatmentRatioStatus(ratioId: number, data: { status: number }) {
    return request.put<Result<void>>(`/api/treatment-reimbursement-ratios/${ratioId}/status`, data)
  },

  // 医院报销比例
  getHospitalRatios(level: 1 | 2 | 3, employeeType: string) {
    return request.get<Result<HospitalReimbursementVO[]>>(`/api/level${level}-hospital-ratios`, {
      params: { employeeType }
    })
  },
  checkHospitalRange(level: 1 | 2 | 3, params: {
    minPayLevel: string
    maxPayLevel: string
    peopleType: string
    excludeId?: number
  }) {
    return request.get<Result<boolean>>(`/api/level${level}-hospital-ratios/check-range`, { params })
  },
  getHospitalRatioById(level: 1 | 2 | 3, ratioId: number) {
    return request.get<Result<HospitalReimbursementVO>>(`/api/level${level}-hospital-ratios/${ratioId}`)
  },
  addHospitalRatio(level: 1 | 2 | 3, data: Partial<HospitalReimbursementVO>) {
    return request.post<Result<void>>(`/api/level${level}-hospital-ratios`, data)
  },
  updateHospitalRatio(level: 1 | 2 | 3, ratioId: number, data: Partial<HospitalReimbursementVO>) {
    return request.put<Result<void>>(`/api/level${level}-hospital-ratios/${ratioId}`, data)
  },
  deleteHospitalRatio(level: 1 | 2 | 3, ratioId: number) {
    return request.delete<Result<void>>(`/api/level${level}-hospital-ratios/${ratioId}`)
  }
}

// 参保人员API
export const personApi = {
  getPage(params: PageQuery) {
    return request.get<Result<PageResult<InsuredPersonVO>>>('/api/insurance-management/persons/page', { params })
  },
  search(personName: string) {
    return request.get<Result<InsuredPersonVO[]>>('/api/insurance-management/persons/search', {
      params: { personName }
    })
  },
  add(data: Partial<InsuredPersonVO>) {
    return request.post<Result<string>>('/api/insurance-management/persons', data)
  },
  update(personId: number, data: Partial<InsuredPersonVO>) {
    return request.put<Result<string>>(`/api/insurance-management/persons/${personId}`, data)
  }
}

// 费用查询API
export const expenseApi = {
  getPersonPage(params: PageQuery) {
    return request.get<Result<PageResult<InsuredPersonVO>>>('/api/expense-query/persons/page', { params })
  },
  searchPerson(personName: string) {
    return request.get<Result<InsuredPersonVO[]>>('/api/expense-query/persons/search', {
      params: { personName }
    })
  },
  getDrugExpenses(personId: number, startDate?: string, endDate?: string) {
    return request.get<Result<ExpenseDetailVO[]>>(`/api/expense-query/persons/${personId}/drug-expenses`, {
      params: { startDate, endDate }
    })
  },
  getServiceExpenses(personId: number, startDate?: string, endDate?: string) {
    return request.get<Result<ExpenseDetailVO[]>>(`/api/expense-query/persons/${personId}/service-expenses`, {
      params: { startDate, endDate }
    })
  },
  getTreatmentExpenses(personId: number, startDate?: string, endDate?: string) {
    return request.get<Result<ExpenseDetailVO[]>>(`/api/expense-query/persons/${personId}/treatment-expenses`, {
      params: { startDate, endDate }
    })
  }
}

// 报销API
export const reimbursementApi = {
  getPersonPage(params: PageQuery) {
    return request.get<Result<PageResult<InsuredPersonVO>>>('/api/reimbursement/persons/page', { params })
  },
  searchPerson(personName: string) {
    return request.get<Result<InsuredPersonVO[]>>('/api/reimbursement/persons/search', {
      params: { personName }
    })
  },
  calculate(personId: number, params: {
    hospitalLevel: string
    peopleType?: string
    startDate?: string
    endDate?: string
  }) {
    return request.post<Result<ReimbursementCalculationVO>>(
      `/api/reimbursement/persons/${personId}/calculate`,
      null,
      { params }
    )
  },
  execute(personId: number, params: {
    hospitalLevel: string
    approver: string
    peopleType?: string
    startDate?: string
    endDate?: string
    remark?: string
  }) {
    return request.post<Result<ReimbursementRecord>>(
      `/api/reimbursement/persons/${personId}/execute`,
      null,
      { params }
    )
  },
  getHistory(personId: number, startDate?: string, endDate?: string) {
    return request.get<Result<ReimbursementRecord[]>>(`/api/reimbursement/persons/${personId}/history`, {
      params: { startDate, endDate }
    })
  }
}
