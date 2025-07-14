<template>
    <div class="ratios-container">
      <el-tabs v-model="activeTab">
        <!-- 药品报销比例 -->
        <el-tab-pane label="药品报销比例" name="drug">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>药品报销比例设置</span>
                <el-button type="primary" @click="handleAddDrugRatio">
                  <el-icon><Plus /></el-icon>
                  新增配置
                </el-button>
              </div>
            </template>
  
            <el-table :data="drugRatios" border stripe>
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="drugReimbursementType" label="药品类别" width="120">
                <template #default="{ row }">
                  <el-tag :type="drugCategoryType(row.drugReimbursementType)">
                    {{ row.drugReimbursementType }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="drugReimbursementProportion" label="报销比例" width="120">
                <template #default="{ row }">
                  {{ row.drugReimbursementProportion }}%
                </template>
              </el-table-column>
              <el-table-column prop="drugReimbursementInfo" label="报销等级信息" min-width="200" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="80" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'info'">
                    {{ row.status === 1 ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center">
                <template #default="{ row }">
                  <el-button-group>
                    <el-button type="primary" link @click="handleEditDrugRatio(row)">
                      编辑
                    </el-button>
                    <el-button type="danger" link @click="handleDeleteDrugRatio(row)">
                      删除
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>
  
        <!-- 不同级别医院报销比例 -->
        <el-tab-pane label="不同级别医院报销比例" name="hospital">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>不同级别医院报销比例设置</span>
                <el-button type="primary" @click="handleAddTreatmentRatio">
                  <el-icon><Plus /></el-icon>
                  新增配置
                </el-button>
              </div>
            </template>
  
            <el-table :data="treatmentRatios" border stripe>
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="hospitalLevel" label="医院等级" width="120">
                <template #default="{ row }">
                  <el-tag type="info">{{ row.hospitalLevel }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="peopleType" label="人员类别" width="120">
                <template #default="{ row }">
                  <el-tag>{{ row.peopleType === '1' ? '在职' : '退休' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="minPayLevel" label="最低缴费档次" width="120">
                <template #default="{ row }">
                  {{ row.minPayLevel }}
                </template>
              </el-table-column>
              <el-table-column prop="maxPayLevel" label="最高缴费档次" width="120">
                <template #default="{ row }">
                  {{ row.maxPayLevel }}
                </template>
              </el-table-column>
              <el-table-column prop="ratio" label="报销比例" width="120">
                <template #default="{ row }">
                  {{ row.ratio }}%
                </template>
              </el-table-column>
              <el-table-column prop="remarks" label="备注" min-width="200" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="80" align="center">
                <template #default="{ row }">
                  <el-switch
                    v-model="row.status"
                    :active-value="1"
                    :inactive-value="0"
                    @change="handleTreatmentRatioStatusChange(row)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center">
                <template #default="{ row }">
                  <el-button-group>
                    <el-button type="primary" link @click="handleEditTreatmentRatio(row)">
                      编辑
                    </el-button>
                    <el-button type="danger" link @click="handleDeleteTreatmentRatio(row)">
                      删除
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-tab-pane>
      </el-tabs>
  
      <!-- 药品报销比例配置对话框 -->
      <el-dialog
        v-model="drugRatioDialog.visible"
        :title="drugRatioDialog.type === 'add' ? '新增药品报销比例' : '编辑药品报销比例'"
        width="500px"
        @close="resetDrugRatioForm"
      >
        <el-form
          ref="drugRatioFormRef"
          :model="drugRatioForm"
          :rules="drugRatioRules"
          label-width="120px"
        >
          <el-form-item label="药品报销类型" prop="drugReimbursementType">
            <el-select v-model="drugRatioForm.drugReimbursementType" placeholder="请选择药品类别">
              <el-option label="甲类药品" value="甲类药品" />
              <el-option label="乙类药品" value="乙类药品" />
              <el-option label="丙类药品" value="丙类药品" />
            </el-select>
          </el-form-item>
          <el-form-item label="报销比例(%)" prop="drugReimbursementProportion">
            <el-input-number
              v-model="drugRatioForm.drugReimbursementProportion"
              :min="0"
              :max="100"
              :precision="0"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="报销等级信息" prop="drugReimbursementInfo">
            <el-input
              v-model="drugRatioForm.drugReimbursementInfo"
              type="textarea"
              placeholder="请输入报销等级信息"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="drugRatioForm.status">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="drugRatioDialog.visible = false">取消</el-button>
            <el-button type="primary" @click="submitDrugRatio">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
  
      <!-- 不同级别医院报销比例配置对话框 -->
      <el-dialog
        v-model="treatmentRatioDialog.visible"
        :title="treatmentRatioDialog.type === 'add' ? '新增医院报销比例' : '编辑医院报销比例'"
        width="500px"
        @close="resetTreatmentRatioForm"
      >
        <el-form
          ref="treatmentRatioFormRef"
          :model="treatmentRatioForm"
          :rules="treatmentRatioRules"
          label-width="100px"
        >
          <el-form-item label="医院等级" prop="hospitalLevel">
            <el-select v-model="treatmentRatioForm.hospitalLevel" placeholder="请选择医院等级">
              <el-option label="三级医院" value="三级医院" />
              <el-option label="二级医院" value="二级医院" />
              <el-option label="一级医院" value="一级医院" />
              <el-option label="社区医院" value="社区医院" />
            </el-select>
          </el-form-item>
          <el-form-item label="人员类别" prop="peopleType">
            <el-select v-model="treatmentRatioForm.peopleType" placeholder="请选择人员类别">
              <el-option label="在职" value="1" />
              <el-option label="退休" value="0" />
            </el-select>
          </el-form-item>
          <el-form-item label="最低缴费档次" prop="minPayLevel">
            <el-input v-model="treatmentRatioForm.minPayLevel" placeholder="请输入最低缴费档次" />
          </el-form-item>
          <el-form-item label="最高缴费档次" prop="maxPayLevel">
            <el-input v-model="treatmentRatioForm.maxPayLevel" placeholder="请输入最高缴费档次" />
          </el-form-item>
          <el-form-item label="报销比例" prop="ratio">
            <el-input-number
              v-model="treatmentRatioForm.ratio"
              :min="0"
              :max="100"
              :precision="0"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model="treatmentRatioForm.remarks"
              type="textarea"
              placeholder="请输入备注信息"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="treatmentRatioDialog.visible = false">取消</el-button>
            <el-button type="primary" @click="handleTreatmentRatioSubmit(treatmentRatioFormRef)">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'
  import { ratioApi } from '@/api/insurance'
  import type { DrugReimbursementVO, HospitalReimbursementVO } from '@/types/insurance'
  
  // 接口定义
  interface RatioBase {
    id: number
    hospitalLevel: string
    ratio: number
    maxAmount: number
    remarks?: string
    status: number
  }
  
  interface DrugRatio extends RatioBase {
    drugCategory: string
  }
  
  interface TreatmentRatio extends RatioBase {
    treatmentType: string
  }
  
  // 状态定义
  const activeTab = ref('drug')
  const drugRatios = ref<DrugReimbursementVO[]>([])
  const treatmentRatios = ref<DrugReimbursementVO[]>([])
  
  // 药品报销比例表单
  const drugRatioDialog = reactive({
    visible: false,
    type: 'add'
  })
  
  const drugRatioFormRef = ref<FormInstance>()
  const drugRatioForm = reactive<Partial<DrugReimbursementVO>>({
    drugReimbursementType: '',
    drugReimbursementProportion: 0,
    drugReimbursementInfo: '全部纳入医保基金支付范围',
    status: 1
  })
  
  const drugRatioRules: FormRules = {
    drugReimbursementType: [
      { required: true, message: '请选择药品类别', trigger: 'change' }
    ],
    drugReimbursementProportion: [
      { required: true, message: '请输入报销比例', trigger: 'blur' }
    ]
  }
  
  // 诊疗项目报销比例表单
  const treatmentRatioDialog = reactive({
    visible: false,
    type: 'add'
  })
  
  const treatmentRatioFormRef = ref<FormInstance>()
  const treatmentRatioForm = reactive<HospitalReimbursementVO>({
    hospitalLevel: '',
    peopleType: '',
    minPayLevel: '',
    maxPayLevel: '',
    ratio: 0,
    payProportion: '0',
    remarks: '',
    status: 1
  })
  
  // 表单校验规则
  const treatmentRatioRules = {
    hospitalLevel: [{ required: true, message: '请选择医院等级', trigger: 'change' }],
    peopleType: [{ required: true, message: '请选择人员类别', trigger: 'change' }],
    minPayLevel: [{ required: true, message: '请输入最低缴费档次', trigger: 'blur' }],
    maxPayLevel: [{ required: true, message: '请输入最高缴费档次', trigger: 'blur' }],
    ratio: [{ required: true, message: '请输入报销比例', trigger: 'change' }]
  }
  
  // 重置表单
  const resetTreatmentRatioForm = () => {
    if (treatmentRatioFormRef.value) {
      treatmentRatioFormRef.value.resetFields()
    }
    Object.assign(treatmentRatioForm, {
      id: undefined,
      hospitalLevel: '',
      peopleType: '',
      minPayLevel: '',
      maxPayLevel: '',
      ratio: 0,
      payProportion: '0',
      remarks: '',
      status: 1
    })
  }
  
  // 获取药品报销比例列表
  const fetchDrugRatios = async () => {
    try {
      const res = await ratioApi.getDrugRatios()
      console.log('获取药品报销比例列表响应:', res)
      
      if (res && res.data) {
        drugRatios.value = res.data || []
        // 输出数据结构以便调试
        if (drugRatios.value.length > 0) {
          console.log('药品报销比例示例数据:', drugRatios.value[0])
        }
      } else {
        console.error('响应数据格式错误:', res)
        ElMessage.error('获取药品报销比例列表失败：响应数据格式错误')
      }
    } catch (error: any) {
      console.error('获取药品报销比例列表失败:', error)
      ElMessage.error(error.message || '获取药品报销比例列表失败，请检查网络连接')
    }
  }
  
  // 获取医院报销比例列表
  const fetchHospitalRatios = async () => {
    try {
      const [level1Res, level2Res, level3Res] = await Promise.all([
        ratioApi.getHospitalRatios(1, '1'),
        ratioApi.getHospitalRatios(2, '1'),
        ratioApi.getHospitalRatios(3, '1')
      ])
      
      console.log('获取医院报销比例列表响应:', {
        level1: level1Res,
        level2: level2Res,
        level3: level3Res
      })
      
      const allRatios = []
      if (level1Res && level1Res.data) allRatios.push(...level1Res.data)
      if (level2Res && level2Res.data) allRatios.push(...level2Res.data)
      if (level3Res && level3Res.data) allRatios.push(...level3Res.data)
      
      treatmentRatios.value = allRatios
    } catch (error: any) {
      console.error('获取医院报销比例列表失败:', error)
      ElMessage.error(error.message || '获取医院报销比例列表失败，请检查网络连接')
    }
  }
  
  // 监听标签页切换
  watch(activeTab, (newTab) => {
    if (newTab === 'drug') {
      fetchDrugRatios()
    } else if (newTab === 'hospital') {
      fetchHospitalRatios()
    }
  })
  
  // 初始化加载
  onMounted(() => {
    if (activeTab.value === 'drug') {
      fetchDrugRatios()
    } else {
      fetchHospitalRatios()
    }
  })
  
  // 药品报销比例操作
  const handleAddDrugRatio = () => {
    drugRatioDialog.type = 'add'
    drugRatioForm.drugReimbursementType = ''
    drugRatioForm.drugReimbursementProportion = 0
    drugRatioForm.drugReimbursementInfo = '全部纳入医保基金支付范围'
    drugRatioForm.status = 1
    drugRatioDialog.visible = true
  }
  
  const handleEditDrugRatio = (row: DrugReimbursementVO) => {
    drugRatioDialog.type = 'edit'
    Object.assign(drugRatioForm, row)
    drugRatioDialog.visible = true
  }
  
  const handleDeleteDrugRatio = async (row: DrugReimbursementVO) => {
    ElMessageBox.confirm(
      `确认删除药品报销比例"${row.drugReimbursementType}"吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      try {
        await ratioApi.deleteDrugRatio(row.id!)
        ElMessage.success('删除成功')
        fetchDrugRatios()
      } catch (error: any) {
        console.error('删除失败:', error)
        ElMessage.error(error.message || '删除失败')
      }
    })
  }
  
  const handleDrugRatioStatusChange = async (row: DrugReimbursementVO) => {
    try {
      await ratioApi.updateDrugRatioStatus(row.id!, { status: row.status })
      ElMessage.success('状态更新成功')
    } catch (error: any) {
      console.error('状态更新失败:', error)
      ElMessage.error(error.message || '状态更新失败')
      // 状态更新失败时恢复原始状态
      row.status = row.status === 1 ? 0 : 1
    }
  }
  
  const submitDrugRatio = async () => {
    if (!drugRatioFormRef.value) return
  
    await drugRatioFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (drugRatioDialog.type === 'add') {
            await ratioApi.addDrugRatio(drugRatioForm)
            ElMessage.success('新增成功')
          } else {
            await ratioApi.updateDrugRatio(drugRatioForm.id!, drugRatioForm)
            ElMessage.success('更新成功')
          }
          drugRatioDialog.visible = false
          fetchDrugRatios()
        } catch (error: any) {
          console.error('保存失败:', error)
          ElMessage.error(error.message || '保存失败')
        }
      }
    })
  }
  
  const resetDrugRatioForm = () => {
    if (drugRatioFormRef.value) {
      drugRatioFormRef.value.resetFields()
    }
    Object.assign(drugRatioForm, {
      drugReimbursementType: '',
      drugReimbursementProportion: 0,
      drugReimbursementInfo: '全部纳入医保基金支付范围',
      status: 1
    })
  }
  
  // 诊疗项目报销比例操作
  const handleAddTreatmentRatio = () => {
    treatmentRatioDialog.type = 'add'
    treatmentRatioDialog.visible = true
  }
  
  const handleEditTreatmentRatio = (row: DrugReimbursementVO) => {
    treatmentRatioDialog.type = 'edit'
    Object.assign(treatmentRatioForm, row)
    treatmentRatioDialog.visible = true
  }
  
  // 处理医院报销比例状态变更
  const handleTreatmentRatioStatusChange = async (row: HospitalReimbursementVO) => {
    try {
      const level = row.hospitalLevel === '一级医院' ? 1 : row.hospitalLevel === '二级医院' ? 2 : 3
      await ratioApi.updateHospitalRatio(level, row.id!, { status: row.status })
      ElMessage.success('状态更新成功')
    } catch (error) {
      console.error('更新状态失败:', error)
      row.status = row.status === 1 ? 0 : 1 // 恢复状态
      ElMessage.error('状态更新失败')
    }
  }
  
  // 处理医院报销比例删除
  const handleDeleteTreatmentRatio = (row: HospitalReimbursementVO) => {
    ElMessageBox.confirm('确认删除该报销比例配置?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
      try {
        const level = row.hospitalLevel === '一级医院' ? 1 : row.hospitalLevel === '二级医院' ? 2 : 3
        await ratioApi.deleteHospitalRatio(level, row.id!)
        ElMessage.success('删除成功')
        fetchHospitalRatios()
      } catch (error) {
        console.error('删除失败:', error)
        ElMessage.error('删除失败')
      }
    })
  }
  
  // 处理医院报销比例表单提交
  const handleTreatmentRatioSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
      if (valid) {
        try {
          const level = treatmentRatioForm.hospitalLevel === '一级医院' ? 1 : 
                       treatmentRatioForm.hospitalLevel === '二级医院' ? 2 : 3
          if (treatmentRatioDialog.type === 'add') {
            await ratioApi.addHospitalRatio(level, treatmentRatioForm)
            ElMessage.success('新增成功')
          } else {
            await ratioApi.updateHospitalRatio(level, treatmentRatioForm.id!, treatmentRatioForm)
            ElMessage.success('更新成功')
          }
          treatmentRatioDialog.visible = false
          fetchHospitalRatios()
        } catch (error) {
          console.error('保存失败:', error)
          ElMessage.error('保存失败')
        }
      }
    })
  }
  
  // 工具函数
  // 格式化价格
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) {
      return '¥0.00'
    }
    return price.toLocaleString('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    })
  }
  
  const drugCategoryType = (category: string) => {
    switch (category) {
      case '甲类药品':
        return 'success'
      case '乙类药品':
        return 'warning'
      case '丙类药品':
        return 'danger'
      default:
        return 'info'
    }
  }
  
  // 初始化
  // fetchDrugRatios()
  // getTreatmentRatios()
  </script>
  
  <style scoped>
  .ratios-container {
    padding: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
  }
  </style>