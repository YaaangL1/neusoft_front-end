import { request } from '@/utils/request'
import type {
  InsuredPerson,
  InsuredPersonQuery,
  ExpenseDetail,
  ExpenseQuery,
  ReimbursementCalculation,
  ReimbursementCalculationParams,
  ReimbursementExecuteParams,
  ReimbursementRecord,
  ReimbursementReport,
  ReportGenerateParams
} from '@/types/insurance'
import type { PageResult, Result } from '@/types'

// 参保人员相关接口
export const insuredPersonApi = {
  // 分页查询参保人员
  getPage(params: InsuredPersonQuery) {
    return request.get<Result<PageResult<InsuredPerson>>>('/api/insurance-management/persons/page', { params })
      .then(response => response.data)
  },

  // 搜索参保人员
  search(params: { personName?: string; insuranceStatus?: string; peopleType?: string }) {
    return request.get<Result<InsuredPerson[]>>('/api/insurance-management/persons/search', { params })
      .then(response => {
        return Array.isArray(response.data) ? response.data : []
      })
  },

  // 新增参保人员
  create(data: Omit<InsuredPerson, 'id' | 'createTime' | 'updateTime'>) {
    return request.post<InsuredPerson>('/api/insurance-management/persons', data)
  },

  // 修改参保人员信息
  update(id: number, data: Partial<InsuredPerson>) {
    return request.put<InsuredPerson>(`/api/insurance-management/persons/${id}`, data)
  }
}

// 费用相关接口
export const expenseApi = {
  // 查询费用详情
  getExpenses(params: ExpenseQuery) {
    let url = '';
    if (params.expenseType === 'drug') {
      url = `/api/expense-query/persons/${params.personId}/drug-expenses`;
    } else if (params.expenseType === 'service') {
      url = `/api/expense-query/persons/${params.personId}/service-expenses`;
    } else if (params.expenseType === 'treatment') {
      url = `/api/expense-query/persons/${params.personId}/treatment-expenses`;
    } else {
      // 默认返回药品费用
      url = `/api/expense-query/persons/${params.personId}/drug-expenses`;
    }
    
    return request.get<Result<ExpenseDetail[]>>(url, {
      params: {
        startDate: params.startDate,
        endDate: params.endDate
      }
    }).then(response => {
      // 确保返回的是数组
      return Array.isArray(response.data) ? response.data : []
    })
  },

  // 获取费用类型分布
  getExpenseTypeChart(personId: number, startDate?: string, endDate?: string) {
    return request.get<{ type: string; amount: number; percentage: number }[]>(
      `/api/reimbursement-reports/persons/${personId}/expense-type-chart`,
      { params: { startDate, endDate } }
    )
  },

  // 获取药品分类占比
  getDrugCategoryChart(personId: number, startDate?: string, endDate?: string) {
    return request.get<{ type: string; amount: number; percentage: number }[]>(
      `/api/reimbursement-reports/persons/${personId}/drug-category-chart`,
      { params: { startDate, endDate } }
    )
  },

  // 导出费用明细
  exportExpenses(personId: number, params: { expenseType?: string; startDate?: string; endDate?: string }) {
    return request.get(`/api/expense-query/persons/${personId}/expenses/export`, {
      params,
      responseType: 'blob'
    })
  }
}

// 报销管理API
export const reimbursementApi = {
  // 分页查询参保人员
  getPersonPage(params: InsuredPersonQuery) {
    return request.get<PageResult<InsuredPerson>>('/api/reimbursement/persons/page', { params })
  },

  // 搜索参保人员
  searchPerson(personName: string) {
    return request.get<InsuredPerson[]>('/api/reimbursement/persons/search', { params: { personName } })
  },

  // 计算报销金额
  calculate(personId: number, params: Omit<ReimbursementCalculationParams, 'personId'>) {
    return request.get<ReimbursementCalculation>(
      `/api/reimbursement/persons/${personId}/calculate`,
      { params }
    )
  },

  // 执行报销
  execute(personId: number, params: Omit<ReimbursementExecuteParams, 'personId'>) {
    return request.post<ReimbursementRecord>(
      `/api/reimbursement/persons/${personId}/execute`,
      params
    )
  },

  // 获取报销记录
  getHistory(personId: number, params?: { startDate?: string; endDate?: string }) {
    return request.get<Result<ReimbursementRecord[]>>(
      `/api/reimbursement/persons/${personId}/history`,
      { params }
    ).then(response => {
      // 确保返回的是数组
      return Array.isArray(response.data) ? response.data : []
    })
  }
}

