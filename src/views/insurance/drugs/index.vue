<template>
    <div class="drugs-container">
      <!-- 搜索栏 -->
      <el-card class="search-card">
        <el-form :inline="true" :model="searchForm" ref="searchFormRef">
          <el-form-item label="药品名称" prop="drugName">
            <el-input
              v-model="searchForm.drugName"
              placeholder="请输入药品名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="药品类别" prop="drugCategory">
            <el-select v-model="searchForm.drugCategory" placeholder="请选择药品类别" clearable>
              <el-option label="甲类" value="甲类" />
              <el-option label="乙类" value="乙类" />
              <el-option label="丙类" value="丙类" />
            </el-select>
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
            <span>药品信息列表</span>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              新增药品
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
          <el-table-column prop="drugName" label="药品名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="brandName" label="商品名" min-width="150" show-overflow-tooltip />
          <el-table-column prop="specification" label="规格" min-width="120" show-overflow-tooltip />
          <el-table-column prop="unit" label="单位" width="80" align="center" />
          <el-table-column prop="manufacturer" label="生产厂家" min-width="150" show-overflow-tooltip />
          <el-table-column prop="drugCategory" label="药品类别" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="drugCategoryType(row.drugCategory)">
                {{ row.drugCategory }}
              </el-tag>
            </template>
          </el-table-column>
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
        :title="dialogType === 'add' ? '新增药品' : '编辑药品'"
        width="600px"
        @close="resetForm"
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="药品名称" prop="drugName">
            <el-input v-model="form.drugName" placeholder="请输入药品名称" />
          </el-form-item>
          <el-form-item label="商品名" prop="brandName">
            <el-input v-model="form.brandName" placeholder="请输入商品名" />
          </el-form-item>
          <el-form-item label="规格" prop="specification">
            <el-input v-model="form.specification" placeholder="请输入规格" />
          </el-form-item>
          <el-form-item label="单位" prop="unit">
            <el-input v-model="form.unit" placeholder="请输入单位" />
          </el-form-item>
          <el-form-item label="生产厂家" prop="manufacturer">
            <el-input v-model="form.manufacturer" placeholder="请输入生产厂家" />
          </el-form-item>
          <el-form-item label="药品类别" prop="drugCategory">
            <el-select v-model="form.drugCategory" placeholder="请选择药品类别">
              <el-option label="甲类" value="甲类" />
              <el-option label="乙类" value="乙类" />
              <el-option label="丙类" value="丙类" />
            </el-select>
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
  import type { Drug } from '@/types/insurance'
  
  // 搜索表单
  const searchForm = reactive({
    drugName: '',
    drugCategory: ''
  })
  
  // 分页信息
  const pagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0
  })
  
  // 表格数据
  const loading = ref(false)
  const tableData = ref<Drug[]>([])
  
  // 表单数据
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInstance>()
  const form = reactive<Partial<Drug>>({
    drugName: '',
    brandName: '',
    specification: '',
    unit: '',
    manufacturer: '',
    drugCategory: undefined,
    price: 0,
    remarks: ''
  })
  
  // 表单校验规则
  const rules: FormRules = {
    drugName: [
      { required: true, message: '请输入药品名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    drugCategory: [
      { required: true, message: '请选择药品类别', trigger: 'change' }
    ],
    unit: [
      { required: true, message: '请输入单位', trigger: 'blur' }
    ],
    price: [
      { required: true, message: '请输入单价', trigger: 'blur' }
    ]
  }
  
  // 获取药品列表
  const fetchDrugs = async () => {
    loading.value = true
    try {
      const { list, total } = await request.get<{ list: Drug[], total: number }>('/drugs', {
        ...searchForm,
        ...pagination
      })
      tableData.value = list
      pagination.total = total
    } catch (error) {
      console.error('获取药品列表失败:', error)
    } finally {
      loading.value = false
    }
  }
  
  // 处理查询
  const handleSearch = () => {
    pagination.pageNum = 1
    fetchDrugs()
  }
  
  // 重置查询
  const resetSearch = () => {
    Object.assign(searchForm, {
      drugName: '',
      drugCategory: ''
    })
    handleSearch()
  }
  
  // 处理新增
  const handleAdd = () => {
    dialogType.value = 'add'
    dialogVisible.value = true
  }
  
  // 处理编辑
  const handleEdit = (row: Drug) => {
    dialogType.value = 'edit'
    Object.assign(form, row)
    dialogVisible.value = true
  }
  
  // 处理删除
  const handleDelete = (row: Drug) => {
    ElMessageBox.confirm(
      `确认删除药品"${row.drugName}"吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await request.delete(`/api/drugs/${row.id}`)
        ElMessage.success('删除成功')
        fetchDrugs()
      } catch (error) {
        console.error('删除失败:', error)
      }
    })
  }
  
  // 处理状态变更
  const handleStatusChange = async (row: Drug) => {
    try {
      await request.put(`/api/drugs/${row.id}/status`, {
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
            await request.post('/api/drugs', form)
            ElMessage.success('新增成功')
          } else {
            await request.put(`/api/drugs/${form.id}`, form)
            ElMessage.success('更新成功')
          }
          dialogVisible.value = false
          fetchDrugs()
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
      drugName: '',
      brandName: '',
      specification: '',
      unit: '',
      manufacturer: '',
      drugCategory: undefined,
      price: 0,
      remarks: ''
    })
  }
  
  // 处理分页变化
  const handleSizeChange = (val: number) => {
    pagination.pageSize = val
    fetchDrugs()
  }
  
  const handleCurrentChange = (val: number) => {
    pagination.pageNum = val
    fetchDrugs()
  }
  
  // 格式化价格
  const formatPrice = (price: number) => {
    return price.toLocaleString('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    })
  }
  
  // 药品类别标签类型
  const drugCategoryType = (category: string) => {
    switch (category) {
      case '甲类':
        return 'success'
      case '乙类':
        return 'warning'
      case '丙类':
        return 'danger'
      default:
        return 'info'
    }
  }
  
  // 初始化
  fetchDrugs()
  </script>
  
  <style scoped>
  .drugs-container {
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