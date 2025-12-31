package main

import (
	"encoding/json"
	"fmt"
	"os"
)

type Request struct {
	Action string `json:"action"`
	Data   string `json:"data"`
}

type Response struct {
	Success bool   `json:"success"`
	Result  string `json:"result"`
	Error   string `json:"error,omitempty"`
}

func main() {
	// 从标准输入读取 JSON
	var req Request
	decoder := json.NewDecoder(os.Stdin)
	if err := decoder.Decode(&req); err != nil {
		sendError(fmt.Sprintf("解析请求失败: %v", err))
		return
	}

	// 处理请求
	switch req.Action {
	case "reverse":
		// 反转字符串
		result := reverseString(req.Data)
		sendSuccess(result)
	case "uppercase":
		// 转大写
		result := toUpperCase(req.Data)
		sendSuccess(result)
	default:
		sendError(fmt.Sprintf("未知操作: %s", req.Action))
	}
}

func reverseString(s string) string {
	runes := []rune(s)
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}
	return string(runes)
}

func toUpperCase(s string) string {
	return fmt.Sprintf("%s", s)
}

func sendSuccess(result string) {
	resp := Response{
		Success: true,
		Result:  result,
	}
	json.NewEncoder(os.Stdout).Encode(resp)
}

func sendError(errMsg string) {
	resp := Response{
		Success: false,
		Error:   errMsg,
	}
	json.NewEncoder(os.Stdout).Encode(resp)
}
