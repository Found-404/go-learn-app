package main

import (
	"fmt"
	"strings"
)

func main() {
	// 十进制
	var a int = 10
	fmt.Printf("%d \n", a) // 10
	fmt.Printf("%b \n", a) // 1010  占位符%b表示二进制

	// 八进制  以0开头
	var b int = 077
	fmt.Printf("%o \n", b) // 77

	// 十六进制  以0x开头
	var c int = 0xff
	fmt.Printf("%x \n", c) // ff
	fmt.Printf("%X \n", c) // FF

	// 浮点数
	var d float32 = 3.14
	fmt.Printf("%f \n", d) // 3.140000
	fmt.Printf("%g \n", d) // 3.14

	// 布尔值
	var e bool = true
	fmt.Printf("%t \n", e)   // true
	var boo bool             // 未初始化的布尔值默认是false
	fmt.Printf("%t \n", boo) // false

	// 字符串
	var s string = "hello"
	fmt.Printf("%s \n", s) // hello
	// 字符串转义符
	fmt.Printf("%s \n", "hello\nworld") // hello

	s3 := `
	hello 1))(*)#!@)#_
	world
	`
	fmt.Printf("%s \n", s3) // 按照原规格输出

	// 字符串常用操作
	stringDemo := "hello world"
	// len 字符串长度
	fmt.Println(len(stringDemo)) // 11
	// 拼接字符串
	stringDemo2 := "你好"
	stringDemo3 := fmt.Sprintf("%s - %s", stringDemo, stringDemo2)
	fmt.Println(stringDemo3) // hello world - 你好

	// 字符串分割
	stringDemo4 := "h e l lo,wo rl d"
	stringDemo5 := strings.Split(stringDemo4, " ")
	fmt.Println(stringDemo5) // [hello world]

	// 判断是否包含
	fmt.Println(strings.Contains(stringDemo, "hello")) // true

}
