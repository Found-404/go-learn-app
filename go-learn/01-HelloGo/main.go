package main

import (
	"fmt"

	"github.com/q1mi/hello" // 在自己项目中引入了别人的库
)

func main() {
	fmt.Println("Hello, World!")
	hello.SayHi()
}

// 安装依赖
// 执行命令：go mod tidy

// go.mod 依赖管理文件
// go.sum 依赖校验文件
// HelloGoLang.exe 代码编译后的可执行文件
