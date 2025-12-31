package main

import (
	"encoding/base64"
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
	var result string
	var err error

	switch req.Action {
	case "base64_encode":
		result = base64.StdEncoding.EncodeToString([]byte(req.Data))
	case "base64_decode":
		decoded, e := base64.StdEncoding.DecodeString(req.Data)
		if e != nil {
			err = e
		} else {
			result = string(decoded)
		}
	default:
		sendError(fmt.Sprintf("未知操作: %s", req.Action))
		return
	}

	if err != nil {
		sendError(err.Error())
		return
	}

	sendSuccess(result)
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
