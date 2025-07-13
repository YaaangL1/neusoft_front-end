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
          <el-form-item label="药品类别" prop="insuranceType">
            <el-select v-model="searchForm.insuranceType" placeholder="请选择药品类别" clearable>
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
          <el-table-column prop="chinaName" label="药品名称" min-width="150" show-overflow-tooltip />
          <el-table-column prop="goodsName" label="商品名" min-width="150" show-overflow-tooltip />
          <el-table-column prop="specifications" label="规格" min-width="120" show-overflow-tooltip />
          <el-table-column prop="drugUnit" label="单位" width="80" align="center" />
          <el-table-column prop="drugManufacturer" label="生产厂家" min-width="150" show-overflow-tooltip />
          <el-table-column prop="insuranceType" label="药品类别" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="drugCategoryType(row.insuranceType)">
                {{ row.insuranceType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="drugPrice" label="单价" width="100" align="right">
            <template #default="{ row }">
              {{ formatPrice(row.drugPrice) }}
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
          <el-form-item label="药品名称" prop="chinaName">
            <el-input v-model="form.chinaName" placeholder="请输入药品名称" />
          </el-form-item>
          <el-form-item label="商品名" prop="goodsName">
            <el-input v-model="form.goodsName" placeholder="请输入商品名" />
          </el-form-item>
          <el-form-item label="规格" prop="specifications">
            <el-input v-model="form.specifications" placeholder="请输入规格" />
          </el-form-item>
          <el-form-item label="单位" prop="drugUnit">
            <el-input v-model="form.drugUnit" placeholder="请输入单位" />
          </el-form-item>
          <el-form-item label="生产厂家" prop="drugManufacturer">
            <el-input v-model="form.drugManufacturer" placeholder="请输入生产厂家" />
          </el-form-item>
          <el-form-item label="药品类别" prop="insuranceType">
            <el-select v-model="form.insuranceType" placeholder="请选择药品类别">
              <el-option label="甲类" value="甲类" />
              <el-option label="乙类" value="乙类" />
              <el-option label="丙类" value="丙类" />
            </el-select>
          </el-form-item>
          <el-form-item label="单价" prop="drugPrice">
            <el-input-number
              v-model="form.drugPrice"
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
  import type { DrugInfoVO } from '@/types/insurance'
  import { drugApi } from '@/api/insurance'
  
  // 搜索表单
  const searchForm = reactive({
    drugName: '',
    insuranceType: ''
  })
  
  // 分页信息
  const pagination = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0
  })
  
  // 表格数据
  const loading = ref(false)
  const tableData = ref<DrugInfoVO[]>([])
  
  // 表单数据
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const formRef = ref<FormInstance>()
  const form = reactive<Partial<DrugInfoVO>>({
    chinaName: '',
    goodsName: '',
    specifications: '',
    drugUnit: '',
    drugManufacturer: '',
    insuranceType: undefined,
    drugPrice: 0,
    remarks: ''
  })
  
  // 表单校验规则
  const rules: FormRules = {
    chinaName: [
      { required: true, message: '请输入药品名称', trigger: 'blur' },
      { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
    ],
    insuranceType: [
      { required: true, message: '请选择药品类别', trigger: 'change' }
    ],
    drugUnit: [
      { required: true, message: '请输入单位', trigger: 'blur' }
    ],
    drugPrice: [
      { required: true, message: '请输入单价', trigger: 'blur' }
    ]
  }
  
  // 获取药品列表
  const fetchDrugs = async () => {
    loading.value = true
    try {
      const params = {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        drugName: searchForm.drugName,
        insuranceType: searchForm.insuranceType
      }
      console.log('请求参数:', params)
      const res = await drugApi.getPage(params)
      if (res.code === 200) {
        tableData.value = res.data.list
        pagination.total = res.data.total
      } else {
        ElMessage.error(res.message || '获取药品列表失败')
      }
    } catch (error: any) {
      console.error('获取药品列表失败:', error)
      ElMessage.error(error.message || '获取药品列表失败')
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
      insuranceType: ''
    })
    handleSearch()
  }
  
  // 处理新增
  const handleAdd = () => {
    dialogType.value = 'add'
    dialogVisible.value = true
  }
  
  // 处理编辑
  const handleEdit = (row: DrugInfoVO) => {
    dialogType.value = 'edit'
    Object.assign(form, row)
    dialogVisible.value = true
  }
  
  // 处理删除
  const handleDelete = (row: DrugInfoVO) => {
    ElMessageBox.confirm(
      `确认删除药品"${row.chinaName}"吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await drugApi.delete([row.id])
        ElMessage.success('删除成功')
        fetchDrugs()
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
            await drugApi.add(form)
            ElMessage.success('新增成功')
          } else {
            await drugApi.update(form.id!, form)
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
      chinaName: '',
      goodsName: '',
      specifications: '',
      drugUnit: '',
      drugManufacturer: '',
      insuranceType: undefined,
      drugPrice: 0,
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