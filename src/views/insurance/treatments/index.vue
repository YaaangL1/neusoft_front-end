<template>
    <div class="treatments-container">
      <!-- 搜索栏 -->
      <el-card class="search-card">
        <el-form :inline="true" :model="searchForm" ref="searchFormRef">
        <el-form-item label="项目名称" prop="treatmentName">
            <el-input
            v-model="searchForm.treatmentName"
              placeholder="请输入项目名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
        <el-form-item label="项目编码" prop="medicalNumber">
            <el-input
            v-model="searchForm.medicalNumber"
              placeholder="请输入项目编码"
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
            <span>诊疗项目列表</span>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增项目
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
        <el-table-column prop="medicalName" label="项目名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="medicalNumber" label="项目编码" width="120" />
        <el-table-column prop="countryNumber" label="国家编码" width="120" show-overflow-tooltip />
        <el-table-column prop="medicalType" label="项目类别" width="120" show-overflow-tooltip />
        <el-table-column prop="medicalUnit" label="单位" width="80" align="center" />
        <el-table-column prop="medicalPrice" label="单价" width="100" align="right">
            <template #default="{ row }">
            {{ formatPrice(row.medicalPrice) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button type="primary" link @click="handleEdit(row)">
                  编辑
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
        :title="dialogType === 'add' ? '新增诊疗项目' : '编辑诊疗项目'"
        width="600px"
        @close="resetForm"
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
        >
        <el-form-item label="项目名称" prop="medicalName">
          <el-input v-model="form.medicalName" placeholder="请输入项目名称" />
          </el-form-item>
        <el-form-item label="项目编码" prop="medicalNumber">
          <el-input v-model="form.medicalNumber" placeholder="请输入项目编码" />
          </el-form-item>
        <el-form-item label="国家编码" prop="countryNumber">
          <el-input v-model="form.countryNumber" placeholder="请输入国家编码" />
          </el-form-item>
        <el-form-item label="项目类别" prop="medicalType">
          <el-input v-model="form.medicalType" placeholder="请输入项目类别" />
          </el-form-item>
        <el-form-item label="单位" prop="medicalUnit">
          <el-input v-model="form.medicalUnit" placeholder="请输入单位" />
          </el-form-item>
        <el-form-item label="单价" prop="medicalPrice">
            <el-input-number
            v-model="form.medicalPrice"
              :precision="2"
              :step="0.1"
              :min="0"
              style="width: 100%"
            />
          </el-form-item>
        <el-form-item label="项目说明" prop="medicalInfo">
          <el-input
            v-model="form.medicalInfo"
            type="textarea"
            placeholder="请输入项目说明"
          />
        </el-form-item>
        <el-form-item label="除外内容" prop="medicalExclude">
          <el-input
            v-model="form.medicalExclude"
            type="textarea"
            placeholder="请输入除外内容"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
            <el-input
            v-model="form.remark"
              type="textarea"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">
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
  import { treatmentApi } from '@/api/insurance'
  import type { TreatmentVO } from '@/types/insurance'
  
  // 搜索表单
  const searchForm = reactive({
    treatmentName: '',
    medicalNumber: ''
  })
  
  // 分页信息
  const pagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0
  })
  
  // 表格数据
  const loading = ref(false)
  const tableData = ref<TreatmentVO[]>([])
  
  // 表单数据
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInstance>()
  const form = reactive<Partial<TreatmentVO>>({
    medicalName: '',
    medicalNumber: '',
    countryNumber: '',
    medicalType: '',
    medicalUnit: '',
    medicalPrice: 0,
    medicalInfo: '',
    medicalExclude: '',
    remark: ''
  })
  
  // 表单校验规则
  const rules: FormRules = {
    medicalName: [
      { required: true, message: '请输入项目名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    medicalNumber: [
      { required: true, message: '请输入项目编码', trigger: 'blur' }
    ],
    medicalUnit: [
      { required: true, message: '请输入单位', trigger: 'blur' }
    ],
    medicalPrice: [
      { required: true, message: '请输入单价', trigger: 'blur' }
    ]
  }
  
  // 获取诊疗项目列表
  const fetchTreatments = async () => {
    loading.value = true
    try {
      const params = {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        treatmentName: searchForm.treatmentName,
        medicalNumber: searchForm.medicalNumber
      }
      console.log('请求诊疗项目列表，参数:', params)
      const res = await treatmentApi.getPage(params)
      console.log('获取诊疗项目列表响应:', res)
      
      if (res && res.data) {
        tableData.value = res.data.list || []
        pagination.total = res.data.total || 0
      } else {
        console.error('响应数据格式错误:', res)
        ElMessage.error('获取诊疗项目列表失败：响应数据格式错误')
      }
    } catch (error: any) {
      console.error('获取诊疗项目列表失败:', error)
      ElMessage.error(error.message || '获取诊疗项目列表失败，请检查网络连接')
    } finally {
      loading.value = false
    }
  }
  
  // 处理查询
  const handleSearch = () => {
    pagination.pageNum = 1
    fetchTreatments()
  }
  
  // 重置查询
  const resetSearch = () => {
    Object.assign(searchForm, {
      treatmentName: '',
      medicalNumber: ''
    })
    handleSearch()
  }
  
  // 处理新增
  const handleAdd = () => {
    dialogType.value = 'add'
    dialogVisible.value = true
  }
  
  // 处理编辑
  const handleEdit = (row: TreatmentVO) => {
    dialogType.value = 'edit'
    Object.assign(form, row)
    dialogVisible.value = true
  }
  
  // 处理删除
  const handleDelete = (row: TreatmentVO) => {
    ElMessageBox.confirm(
      `确认删除诊疗项目"${row.medicalName}"吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await treatmentApi.delete([row.id])
        ElMessage.success('删除成功')
        fetchTreatments()
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
          if (dialogType.value === 'add') {
            await treatmentApi.add(form)
            ElMessage.success('新增成功')
          } else {
            await treatmentApi.update(form.id!, form)
            ElMessage.success('更新成功')
          }
          dialogVisible.value = false
          fetchTreatments()
        } catch (error) {
          console.error('保存失败:', error)
        }
      }
    })
  }
  
  // 重置表单
  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields()
    }
    Object.assign(form, {
      medicalName: '',
      medicalNumber: '',
      countryNumber: '',
      medicalType: '',
      medicalUnit: '',
      medicalPrice: 0,
      medicalInfo: '',
      medicalExclude: '',
      remark: ''
    })
  }
  
  // 处理分页变化
  const handleSizeChange = (val: number) => {
    pagination.pageSize = val
    fetchTreatments()
  }
  
  const handleCurrentChange = (val: number) => {
    pagination.pageNum = val
    fetchTreatments()
  }
  
  // 格式化价格
  const formatPrice = (price: number) => {
    return price.toLocaleString('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    })
  }
  
  // 初始化
  fetchTreatments()
  </script>
  
  <style scoped>
  .treatments-container {
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