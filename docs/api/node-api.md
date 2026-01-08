# Node API

`window.nodeAPI` 提供 Node.js 能力，需要在 `package.json` 的 `unihub.permissions` 中声明相应权限。

## fs

文件系统操作，需要 `fs` 权限。

### readFile(path, encoding?)

读取文件内容。

```typescript
readFile(path: string, encoding?: string): Promise<string | Buffer>
```

**参数**:

- `path` - 文件路径
- `encoding` - 编码（如 `'utf-8'`），不指定则返回 Buffer

**示例**:

```javascript
// 读取文本文件
const content = await window.nodeAPI.fs.readFile('/path/to/file.txt', 'utf-8')

// 读取二进制文件
const buffer = await window.nodeAPI.fs.readFile('/path/to/image.png')
```

### writeFile(path, data, encoding?)

写入文件。

```typescript
writeFile(path: string, data: string | Buffer, encoding?: string): Promise<void>
```

**示例**:

```javascript
// 写入文本
await window.nodeAPI.fs.writeFile('/path/to/file.txt', 'Hello World', 'utf-8')

// 写入二进制
await window.nodeAPI.fs.writeFile('/path/to/file.bin', buffer)
```

### exists(path)

检查文件或目录是否存在。

```typescript
exists(path: string): Promise<boolean>
```

### readdir(path)

读取目录内容。

```typescript
readdir(path: string): Promise<string[]>
```

**返回**: 目录中的文件和子目录名称数组

### mkdir(path, options?)

创建目录。

```typescript
interface MkdirOptions {
  recursive?: boolean
}

mkdir(path: string, options?: MkdirOptions): Promise<void>
```

**示例**:

```javascript
// 递归创建目录
await window.nodeAPI.fs.mkdir('/path/to/deep/dir', { recursive: true })
```

### unlink(path)

删除文件。

```typescript
unlink(path: string): Promise<void>
```

### rmdir(path, options?)

删除目录。

```typescript
interface RmdirOptions {
  recursive?: boolean
}

rmdir(path: string, options?: RmdirOptions): Promise<void>
```

### stat(path)

获取文件/目录信息。

```typescript
interface Stats {
  isFile(): boolean
  isDirectory(): boolean
  size: number
  mtime: Date
  ctime: Date
}

stat(path: string): Promise<Stats>
```

### rename(oldPath, newPath)

重命名/移动文件。

```typescript
rename(oldPath: string, newPath: string): Promise<void>
```

### copyFile(src, dest)

复制文件。

```typescript
copyFile(src: string, dest: string): Promise<void>
```

---

## path

路径处理工具，无需特殊权限。

### join(...paths)

拼接路径。

```typescript
join(...paths: string[]): string
```

**示例**:

```javascript
const fullPath = window.nodeAPI.path.join('/home', 'user', 'documents', 'file.txt')
// => '/home/user/documents/file.txt'
```

### dirname(path)

获取目录名。

```typescript
dirname(path: string): string
```

**示例**:

```javascript
window.nodeAPI.path.dirname('/home/user/file.txt')
// => '/home/user'
```

### basename(path, ext?)

获取文件名。

```typescript
basename(path: string, ext?: string): string
```

**示例**:

```javascript
window.nodeAPI.path.basename('/home/user/file.txt')
// => 'file.txt'

window.nodeAPI.path.basename('/home/user/file.txt', '.txt')
// => 'file'
```

### extname(path)

获取扩展名。

```typescript
extname(path: string): string
```

**示例**:

```javascript
window.nodeAPI.path.extname('file.txt')
// => '.txt'
```

### resolve(...paths)

解析为绝对路径。

```typescript
resolve(...paths: string[]): string
```

### isAbsolute(path)

判断是否为绝对路径。

```typescript
isAbsolute(path: string): boolean
```

### normalize(path)

规范化路径。

```typescript
normalize(path: string): string
```

### sep

路径分隔符（`/` 或 `\`）。

```typescript
sep: string
```

---

## http

HTTP 请求，需要 `http` 权限。绕过 CORS 限制。

### get(url, options?)

发起 GET 请求。

```typescript
interface HttpOptions {
  headers?: Record<string, string>
  timeout?: number
}

interface HttpResponse {
  status: number
  headers: Record<string, string>
  data: any
}

get(url: string, options?: HttpOptions): Promise<HttpResponse>
```

**示例**:

```javascript
const response = await window.nodeAPI.http.get('https://api.example.com/data', {
  headers: {
    Authorization: 'Bearer token'
  }
})
console.log(response.data)
```

### post(url, data, options?)

发起 POST 请求。

```typescript
post(url: string, data: any, options?: HttpOptions): Promise<HttpResponse>
```

**示例**:

```javascript
const response = await window.nodeAPI.http.post(
  'https://api.example.com/data',
  {
    name: 'test',
    value: 123
  },
  {
    headers: {
      'Content-Type': 'application/json'
    }
  }
)
```

### request(options)

发起自定义请求。

```typescript
interface RequestOptions {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  data?: any
  timeout?: number
}

request(options: RequestOptions): Promise<HttpResponse>
```

---

## spawn

执行系统命令，需要 `spawn` 权限。

### exec(command, args?, options?)

执行命令并等待完成。

```typescript
interface SpawnOptions {
  cwd?: string
  env?: Record<string, string>
  timeout?: number
}

interface SpawnResult {
  stdout: string
  stderr: string
  code: number
}

exec(command: string, args?: string[], options?: SpawnOptions): Promise<SpawnResult>
```

**示例**:

```javascript
// 执行 git status
const result = await window.nodeAPI.spawn.exec('git', ['status'], {
  cwd: '/path/to/repo'
})

console.log('输出:', result.stdout)
console.log('错误:', result.stderr)
console.log('退出码:', result.code)
```

::: danger 安全警告
`spawn` 权限允许执行任意系统命令，风险较高。请谨慎使用，并确保：

- 不要执行用户输入的命令
- 验证所有参数
- 使用最小必要的权限
  :::
