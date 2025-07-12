import { request } from '../utils/request'
import type { PageQuery, PageResult, Drug, Treatment, MedicalFacility, ReimbursementRatio } from '@/types/insurance'

// 药品管理API
export const drugApi = {
  // 分页查询
  getPage(params: PageQuery) {
    return request.get<PageResult<Drug>>('/drugs/page', params)
  },
  // 搜索
  search(drugName: string) {
    return request.get<Drug[]>('/drugs/search', { drugName })
  },
  // 新增
  add(data: Partial<Drug>) {
    return request.post('/drugs', data)
  },
  // 修改
  update(id: number, data: Partial<Drug>) {
    return request.put(`/drugs/${id}`, data)
  },
  // 删除
  delete(ids: number[]) {
    return request.delete('/drugs', { ids })
  }
}

// 诊疗项目API
export const treatmentApi = {
  getPage(params: PageQuery) {
    return request.get<PageResult<Treatment>>('/treatments/page', params)
  },
  search(treatmentName: string) {
    return request.get<Treatment[]>('/treatments/search', { treatmentName })
  },
  add(data: Partial<Treatment>) {
    return request.post('/treatments', data)
  },
  update(id: number, data: Partial<Treatment>) {
    return request.put(`/treatments/${id}`, data)
  },
  delete(ids: number[]) {
    return request.delete('/treatments', { ids })
  }
}

// 医疗服务设施API
export const facilityApi = {
  getPage(params: PageQuery) {
    return request.get<PageResult<MedicalFacility>>('/medical-facilities/page', params)
  },
  search(facilityName: string) {
    return request.get<MedicalFacility[]>('/medical-facilities/search', { facilityName })
  },
  add(data: Partial<MedicalFacility>) {
    return request.post('/medical-facilities', data)
  },
  update(id: number, data: Partial<MedicalFacility>) {
    return request.put(`/medical-facilities/${id}`, data)
  },
  delete(ids: number[]) {
    return request.delete('/medical-facilities', { ids })
  }
}

// 报销比例API
export const ratioApi = {
  getDrugRatios() {
    return request.get<ReimbursementRatio[]>('/drug-reimbursement-ratios')
  },
  updateDrugRatio(id: number, data: Partial<ReimbursementRatio>) {
    return request.put(`/drug-reimbursement-ratios/${id}`, data)
  },
  getHospitalRatios(level: number, employeeType: '在职' | '退休') {
    return request.get<ReimbursementRatio[]>(`/level${level}-hospital-ratios`, { employeeType })
  },
  updateHospitalRatio(level: number, id: number, data: Partial<ReimbursementRatio>) {
    return request.put(`/level${level}-hospital-ratios/${id}`, data)
  }
}
