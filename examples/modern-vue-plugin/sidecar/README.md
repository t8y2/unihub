# Sidecar 示例

这是一个使用 Go 语言编写的 Sidecar 示例，展示如何在插件中使用外部进程。

## 编译

```bash
# macOS/Linux
go build -o main main.go

# Windows
go build -o main.exe main.go

# 跨平台编译
GOOS=darwin GOARCH=amd64 go build -o main-darwin main.go
GOOS=windows GOARCH=amd64 go build -o main-windows.exe main.go
GOOS=linux GOARCH=amd64 go build -o main-linux main.go
```

## 使用方式

在插件中通过 `window.node.spawn()` 调用：

```javascript
const result = await window.node.spawn('./sidecar/main', [], {
  input: JSON.stringify({
    action: 'reverse',
    data: 'Hello World'
  })
})

if (result.success) {
  const response = JSON.parse(result.stdout)
  console.log(response.result) // "dlroW olleH"
}
```

## 支持的操作

- `reverse`: 反转字符串
- `uppercase`: 转大写

## 注意事项

1. Sidecar 必须编译成二进制文件（.exe）
2. 必须放在插件目录内（如 `sidecar/` 文件夹）
3. 通过 stdin/stdout 进行 JSON 通信
4. 开发者需要为不同平台编译不同的二进制文件
