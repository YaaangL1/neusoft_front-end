<template>
    <div v-if="!item.meta?.hidden">
      <!-- 首页的特殊处理 -->
      <template v-if="item.path === '/'">
        <el-menu-item :index="item.redirect || '/'">
          <el-icon v-if="item.meta?.icon">
            <component :is="item.meta.icon" />
          </el-icon>
          <template #title>{{ item.meta?.title }}</template>
        </el-menu-item>
      </template>

      <!-- 没有子菜单的情况 -->
      <template v-else-if="!hasChildren(item)">
        <el-menu-item :index="resolvePath(basePath, item.path)">
          <el-icon v-if="item.meta?.icon">
            <component :is="item.meta.icon" />
          </el-icon>
          <template #title>{{ item.meta?.title }}</template>
        </el-menu-item>
      </template>
  
      <!-- 有子菜单的情况 -->
      <el-sub-menu v-else :index="resolvePath(basePath, item.path)">
        <template #title>
          <el-icon v-if="item.meta?.icon">
            <component :is="item.meta.icon" />
          </el-icon>
          <span>{{ item.meta?.title }}</span>
        </template>
        
        <sidebar-item
          v-for="child in item.children"
          :key="child.path"
          :item="child"
          :base-path="item.path"
        />
      </el-sub-menu>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { RouteRecordRaw } from 'vue-router'
  import { isExternal } from '@/utils/validate'
  
  const props = defineProps<{
    item: RouteRecordRaw
    basePath: string
  }>()
  
  // 判断是否有子菜单
  const hasChildren = (route: RouteRecordRaw) => {
    if (route.path === '/') {
      return false // 首页永远不显示子菜单
    }
    return route.children && route.children.length > 0
  }
  
  // 解析路径
  const resolvePath = (basePath: string, routePath: string) => {
    if (isExternal(routePath)) {
      return routePath
    }
    if (isExternal(basePath)) {
      return basePath
    }

    // 如果是以斜杠开头的路径，直接返回
    if (routePath.startsWith('/')) {
      return routePath
    }
    
    // 如果是子路由，需要拼接父路由的路径
    const normalizedBase = basePath.replace(/\/$/, '') // 去掉 basePath 结尾的 /
    const normalizedRoute = routePath.replace(/^\//, '') // 去掉 routePath 开头的 /
    return `${normalizedBase}/${normalizedRoute}`
  }
  </script>