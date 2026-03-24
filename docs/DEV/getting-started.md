# 快速开始

> 忆流 V2.0 开发环境搭建指南

---

## 一、环境要求

### 1.1 系统要求

| 要求 | 版本 |
|------|------|
| Node.js | >= 18.0.0 |
| npm / pnpm | 最新稳定版 |
| 操作系统 | macOS / Windows / Linux |

### 1.2 推荐工具

| 工具 | 说明 |
|------|------|
| VS Code | 代码编辑器 |
| VS Code Extension: ESLint | 代码检查 |
| VS Code Extension: Prettier | 代码格式化 |

---

## 二、项目结构

```
yiliu/
├── src/
│   ├── main/                 # Electron 主进程
│   │   ├── index.ts          # 入口
│   │   ├── window.ts         # 窗口管理
│   │   ├── ipc.ts            # IPC 处理
│   │   ├── tray.ts           # 托盘
│   │   ├── menu.ts           # 菜单
│   │   └── shortcuts.ts      # 快捷键
│   ├── renderer/             # React 前端
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── stores/
│   ├── core/                 # 核心业务
│   │   ├── services/
│   │   ├── storage/
│   │   └── types/
│   └── preload/              # 预加载脚本
│       └── index.ts
├── docs/                     # 文档
├── electron-builder.json     # 打包配置
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── vitest.config.ts
```

---

## 三、搭建步骤

### 3.1 克隆项目

```bash
git clone https://github.com/DamingDong/yiliu.git
cd yiliu
```

### 3.2 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 3.3 配置环境变量（可选）

创建 `.env.local` 文件：

```bash
# 可选配置
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
YILIU_DATA_PATH=./data
```

### 3.4 启动开发服务器

```bash
# 启动 Electron + React
pnpm dev
```

应用将自动打开。

---

## 四、开发命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm build:renderer` | 仅构建前端 |
| `pnpm build:main` | 仅构建主进程 |
| `pnpm test` | 运行测试 |
| `pnpm lint` | 代码检查 |
| `pnpm lint:fix` | 自动修复 |
| `pnpm typecheck` | 类型检查 |

---

## 五、开发说明

### 5.1 主进程开发

主进程代码在 `src/main/` 目录，使用 CommonJS 规范。

```typescript
// src/main/index.ts
import { app, BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: '忆流',
  });
  
  // 加载页面
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile('dist/renderer/index.html');
  }
}

app.whenReady().then(createWindow);
```

### 5.2 渲染进程开发

渲染进程代码在 `src/renderer/` 目录，使用 ES Module 规范。

```tsx
// src/renderer/App.tsx
import { useState } from 'react';
import { NoteList } from './components/notes/note-list';
import { NoteInput } from './components/notes/note-input';

export function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  
  const handleSubmit = async (content: string) => {
    const note = await window.api.createNote(content);
    setNotes([note, ...notes]);
  };
  
  return (
    <div>
      <NoteList notes={notes} />
      <NoteInput onSubmit={handleSubmit} />
    </div>
  );
}
```

### 5.3 IPC 通信

主进程和渲染进程通过 IPC 通信。

```typescript
// src/preload/index.ts (暴露 API)
contextBridge.exposeInMainWorld('api', {
  createNote: (content: string) => ipcRenderer.invoke('note:create', content),
  getNotes: () => ipcRenderer.invoke('note:list'),
  searchNotes: (query: string) => ipcRenderer.invoke('search:semantic', query),
});

// src/main/ipc.ts (处理 IPC)
ipcMain.handle('note:create', async (event, content) => {
  const note = await noteService.create(content);
  return note;
});
```

---

## 六、调试

### 6.1 主进程调试

使用 VS Code 调试：

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}",
      "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
      "runtimeArgs": ["."],
      "console": "integratedTerminal"
    }
  ]
}
```

### 6.2 渲染进程调试

使用 Chrome DevTools：

1. 开发模式下按 `Cmd/Ctrl + Shift + I`
2. 或右键点击窗口选择"检查元素"

### 6.3 日志

主进程日志输出到终端：

```typescript
import { log } from 'electron-log';

log.info('App started');
log.error('Error occurred', error);
```

---

## 七、构建发布

### 7.1 构建应用

```bash
pnpm build
```

构建产物在 `release/` 目录：

```
release/
├── mac/                      # macOS
│   ├── yiliu.dmg
│   └── yiliu.app
├── win/                      # Windows
│   └── yiliu.exe
└── linux/                   # Linux
    └── yiliu.AppImage
```

### 7.2 配置应用信息

编辑 `electron-builder.json`：

```json
{
  "appId": "com.yiliu.app",
  "productName": "忆流",
  "directories": {
    "output": "release"
  },
  "mac": {
    "category": "public.app-category.productivity",
    "target": ["dmg"]
  },
  "win": {
    "target": ["nsis"]
  },
  "linux": {
    "target": ["AppImage"]
  }
}
```

---

## 八、常见问题

### 8.1 依赖安装失败

```bash
# 清除缓存
rm -rf node_modules
npm cache clean --force

# 重新安装
pnpm install
```

### 8.2 Electron 启动失败

检查 Node.js 版本：

```bash
node --version  # >= 18.0.0
```

### 8.3 端口被占用

默认端口 5173，如被占用：

```bash
# 设置其他端口
PORT=3000 pnpm dev
```

---

## 九、参考资源

| 资源 | 链接 |
|------|------|
| Electron 文档 | https://www.electronjs.org/ |
| React 文档 | https://react.dev/ |
| Vite 文档 | https://vitejs.dev/ |
| Electron Builder | https://www.electron.build/ |

---

*最后更新: 2026-03-23*