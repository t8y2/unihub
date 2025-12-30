# 故障排除指南

## 常见问题

### 1. EACCES 错误（权限被拒绝）

**错误信息**：
```
spawn /path/to/backend/main EACCES
```

**原因**：后端可执行文件没有执行权限

**解决方案**：

#### 方法 1：打包时添加权限（推荐）
```bash
# 在打包脚本中添加
chmod +x backend/main
zip -r plugin.zip manifest.json frontend/ backend/
```

#### 方法 2：手动添加权限
```bash
chmod +x backend/main
```

#### 方法 3：自动修复
插件管理器已更新，会在安装时自动添加执行权限。重新安装插件即可。

---

### 2. Vue 模板编译错误

**错误信息**：
```
Component provided template option but runtime compilation is not supported
```

**原因**：Vue 默认构建不包含模板编译器

**解决方案**：

已在 `electron.vite.config.ts` 中配置：
```typescript
resolve: {
  alias: {
    'vue': 'vue/dist/vue.esm-bundler.js'
  }
}
```

重启开发服务器：
```bash
pnpm dev
```

---

### 3. iframe 沙箱警告

**警告信息**：
```
An iframe which has both allow-scripts and allow-same-origin for its sandbox attribute can escape its sandboxing
```

**说明**：这是预期行为。插件需要这些权限才能正常工作。

**安全措施**：
- 只安装来自可信来源的插件
- 插件运行在独立的 iframe 中
- 后端通过子进程隔离
- 已配置 CSP 策略

---

### 4. CSP 安全警告

**警告信息**：
```
Electron Security Warning (Insecure Content-Security-Policy)
```

**解决方案**：

已在 `src/renderer/index.html` 中添加 CSP：
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: blob:; 
               connect-src 'self' http: https:; 
               frame-src blob:;" />
```

**注意**：开发模式下仍会显示警告，打包后会消失。

---

### 5. 插件无法加载

**症状**：插件安装成功但无法显示

**检查清单**：

1. **检查 manifest.json**
   ```json
   {
     "id": "com.example.plugin",
     "name": "插件名称",
     "main": "frontend/index.html",  // 确保路径正确
     "category": "tool"
   }
   ```

2. **检查文件结构**
   ```
   plugin.zip
   ├── manifest.json
   ├── frontend/
   │   └── index.html  ✓ 必须存在
   └── backend/        ✓ 可选
   ```

3. **检查控制台**
   - 打开开发者工具（Cmd/Ctrl + Shift + I）
   - 查看 Console 标签页的错误信息

---

### 6. 后端调用失败

**症状**：前端调用后端返回错误

**检查清单**：

1. **检查后端文件**
   ```bash
   # Python
   ls -la backend/main.py
   chmod +x backend/main.py
   
   # Go
   ls -la backend/main
   chmod +x backend/main
   ```

2. **测试后端**
   ```bash
   # Python
   python3 backend/main.py function_name '{"arg":"value"}'
   
   # Go
   ./backend/main function_name '{"arg":"value"}'
   ```

3. **检查返回格式**
   后端必须输出 JSON 到 stdout：
   ```json
   {"success": true, "result": "..."}
   ```

---

### 7. Go 编译失败

**错误信息**：
```
go: command not found
```

**解决方案**：

安装 Go：
```bash
# macOS
brew install go

# Linux
sudo apt install golang-go

# 或从官网下载
https://go.dev/dl/
```

验证安装：
```bash
go version
```

---

### 8. Python 脚本无法执行

**错误信息**：
```
python3: command not found
```

**解决方案**：

安装 Python 3：
```bash
# macOS
brew install python3

# Linux
sudo apt install python3

# 验证
python3 --version
```

---

### 9. 插件 API 未定义

**错误信息**：
```
window.api is not defined
```

**原因**：插件在 API 注入前就尝试调用

**解决方案**：

等待 `unihub-ready` 事件：
```javascript
window.addEventListener('unihub-ready', () => {
  // 现在可以安全使用 window.api
  window.api.plugin.backendCall(...)
})
```

---

### 10. 插件更新失败

**症状**：安装新版本时提示已安装

**解决方案**：

先卸载旧版本：
```bash
# 在插件商店的"已安装"标签页中卸载
# 然后重新安装新版本
```

或手动删除：
```bash
# macOS/Linux
rm -rf ~/Library/Application\ Support/unihub-electron/plugins/com.example.plugin

# 重启应用
```

---

## 调试技巧

### 1. 查看插件日志

打开开发者工具：
```
Cmd/Ctrl + Shift + I
```

查看 Console 标签页。

### 2. 查看插件文件

```bash
# macOS
open ~/Library/Application\ Support/unihub-electron/plugins/

# Linux
xdg-open ~/.config/unihub-electron/plugins/

# Windows
explorer %APPDATA%\unihub-electron\plugins\
```

### 3. 测试后端独立运行

```bash
cd ~/Library/Application\ Support/unihub-electron/plugins/com.example.plugin

# Python
python3 backend/main.py function_name '{"test":"data"}'

# Go
./backend/main function_name '{"test":"data"}'

# Node.js
node backend/main.js function_name '{"test":"data"}'
```

### 4. 查看插件元数据

```bash
cat ~/Library/Application\ Support/unihub-electron/plugins-data.json | jq
```

---

## 获取帮助

如果以上方法都无法解决问题：

1. 查看完整日志
2. 检查 GitHub Issues
3. 提交新 Issue，包含：
   - 错误信息
   - 操作步骤
   - 系统信息
   - 插件代码（如果可能）

---

## 最佳实践

### 开发插件时

1. **先测试后端**
   ```bash
   # 独立测试后端逻辑
   ./backend/main test '{"data":"test"}'
   ```

2. **使用本地服务器**
   ```bash
   python3 -m http.server 8080
   ```

3. **查看控制台**
   始终打开开发者工具查看错误

4. **版本控制**
   使用 Git 管理插件代码

### 发布插件时

1. **测试所有功能**
2. **添加 README**
3. **指定依赖**（Python 包、Go 版本等）
4. **提供示例**
5. **标注权限需求**

---

**遇到问题？查看文档或提交 Issue！** 🚀
