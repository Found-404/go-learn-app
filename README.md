# Go + Vue 3 学习项目

这是一个用于学习 Go 语言后端开发的入门项目。它包含一个基于 Gin 框架的 Go 后端和一个基于 Vue 3 的前端界面。

## 技术栈

- **后端**: Go, Gin (Web 框架), GORM (ORM), SQLite (数据库)
- **前端**: Vue 3, Vite, TypeScript, Axios, Lucide Vue (图标)

## 项目结构

```
go-learn-app/
├── backend/          # Go 后端代码
│   ├── main.go       # 后端入口及业务逻辑
│   ├── go.mod        # Go 依赖管理
│   └── todos.db      # SQLite 数据库文件 (运行后生成)
└── frontend/         # Vue 前端代码
    ├── src/          # 前端源码
    ├── package.json  # 前端依赖管理
    └── vite.config.ts# Vite 配置
```

## 如何运行

### 1. 运行后端

你需要安装 [Go](https://go.dev/doc/install)。

```bash
cd backend
go run main.go
```
后端将在 `http://localhost:8080` 启动。

### 2. 运行前端

你需要安装 [Node.js](https://nodejs.org/)。

```bash
cd frontend
npm install
npm run dev
```
前端将在 `http://localhost:5173` 启动（具体取决于 Vite 输出）。

## 学习重点

1. **Go 基础**: 结构体 (Struct)、初始化函数 (init)。
2. **Gin 框架**: 路由 (Routing)、中间件 (CORS)、JSON 绑定与响应。
3. **数据库**: 使用 GORM 进行增删改查 (CRUD) 操作，SQLite 零配置启动。
4. **前后端交互**: 使用 Axios 调用 RESTful API，处理跨域问题。
