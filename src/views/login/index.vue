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
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
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
  import type { FormInstance } from 'element-plus'
  import { useUserStore } from '@/stores/user'
  
  const userStore = useUserStore()
  const loginFormRef = ref<FormInstance>()
  const loading = ref(false)
  
  const loginForm = ref({
    username: '',
    password: ''
  })
  
  const loginRules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
  }
  
  const handleLogin = async () => {
    if (!loginFormRef.value) return
    
    try {
      loading.value = true
      await loginFormRef.value.validate()
      await userStore.login(loginForm.value)
    } catch (error) {
      console.error('登录失败:', error)
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
  </style>