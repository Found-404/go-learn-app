<template>
  <div class="editor-view-container">
    <header class="view-header">
      <div class="header-left">
        <h1 class="view-title">富文本编辑器</h1>
        <p class="view-description">Notion 风格的 Markdown 实时编辑器</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="handleManualSave">
          <Save :size="18" />
          <span>立即保存</span>
        </button>
      </div>
    </header>

    <main class="editor-main">
      <div class="editor-wrapper">
        <TiptapEditor 
          v-model="markdownContent" 
          @save="onAutoSave" 
          placeholder='输入 "/" 以调出浮动菜单，或直接开始写作...'
        />
      </div>
      
      <aside class="editor-sidebar">
        <div class="sidebar-card">
          <h3 class="card-title">编辑器指南</h3>
          <div class="guide-content">
            <div class="guide-section">
              <h4>Markdown 快捷键</h4>
              <ul class="guide-list">
                <li><code>#</code> 空格 - 一级标题</li>
                <li><code>##</code> 空格 - 二级标题</li>
                <li><code>-</code> 空格 - 无序列表</li>
                <li><code>1.</code> 空格 - 有序列表</li>
                <li><code>[ ]</code> 空格 - 任务列表</li>
                <li><code>></code> 空格 - 引用</li>
                <li><code>```</code> 空格 - 代码块</li>
              </ul>
            </div>
            
            <div class="guide-section">
              <h4>Notion 交互</h4>
              <ul class="guide-list">
                <li><strong>浮动菜单</strong>: 在空行输入 <code>/</code> 或查看行首左侧</li>
                <li><strong>气泡菜单</strong>: 选中文字以调出格式化选项</li>
                <li><strong>自动保存</strong>: 修改后 3 秒自动保存</li>
              </ul>
            </div>

            <div class="guide-section">
              <h4>增强功能</h4>
              <ul class="guide-list">
                <li><strong>导入导出</strong>: 支持 .md 文件</li>
                <li><strong>字数统计</strong>: 实时显示在底部状态栏</li>
                <li><strong>只读模式</strong>: 切换编辑与预览状态</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="sidebar-card preview-card">
          <h3 class="card-title">Markdown 源码实时预览</h3>
          <div class="markdown-preview">
            <pre><code>{{ markdownContent || '暂无内容' }}</code></pre>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TiptapEditor from '../components/Editor/TiptapEditor.vue'
import { Save } from 'lucide-vue-next'

const STORAGE_KEY = 'tiptap_notion_content'

const markdownContent = ref('')

// Load from localStorage on mount
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    markdownContent.value = saved
  } else {
    markdownContent.value = '# 欢迎使用 Notion 风格编辑器\n\n这是一个集成了 **TipTap** 的现代化编辑器。您可以直接开始写作，或者试试以下功能：\n\n### 🚀 核心特性\n- **Notion 交互体验**：在空行尝试输入 `/` 或者选中文字试试。\n- **Markdown 实时渲染**：所有输入会自动转换为 Markdown 格式。\n- **双向绑定**：内容以 Markdown 字符串形式同步。\n\n### 📝 任务列表演示\n- [x] 已完成的任务\n- [ ] 待办事项\n\n### 📊 表格支持\n| 功能 | 状态 | 备注 |\n| :--- | :--- | :--- |\n| 自动保存 | ✅ | 3秒防抖 |\n| 导入导出 | ✅ | 支持 .md |\n| 字数统计 | ✅ | 底部显示 |\n\n> 提示：右侧侧边栏提供了详细的编辑器指南。'
  }
})

const onAutoSave = (content: string) => {
  localStorage.setItem(STORAGE_KEY, content)
  console.log('Auto-saved at', new Date().toLocaleTimeString())
}

const handleManualSave = () => {
  localStorage.setItem(STORAGE_KEY, markdownContent.value)
  alert('内容已保存到本地存储！')
}
</script>

<style scoped>
.editor-view-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-sizing: border-box;
  overflow: hidden;
  background-color: #f8fafc;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 0 4px;
}

.view-title {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
  letter-spacing: -0.5px;
}

.view-description {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.btn-primary:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.editor-main {
  flex-grow: 1;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  overflow: hidden;
}

.editor-wrapper {
  height: 100%;
  min-height: 0;
  background: white;
  border-radius: 12px;
}

.editor-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  padding-right: 4px;
}

.sidebar-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.guide-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.guide-section h4 {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.guide-list {
  padding-left: 18px;
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
}

.guide-list li {
  margin-bottom: 6px;
}

.guide-list code {
  background: #f1f5f9;
  padding: 1px 4px;
  border-radius: 4px;
  font-family: monospace;
  color: #e11d48;
  font-weight: 600;
}

.preview-card {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  min-height: 200px;
}

.markdown-preview {
  flex-grow: 1;
  background: #0f172a;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  overflow-y: auto;
  max-height: 400px;
}

.markdown-preview pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  color: #cbd5e1;
  font-family: "Fira Code", monospace;
  line-height: 1.6;
}

/* Custom Scrollbar */
.editor-sidebar::-webkit-scrollbar,
.markdown-preview::-webkit-scrollbar {
  width: 6px;
}

.editor-sidebar::-webkit-scrollbar-thumb,
.markdown-preview::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 10px;
}

/* Mobile Responsiveness */
@media (max-width: 1200px) {
  .editor-main {
    grid-template-columns: 1fr;
  }
  
  .editor-sidebar {
    display: none;
  }
}
</style>
