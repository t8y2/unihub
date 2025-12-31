/**
 * 判断 icon 是否为 emoji
 * @param icon - 图标字符串（emoji 或 SVG path）
 * @returns 是否为 emoji
 */
export function isEmoji(icon: string | undefined): boolean {
  if (!icon) return false

  // 如果是 SVG path，通常以 M 或 m 开头（moveto 命令）
  if (icon.startsWith('M') || icon.startsWith('m')) {
    return false
  }

  // 如果长度较短且包含 Unicode emoji 字符，认为是 emoji
  if (icon.length < 10) {
    // 检查是否包含 emoji 范围的 Unicode 字符
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
    return emojiRegex.test(icon)
  }

  return false
}
