package main

import (
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Todo 数据库模型：定义待办事项的数据结构
type Todo struct {
	ID        uint   `gorm:"primaryKey" json:"id"` // 主键 ID
	Title     string `json:"title"`                // 任务标题
	Completed bool   `json:"completed"`            // 是否已完成
}

// db 全局数据库连接对象
var db *gorm.DB

// initDB 初始化数据库连接
func initDB() {
	var err error
	// 使用 GORM 连接 SQLite 数据库，如果文件不存在会自动创建
	db, err = gorm.Open(sqlite.Open("todos.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("数据库连接失败: ", err)
	}

	// 自动迁移模式：根据 Todo 结构体自动创建或更新数据库表结构
	db.AutoMigrate(&Todo{})
}

func main() {
	// 1. 初始化数据库
	initDB()

	// 2. 创建 Gin 引擎实例
	r := gin.Default()

	// 3. 显式配置 CORS (跨域资源共享)
	// 解决前端 http://localhost:5173 访问 http://localhost:8082 时的跨域问题
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:5173", "http://127.0.0.1:5173"} // 允许 Vite 开发服务器地址
	config.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// 4. 注册 API 路由组
	api := r.Group("/api")
	{
		api.GET("/todos", getTodos)          // 获取所有待办
		api.POST("/todos", createTodo)       // 创建新待办
		api.PUT("/todos/:id", updateTodo)    // 更新指定待办
		api.DELETE("/todos/:id", deleteTodo) // 删除指定待办
	}

	// 5. 启动服务器，监听 8082 端口
	log.Println("服务器已启动，监听地址: http://localhost:8082")
	r.Run(":8082")
}

// getTodos 获取所有待办事项的处理器
// @Summary 获取列表
func getTodos(c *gin.Context) {
	var todos []Todo
	// 从数据库中查询所有记录，并存入 todos 切片
	db.Find(&todos)
	// 以 JSON 格式返回 200 状态码和数据
	c.JSON(http.StatusOK, todos)
}

// createTodo 创建新待办事项的处理器
func createTodo(c *gin.Context) {
	var todo Todo
	// 将请求体中的 JSON 绑定到 todo 结构体
	if err := c.ShouldBindJSON(&todo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数格式错误"})
		return
	}
	// 在数据库中创建记录
	db.Create(&todo)
	c.JSON(http.StatusOK, todo)
}

// updateTodo 更新指定待办事项状态的处理器
func updateTodo(c *gin.Context) {
	id := c.Param("id") // 从 URL 路径中获取 ID 参数
	var todo Todo
	// 先根据 ID 查找记录
	if err := db.First(&todo, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "未找到该待办事项"})
		return
	}

	// 将请求体中的新数据绑定到找到的对象上
	if err := c.ShouldBindJSON(&todo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数格式错误"})
		return
	}

	// 保存更新后的数据到数据库
	db.Save(&todo)
	c.JSON(http.StatusOK, todo)
}

// deleteTodo 删除指定待办事项的处理器
func deleteTodo(c *gin.Context) {
	id := c.Param("id")
	// 根据 ID 从数据库中物理删除记录
	if err := db.Delete(&Todo{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
