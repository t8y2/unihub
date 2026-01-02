# 插件数据管理

UniHub 提供了完善的插件数据管理功能，包括数据备份、恢复、清理等。

## 功能概览

### 1. 数据备份

- **手动备份**: 在"数据管理"界面手动备份插件数据
- **自动备份**: 卸载插件时可选择自动备份数据
- **备份内容**: 包含插件的所有文件和配置

### 2. 数据恢复

- 从备份列表中选择任意备份进行恢复
- 恢复前会自动备份当前数据
- 支持跨版本恢复

### 3. 数据清理

- 清理单个插件的所有数据
- 清理过期备份（默认保留 30 天）
- 释放磁盘空间

## 使用指南

### 访问数据管理

1. 打开 UniHub
2. 进入「插件管理」页面
3. 点击右上角「数据管理」按钮

### 备份插件数据

**方式一：手动备份**

1. 在「插件数据」标签页找到目标插件
2. 点击「备份」按钮
3. 等待备份完成

**方式二：卸载时备份**

1. 卸载插件时勾选「保留插件数据」
2. 系统会自动创建备份
3. 备份可在「备份管理」中查看

### 恢复插件数据

1. 切换到「备份管理」标签页
2. 找到要恢复的备份
3. 点击「恢复」按钮
4. 确认操作

> ⚠️ **注意**: 恢复操作会覆盖当前数据，请谨慎操作

### 清理数据

**清理单个插件数据**

1. 在「插件数据」标签页找到目标插件
2. 点击「清理」按钮
3. 确认删除

**清理过期备份**

1. 切换到「备份管理」标签页
2. 点击「清理过期备份」按钮
3. 系统会删除 30 天前的备份

## 卸载策略

卸载插件时，你可以选择：

### 选项 1: 保留数据（推荐）

- ✅ 数据会被自动备份
- ✅ 可以随时恢复
- ✅ 重新安装插件后可恢复数据
- ⚠️ 占用磁盘空间

**适用场景**:

- 临时卸载插件
- 升级插件版本
- 不确定是否需要数据

### 选项 2: 删除数据

- ✅ 彻底清理，释放空间
- ❌ 数据无法恢复
- ❌ 重新安装后需要重新配置

**适用场景**:

- 确定不再使用插件
- 需要释放磁盘空间
- 插件数据损坏需要重置

## 数据存储位置

### 插件数据

```
~/Library/Application Support/unihub-electron/plugins/
└── [plugin-id]/
    ├── dist/           # 插件文件
    ├── package.json    # 插件配置
    └── ...
```

### 备份文件

```
~/Library/Application Support/unihub-electron/plugin-backups/
├── [plugin-id]_[timestamp].zip  # 备份文件
└── backups-meta.json            # 备份元数据
```

## API 使用

### 主进程 API

```typescript
// 获取插件数据信息
const info = await pluginDataManager.getPluginDataInfo(pluginId)

// 备份插件数据
const result = await pluginDataManager.backupPluginData(pluginId)

// 恢复备份
const result = await pluginDataManager.restorePluginData(backupId)

// 清理数据
const result = await pluginDataManager.clearPluginData(pluginId)

// 清理过期备份
const result = await pluginDataManager.cleanupOldBackups(30)
```

### 渲染进程 API

```typescript
// 获取所有插件数据信息
const dataList = await window.api.pluginData.getAllInfo()

// 备份插件
const result = await window.api.pluginData.backup(pluginId)

// 恢复备份
const result = await window.api.pluginData.restore(backupId)

// 获取所有备份
const backups = await window.api.pluginData.getAllBackups()

// 获取指定插件的备份
const backups = await window.api.pluginData.getPluginBackups(pluginId)

// 删除备份
const result = await window.api.pluginData.deleteBackup(backupId)

// 清理数据
const result = await window.api.pluginData.clear(pluginId)

// 清理过期备份
const result = await window.api.pluginData.cleanupOldBackups(30)
```

## 最佳实践

### 1. 定期备份重要数据

对于包含重要配置或数据的插件，建议定期手动备份。

### 2. 升级前备份

升级插件前，建议先备份当前数据，以防升级失败。

### 3. 定期清理过期备份

建议每月清理一次过期备份，释放磁盘空间。

### 4. 卸载前考虑数据保留

如果不确定是否还需要插件数据，建议选择保留数据。

## 故障排除

### 备份失败

**可能原因**:

- 磁盘空间不足
- 插件目录权限问题
- 插件文件被占用

**解决方案**:

1. 检查磁盘空间
2. 关闭正在运行的插件
3. 重启应用后重试

### 恢复失败

**可能原因**:

- 备份文件损坏
- 插件版本不兼容
- 目标目录权限问题

**解决方案**:

1. 尝试其他备份
2. 检查插件版本
3. 重新安装插件后恢复

### 数据丢失

**预防措施**:

- 定期备份重要数据
- 卸载时选择保留数据
- 使用云同步备份文件

## 技术细节

### 备份格式

- 格式: ZIP 压缩包
- 命名: `[plugin-id]_[timestamp].zip`
- 内容: 插件目录的完整副本

### 元数据结构

```typescript
interface BackupInfo {
  id: string // 备份 ID
  pluginId: string // 插件 ID
  pluginName: string // 插件名称
  createdAt: string // 创建时间
  size: number // 备份大小（字节）
  fileCount: number // 文件数量
}
```

### 性能优化

- 使用流式压缩，减少内存占用
- 异步操作，不阻塞主线程
- 增量备份（计划中）

## 未来计划

- [ ] 增量备份支持
- [ ] 云端备份同步
- [ ] 自动备份计划
- [ ] 备份加密
- [ ] 备份压缩率优化

---

**相关文档**:

- [插件开发指南](./package-json-guide.md)
- [插件权限系统](./permissions.md)