// 药品相关API
export const drugApi = {
  // 分页查询药品信息
  async getPage(params: { pageNum: number; pageSize: number; drugName?: string; insuranceType?: string }) {
    try {
      console.log('调用药品分页查询API，参数:', params)
      const response = await request.get<Result<PageResult<any>>>('/api/drugs/page', { params })
      console.log('药品分页查询API响应:', response)
      return response
    } catch (error) {
      console.error('药品分页查询失败:', error)
      throw error
    }
  },

  // 搜索药品
  async search(drugName: string) {
    try {
      console.log('调用药品搜索API，参数:', { drugName })
      const response = await request.get<Result<any[]>>('/api/drugs/search', { params: { drugName } })
      console.log('药品搜索API响应:', response)
      return response
    } catch (error) {
      console.error('药品搜索失败:', error)
      throw error
    }
  },

  // 获取药品详情
  async getById(drugId: number) {
    try {
      console.log('调用药品详情API，参数:', { drugId })
      const response = await request.get<Result<any>>(`/api/drugs/${drugId}`)
      console.log('药品详情API响应:', response)
      return response
    } catch (error) {
      console.error('获取药品详情失败:', error)
      throw error
    }
  },

  // 新增药品
  async add(data: any) {
    try {
      console.log('调用新增药品API，参数:', data)
      const response = await request.post<Result<any>>('/api/drugs', data)
      console.log('新增药品API响应:', response)
      return response
    } catch (error) {
      console.error('新增药品失败:', error)
      throw error
    }
  },

  // 更新药品
  async update(drugId: number, data: any) {
    try {
      console.log('调用更新药品API，参数:', { drugId, data })
      const response = await request.put<Result<any>>(`/api/drugs/${drugId}`, data)
      console.log('更新药品API响应:', response)
      return response
    } catch (error) {
      console.error('更新药品失败:', error)
      throw error
    }
  },

  // 删除药品
  async delete(drugIds: number[]) {
    try {
      console.log('调用删除药品API，参数:', { drugIds })
      const response = await request.delete<Result<any>>('/api/drugs', { data: drugIds })
      console.log('删除药品API响应:', response)
      return response
    } catch (error) {
      console.error('删除药品失败:', error)
      throw error
    }
  }
}

// 诊疗项目相关API
export const treatmentApi = {
  // 分页查询诊疗项目
  async getPage(params: { pageNum: number; pageSize: number; treatmentName?: string }) {
    try {
      console.log('调用诊疗项目分页查询API，参数:', params)
      const response = await request.get<Result<PageResult<any>>>('/api/treatments/page', { params })
      console.log('诊疗项目分页查询API响应:', response)
      return response
    } catch (error) {
      console.error('诊疗项目分页查询失败:', error)
      throw error
    }
  },

  // 搜索诊疗项目
  async search(treatmentName: string) {
    try {
      console.log('调用诊疗项目搜索API，参数:', { treatmentName })
      const response = await request.get<Result<any[]>>('/api/treatments/search', { params: { treatmentName } })
      console.log('诊疗项目搜索API响应:', response)
      return response
    } catch (error) {
      console.error('诊疗项目搜索失败:', error)
      throw error
    }
  },

  // 获取诊疗项目详情
  async getById(treatmentId: number) {
    try {
      console.log('调用诊疗项目详情API，参数:', { treatmentId })
      const response = await request.get<Result<any>>(`/api/treatments/${treatmentId}`)
      console.log('诊疗项目详情API响应:', response)
      return response
    } catch (error) {
      console.error('获取诊疗项目详情失败:', error)
      throw error
    }
  },

  // 新增诊疗项目
  async add(data: any) {
    try {
      console.log('调用新增诊疗项目API，参数:', data)
      const response = await request.post<Result<any>>('/api/treatments', data)
      console.log('新增诊疗项目API响应:', response)
      return response
    } catch (error) {
      console.error('新增诊疗项目失败:', error)
      throw error
    }
  },

  // 更新诊疗项目
  async update(treatmentId: number, data: any) {
    try {
      console.log('调用更新诊疗项目API，参数:', { treatmentId, data })
      const response = await request.put<Result<any>>(`/api/treatments/${treatmentId}`, data)
      console.log('更新诊疗项目API响应:', response)
      return response
    } catch (error) {
      console.error('更新诊疗项目失败:', error)
      throw error
    }
  },

  // 删除诊疗项目
  async delete(treatmentIds: number[]) {
    try {
      console.log('调用删除诊疗项目API，参数:', { treatmentIds })
      const response = await request.delete<Result<any>>('/api/treatments', { data: treatmentIds })
      console.log('删除诊疗项目API响应:', response)
      return response
    } catch (error) {
      console.error('删除诊疗项目失败:', error)
      throw error
    }
  }
}

