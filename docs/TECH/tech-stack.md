# 技术栈

> 忆流 V2.0 使用的技术组件及说明

---

## 一、核心框架

### 1.1 Electron

**版本**: ^28.0.0
**用途**: 桌面应用框架

| 特性 | 说明 |
|------|------|
| 多平台 | Windows/macOS/Linux |
| Chromium | 基于 Chrome V8 引擎 |
| Node.js | 可使用 npm 包 |
| IPC | 进程间通信 |

**官方文档**: https://www.electronjs.org/

### 1.2 React

**版本**: ^18.2.0
**用途**: UI 框架

| 特性 | 说明 |
|------|------|
| 组件化 | 可复用 UI 组件 |
| 虚拟 DOM | 高效渲染 |
| Hooks | 函数式组件 |
| 生态 | 丰富的第三方库 |

**官方文档**: https://react.dev/

### 1.3 TypeScript

**版本**: ^5.3.0
**用途**: 类型安全

| 特性 | 说明 |
|------|------|
| 类型系统 | 编译时类型检查 |
| 智能提示 | IDE 支持 |
| 重构友好 | 安全重构 |
| 文档化 | 类型即文档 |

**官方文档**: https://www.typescriptlang.org/

---

## 二、构建工具

### 2.1 Vite

**版本**: ^5.0.0
**用途**: 前端构建工具

| 特性 | 说明 |
|------|------|
| 快速启动 | 基于 ESM |
| 热更新 | HMR |
| 插件系统 | 扩展性强 |
| 打包 | Rollup |

**官方文档**: https://vitejs.dev/

### 2.2 electron-builder

**版本**: ^24.0.0
**用途**: 打包发布

| 特性 | 说明 |
|------|------|
| 多平台 | .dmg/.exe/.AppImage |
| 代码签名 | 应用签名 |
| 自动更新 | Squirrel |
| 压缩 | UPX 压缩 |

**官方文档**: https://www.electron.build/

---

## 三、UI 层

### 3.1 Tailwind CSS

**版本**: ^3.4.0
**用途**: 原子化 CSS

| 特性 | 说明 |
|------|------|
| 快速开发 | 原子类 |
| 定制化 | 主题配置 |
| JIT | 即时编译 |
| 响应式 | 内置断点 |

**官方文档**: https://tailwindcss.com/

### 3.2 shadcn/ui

**版本**: latest
**用途**: React 组件库

| 特性 | 说明 |
|------|------|
| 可定制 | 基于 Radix |
| 无障碍 | ARIA 支持 |
| 主题化 | CSS 变量 |
| 代码控制 | 你拥有代码 |

**官方文档**: https://ui.shadcn.com/

### 3.3 Lucide React

**版本**: ^0.300.0
**用途**: 图标库

| 特性 | 说明 |
|------|------|
| 一致性 | 统一风格 |
| 轻量 | SVG |
| 可定制 | 颜色/大小 |
| React 原生 | 组件化 |

**官方文档**: https://lucide.dev/

---

## 四、数据层

### 4.1 LibSQL

**版本**: ^0.14.0 (@libsql/client)
**用途**: 本地数据库

| 特性 | 说明 |
|------|------|
| SQLite 兼容 | 广泛支持 |
| 向量支持 | 原生向量字段 |
| 纯 JS | 无 native 依赖 |
| 事务 | ACID 支持 |

**官方文档**: https://github.com/libsql/libsql/

### 4.2 @xenova/transformers

**版本**: ^2.17.0
**用途**: 本地嵌入模型

| 特性 | 说明 |
|------|------|
| 浏览器可用 | WebAssembly |
| ONNX 推理 | 高性能 |
| 模型缓存 | 本地模型 |
| 零依赖 | 纯 JS |

**官方文档**: https://github.com/xenova/transformers.js

---

## 五、状态管理

### 5.1 Zustand

**版本**: ^4.4.0
**用途**: 轻量状态管理

| 特性 | 说明 |
|------|------|
| 极简 | 无 Provider |
| TypeScript | 完整支持 |
| DevTools | 调试支持 |
| 中间件 | 扩展性强 |

**官方文档**: https://zustand.docs.pmnd.rs/

---

## 六、工具库

### 6.1 date-fns

**版本**: ^3.0.0
**用途**: 日期处理

| 特性 | 说明 |
|------|------|
| 轻量 | 模块化导入 |
| Tree-shaking | 按需打包 |
| 不可变 | 纯函数 |
| 国际化 | 多语言支持 |

**官方文档**: https://date-fns.org/

### 6.2 clsx

**版本**: ^2.0.0
**用途**: 条件类名

```typescript
import { clsx } from 'clsx';

clsx('foo', isActive && 'bar'); // 'foo bar'
```

**官方文档**: https://github.com/lukeed/clsx

---

## 七、开发工具

### 7.1 Vitest

**版本**: ^1.1.0
**用途**: 单元测试

| 特性 | 说明 |
|------|------|
| Vite 集成 | 快速 |
| TypeScript | 原生支持 |
| Chai | 断言库 |
| 覆盖率 | 内置覆盖 |

**官方文档**: https://vitest.dev/

### 7.2 ESLint

**版本**: ^8.55.0
**用途**: 代码检查

| 规则集 | 说明 |
|--------|------|
| @typescript-eslint | TS 支持 |
| eslint-plugin-react | React 规则 |
| eslint-plugin-react-hooks | Hooks 规则 |
| prettier | 代码格式化 |

### 7.3 Prettier

**版本**: ^3.1.0
**用途**: 代码格式化

| 配置 | 值 |
|------|-----|
| 单引号 | true |
| 分号 | false |
| 行宽 | 100 |
| Tab 宽度 | 2 |

---

## 八、依赖版本 (package.json)

```json
{
  "dependencies": {
    "electron": "^28.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@libsql/client": "^0.14.0",
    "@xenova/transformers": "^2.17.0",
    "zustand": "^4.4.0",
    "date-fns": "^3.0.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "electron-builder": "^24.0.0",
    "vitest": "^1.1.0",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 九、环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `OPENAI_API_KEY` | OpenAI API Key | - |
| `OPENAI_BASE_URL` | OpenAI API 地址 | https://api.openai.com/v1 |
| `YILIU_DATA_PATH` | 数据目录 | ./data |
| `NODE_ENV` | 环境 | development |

---

*最后更新: 2026-03-23*