# 安装

## 下载安装包

从 [GitHub Releases](https://github.com/t8y2/unihub/releases) 下载适合你系统的安装包：

| 系统                  | 文件                           |
| --------------------- | ------------------------------ |
| macOS (Apple Silicon) | `UniHub-x.x.x-arm64.dmg`       |
| macOS (Intel)         | `UniHub-x.x.x-x64.dmg`         |
| Windows               | `UniHub-x.x.x-setup.exe`       |
| Linux (deb)           | `UniHub-x.x.x-amd64.deb`       |
| Linux (AppImage)      | `UniHub-x.x.x-x86_64.AppImage` |

## macOS 安装

1. 下载 `.dmg` 文件
2. 双击打开 DMG 文件
3. 将 UniHub 拖入 Applications 文件夹
4. 首次打开时，如果提示"无法验证开发者"，请前往 **系统偏好设置 → 安全性与隐私**，点击"仍要打开"

## Windows 安装

1. 下载 `.exe` 安装程序
2. 双击运行安装程序
3. 按照向导完成安装
4. 从开始菜单或桌面快捷方式启动 UniHub

## Linux 安装

### Debian/Ubuntu

```bash
sudo dpkg -i UniHub-x.x.x-amd64.deb
```

### AppImage

```bash
chmod +x UniHub-x.x.x-x86_64.AppImage
./UniHub-x.x.x-x86_64.AppImage
```

## 从源码构建

如果你想从源码构建 UniHub：

```bash
# 克隆仓库
git clone https://github.com/t8y2/unihub.git
cd unihub

# 安装依赖
pnpm install

# 开发模式运行
pnpm dev

# 构建生产版本
pnpm build
```

## 更新

UniHub 支持自动更新检查。当有新版本时，会在应用内提示你下载更新。

你也可以在 **设置 → 关于** 中手动检查更新。
