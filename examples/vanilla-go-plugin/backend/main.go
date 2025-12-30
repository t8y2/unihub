package main

import (
	"compress/gzip"
	"bytes"
	"crypto/md5"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"time"
)

type Input struct {
	Data string `json:"data"`
}

type Output struct {
	Success bool   `json:"success"`
	Output  string `json:"output"`
	Message string `json:"message"`
}

func compress(input Input) Output {
	var buf bytes.Buffer
	gz := gzip.NewWriter(&buf)
	gz.Write([]byte(input.Data))
	gz.Close()
	
	compressed := base64.StdEncoding.EncodeToString(buf.Bytes())
	ratio := float64(len(compressed)) / float64(len(input.Data)) * 100
	
	return Output{
		Success: true,
		Output:  compressed,
		Message: fmt.Sprintf("压缩率: %.2f%%", ratio),
	}
}

func encrypt(input Input) Output {
	// 简单的 Base64 编码（示例）
	encrypted := base64.StdEncoding.EncodeToString([]byte(input.Data))
	
	return Output{
		Success: true,
		Output:  encrypted,
		Message: "已使用 Base64 编码",
	}
}

func hash(input Input) Output {
	md5Hash := md5.Sum([]byte(input.Data))
	sha256Hash := sha256.Sum256([]byte(input.Data))
	
	result := map[string]string{
		"md5":    hex.EncodeToString(md5Hash[:]),
		"sha256": hex.EncodeToString(sha256Hash[:]),
	}
	
	jsonResult, _ := json.Marshal(result)
	
	return Output{
		Success: true,
		Output:  string(jsonResult),
		Message: "已计算哈希值",
	}
}

func benchmark(input Input) Output {
	start := time.Now()
	
	// 执行一些计算密集型操作
	count := 0
	for i := 0; i < 1000000; i++ {
		count += i
	}
	
	elapsed := time.Since(start)
	
	return Output{
		Success: true,
		Output:  fmt.Sprintf("%d", count),
		Message: fmt.Sprintf("执行时间: %v", elapsed),
	}
}

func main() {
	if len(os.Args) < 3 {
		fmt.Println(`{"success": false, "message": "参数不足"}`)
		os.Exit(1)
	}
	
	functionName := os.Args[1]
	argsJSON := os.Args[2]
	
	var input Input
	if err := json.Unmarshal([]byte(argsJSON), &input); err != nil {
		fmt.Printf(`{"success": false, "message": "JSON 解析失败: %s"}`, err)
		os.Exit(1)
	}
	
	var output Output
	
	switch functionName {
	case "compress":
		output = compress(input)
	case "encrypt":
		output = encrypt(input)
	case "hash":
		output = hash(input)
	case "benchmark":
		output = benchmark(input)
	default:
		output = Output{
			Success: false,
			Message: fmt.Sprintf("未知函数: %s", functionName),
		}
	}
	
	result, _ := json.Marshal(output)
	fmt.Println(string(result))
}
