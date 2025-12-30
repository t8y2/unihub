# UniHub 插件开发完整指南

## 🎯 核心理念

**完全开放的插件系统**：支持任意前端框架和后端语言的自由组合！

- 前端：原生 JS、Vue、React、Svelte... 任何你喜欢的
- 后端：Python、Go、Rust、Node.js、Java... 任何你擅长的

## 🚀 快速开始

### 示例 1：原生 JS + Go（高性能）

```bash
cd examples/vanilla-go-plugin
./build.sh      # 编译 Go 后端
./package.sh    # 打包插件
python3 -m http.server 8080

# 在插件商店输入: http://localhost:8080/plugin.zip
```

### 示例 2：React + Python（快速开发）

```bash
cd examples/react-python-plugin
./package.sh    # 打包插件
python3 -m http.server 8080

# 在插件商店输入: http://localhost:8080/plugin.zip
```

### 示例 3：Vue + Node.js（传统组合）

```bash
cd examples/simple-plugin
./package.sh
python3 -m http.server 8080
```

---

## 📦 插件格式

**统一使用 ZIP 格式！**

```
plugin.zip
├── manifest.json      # 必需：插件元数据
├── frontend/          # 必需：前端代码
│   ├── index.js      # 入口文件
│   ├── component.js  # 可选：组件代码
│   └── utils.js      # 可选：工具函数
└── backend/           # 可选：Rust 后端
    └── lib*.dylib     # macOS 动态库
```

### 插件类型

**纯前端插件**（最简单）：

```
plugin.zip
├── manifest.json
└── frontend/
    └── index.js
```

**带第三方库的前端插件**：

```
plugin.zip
├── manifest.json
└── frontend/
    ├── index.js
    └── vendor/
        └── lodash.min.js
```

**带 Rust 后端的插件**（高性能）：

```
plugin.zip
├── manifest.json
├── frontend/
│   └── index.js
└── backend/
    └── lib*.dylib
```

---

## 🚀 JavaScript 插件开发

### 最小插件示例

**1. manifest.json**（元数据）

```json
{
  "id": "com.yourname.hello",
  "name": "Hello World",
  "description": "我的第一个插件",
  "version": "1.0.0",
  "author": {
    "name": "你的名字",
    "email": "your@email.com"
  },
  "category": "tool",
  "keywords": ["hello", "demo"],
  "icon": "M12 4v16m8-8H4",
  "permissions": []
}
```

**2. frontend/index.js**（插件代码）

```javascript
// Vue 组件定义
const component = {
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold">{{ message }}</h1>
      <button 
        @click="count++"
        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        点击次数: {{ count }}
      </button>
    </div>
  `,

  setup() {
    const { ref } = window.Vue
    const message = ref('Hello World!')
    const count = ref(0)

    return { message, count }
  }
}

// 导出组件
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { default: component }
}
```

**3. 打包**

```bash
zip -r plugin.zip manifest.json frontend/
```

### 可用的 API

#### Vue 3 API

```javascript
const { ref, reactive, computed, watch, onMounted, onUnmounted } = window.Vue
```

#### 后端 API（通过 $tauri）

```javascript
setup($tauri) {
  // 哈希计算（无需权限）
  const md5 = await $tauri.hash('data', 'md5')
  const sha256 = await $tauri.hash('data', 'sha256')

  // Base64（无需权限）
  const encoded = await $tauri.base64Encode('Hello')
  const decoded = await $tauri.base64Decode(encoded)

  // 压缩（无需权限）
  const compressed = await $tauri.compress('large data...')
  const decompressed = await $tauri.decompress(compressed)

  // 系统信息（无需权限）
  const info = await $tauri.getSystemInfo()

  // HTTP 请求（需要 network 权限）
  const response = await $tauri.httpRequest({
    url: 'https://api.example.com/data',
    method: 'GET'
  })

  // 剪贴板（需要 clipboard 权限）
  const text = await $tauri.readClipboard()
  await $tauri.writeClipboard('Hello')

  // 通知（需要 notification 权限）
  await $tauri.showNotification('标题', '内容')

  // 文件系统（需要 filesystem 权限）
  const content = await $tauri.readFile('path/to/file.txt')
  await $tauri.writeFile('path/to/file.txt', 'content')
}
```

#### 权限声明

```javascript
metadata: {
  // ...
  permissions: ['network', 'clipboard', 'notification', 'filesystem']
}
```

### 样式（Tailwind CSS）

```javascript
template: `
  <div class="p-4 bg-white dark:bg-gray-900">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
      标题
    </h1>
    <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      按钮
    </button>
  </div>
`
```

### 使用第三方库

**方法 1：打包到插件中**（推荐）

```
plugin.zip
├── manifest.json
└── frontend/
    ├── index.js
    └── vendor/
        └── lodash.min.js
```

在 `index.js` 中导入：

```javascript
// 加载第三方库
const lodash = await import('./vendor/lodash.min.js')

