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
              <el-table-column prop="drugCategory" label="药品类别" width="120">
                <template #default="{ row }">
                  <el-tag :type="drugCategoryType(row.drugCategory)">
                    {{ row.drugCategory }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="hospitalLevel" label="医院等级" width="120">
                <template #default="{ row }">
                  <el-tag type="info">{{ row.hospitalLevel }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="ratio" label="报销比例" width="120">
                <template #default="{ row }">
                  {{ row.ratio }}%
                </template>
              </el-table-column>
              <el-table-column prop="maxAmount" label="最高限额" width="150">
                <template #default="{ row }">
                  {{ formatPrice(row.maxAmount) }}
                </template>
              </el-table-column>
              <el-table-column prop="remarks" label="备注" min-width="200" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="80" align="center">
                <template #default="{ row }">
                  <el-switch
                    v-model="row.status"
                    :active-value="1"
                    :inactive-value="0"
                    @change="handleDrugRatioStatusChange(row)"
                  />
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
          label-width="100px"
        >
          <el-form-item label="药品类别" prop="drugCategory">
            <el-select v-model="drugRatioForm.drugCategory" placeholder="请选择药品类别">
              <el-option label="甲类" value="甲类" />
              <el-option label="乙类" value="乙类" />
              <el-option label="丙类" value="丙类" />
            </el-select>
          </el-form-item>
          <el-form-item label="医院等级" prop="hospitalLevel">
            <el-select v-model="drugRatioForm.hospitalLevel" placeholder="请选择医院等级">
              <el-option label="三级医院" value="三级医院" />
              <el-option label="二级医院" value="二级医院" />
              <el-option label="一级医院" value="一级医院" />
              <el-option label="社区医院" value="社区医院" />
            </el-select>
          </el-form-item>
          <el-form-item label="报销比例" prop="ratio">
            <el-input-number
              v-model="drugRatioForm.ratio"
              :min="0"
              :max="100"
              :precision="0"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="最高限额" prop="maxAmount">
            <el-input-number
              v-model="drugRatioForm.maxAmount"
              :min="0"
              :precision="2"
              :step="100"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="备注" prop="remarks">
            <el-input
              v-model="drugRatioForm.remarks"
              type="textarea"
              placeholder="请输入备注信息"
            />
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
  import { ref, reactive, onMounted } from 'vue'
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
  const drugRatioForm = reactive<Partial<DrugRatio>>({
    drugCategory: '',
    hospitalLevel: '',
    ratio: 0,
    maxAmount: 0,
    remarks: ''
  })
  
  const drugRatioRules: FormRules = {
    drugCategory: [
      { required: true, message: '请选择药品类别', trigger: 'change' }
    ],
    hospitalLevel: [
      { required: true, message: '请选择医院等级', trigger: 'change' }
    ],
    ratio: [
      { required: true, message: '请输入报销比例', trigger: 'blur' }
    ],
    maxAmount: [
      { required: true, message: '请输入最高限额', trigger: 'blur' }
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
      remarks: '',
      status: 1
    })
  }
  
  // 获取药品报销比例列表
  const fetchDrugRatios = async () => {
    try {
      const res = await ratioApi.getDrugRatios()
      if (res.code === 200) {
        drugRatios.value = res.data
      } else {
        ElMessage.error(res.message || '获取药品报销比例失败')
      }
    } catch (error: any) {
      console.error('获取药品报销比例失败:', error)
      ElMessage.error(error.message || '获取药品报销比例失败')
    }
  }
  
  // 获取医院报销比例列表
  const getTreatmentRatios = async () => {
    try {
      const [level1, level2, level3] = await Promise.all([
        ratioApi.getHospitalRatios(1, '1'), // 获取一级医院在职人员报销比例
        ratioApi.getHospitalRatios(2, '1'), // 获取二级医院在职人员报销比例
        ratioApi.getHospitalRatios(3, '1')  // 获取三级医院在职人员报销比例
      ])
      if (level1.data && level2.data && level3.data) {
        treatmentRatios.value = [
          ...level1.data.map(item => ({ ...item, hospitalLevel: '一级医院' })),
          ...level2.data.map(item => ({ ...item, hospitalLevel: '二级医院' })),
          ...level3.data.map(item => ({ ...item, hospitalLevel: '三级医院' }))
        ]
      }
    } catch (error) {
      console.error('获取医院报销比例列表失败:', error)
    }
  }
  
  // 药品报销比例操作
  const handleAddDrugRatio = () => {
    drugRatioDialog.type = 'add'
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
      await ratioApi.updateDrugRatioStatus(row.id!, {
        status: row.status
      })
      ElMessage.success('状态更新成功')
    } catch (error: any) {
      console.error('状态更新失败:', error)
      ElMessage.error(error.message || '状态更新失败')
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
      drugCategory: '',
      hospitalLevel: '',
      ratio: 0,
      maxAmount: 0,
      remarks: ''
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
        getTreatmentRatios()
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
          getTreatmentRatios()
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
  fetchDrugRatios()
  getTreatmentRatios()
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