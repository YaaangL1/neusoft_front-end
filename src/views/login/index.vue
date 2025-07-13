<template>
    <div class="login-container">
      <el-card class="login-card">
        <div class="title">东软医疗保险报销系统</div>
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
        >
        <el-form-item prop="loginName">
            <el-input
            v-model="loginForm.loginName"
              placeholder="用户名"
              prefix-icon="User"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
        <el-form-item prop="captcha" v-if="showCaptcha">
          <el-input
            v-model="loginForm.captcha"
            placeholder="验证码"
            prefix-icon="Key"
            @keyup.enter="handleLogin"
          >
            <template #append>
              <img :src="captchaUrl" @click="refreshCaptcha" alt="验证码" class="captcha-img" />
            </template>
          </el-input>
        </el-form-item>
          <el-form-item>
            <el-button
              :loading="loading"
              type="primary"
              class="login-button"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
  import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
  import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/auth'
  
const router = useRouter()
const route = useRoute()
  const userStore = useUserStore()
  const loginFormRef = ref<FormInstance>()
  const loading = ref(false)
const showCaptcha = ref(false)
const captchaUrl = ref('')
  
  const loginForm = ref({
  loginName: '',
  password: '',
  captcha: ''
  })
  
  const loginRules = {
  loginName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

const refreshCaptcha = () => {
  // TODO: 实现验证码刷新
  captchaUrl.value = `${import.meta.env.VITE_API_BASE_URL}/api/auth/captcha?t=${Date.now()}`
  }
  
  const handleLogin = async () => {
    if (!loginFormRef.value) return
    
    try {
      loading.value = true
      await loginFormRef.value.validate()
    
    // 检查用户名是否存在
    const { data: exists } = await authApi.checkUsername(loginForm.value.loginName)
    if (!exists) {
      ElMessage.error('用户名不存在')
      return
    }
    
    // 登录
      await userStore.login(loginForm.value)
    
    // 登录成功后跳转
    const redirect = route.query.redirect as string
    router.replace(redirect || '/')
    ElMessage.success('登录成功')
  } catch (error: any) {
      console.error('登录失败:', error)
    ElMessage.error(error.message || '登录失败')
    if (error.response?.status === 401) {
      showCaptcha.value = true
      refreshCaptcha()
    }
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <style scoped>
  .login-container {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
  }
  
  .login-card {
    width: 400px;
  }
  
  .title {
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 30px;
    color: #409eff;
  }
  
  .login-form {
    padding: 20px;
  }
  
  .login-button {
    width: 100%;
  }

.captcha-img {
  height: 32px;
  margin: -6px -15px;
  cursor: pointer;
}
  </style>