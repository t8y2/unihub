# React + Python 插件示例

展示如何使用 React 前端 + Python 后端开发插件。

## 技术栈

- **前端**: React 18 (CDN)
- **后端**: Python 3
- **通信**: Electron IPC + 子进程

## 功能

- 反转文本
- 分析文本（字符数、单词数等）
- 计算哈希值（MD5、SHA1、SHA256）

## 安装测试

```bash
# 打包
./package.sh

# 启动测试服务器
python3 -m http.server 8080

# 在插件商店输入
http://localhost:8080/plugin.zip
```

## 文件结构

```
react-python-plugin/
├── manifest.json
├── frontend/
│   └── index.html    # React 应用
├── backend/
│   └── main.py       # Python 后端
└── package.sh
```
