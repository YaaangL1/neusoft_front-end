<template>
    <div class="treatments-container">
      <!-- 搜索栏 -->
      <el-card class="search-card">
        <el-form :inline="true" :model="searchForm" ref="searchFormRef">
          <el-form-item label="项目名称" prop="projectName">
            <el-input
              v-model="searchForm.projectName"
              placeholder="请输入项目名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="项目编码" prop="projectCode">
            <el-input
              v-model="searchForm.projectCode"
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
          <el-table-column prop="projectName" label="项目名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="projectCode" label="项目编码" width="120" />
          <el-table-column prop="nationalCode" label="国家编码" width="120" show-overflow-tooltip />
          <el-table-column prop="financialCategory" label="财务分类" width="120" show-overflow-tooltip />
          <el-table-column prop="unit" label="单位" width="80" align="center" />
          <el-table-column prop="price" label="单价" width="100" align="right">
            <template #default="{ row }">
              {{ formatPrice(row.price) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="handleStatusChange(row)"
              />
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
          <el-form-item label="项目名称" prop="projectName">
            <el-input v-model="form.projectName" placeholder="请输入项目名称" />
          </el-form-item>
          <el-form-item label="项目编码" prop="projectCode">
            <el-input v-model="form.projectCode" placeholder="请输入项目编码" />
          </el-form-item>
          <el-form-item label="国家编码" prop="nationalCode">
            <el-input v-model="form.nationalCode" placeholder="请输入国家编码" />
          </el-form-item>
          <el-form-item label="财务分类" prop="financialCategory">
            <el-input v-model="form.financialCategory" placeholder="请输入财务分类" />
          </el-form-item>
          <el-form-item label="单位" prop="unit">
            <el-input v-model="form.unit" placeholder="请输入单位" />
          </el-form-item>
          <el-form-item label="单价" prop="price">
            <el-input-number
              v-model="form.price"
              :precision="2"
              :step="0.1"
              :min="0"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model="form.remarks"
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
  import { request } from '@/utils/request'
  import type { Treatment } from '@/types/insurance'
  
  // 搜索表单
  const searchForm = reactive({
    projectName: '',
    projectCode: ''
  })
  
  // 分页信息
  const pagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0
  })
  
  // 表格数据
  const loading = ref(false)
  const tableData = ref<Treatment[]>([])
  
  // 表单数据
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInstance>()
  const form = reactive<Partial<Treatment>>({
    projectName: '',
    projectCode: '',
    nationalCode: '',
    financialCategory: '',
    unit: '',
    price: 0,
    remarks: ''
  })
  
  // 表单校验规则
  const rules: FormRules = {
    projectName: [
      { required: true, message: '请输入项目名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    projectCode: [
      { required: true, message: '请输入项目编码', trigger: 'blur' }
    ],
    unit: [
      { required: true, message: '请输入单位', trigger: 'blur' }
    ],
    price: [
      { required: true, message: '请输入单价', trigger: 'blur' }
    ]
  }
  
  // 获取诊疗项目列表
  const fetchTreatments = async () => {
    loading.value = true
    try {
      const { list, total } = await request.get<{ list: Treatment[], total: number }>('/api/insurance/treatments', {
        ...searchForm,
        ...pagination
      })
      tableData.value = list
      pagination.total = total
    } catch (error) {
      console.error('获取诊疗项目列表失败:', error)
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
      projectName: '',
      projectCode: ''
    })
    handleSearch()
  }
  
  // 处理新增
  const handleAdd = () => {
    dialogType.value = 'add'
    dialogVisible.value = true
  }
  
  // 处理编辑
  const handleEdit = (row: Treatment) => {
    dialogType.value = 'edit'
    Object.assign(form, row)
    dialogVisible.value = true
  }
  
  // 处理删除
  const handleDelete = (row: Treatment) => {
    ElMessageBox.confirm(
      `确认删除诊疗项目"${row.projectName}"吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await request.delete(`/api/insurance/treatments/${row.id}`)
        ElMessage.success('删除成功')
        fetchTreatments()
      } catch (error) {
        console.error('删除失败:', error)
      }
    })
  }
  
  // 处理状态变更
  const handleStatusChange = async (row: Treatment) => {
    try {
      await request.put(`/api/insurance/treatments/${row.id}/status`, {
        status: row.status
      })
      ElMessage.success('状态更新成功')
    } catch (error) {
      console.error('状态更新失败:', error)
      row.status = row.status === 1 ? 0 : 1
    }
  }
  
  // 处理表单提交
  const handleSubmit = async () => {
    if (!formRef.value) return
    
    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (dialogType.value === 'add') {
            await request.post('/api/insurance/treatments', form)
            ElMessage.success('新增成功')
          } else {
            await request.put(`/api/insurance/treatments/${form.id}`, form)
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
      projectName: '',
      projectCode: '',
      nationalCode: '',
      financialCategory: '',
      unit: '',
      price: 0,
      remarks: ''
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