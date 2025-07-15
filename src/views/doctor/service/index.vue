<template>
  <div class="service-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <el-form-item label="患者ID" prop="patientId">
          <el-input-number
            v-model="searchForm.patientId"
            placeholder="请输入患者ID"
            :min="1"
            :precision="0"
            style="width: 160px"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="服务名称" prop="serviceName">
          <el-input
            v-model="searchForm.serviceName"
            placeholder="请输入服务名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>医疗服务记录列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增记录
          </el-button>
        </div>
      </template>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="patientName" label="患者姓名" width="120" />
        <el-table-column prop="medicalName" label="服务名称" width="150" />
        <el-table-column prop="medicalNumber" label="服务编码" width="120" />
        <el-table-column prop="orderTime" label="开立时间" width="150">
          <template #default="{ row }">
            {{ formatDate(row.orderTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="doctorOrder" label="医嘱内容" min-width="150" show-overflow-tooltip />
        <el-table-column prop="useMethod" label="使用方法" width="120" />
        <el-table-column prop="medicalPrice" label="单价" width="100" />
        <el-table-column prop="medicalUnit" label="单位" width="80" />
        <el-table-column prop="medicalInfo" label="医疗服务信息" min-width="150" show-overflow-tooltip />
        <el-table-column prop="medicalExclude" label="排除项目" min-width="150" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="serviceStatusType(row.status)">
              {{ serviceStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="success" link @click="handleView(row)">
                查看
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增医疗服务记录' : dialogType === 'edit' ? '编辑医疗服务记录' : '查看医疗服务记录'"
      width="700px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        :disabled="dialogType === 'view'"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="患者ID" prop="patientId" required>
              <el-input-number v-model="form.patientId" :min="1" :precision="0" style="width: 100%" placeholder="请输入患者ID" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="患者姓名" prop="patientName">
              <el-input v-model="form.patientName" placeholder="请输入患者姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="医疗服务" prop="medicalId" required>
              <el-select
                v-model="form.medicalId"
                filterable
                remote
                :remote-method="searchMedicalServices"
                placeholder="请选择医疗服务"
                style="width: 100%"
                @change="handleMedicalServiceChange"
              >
                <el-option
                  v-for="item in medicalServiceOptions"
                  :key="item.id || item.medicalId || ''"
                  :label="item.medicalName"
                  :value="item.medicalId || item.id"
                >
                  <div>
                    <span>{{ item.medicalName }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">{{ item.medicalNumber }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="医疗服务名称" prop="medicalName">
              <el-input v-model="form.medicalName" placeholder="请输入医疗服务名称" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="医疗服务编码" prop="medicalNumber">
              <el-input v-model="form.medicalNumber" placeholder="请输入医疗服务编码" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="医疗服务类型" prop="medicalType">
              <el-select v-model="form.medicalType" placeholder="请选择医疗服务类型" style="width: 100%">
                <el-option label="检查" value="检查" />
                <el-option label="化验" value="化验" />
                <el-option label="治疗" value="治疗" />
                <el-option label="手术" value="手术" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开立时间" prop="orderTime">
              <el-date-picker
                v-model="form.orderTime"
                type="datetime"
                placeholder="请选择开立时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="医嘱内容" prop="doctorOrder">
              <el-input v-model="form.doctorOrder" type="textarea" :rows="3" placeholder="请输入医嘱内容" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="使用方法" prop="useMethod">
              <el-input v-model="form.useMethod" placeholder="请输入使用方法" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单价" prop="medicalPrice">
              <el-input v-model="form.medicalPrice" placeholder="请输入单价" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="medicalUnit">
              <el-input v-model="form.medicalUnit" placeholder="请输入单位" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="医疗服务信息" prop="medicalInfo">
              <el-input v-model="form.medicalInfo" type="textarea" :rows="3" placeholder="请输入医疗服务信息" />
        </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排除项目" prop="medicalExclude">
              <el-input v-model="form.medicalExclude" type="textarea" :rows="3" placeholder="请输入排除项目" />
        </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="正常执行" value="1" />
                <el-option label="已作废" value="0" />
                <el-option label="已停止" value="2" />
              </el-select>
        </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" v-if="dialogType !== 'view'">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { serviceApi } from '@/api/doctor'
import type { PatientMedicalServiceVO } from '@/types/doctor'
import dayjs from 'dayjs'
import request from '@/utils/request'
import type { Result } from '@/types'

// 医疗服务选项
interface MedicalService {
  id?: number
  medicalId?: number
  medicalName?: string
  medicalNumber?: string
  medicalType?: string
  medicalUnit?: string
  medicalPrice?: number
  medicalInfo?: string
  medicalExclude?: string
  countryNumber?: string
}

const medicalServiceOptions = ref<MedicalService[]>([])

// 搜索医疗服务
const searchMedicalServices = async (query: string) => {
  if (query) {
    try {
      // 使用serviceApi.search方法，它调用的是正确的接口 /api/patient-medical-services/search
      const { data } = await serviceApi.search(query)
      console.log('搜索医疗服务结果:', data)
      medicalServiceOptions.value = data || []
    } catch (error) {
      console.error('搜索医疗服务失败:', error)
    }
  } else {
    medicalServiceOptions.value = []
  }
}

// 处理医疗服务选择变化
const handleMedicalServiceChange = (serviceId: number) => {
  const service = medicalServiceOptions.value.find(item => item.id === serviceId || item.medicalId === serviceId)
  if (service) {
    Object.assign(form, {
      medicalId: service.medicalId || service.id,
      medicalName: service.medicalName || '',
      medicalNumber: service.medicalNumber || '',
      medicalType: service.medicalType || '',
      medicalUnit: service.medicalUnit || '',
      medicalPrice: service.medicalPrice || 0,
      medicalInfo: service.medicalInfo || '',
      medicalExclude: service.medicalExclude || '',
      countryNumber: service.countryNumber || ''
    })
  }
}

// 搜索表单
const searchForm = reactive({
  patientId: undefined as number | undefined,
  serviceName: ''
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const loading = ref(false)
const tableData = ref<PatientMedicalServiceVO[]>([])

// 表单数据
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit' | 'view'>('add')
const formRef = ref<FormInstance>()
const form = reactive<Partial<PatientMedicalServiceVO>>({
  patientId: undefined,
  patientName: '',
  medicalId: undefined,
  medicalName: '',
  medicalNumber: '',
  medicalType: '',
  medicalUnit: '',
  medicalPrice: undefined,
  medicalInfo: '',
  medicalExclude: '',
  doctorOrder: '',
  useMethod: '',
  orderTime: new Date().toISOString(),
  status: 1,
  createdTime: '',
  updatedTime: ''
})

// 表单校验规则
const rules: FormRules = {
  patientId: [
    { required: true, message: '请输入患者ID', trigger: 'blur' }
  ],
  patientName: [
    { required: true, message: '请输入患者姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  medicalId: [
    { required: true, message: '请选择医疗服务', trigger: 'change' }
  ],
  medicalName: [
    { required: true, message: '请输入医疗服务名称', trigger: 'blur' }
  ],
  medicalNumber: [
    { required: true, message: '请输入医疗服务编码', trigger: 'blur' }
  ],
  medicalType: [
    { required: true, message: '请选择医疗服务类型', trigger: 'change' }
  ],
  orderTime: [
    { required: true, message: '请选择开立时间', trigger: 'change' }
  ],
  doctorOrder: [
    { required: true, message: '请输入医嘱内容', trigger: 'blur' }
  ],
  useMethod: [
    { required: true, message: '请输入使用方法', trigger: 'blur' }
  ]
}

// 获取医疗服务记录列表
const fetchServiceRecords = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    };
    
    // 只添加有值的查询参数
    if (searchForm.patientId) {
      params.patientId = searchForm.patientId;
    }
    
    if (searchForm.serviceName) {
      params.serviceName = searchForm.serviceName;
    }
    
    console.log('医疗服务查询参数:', params);
    const { data } = await serviceApi.getPage(params);
    tableData.value = data.list;
    pagination.total = data.total;
  } catch (error) {
    console.error('获取医疗服务记录列表失败:', error);
    ElMessage.error('获取医疗服务记录列表失败');
  } finally {
    loading.value = false;
  }
}

// 处理查询
const handleSearch = () => {
  pagination.pageNum = 1
  fetchServiceRecords()
}

// 重置查询
const resetSearch = () => {
  Object.assign(searchForm, {
    patientId: undefined,
    serviceName: ''
  })
  handleSearch()
}

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 处理编辑
const handleEdit = async (row: PatientMedicalServiceVO) => {
  dialogType.value = 'edit'
  try {
    const { data } = await serviceApi.getById(row.id!)
    Object.assign(form, data)
  dialogVisible.value = true
  } catch (error) {
    console.error('获取医疗服务记录详情失败:', error)
  }
}

// 处理查看
const handleView = async (row: PatientMedicalServiceVO) => {
  dialogType.value = 'view'
  try {
    const { data } = await serviceApi.getById(row.id!)
    Object.assign(form, data)
  dialogVisible.value = true
  } catch (error) {
    console.error('获取医疗服务记录详情失败:', error)
  }
}

// 处理删除
const handleDelete = (row: PatientMedicalServiceVO) => {
  ElMessageBox.confirm(
    `确认删除患者"${row.patientName}"的医疗服务记录吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await serviceApi.delete(row.id!)
      ElMessage.success('删除成功')
      fetchServiceRecords()
    } catch (error) {
      console.error('删除失败:', error)
    }
  })
}

// 处理表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 确保必要字段存在且类型正确
        if (!form.patientId) {
          ElMessage.error('患者ID不能为空')
          return
        }
        
        if (!form.medicalId) {
          ElMessage.error('医疗服务不能为空')
          return
        }
        
        // 确保数据类型正确
        const currentTime = new Date().toISOString()
        
        // 严格按照API文档构建请求体
        // 参考文档12.1 新增患者医疗服务
        const submitData = {
          createdTime: currentTime,
          doctorOrder: form.doctorOrder || '',
          medicalId: Number(form.medicalId),
          orderTime: form.orderTime || currentTime,
          patientId: Number(form.patientId),
          status: Number(form.status || 1),
          updatedTime: currentTime,
          useMethod: form.useMethod || ''
        }
        
        console.log('提交患者医疗服务数据:', JSON.stringify(submitData))
        
        if (dialogType.value === 'add') {
          await serviceApi.add(submitData)
          ElMessage.success('新增成功')
        } else {
          // 编辑时需要添加id字段
          const updateData = {
            ...submitData,
            id: form.id
          }
          await serviceApi.update(form.id!, updateData)
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchServiceRecords()
      } catch (error: any) {
        console.error('保存失败:', error)
        if (error.response && error.response.data) {
          ElMessage.error(`保存失败: ${error.response.data.message || error.response.data.error || '请检查数据格式是否正确'}`)
        } else {
          ElMessage.error(`保存失败: ${error.message || '请检查数据格式是否正确'}`)
        }
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  medicalServiceOptions.value = []
  Object.assign(form, {
    id: undefined,
    patientId: undefined,
    patientName: '',
    medicalId: undefined,
    medicalName: '',
    medicalNumber: '',
    medicalType: '',
    medicalUnit: '',
    medicalPrice: undefined,
    medicalInfo: '',
    medicalExclude: '',
    doctorOrder: '',
    useMethod: '',
    orderTime: new Date().toISOString(),
    status: 1,
    createdTime: '',
    updatedTime: ''
  })
}

// 处理分页变化
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchServiceRecords()
}

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  fetchServiceRecords()
}

// 格式化日期
const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 医疗服务状态
const serviceStatusType = (status: number) => {
  switch (status) {
    case 1:
      return 'success'
    case 0:
      return 'danger'
    case 2:
      return 'warning'
    default:
      return 'info'
  }
}

const serviceStatusText = (status: number) => {
  switch (status) {
    case 1:
      return '正常执行'
    case 0:
      return '已作废'
    case 2:
      return '已停止'
    default:
      return '未知'
  }
}

// 初始化
fetchServiceRecords()
</script>

<style scoped>
.service-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
