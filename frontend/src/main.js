import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './x6-config' // 引入 x6 配置

const app = createApp(App)
app.use(router)
app.mount('#app')
