import { request } from '../utils/request'
import type { PageQuery, PageResult, Result } from '../types'
import type { 
  PatientDiagnosisVO, 
  PatientPrescriptionVO, 
  PatientTreatmentVO, 
  PatientMedicalServiceVO
} from '../types/doctor'
import type {
  ReimbursementCalculationVO,
  ReimbursementRecord
} from '../types/insurance'

// 诊断管理API
export const diagnosisApi = {
  // 分页查询
  getPage(params: PageQuery & { diseaseName?: string, patientId?: number }) {
    return request.get<Result<PageResult<PatientDiagnosisVO>>>('/api/patient-diagnoses/page', { params })
  },
  // 搜索
  search(diseaseName: string) {
    return request.get<Result<PatientDiagnosisVO[]>>('/api/patient-diagnoses/search', { params: { diseaseName } })
  },
  // 获取详情
  getById(id: number) {
    return request.get<Result<PatientDiagnosisVO>>(`/api/patient-diagnoses/${id}`)
  },
  // 新增
  add(data: Partial<PatientDiagnosisVO>) {
    return request.post<Result<string>>('/api/patient-diagnoses', data)
  },
  // 修改
  update(id: number, data: Partial<PatientDiagnosisVO>) {
    return request.put<Result<string>>(`/api/patient-diagnoses/${id}`, data)
  },
  // 删除
  delete(id: number) {
    return request.delete<Result<string>>(`/api/patient-diagnoses/${id}`)
  }
}

// 处方管理API
export const prescriptionApi = {
  // 分页查询
  getPage(params: PageQuery & { drugName?: string, patientId?: number }) {
    return request.get<Result<PageResult<PatientPrescriptionVO>>>('/api/patient-prescriptions/page', { params })
  },
  // 搜索
  search(drugName: string) {
    return request.get<Result<PatientPrescriptionVO[]>>('/api/patient-prescriptions/search', { params: { drugName } })
  },
  // 获取详情
  getById(id: number) {
    return request.get<Result<PatientPrescriptionVO>>(`/api/patient-prescriptions/${id}`)
  },
  // 新增
  add(data: Partial<PatientPrescriptionVO>) {
    return request.post<Result<string>>('/api/patient-prescriptions', data)
  },
  // 修改
  update(id: number, data: Partial<PatientPrescriptionVO>) {
    return request.put<Result<string>>(`/api/patient-prescriptions/${id}`, data)
  },
  // 删除
  delete(id: number) {
    return request.delete<Result<string>>(`/api/patient-prescriptions/${id}`)
  }
}

// 诊疗项目管理API
export const treatmentApi = {
  // 分页查询
  getPage(params: PageQuery & { treatmentName?: string, patientId?: number }) {
    return request.get<Result<PageResult<PatientTreatmentVO>>>('/api/patient-treatments/page', { params })
  },
  // 搜索
  search(treatmentName: string) {
    return request.get<Result<PatientTreatmentVO[]>>('/api/patient-treatments/search', { params: { treatmentName } })
  },
  // 获取详情
  getById(id: number) {
    return request.get<Result<PatientTreatmentVO>>(`/api/patient-treatments/${id}`)
  },
  // 新增
  add(data: Partial<PatientTreatmentVO>) {
    return request.post<Result<string>>('/api/patient-treatments', data)
  },
  // 修改
  update(id: number, data: Partial<PatientTreatmentVO>) {
    return request.put<Result<string>>(`/api/patient-treatments/${id}`, data)
  },
  // 删除
  delete(id: number) {
    return request.delete<Result<string>>(`/api/patient-treatments/${id}`)
  }
}

// 医疗服务管理API
export const serviceApi = {
  // 分页查询
  getPage(params: PageQuery & { serviceName?: string, patientId?: number }) {
    return request.get<Result<PageResult<PatientMedicalServiceVO>>>('/api/patient-medical-services/page', { params })
  },
  // 搜索
  search(serviceName: string) {
    return request.get<Result<PatientMedicalServiceVO[]>>('/api/patient-medical-services/search', { params: { serviceName } })
  },
  // 获取详情
  getById(id: number) {
    return request.get<Result<PatientMedicalServiceVO>>(`/api/patient-medical-services/${id}`)
  },
  // 新增
  add(data: Partial<PatientMedicalServiceVO>) {
    return request.post<Result<string>>('/api/patient-medical-services', data)
  },
  // 修改
  update(id: number, data: Partial<PatientMedicalServiceVO>) {
    return request.put<Result<string>>(`/api/patient-medical-services/${id}`, data)
  },
  // 删除
  delete(id: number) {
    return request.delete<Result<string>>(`/api/patient-medical-services/${id}`)
  }
} 

// 报销管理API
export const reimbursementApi = {
  // 分页查询
  getPage(params: PageQuery & { personName?: string }) {
    return request.get<Result<PageResult<ReimbursementRecord>>>('/api/insured-persons/page', { params })
  },
  // 搜索参保人员
  searchPerson(personName: string) {
    return request.get<Result<ReimbursementRecord[]>>('/api/insured-persons/search', { 
      params: { personName } 
    })
  },
  // 费用报销计算
  calculate(personId: number, params: { 
    hospitalLevel: string,
    peopleType?: string,
    startDate?: string,
    endDate?: string 
  }) {
    return request.get<Result<ReimbursementCalculationVO>>(`/api/insured-persons/${personId}/reimbursement-calculation`, { params })
  },
  // 执行费用报销
  execute(personId: number, params: {
    hospitalLevel: string,
    approver: string,
    peopleType?: string,
    startDate?: string,
    endDate?: string,
    remark?: string
  }) {
    return request.post<Result<ReimbursementRecord>>(`/api/insured-persons/${personId}/reimbursement`, params)
  },
  // 查询报销历史
  getHistory(personId: number, params?: {
    startDate?: string,
    endDate?: string
  }) {
    return request.get<Result<ReimbursementRecord[]>>(`/api/insured-persons/${personId}/reimbursement-report`, { params })
  }
} 