# 插件隔离演示

## 🔒 隔离机制测试

### 测试 1：数据隔离

**插件 A**：
```typescript
// 保存数据
await window.unihub.db.set('mySecret', 'password123')
console.log('插件 A 保存了密码')
```

**插件 B**：
```typescript
// 尝试读取插件 A 的数据
const secret = await window.unihub.db.get('mySecret')
console.log('插件 B 读取到:', secret)
// 输出: null （数据隔离成功）
```

**结果**：✅ 插件 B 无法访问插件 A 的数据

---

### 测试 2：文件系统隔离

**插件 A 的目录结构**：
```
plugins/com.example.pluginA/
├── dist/
├── data/
│   └── secret.txt  // 包含敏感信息
└── package.json
```

**插件 B 尝试访问**：
```typescript
// ❌ 尝试读取插件 A 的文件
try {
  const content = await window.node.fs.readFile('../com.example.pluginA/data/secret.txt')
} catch (error) {
  console.error(error.message)
  // 输出: 路径遍历攻击检测：不允许访问插件目录外的文件
}
```

**结果**：✅ 路径遍历攻击被阻止

---

### 测试 3：权限隔离

**插件 A 的权限**：
```json
{
  "permissions": ["clipboard"]
}
```

**插件 B 的权限**：
```json
{
  "permissions": ["http"]
}
```

**插件 A 尝试发起 HTTP 请求**：
```typescript
try {
  await window.unihub.http.get('https://api.example.com')
} catch (error) {
  console.error(error.message)
  // 输出: 插件 com.example.pluginA 缺少权限: http
}
```

**插件 B 尝试访问剪贴板**：
```typescript
try {
  await window.unihub.clipboard.readText()
} catch (error) {
  console.error(error.message)
  // 输出: 插件 com.example.pluginB 缺少权限: clipboard
}
```

**结果**：✅ 权限隔离生效

---

### 测试 4：进程隔离

**插件 A 崩溃**：
```typescript
// 插件 A 中的错误代码
throw new Error('插件崩溃了！')
```

**观察结果**：
- ✅ 主程序继续运行
- ✅ 插件 B 正常工作
- ✅ 可以重新加载插件 A

---

### 测试 5：Sidecar 隔离

**插件 A 的 Sidecar**：
```
plugins/com.example.pluginA/sidecar/main
```

**插件 B 尝试执行插件 A 的 Sidecar**：
```typescript
try {
  await window.node.spawn('../com.example.pluginA/sidecar/main')
} catch (error) {
  console.error(error.message)
  // 输出: 路径遍历攻击检测
}
```

**结果**：✅ 无法执行其他插件的 Sidecar

---

## 🛡️ 安全边界

### 插件可以做什么

✅ 访问自己的数据
✅ 访问自己的文件
✅ 使用已授权的权限
✅ 执行自己的 Sidecar
✅ 与主程序通信

### 插件不能做什么

❌ 访问其他插件的数据
❌ 访问其他插件的文件
❌ 使用未授权的权限
❌ 执行其他插件的 Sidecar
❌ 直接访问 Node.js API
❌ 绕过权限检查

---

## 📊 隔离架构图

```
┌─────────────────────────────────────────────────────────┐
│                      主进程 (Main)                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │         PermissionManager (权限管理)              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │         PluginManager (插件管理)                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
│   插件 A       │ │   插件 B       │ │   插件 C       │
│ WebContents   │ │ WebContents   │ │ WebContents   │
│ View          │ │ View          │ │ View          │
├───────────────┤ ├───────────────┤ ├───────────────┤
│ 权限:         │ │ 权限:         │ │ 权限:         │
│ - clipboard   │ │ - http        │ │ - fs          │
│ - http        │ │ - notification│ │ - spawn       │
├───────────────┤ ├───────────────┤ ├───────────────┤
│ 数据:         │ │ 数据:         │ │ 数据:         │
│ pluginA.json  │ │ pluginB.json  │ │ pluginC.json  │
├───────────────┤ ├───────────────┤ ├───────────────┤
│ 文件:         │ │ 文件:         │ │ 文件:         │
│ plugins/      │ │ plugins/      │ │ plugins/      │
│ pluginA/      │ │ pluginB/      │ │ pluginC/      │
└───────────────┘ └───────────────┘ └───────────────┘
```

---

## 🔍 隔离验证清单

### 数据隔离
- [ ] 插件 A 无法读取插件 B 的数据
- [ ] 插件 B 无法修改插件 A 的数据
- [ ] 数据存储在独立文件中

### 文件系统隔离
- [ ] 插件只能访问自己的目录
- [ ] 路径遍历攻击被阻止
- [ ] 绝对路径访问被阻止

### 权限隔离
- [ ] 无权限时 API 调用失败
- [ ] 权限检查在每次调用时执行
- [ ] 权限配置独立存储

### 进程隔离
- [ ] 插件崩溃不影响主程序
- [ ] 插件崩溃不影响其他插件
- [ ] 可以独立重启插件

### Sidecar 隔离
- [ ] 只能执行自己目录内的程序
- [ ] 无法执行系统命令
- [ ] 无法执行其他插件的程序

---

## 💡 最佳实践

### 1. 最小权限原则
```json
// ✅ 好的做法
{
  "permissions": ["clipboard"]  // 只声明需要的
}

// ❌ 不好的做法
{
  "permissions": ["fs", "clipboard", "http", "spawn", "system"]
}
```

### 2. 数据加密
```typescript
// 敏感数据应该加密存储
const encrypted = encrypt(sensitiveData)
await window.unihub.db.set('secret', encrypted)
```

### 3. 错误处理
```typescript
// 优雅处理权限错误
try {
  await window.unihub.clipboard.readText()
} catch (error) {
  if (error.message.includes('缺少权限')) {
    showPermissionError()
  }
}
```

---

## 🎯 总结

UniHub 的插件隔离机制提供了：

1. ✅ **多层防护**：进程、数据、文件、权限
2. ✅ **安全边界**：清晰的权限模型
3. ✅ **攻击防护**：路径遍历、权限滥用
4. ✅ **崩溃隔离**：插件崩溃不影响系统
5. ✅ **易于审计**：权限配置透明

**安全等级**：⭐⭐⭐⭐⭐ (5/5)
