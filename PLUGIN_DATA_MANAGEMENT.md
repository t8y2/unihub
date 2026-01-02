# 插件数据管理功能实现

## 概述

为 UniHub 实现了完整的插件数据管理功能，包括数据备份、恢复、清理和卸载时的数据处理策略。

## 实现的功能

### 1. 数据备份 ✅

- **手动备份**: 用户可以在数据管理界面手动备份任意插件的数据
- **自动备份**: 卸载插件时可选择自动创建备份
- **备份格式**: ZIP 压缩包，包含插件的所有文件
- **备份元数据**: 记录备份时间、大小、文件数量等信息

### 2. 数据恢复 ✅

- **从备份恢复**: 可以从备份列表中选择任意备份进行恢复
- **安全恢复**: 恢复前自动备份当前数据，防止数据丢失
- **跨版本支持**: 支持恢复不同版本的插件数据

### 3. 数据清理 ✅

- **单个清理**: 清理指定插件的所有数据
- **批量清理**: 清理过期备份（默认 30 天）
- **确认机制**: 所有删除操作都需要用户确认

### 4. 卸载策略 ✅

用户在卸载插件时可以选择：

- **保留数据**: 自动创建备份，可随时恢复
- **删除数据**: 彻底清理，释放磁盘空间

## 文件结构

```
src/
├── main/
│   ├── plugin-data-manager.ts          # 数据管理核心逻辑
│   ├── plugin-manager.ts                # 集成数据管理功能
│   └── index.ts                         # IPC 处理器
├── preload/
│   ├── index.ts                         # API 暴露
│   └── index.d.ts                       # 类型定义
└── renderer/src/
    ├── components/
    │   ├── PluginDataManager.vue        # 数据管理 UI
    │   ├── PluginManagementPage.vue     # 集成数据管理入口
    │   └── ui/tabs/                     # Tabs 组件
    └── plugins/marketplace/
        └── installer.ts                 # 支持卸载选项

docs/
└── plugin-development/
    └── data-management.md               # 使用文档
```

## 核心 API

### 主进程 API (plugin-data-manager.ts)

```typescript
class PluginDataManager {
  // 获取插件数据信息
  getPluginDataInfo(pluginId: string): PluginDataInfo | null

  // 获取所有插件数据信息
  getAllPluginsDataInfo(): PluginDataInfo[]

  // 备份插件数据
  async backupPluginData(pluginId: string): Promise<Result>

  // 恢复插件数据
  async restorePluginData(backupId: string): Promise<Result>

  // 删除备份
  deleteBackup(backupId: string): Result

  // 获取所有备份
  getAllBackups(): BackupInfo[]

  // 获取指定插件的备份
  getPluginBackups(pluginId: string): BackupInfo[]

  // 清理插件数据
  clearPluginData(pluginId: string): Result

  // 卸载时处理数据
  async handleUninstallData(pluginId: string, options: UninstallOptions): Promise<Result>

  // 清理过期备份
  cleanupOldBackups(daysToKeep: number): Result
}
```

### 渲染进程 API (window.api.pluginData)

```typescript
interface PluginDataAPI {
  getInfo(pluginId: string): Promise<PluginDataInfo | null>
  getAllInfo(): Promise<PluginDataInfo[]>
  backup(pluginId: string): Promise<Result>
  restore(backupId: string): Promise<Result>
  deleteBackup(backupId: string): Promise<Result>
  getAllBackups(): Promise<BackupInfo[]>
  getPluginBackups(pluginId: string): Promise<BackupInfo[]>
  clear(pluginId: string): Promise<Result>
  cleanupOldBackups(daysToKeep?: number): Promise<Result>
}
```

## UI 组件

### PluginDataManager.vue

数据管理主界面，包含两个标签页：

1. **插件数据**: 显示所有插件的数据信息，支持备份和清理
2. **备份管理**: 显示所有备份，支持恢复和删除

特性：

- 实时统计数据大小和备份数量
- 按插件分组显示备份
- 确认对话框防止误操作
- 友好的错误提示

### 集成到 PluginManagementPage.vue

- 添加"数据管理"按钮
- 卸载对话框增加"保留数据"选项
- 显示卸载结果（是否已备份）

## 数据存储

### 插件数据位置

```
~/Library/Application Support/unihub-electron/plugins/
└── [plugin-id]/
    ├── dist/
    ├── package.json
    └── ...
```

### 备份文件位置

```
~/Library/Application Support/unihub-electron/plugin-backups/
├── [plugin-id]_[timestamp].zip
├── [plugin-id]_[timestamp].zip
└── backups-meta.json
```

### 备份元数据格式

```json
[
  {
    "id": "com.example.plugin_1704067200000",
    "pluginId": "com.example.plugin",
    "pluginName": "示例插件",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "size": 1048576,
    "fileCount": 42
  }
]
```

## 使用流程

### 1. 备份插件数据

```
插件管理 → 数据管理 → 插件数据 → 选择插件 → 备份
```

### 2. 恢复插件数据

```
插件管理 → 数据管理 → 备份管理 → 选择备份 → 恢复
```

### 3. 卸载插件（保留数据）

```
插件管理 → 已安装 → 选择插件 → 卸载 → 勾选"保留插件数据" → 确认
```

### 4. 清理过期备份

```
插件管理 → 数据管理 → 备份管理 → 清理过期备份
```

## 安全机制

1. **确认对话框**: 所有删除操作都需要用户确认
2. **自动备份**: 恢复前自动备份当前数据
3. **错误处理**: 完善的错误捕获和提示
4. **数据隔离**: 每个插件的数据独立存储

## 性能优化

1. **异步操作**: 所有 I/O 操作都是异步的，不阻塞 UI
2. **流式压缩**: 使用 AdmZip 进行流式压缩，减少内存占用
3. **懒加载**: 数据管理界面按需加载
4. **缓存机制**: 备份元数据缓存在内存中

## 测试建议

### 手动测试步骤

1. **测试备份功能**
   - 安装一个插件
   - 在数据管理中备份该插件
   - 检查备份文件是否生成
   - 验证备份元数据是否正确

2. **测试恢复功能**
   - 修改插件数据
   - 从备份恢复
   - 验证数据是否恢复到备份时的状态

3. **测试卸载策略**
   - 卸载插件并选择保留数据
   - 检查是否创建了备份
   - 重新安装插件
   - 恢复备份，验证数据是否完整

4. **测试清理功能**
   - 清理单个插件数据
   - 清理过期备份
   - 验证文件是否被删除

## 已知限制

1. **备份大小**: 大型插件（>100MB）备份可能较慢
2. **并发限制**: 同时备份多个插件可能影响性能
3. **跨平台**: 路径处理已考虑跨平台，但需要在 Windows/Linux 上测试

## 未来改进

- [ ] 增量备份支持
- [ ] 云端备份同步
- [ ] 自动备份计划
- [ ] 备份加密
- [ ] 备份压缩率优化
- [ ] 批量操作支持

## 相关文档

- [使用文档](./docs/plugin-development/data-management.md)
- [插件开发指南](./docs/plugin-development/package-json-guide.md)

---

**实现时间**: 2025-01-02
**版本**: 1.0.0
**状态**: ✅ 已完成
