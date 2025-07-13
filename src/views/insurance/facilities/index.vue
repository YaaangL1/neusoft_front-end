<template>
    <div class="facilities-container">
      <!-- 搜索栏 -->
      <el-card class="search-card">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="项目名称">
            <el-input
              v-model="searchForm.projectName"
              placeholder="请输入项目名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="项目编码">
            <el-input
              v-model="searchForm.projectCode"
              placeholder="请输入项目编码"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
  
      <!-- 操作栏 -->
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <el-button type="primary" @click="handleAdd">新增设施</el-button>
            <el-button 
              type="danger" 
              :disabled="!selectedRows.length"
              @click="handleBatchDelete"
            >
              批量删除
            </el-button>
          </div>
        </template>
  
        <!-- 表格 -->
        <el-table
          v-loading="loading"
          :data="tableData"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="projectCode" label="项目编码" width="120" />
          <el-table-column prop="projectName" label="项目名称" show-overflow-tooltip />
          <el-table-column prop="nationalCode" label="国家编码" width="120" />
          <el-table-column prop="financialCategory" label="财务分类" width="100" />
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="{ row }">
              ¥{{ row.price.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
  
        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
  
      <!-- 编辑弹窗 -->
      <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="500px"
        @close="resetForm"
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="项目编码" prop="projectCode">
            <el-input v-model="form.projectCode" />
          </el-form-item>
          <el-form-item label="项目名称" prop="projectName">
            <el-input v-model="form.projectName" />
          </el-form-item>
          <el-form-item label="国家编码">
            <el-input v-model="form.nationalCode" />
          </el-form-item>
          <el-form-item label="财务分类">
            <el-input v-model="form.financialCategory" />
          </el-form-item>
          <el-form-item label="单位" prop="unit">
            <el-input v-model="form.unit" />
          </el-form-item>
          <el-form-item label="价格" prop="price">
            <el-input-number 
              v-model="form.price" 
              :precision="2" 
              :step="0.01" 
              :min="0"
            />
          </el-form-item>
          <el-form-item label="项目内涵">
            <el-input 
              v-model="form.projectContent" 
              type="textarea" 
              :rows="3"
            />
          </el-form-item>
          <el-form-item label="状态">
            <el-switch
              v-model="form.status"
              :active-value="1"
              :inactive-value="0"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance } from 'element-plus'
  import { facilityApi } from '@/api/insurance'
  import type { MedicalFacility } from '@/types/insurance'
  
  // 搜索表单
  const searchForm = reactive({
    projectName: '',
    projectCode: ''
  })
  
  // 表格数据
  const loading = ref(false)
  const tableData = ref<MedicalFacility[]>([])
  const selectedRows = ref<MedicalFacility[]>([])
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)
  
  // 获取表格数据
  const getTableData = async () => {
    loading.value = true
    try {
      const params = {
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        facilityName: searchForm.projectName
      }
      console.log('请求医疗服务设施列表，参数:', params)
      const res = await facilityApi.getPage(params)
      console.log('获取医疗服务设施列表响应:', res)
      
      if (res && res.data) {
        tableData.value = res.data.list || []
        total.value = res.data.total || 0
      } else {
        console.error('响应数据格式错误:', res)
        ElMessage.error('获取医疗服务设施列表失败：响应数据格式错误')
      }
    } catch (error: any) {
      console.error('获取医疗服务设施列表失败:', error)
      ElMessage.error(error.message || '获取医疗服务设施列表失败，请检查网络连接')
    } finally {
      loading.value = false
    }
  }
  
  // 搜索和重置
  const handleSearch = () => {
    pageNum.value = 1
    getTableData()
  }
  
  const resetSearch = () => {
    searchForm.projectName = ''
    searchForm.projectCode = ''
    handleSearch()
  }
  
  // 表格选择
  const handleSelectionChange = (rows: MedicalFacility[]) => {
    selectedRows.value = rows
  }
  
  // 分页
  const handleSizeChange = (val: number) => {
    pageSize.value = val
    getTableData()
  }
  
  const handleCurrentChange = (val: number) => {
    pageNum.value = val
    getTableData()
  }
  
  // 表单
  const dialogVisible = ref(false)
  const dialogTitle = ref('')
  const formRef = ref<FormInstance>()
  const form = reactive<Partial<MedicalFacility>>({
    projectCode: '',
    projectName: '',
    nationalCode: '',
    financialCategory: '',
    unit: '',
    price: 0,
    projectContent: '',
    status: 1
  })
  
  // 表单校验规则
  const rules = {
    projectCode: [{ required: true, message: '请输入项目编码', trigger: 'blur' }],
    projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
    unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
    price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
  }
  
  // 新增
  const handleAdd = () => {
    dialogTitle.value = '新增医疗服务设施'
    dialogVisible.value = true
  }
  
  // 编辑
  const handleEdit = (row: MedicalFacility) => {
    dialogTitle.value = '编辑医疗服务设施'
    Object.assign(form, row)
    dialogVisible.value = true
  }
  
  // 删除
  const handleDelete = async (row: MedicalFacility) => {
    await ElMessageBox.confirm('确认删除该医疗服务设施吗？', '提示', {
      type: 'warning'
    })
    try {
      await facilityApi.delete([row.id])
      ElMessage.success('删除成功')
      getTableData()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }
  
  // 批量删除
  const handleBatchDelete = async () => {
    if (!selectedRows.value.length) return
    
    await ElMessageBox.confirm(
      `确认删除选中的 ${selectedRows.value.length} 条数据吗？`,
      '提示',
      { type: 'warning' }
    )
    try {
      await facilityApi.delete(selectedRows.value.map(row => row.id))
      ElMessage.success('删除成功')
      getTableData()
    } catch (error) {
      console.error('批量删除失败:', error)
    }
  }
  
  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return
    
    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (form.id) {
            await facilityApi.update(form.id, form)
          } else {
            await facilityApi.add(form)
          }
          ElMessage.success('保存成功')
          dialogVisible.value = false
          getTableData()
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
      id: undefined,
      projectCode: '',
      projectName: '',
      nationalCode: '',
      financialCategory: '',
      unit: '',
      price: 0,
      projectContent: '',
      status: 1
    })
  }
  
  // 初始化
  getTableData()
  </script>
  
  <style scoped>
  .facilities-container {
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