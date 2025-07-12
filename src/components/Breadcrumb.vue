<template>
  <el-breadcrumb separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbs"
        :key="item.path"
      >
        <span
          v-if="item.redirect === 'noredirect' || index === breadcrumbs.length - 1"
          class="no-redirect"
        >
          {{ item.meta?.title }}
        </span>
        <a v-else @click.prevent="handleLink(item)">
          {{ item.meta?.title }}
        </a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useRoute, useRouter, type RouteLocationMatched } from 'vue-router'
  
  const route = useRoute()
  const router = useRouter()
  
  const breadcrumbs = ref<RouteLocationMatched[]>([])
  
  // 获取面包屑数据
  const getBreadcrumb = () => {
    // 先过滤出有title且未隐藏的匹配路由
  const matched = route.matched.filter(
    item => item.meta && item.meta.title && !item.meta.hidden
  )

  // 拼接首页，避免重复（防止 matched 已经包含首页时重复显示）
  const hasHome = matched.some(item => item.path === '/dashboard')

  if (!hasHome) {
    breadcrumbs.value = [
      {
        path: '/dashboard',
        meta: { title: '首页' },
        components: {},
        redirect: undefined,
        name: undefined,
        mods: {} as Record<string, unknown>,
        children: [],
        props: {},
        beforeEnter: undefined,
        leaveGuards: new Set(),
        updateGuards: new Set(),
        enterCallbacks: {},
        instances: {},
        aliasOf: undefined
      } as RouteLocationMatched,
      ...matched
    ]
  } else {
    breadcrumbs.value = matched
    }
  }
  
  // 处理链接点击
  const handleLink = (item: RouteLocationMatched) => {
    const { redirect, path } = item
    if (redirect) {
      router.push(redirect.toString())
      return
    }
    router.push(path)
  }
  
  // 监听路由变化
  watch(
    () => route.path,
    () => getBreadcrumb(),
    {
      immediate: true
    }
  )
  </script>
  
  <style scoped>
  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
  
  .breadcrumb-enter-active,
  .breadcrumb-leave-active {
    transition: all 0.5s;
  }
  
  .breadcrumb-enter-from,
  .breadcrumb-leave-active {
    opacity: 0;
    transform: translateX(20px);
  }
  
  .breadcrumb-leave-active {
    position: absolute;
  }
  </style>