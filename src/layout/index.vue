<template>
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside width="240px" class="aside">
        <div class="logo">
          <img src="../assets/logo.svg" alt="logo" />
          <span>医疗保险报销系统</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          :unique-opened="true"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <sidebar-item
            v-for="route in routes"
            :key="route.path"
            :item="route"
            :base-path="route.path"
          />
        </el-menu>
      </el-aside>
  
      <el-container>
        <!-- 头部 -->
        <el-header class="header">
          <div class="header-left">
            <breadcrumb />
          </div>
          <div class="header-right">
            <el-dropdown trigger="click" @command="handleCommand">
              <span class="user-info">
                {{ userStore.userInfo?.realName }}
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
  
        <!-- 主要内容区 -->
        <el-main>
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useUserStore } from '../stores/user'
  import SidebarItem from '../components/SidebarItem.vue'
  import Breadcrumb from '../components/Breadcrumb.vue'
  import { routes } from '../router'
  
  const userStore = useUserStore()
  const route = useRoute()
  const router = useRouter()
  
  const activeMenu = computed(() => route.path)
  
  // 处理下拉菜单命令
  const handleCommand = (command: string) => {
    if (command === 'logout') {
      userStore.logout()
    } else if (command === 'profile') {
      router.push('/profile')
    }
  }
  </script>
  
  <style scoped>
  .layout-container {
    height: 100vh;
  }
  
  .aside {
    width: 240px;
    background-color: #304156;
    overflow-x: hidden;
    box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
  }
  
  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    background: #2b2f3a;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  }
  
  .logo img {
    width: 32px;
    height: 32px;
    margin-right: 12px;
  }
  
  .header {
    background: #fff;
    border-bottom: 1px solid #dcdfe6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  }
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .user-info {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .fade-transform-enter-active,
  .fade-transform-leave-active {
    transition: all 0.3s;
  }
  
  .fade-transform-enter-from {
    opacity: 0;
    transform: translateX(-30px);
  }
  
  .fade-transform-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }

  :deep(.el-menu) {
    border-right: none;
  }

  :deep(.el-menu-item) {
    height: 50px;
    line-height: 50px;
    font-size: 14px;
  }

  :deep(.el-sub-menu__title) {
    height: 50px;
    line-height: 50px;
    font-size: 14px;
  }

  :deep(.el-menu-item.is-active) {
    background-color: #263445 !important;
  }

  :deep(.el-menu-item:hover) {
    background-color: #263445 !important;
  }

  :deep(.el-sub-menu__title:hover) {
    background-color: #263445 !important;
  }
  </style>