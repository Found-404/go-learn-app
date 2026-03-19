import { createRouter, createWebHashHistory } from 'vue-router'
import TodoView from '../views/TodoView.vue'
import MindMapView from '../views/MindMapView.vue'
import PhysicsView from '../views/PhysicsView.vue'
import EditorView from '../views/EditorView.vue'

const routes = [
  {
    path: '/',
    redirect: '/todo'
  },
  {
    path: '/todo',
    name: 'todo',
    component: TodoView,
    meta: { title: '待办清单' }
  },
  {
    path: '/mindmap',
    name: 'mindmap',
    component: MindMapView,
    meta: { title: '思维导图' }
  },
  {
    path: '/physics',
    name: 'physics',
    component: PhysicsView,
    meta: { title: '物理实验室' }
  },
  {
    path: '/editor',
    name: 'editor',
    component: EditorView,
    meta: { title: '富文本编辑器' }
  }
]

const router = createRouter({
  history: createWebHashHistory(), // 使用 Hash 模式适配 GitHub Pages
  routes
})

// 路由守卫：更新页面标题
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - GoApp`
  }
  next()
})

export default router
