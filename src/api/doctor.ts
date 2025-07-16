import { request } from '../utils/request'
import type { PageQuery, PageResult, Result } from '../types'
import type { 
  PatientDiagnosisVO, 
  PatientPrescriptionVO, 
  PatientTreatmentVO, 
  PatientMedicalServiceVO
} from '../types/doctor'
import type {
  ReimbursementCalculation,
  ReimbursementRecord
} from '../types/insurance'
import dayjs from 'dayjs'

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
    console.log('API层添加诊断数据:', JSON.stringify(data))
    // 直接透传时间字段为ISO格式
    const submitData: any = {
      diseaseId: Number(data.diseaseId),
      diseaseType: Number(data.diseaseType),
      patientId: Number(data.patientId),
      orderTime: data.orderTime,
      createdTime: data.createdTime
    }
    return request.post<Result<string>>('/api/patient-diagnoses', submitData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  // 修改
  update(id: number, data: Partial<PatientDiagnosisVO>) {
    console.log('API层更新诊断数据:', JSON.stringify(data))
    // 直接透传时间字段为ISO格式
    const submitData = {
      id: Number(id),
      diseaseId: Number(data.diseaseId),
      diseaseType: Number(data.diseaseType),
      patientId: Number(data.patientId),
      orderTime: data.orderTime,
      createdTime: data.createdTime
    }
    return request.put<Result<string>>(`/api/patient-diagnoses/${id}`, submitData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  // 删除
  delete(id: number) {
    return request.delete<Result<string>>(`/api/patient-diagnoses/${id}`)
  }
}

// 处方管理API
export const prescriptionApi = {
  // 分页查询
  getPage(params: PageQuery & { drugName?: string, patientName?: string, patientId?: number }) {
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
  add(data: any) {
    console.log('API层添加处方数据:', JSON.stringify(data))
    // 确保数据格式正确，严格按照API文档要求
    const currentTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const submitData = {
      createdTime: data.createdTime || currentTime,
      doctorOrder: data.doctorOrder || '',
      drugId: Number(data.drugId),
      endTime: data.endTime || '',
      orderNumber: Number(data.orderNumber || 0),
      patientId: Number(data.patientId),
      startTime: data.startTime || '',
      status: Number(data.status || 1),
      updatedTime: data.updatedTime || currentTime,
      useMethod: data.useMethod || ''
    }
    return request.post<Result<string>>('/api/patient-prescriptions', submitData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  // 修改
  update(id: number, data: any) {
    console.log('API层更新处方数据:', JSON.stringify(data))
    // 确保数据格式正确，严格按照API文档要求
    const currentTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
    const submitData = {
      createdTime: data.createdTime || currentTime,
      doctorOrder: data.doctorOrder || '',
      drugId: Number(data.drugId),
      endTime: data.endTime || '',
      id: Number(id),
      orderNumber: Number(data.orderNumber || 0),
      patientId: Number(data.patientId),
      startTime: data.startTime || '',
      status: Number(data.status || 1),
      updatedTime: currentTime,
      useMethod: data.useMethod || ''
    }
    return request.put<Result<string>>(`/api/patient-prescriptions/${id}`, submitData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
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
  add(data: any) {
    console.log('API层添加医疗服务数据:', JSON.stringify(data))
    // 确保数据格式正确，严格按照API文档要求
    const submitData = {
      createdTime: data.createdTime || dayjs().format("YYYY-MM-DD HH:mm:ss"),
      doctorOrder: data.doctorOrder || '',
      medicalId: Number(data.medicalId),
      orderTime: data.orderTime || dayjs().format("YYYY-MM-DD HH:mm:ss"),
      patientId: Number(data.patientId),
      status: Number(data.status || 1),
      updatedTime: data.updatedTime || dayjs().format("YYYY-MM-DD HH:mm:ss"),
      useMethod: data.useMethod || ''
    }
    return request.post<Result<string>>('/api/patient-medical-services', submitData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  // 修改
  update(id: number, data: any) {
    console.log('API层更新医疗服务数据:', JSON.stringify(data))
    // 确保数据格式正确，严格按照API文档要求
    const submitData = {
      createdTime: data.createdTime || dayjs().format("YYYY-MM-DD HH:mm:ss"),
      doctorOrder: data.doctorOrder || '',
      id: Number(id),
      medicalId: Number(data.medicalId),
      orderTime: data.orderTime || dayjs().format("YYYY-MM-DD HH:mm:ss"),
      patientId: Number(data.patientId),
      status: Number(data.status || 1),
      updatedTime: data.updatedTime || dayjs().format("YYYY-MM-DD HH:mm:ss"),
      useMethod: data.useMethod || ''
    }
    return request.put<Result<string>>(`/api/patient-medical-services/${id}`, submitData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
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
    return request.get<Result<ReimbursementCalculation>>(`/api/insured-persons/${personId}/reimbursement-calculation`, { params })
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