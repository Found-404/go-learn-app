<script setup lang="ts">
import { ListTodo, Share2, Atom, FileText } from 'lucide-vue-next'
</script>

<template>
  <div class="app-container">
    <nav class="side-nav">
      <div class="nav-header">
        <div class="logo">DEMO</div>
      </div>
      <router-link 
        to="/todo" 
        class="nav-item" 
        active-class="active"
      >
        <ListTodo :size="20" />
        <span>待办清单</span>
      </router-link>
      <router-link 
        to="/mindmap" 
        class="nav-item" 
        active-class="active"
      >
        <Share2 :size="20" />
        <span>思维导图</span>
      </router-link>
      <router-link 
        to="/editor" 
        class="nav-item" 
        active-class="active"
      >
        <FileText :size="20" />
        <span>富文本编辑器</span>
      </router-link>
      <router-link 
        to="/physics" 
        class="nav-item" 
        active-class="active"
      >
        <Atom :size="20" />
        <span>物理实验室</span>
      </router-link>
    </nav>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<style>
/* 全局基础样式 */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f1f5f9;
  overflow: hidden;
  position: relative;
}

.side-nav {
  width: 240px;
  background: #111827; /* 深黑色背景 */
  color: #d1d5db; /* 默认文字颜色 */
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  z-index: 10;
  /* 移除阴影，追求简约 */
}

.nav-header {
  padding: 0 24px 40px;
}

.logo {
  font-size: 28px;
  font-weight: 700;
  color: #f9fafb; /* 白色 Logo */
  letter-spacing: 0.5px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  border: none;
  background: transparent;
  color: #9ca3af; /* 默认导航项文字颜色 */
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
}

.nav-item:hover {
  background: #1f2937; /* 悬停背景色 */
  color: #f9fafb; /* 悬停文字颜色 */
}

.nav-item.active {
  background: #374151; /* 激活背景色 */
  color: #f9fafb; /* 激活文字颜色 */
  font-weight: 600;
}

.main-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  z-index: 5;
  position: relative;
}

/* 路由切换过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