const component = {
  setup() {
    const data = lodash.default.chunk([1, 2, 3, 4], 2)
    // ...
  }
}
```

**方法 2：使用 CDN**（需要 network 权限）

```javascript
const component = {
  async setup() {
    // 动态加载
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js'
    await new Promise((resolve) => {
      script.onload = resolve
      document.head.appendChild(script)
    })

    const data = window._.chunk([1, 2, 3, 4], 2)
    // ...
  }
}
```

### 多文件组织

**项目结构：**

```
my-plugin/
├── manifest.json
└── frontend/
    ├── index.js       # 入口文件
    ├── component.js   # 主组件
    ├── utils.js       # 工具函数
    └── styles.css     # 样式（可选）
```

**index.js**（入口）：

```javascript
import { createComponent } from './component.js'
import { formatData } from './utils.js'

const component = createComponent()

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { default: component }
}
```

**component.js**：

```javascript
export function createComponent() {
  return {
    template: `<div>...</div>`,
    setup() {
      // ...
    }
  }
}
```

**utils.js**：

```javascript
export function formatData(data) {
  return data.toUpperCase()
}
```

### manifest.json 字段说明

```json
{
  "id": "com.yourname.plugin-name", // 必需：唯一 ID（反向域名）
  "name": "插件名称", // 必需：显示名称
  "description": "插件描述", // 必需：简短描述
  "version": "1.0.0", // 必需：版本号（语义化）
  "author": {
    // 必需：作者信息
    "name": "你的名字",
    "email": "your@email.com", // 可选
    "url": "https://yoursite.com" // 可选
  },
  "category": "tool", // 必需：formatter/tool/encoder/custom
  "keywords": ["关键词1", "关键词2"], // 必需：关键词数组
  "icon": "M12 4v16m8-8H4", // 可选：Heroicons SVG path
  "permissions": ["network"], // 可选：权限数组
  "main": "frontend/index.js" // 可选：入口文件（默认 frontend/index.js）
}
```

---

## 🌐 前端框架选择

### 原生 JavaScript（推荐新手）

**优势**：零依赖、最快加载、最小体积

```html
<!DOCTYPE html>
<html>
  <head>
    <title>我的插件</title>
  </head>
  <body>
    <div id="app">
      <h1>Hello World</h1>
      <button onclick="handleClick()">点击</button>
    </div>

    <script>
      function handleClick() {
        alert('Hello!')
      }
    </script>
  </body>
</html>
```

### Vue 3（推荐快速开发）

**优势**：响应式、组件化、易学

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></script>
  </head>
  <body>
    <div id="app">
      <h1>{{ message }}</h1>
      <button @click="count++">点击: {{ count }}</button>
    </div>

    <script>
      const { createApp, ref } = Vue
      createApp({
        setup() {
          const message = ref('Hello Vue!')
          const count = ref(0)
          return { message, count }
        }
      }).mount('#app')
    </script>
  </body>
</html>
```

### React（推荐复杂应用）

**优势**：生态丰富、组件复用

```html
<!DOCTYPE html>
<html>
  <head>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
    ></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body>
    <div id="root"></div>

    <script type="text/babel">
      function App() {
        const [count, setCount] = React.useState(0)
        return (
          <div>
            <h1>Hello React!</h1>
            <button onClick={() => setCount(count + 1)}>点击: {count}</button>
          </div>
        )
      }
      ReactDOM.render(<App />, document.getElementById('root'))
    </script>
  </body>
</html>
```

---

## 🔧 后端语言选择

### Python（推荐数据处理）

**优势**：简单易学、库丰富、适合数据分析

```python
#!/usr/bin/env python3
import sys
import json

def process(args):
    data = json.loads(args)
    result = data['text'].upper()
    return json.dumps({'result': result})

if __name__ == '__main__':
    function_name = sys.argv[1]
    args = sys.argv[2]

    if function_name == 'process':
        print(process(args))
```

### Go（推荐高性能）

**优势**：编译快、执行快、并发强

```go
package main

import (
    "encoding/json"
    "fmt"
    "os"
)

type Input struct {
    Text string `json:"text"`
}

type Output struct {
    Result string `json:"result"`
}

func main() {
    functionName := os.Args[1]
    argsJSON := os.Args[2]

    var input Input
    json.Unmarshal([]byte(argsJSON), &input)

    output := Output{Result: input.Text}
    result, _ := json.Marshal(output)
    fmt.Println(string(result))
}
```

### Node.js（推荐 Web 工具）

**优势**：与前端同语言、npm 生态

```javascript
const args = JSON.parse(process.argv[3])
const result = { result: args.text.toUpperCase() }
console.log(JSON.stringify(result))
```

### Rust（推荐系统工具）

**优势**：最高性能、内存安全

```rust
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct Input { text: String }

#[derive(Serialize)]
struct Output { result: String }

fn main() {
    let args: Input = serde_json::from_str(&std::env::args().nth(2).unwrap()).unwrap();
    let output = Output { result: args.text.to_uppercase() };
    println!("{}", serde_json::to_string(&output).unwrap());
}
```

---

## 🦀 后端开发详解

### 项目结构

