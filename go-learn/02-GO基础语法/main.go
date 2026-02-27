package main // 定义了包的名字为main。必须在go文件的第一行声明当前go文件属于哪一个包

import (
	"fmt"
) // 导入了标准库中的fmt包，用于格式化输出

// func 声明函数
// main 是程序的入口函数
func main() {
	// 单行注释
	fmt.Println("Hello, World!")

	// 多行注释
	/*
		这是一个多行注释
		可以跨越多行
	*/

	// ---------------------------------------
	// 变量声明

	// 标准声明
	var name string = "q1mi"
	var age int = 18
	var isOk bool = true
	fmt.Println(name, age, isOk)
	// 批量声明
	var (
		a int
		b string
		c float64
	)
	fmt.Println(a, b, c)
	var d, e string = "d", "e"
	fmt.Println(d, e)

	// 类型推导
	var f = "f"
	fmt.Println(f)

	// 短变量声明，只能在函数内部使用
	g := 100
	fmt.Println(g)

	// 匿名变量
	// 使用下划线 "_" 接收不需要使用的值，避免编译器报错
	// 常用于函数返回多个值时忽略其中某些返回值
	// _多用于占位，表示忽略值
	_, h := 100, 200
	fmt.Println(h)

	// ---------------------------------------
	// 常量声明
	// const 常量名称 常量类型 = 常量值
	// 常量声明必须赋值，不可修改
	const pi float64 = 3.14159
	fmt.Println(pi)

	const (
		n1        = 10
		n2 string = "q1mi"
	)

	// 就算没有给n4赋值，也会默认使用n3的类型
	const (
		n3 = 10
		n4
	)

	// iota
	const (
		n5 = iota
		n6
		n7
		n8
		n9
	)
	fmt.Println("inta:", n5, n6, n7, n8, n9)
	const (
		f1 = iota
		f2 = 10
		f3
		f4 = iota
	)
	fmt.Println("inta:", f1, f2, f3, f4)

}

// 代码块之外只能声明变量，不能赋值操作