// 医疗服务设施相关API
export const facilityApi = {
  // 分页查询医疗服务设施
  async getPage(params: { pageNum: number; pageSize: number; facilityName?: string }) {
    try {
      console.log('调用医疗服务设施分页查询API，参数:', params)
      const response = await request.get<Result<PageResult<any>>>('/api/medical-facilities/page', { params })
      console.log('医疗服务设施分页查询API响应:', response)
      return response
    } catch (error) {
      console.error('医疗服务设施分页查询失败:', error)
      throw error
    }
  },

  // 搜索医疗服务设施
  async search(facilityName: string) {
    try {
      console.log('调用医疗服务设施搜索API，参数:', { facilityName })
      const response = await request.get<Result<any[]>>('/api/medical-facilities/search', { params: { facilityName } })
      console.log('医疗服务设施搜索API响应:', response)
      return response
    } catch (error) {
      console.error('医疗服务设施搜索失败:', error)
      throw error
    }
  },

  // 获取医疗服务设施详情
  async getById(facilityId: number) {
    try {
      console.log('调用医疗服务设施详情API，参数:', { facilityId })
      const response = await request.get<Result<any>>(`/api/medical-facilities/${facilityId}`)
      console.log('医疗服务设施详情API响应:', response)
      return response
    } catch (error) {
      console.error('获取医疗服务设施详情失败:', error)
      throw error
    }
  },

  // 新增医疗服务设施
  async add(data: any) {
    try {
      console.log('调用新增医疗服务设施API，参数:', data)
      const response = await request.post<Result<any>>('/api/medical-facilities', data)
      console.log('新增医疗服务设施API响应:', response)
      return response
    } catch (error) {
      console.error('新增医疗服务设施失败:', error)
      throw error
    }
  },

  // 更新医疗服务设施
  async update(facilityId: number, data: any) {
    try {
      console.log('调用更新医疗服务设施API，参数:', { facilityId, data })
      const response = await request.put<Result<any>>(`/api/medical-facilities/${facilityId}`, data)
      console.log('更新医疗服务设施API响应:', response)
      return response
    } catch (error) {
      console.error('更新医疗服务设施失败:', error)
      throw error
    }
  },

  // 删除医疗服务设施
  async delete(facilityIds: number[]) {
    try {
      console.log('调用删除医疗服务设施API，参数:', { facilityIds })
      const response = await request.delete<Result<any>>('/api/medical-facilities', { data: facilityIds })
      console.log('删除医疗服务设施API响应:', response)
      return response
    } catch (error) {
      console.error('删除医疗服务设施失败:', error)
      throw error
    }
  }
}

