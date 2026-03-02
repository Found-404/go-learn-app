<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Plus, Trash2, CheckCircle, Circle, Loader2 } from 'lucide-vue-next'

interface Todo {
  id: number
  title: string
  completed: boolean
}

const todos = ref<Todo[]>([])
const newTodo = ref('')
const loading = ref(false)
const error = ref('')

const API_URL = 'http://localhost:8082/api/todos'

// 获取所有待办
const fetchTodos = async () => {
  loading.value = true
  try {
    const response = await axios.get(API_URL)
    todos.value = response.data
  } catch (err) {
    error.value = '无法加载待办事项'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 添加待办
const addTodo = async () => {
  if (!newTodo.value.trim()) return
  try {
    const response = await axios.post(API_URL, {
      title: newTodo.value,
      completed: false
    })
    todos.value.push(response.data)
    newTodo.value = ''
  } catch (err) {
    console.error(err)
  }
}

// 切换状态
const toggleTodo = async (todo: Todo) => {
  try {
    const response = await axios.put(`${API_URL}/${todo.id}`, {
      ...todo,
      completed: !todo.completed
    })
    const index = todos.value.findIndex(t => t.id === todo.id)
    if (index !== -1) {
      todos.value[index] = response.data
    }
  } catch (err) {
    console.error(err)
  }
}

// 删除待办
const deleteTodo = async (id: number) => {
  try {
    await axios.delete(`${API_URL}/${id}`)
    todos.value = todos.value.filter(t => t.id !== id)
  } catch (err) {
    console.error(err)
  }
}

onMounted(fetchTodos)
</script>

<template>
  <div class="todo-view">
    <div class="card">
      <header>
        <h1>Todo List</h1>
      </header>

      <div class="input-group">
        <input 
          v-model="newTodo" 
          @keyup.enter="addTodo" 
          placeholder="添加一个新的任务..."
          type="text"
        />
        <button @click="addTodo" class="add-btn">
          <Plus :size="20" />
          添加
        </button>
      </div>

      <div v-if="loading" class="status-box">
        <Loader2 class="spin" />
        加载中...
      </div>

      <div v-else-if="error" class="status-box error">
        {{ error }}
      </div>

      <ul v-else class="todo-list">
        <li v-for="todo in todos" :key="todo.id" :class="{ completed: todo.completed }">
          <div class="todo-content" @click="toggleTodo(todo)">
            <component :is="todo.completed ? CheckCircle : Circle" :size="20" class="status-icon" />
            <span>{{ todo.title }}</span>
          </div>
          <button @click="deleteTodo(todo.id)" class="delete-btn">
            <Trash2 :size="18" />
          </button>
        </li>
        <li v-if="todos.length === 0" class="empty">
          暂无任务，开始添加吧！
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.todo-view {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 20px;
  position: relative;
}

.card {
  background: white;
  width: 100%;
  max-width: 500px;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

header {
  margin-bottom: 24px;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
}

.subtitle {
  color: #6b7280;
  font-size: 14px;
  margin-top: 4px;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 24px;
}

input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #3b82f6;
}

.add-btn {
  background-color: #38bdf8;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background-color: #0ea5e9;
}

.todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.todo-list li:hover {
  background-color: #f9fafb;
}

.todo-content {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
}

.todo-list li.completed span {
  text-decoration: line-through;
  color: #9ca3af;
}

.status-icon {
  color: #d1d5db;
}

.completed .status-icon {
  color: #10b981;
}

.delete-btn {
  color: #9ca3af;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.delete-btn:hover {
  color: #ef4444;
  background-color: #fee2e2;
}

.status-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #6b7280;
}

.status-box.error {
  color: #ef4444;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty {
  text-align: center;
  color: #9ca3af;
  padding: 40px 0 !important;
  font-style: italic;
}

footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
  font-size: 12px;
  color: #9ca3af;
  display: flex;
  justify-content: space-between;
}
</style>