```
my-plugin/
├── plugin.js             # 前端代码
├── backend/              # Rust 后端
│   ├── Cargo.toml       # Rust 依赖
│   └── src/
│       └── lib.rs       # Rust 代码
├── package.sh           # 打包脚本
└── serve.sh             # 测试服务器
```

### Cargo.toml

```toml
[package]
name = "my-plugin-backend"
version = "1.0.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

### Rust 代码（lib.rs）

```rust
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct Args {
    data: String,
}

#[derive(Serialize)]
struct Response {
    success: bool,
    result: String,
}

#[no_mangle]
pub extern "C" fn process_data(
    args_ptr: *const u8,
    args_len: usize,
    output_ptr: *mut u8,
    output_len: *mut usize,
) -> i32 {
    // 1. 解析参数
    let args_slice = unsafe {
        std::slice::from_raw_parts(args_ptr, args_len)
    };
    let args_str = match std::str::from_utf8(args_slice) {
        Ok(s) => s,
        Err(_) => return -1,
    };
    let args: Args = match serde_json::from_str(args_str) {
        Ok(a) => a,
        Err(_) => return -2,
    };

    // 2. 处理数据
    let result = args.data.to_uppercase();

    // 3. 构建响应
    let response = Response {
        success: true,
        result,
    };

    // 4. 序列化响应
    let response_json = match serde_json::to_string(&response) {
        Ok(j) => j,
        Err(_) => return -3,
    };

    // 5. 写入输出
    let response_bytes = response_json.as_bytes();
    let buffer_size = unsafe { *output_len };

    if response_bytes.len() > buffer_size {
        return -4;
    }

    unsafe {
        std::ptr::copy_nonoverlapping(
            response_bytes.as_ptr(),
            output_ptr,
            response_bytes.len(),
        );
        *output_len = response_bytes.len();
    }

    0
}
```

### 前端调用后端

```javascript
setup($tauri) {
  const { ref } = window.Vue
  const result = ref('')

  const processData = async () => {
    try {
      const response = await $tauri.callBackend(
        'com.example.my-plugin',
        'process_data',
        { data: 'hello world' }
      )
      result.value = response.result
    } catch (error) {
      console.error('错误:', error)
    }
  }

  return { result, processData }
}
```

### FFI 接口规范

所有后端函数必须遵循：

```rust
#[no_mangle]
pub extern "C" fn function_name(
    args_ptr: *const u8,    // 输入参数（JSON 字符串）
    args_len: usize,        // 输入长度
    output_ptr: *mut u8,    // 输出缓冲区
    output_len: *mut usize, // 输出长度（输入时为缓冲区大小）
) -> i32                    // 返回码（0 = 成功，负数 = 错误）
```

**返回码约定：**

- `0` - 成功
- `-1` - 参数解析失败
- `-2` - JSON 反序列化失败
- `-3` - JSON 序列化失败
- `-4` - 输出缓冲区太小

### 编译和打包

```bash
# 编译 Rust 后端
cd backend
cargo build --release

# 打包成 ZIP
cd ..
./package.sh
```

---

## 🧪 测试插件

### 本地测试

```bash
cd examples/plugin-with-backend
./package.sh    # 生成 plugin.zip
./serve.sh      # 启动服务器

# 在另一个终端
pnpm tauri:dev

# 在插件商店输入
http://localhost:8080/plugin.zip
```

### GitHub Release

1. 打包插件：`./package.sh`
2. 在 GitHub 上创建 Release，上传 `plugin.zip`
3. 在插件商店中输入 Release URL 安装

---

## 💡 最佳实践

### 错误处理

```javascript
try {
  const result = await $tauri.hash(input, 'md5')
} catch (error) {
  console.error('错误:', error.message)
}
```

### 响应式数据

```javascript
const count = ref(0)
const user = reactive({ name: 'John' })
```

### 深色模式

```javascript
class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
```

### 版本号

- `1.0.0` → `1.0.1` - 修复 bug
- `1.0.0` → `1.1.0` - 新增功能
- `1.0.0` → `2.0.0` - 破坏性更新

---

## 🔒 安全限制

### 禁止的操作

- ❌ `eval()`
- ❌ `Function()` 构造器
- ❌ `require()` / `import()`
- ❌ 直接访问 DOM
- ❌ 访问全局变量（除了 `window.Vue`）

---

## 📚 示例

查看完整示例：

- `examples/complete-example.js` - 纯 JavaScript 插件
- `examples/plugin-with-backend/` - 带 Rust 后端的插件

---

## ❓ 常见问题

**Q: 插件可以使用第三方库吗？**  
A: 可以，但需要打包到单个文件中（使用 webpack/rollup）。

**Q: 插件大小有限制吗？**  
A: 建议小于 1MB。

**Q: 如何调试插件？**  
A: 使用浏览器开发者工具的 Console 查看日志。

**Q: 支持哪些平台？**  
A: macOS (x86_64, aarch64)、Linux (x86_64)、Windows (x86_64)

---

**开始创建你的插件吧！** 🚀
