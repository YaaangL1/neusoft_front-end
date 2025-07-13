import { request } from '@/utils/request'
import type { Result, PageQuery, PageResult } from '@/types'
import type { InsuredPersonVO, ReimbursementReportVO, CategoryRatioData } from '@/types/insurance'

export const reportApi = {
  // 参保人员分页查询
  getPersonPage(params: PageQuery) {
    return request.get<Result<PageResult<InsuredPersonVO>>>('/api/reimbursement-reports/persons/page', {
      params
    })
  },

  // 参保人员搜索
  searchPerson(personName: string) {
    return request.get<Result<InsuredPersonVO[]>>('/api/reimbursement-reports/persons/search', {
      params: { personName }
    })
  },

  // 获取综合费用报销详情报表
  getComprehensiveReport(personId: number, startDate?: string, endDate?: string) {
    return request.get<Result<ReimbursementReportVO>>(
      `/api/reimbursement-reports/persons/${personId}/comprehensive-report`,
      { params: { startDate, endDate } }
    )
  },

  // 获取药品费用分类占比报表
  getDrugCategoryChart(personId: number, startDate?: string, endDate?: string) {
    return request.get<Result<CategoryRatioData[]>>(
      `/api/reimbursement-reports/persons/${personId}/drug-category-chart`,
      { params: { startDate, endDate } }
    )
  },

  // 获取费用类型占比报表
  getExpenseTypeChart(personId: number, startDate?: string, endDate?: string) {
    return request.get<Result<CategoryRatioData[]>>(
      `/api/reimbursement-reports/persons/${personId}/expense-type-chart`,
      { params: { startDate, endDate } }
    )
  }
} 