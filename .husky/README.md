# Husky Git Hooks

这个项目使用 Husky 来管理 Git hooks，确保代码质量。

## 已配置的 Hooks

### pre-commit

在每次 commit 之前自动运行：

- ESLint 检查和自动修复
- Prettier 格式化

只会检查和修复暂存的文件（staged files），不会影响其他文件。

## 如何跳过 Hooks（不推荐）

如果在特殊情况下需要跳过 hooks：

```bash
git commit --no-verify -m "your message"
```

## 手动运行检查

```bash
# 运行 lint
pnpm lint

# 运行 lint 并自动修复
pnpm lint --fix

# 运行格式化
pnpm format

# 运行类型检查
pnpm typecheck
```