// 报销比例相关API
export const ratioApi = {
  // 获取药品报销比例
  async getDrugRatios() {
    try {
      console.log('调用获取药品报销比例API')
      const response = await request.get<Result<any[]>>('/api/drug-reimbursement-ratios')
      console.log('获取药品报销比例响应:', response)
      return response
    } catch (error) {
      console.error('获取药品报销比例失败:', error)
      throw error
    }
  },

  // 获取医院报销比例
  async getHospitalRatios(level: number, employeeType: string) {
    try {
      console.log('调用获取医院报销比例API，参数:', { level, employeeType })
      const response = await request.get<Result<any[]>>(`/api/level${level}-hospital-ratios`, { 
        params: { employeeType } 
      })
      console.log('获取医院报销比例响应:', response)
      return response
    } catch (error) {
      console.error('获取医院报销比例失败:', error)
      throw error
    }
  },

  // 新增药品报销比例
  async addDrugRatio(data: any) {
    try {
      console.log('调用新增药品报销比例API，参数:', data)
      const response = await request.post<Result<any>>('/api/drug-reimbursement-ratios', data)
      console.log('新增药品报销比例响应:', response)
      return response
    } catch (error) {
      console.error('新增药品报销比例失败:', error)
      throw error
    }
  },

  // 更新药品报销比例
  async updateDrugRatio(ratioId: number, data: any) {
    try {
      console.log('调用更新药品报销比例API，参数:', { ratioId, data })
      const response = await request.put<Result<any>>(`/api/drug-reimbursement-ratios/${ratioId}`, data)
      console.log('更新药品报销比例响应:', response)
      return response
    } catch (error) {
      console.error('更新药品报销比例失败:', error)
      throw error
    }
  },

  // 删除药品报销比例
  async deleteDrugRatio(ratioId: number) {
    try {
      console.log('调用删除药品报销比例API，参数:', { ratioId })
      const response = await request.delete<Result<any>>(`/api/drug-reimbursement-ratios/${ratioId}`)
      console.log('删除药品报销比例响应:', response)
      return response
    } catch (error) {
      console.error('删除药品报销比例失败:', error)
      throw error
    }
  },

  // 检查药品报销比例类型是否存在
  async checkDrugRatioType(drugReimbursementType: string, excludeId?: number) {
    try {
      console.log('调用检查药品报销比例类型API，参数:', { drugReimbursementType, excludeId })
      const response = await request.get<Result<boolean>>('/api/drug-reimbursement-ratios/check-type', {
        params: { drugReimbursementType, excludeId }
      })
      console.log('检查药品报销比例类型响应:', response)
      return response
    } catch (error) {
      console.error('检查药品报销比例类型失败:', error)
      throw error
    }
  },

  // 更新药品报销比例状态
  async updateDrugRatioStatus(ratioId: number, status: number) {
    try {
      console.log('调用更新药品报销比例状态API，参数:', { ratioId, status })
      const response = await request.put<Result<any>>(`/api/drug-reimbursement-ratios/${ratioId}/status`, { status })
      console.log('更新药品报销比例状态响应:', response)
      return response
    } catch (error) {
      console.error('更新药品报销比例状态失败:', error)
      throw error
    }
  },

  // 新增医院报销比例
  async addHospitalRatio(level: number, data: any) {
    try {
      console.log('调用新增医院报销比例API，参数:', { level, data })
      const response = await request.post<Result<any>>(`/api/level${level}-hospital-ratios`, data)
      console.log('新增医院报销比例响应:', response)
      return response
    } catch (error) {
      console.error('新增医院报销比例失败:', error)
      throw error
    }
  },

  // 更新医院报销比例
  async updateHospitalRatio(level: number, ratioId: number, data: any) {
    try {
      console.log('调用更新医院报销比例API，参数:', { level, ratioId, data })
      const response = await request.put<Result<any>>(`/api/level${level}-hospital-ratios/${ratioId}`, data)
      console.log('更新医院报销比例响应:', response)
      return response
    } catch (error) {
      console.error('更新医院报销比例失败:', error)
      throw error
    }
  },

  // 删除医院报销比例
  async deleteHospitalRatio(level: number, ratioId: number) {
    try {
      console.log('调用删除医院报销比例API，参数:', { level, ratioId })
      const response = await request.delete<Result<any>>(`/api/level${level}-hospital-ratios/${ratioId}`)
      console.log('删除医院报销比例响应:', response)
      return response
    } catch (error) {
      console.error('删除医院报销比例失败:', error)
      throw error
    }
  }
}
