// 患者疾病诊断信息
export interface PatientDiagnosisVO {
  id?: number
  patientId?: number
  patientName?: string
  diseaseId?: number
  diseaseCode?: string
  diseaseName?: string
  diseaseICD?: string
  diseaseCategory?: string
  diseaseType?: number
  diseaseTypeName?: string
  orderTime?: string
  createdTime?: string
  updatedTime?: string
}

// 患者药品处方信息
export interface PatientPrescriptionVO {
  id?: number
  patientId?: number
  patientName?: string
  drugId?: number
  chinaName?: string
  goodsName?: string
  specifications?: string
  drugUnit?: string
  drugPrice?: number
  drugManufacturer?: string
  insuranceType?: string
  doctorOrder?: string
  useMethod?: string
  orderNumber?: number
  startTime?: string
  endTime?: string
  status?: number
  statusName?: string
  createdTime?: string
  updatedTime?: string
}

// 患者诊疗项目信息
export interface PatientTreatmentVO {
  id?: number
  patientId?: number
  patientName?: string
  diagnosisId?: number
  medicalName?: string
  medicalNumber?: string
  medicalType?: string
  medicalUnit?: string
  medicalPrice?: number
  medicalInfo?: string
  medicalExclude?: string
  doctorOrder?: string
  useMethod?: string
  orderTime?: string
  status?: number
  statusName?: string
  createdTime?: string
  updatedTime?: string
}

// 患者医疗服务信息
export interface PatientMedicalServiceVO {
  id?: number
  patientId?: number
  patientName?: string
  medicalId?: number
  medicalName?: string
  medicalNumber?: string
  medicalType?: string
  medicalUnit?: string
  medicalPrice?: number
  medicalInfo?: string
  medicalExclude?: string
  countryNumber?: string
  doctorOrder?: string
  useMethod?: string
  orderTime?: string
  status?: number
  statusName?: string
  createdTime?: string
  updatedTime?: string
} 