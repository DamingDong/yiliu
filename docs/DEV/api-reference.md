# API 参考

> 忆流 V2.0 模块接口说明

---

## 一、主进程 API

### 1.1 window.api

通过 preload 暴露给渲染进程的 API。

```typescript
// src/preload/index.ts
contextBridge.exposeInMainWorld('api', {
  // 笔记操作
  createNote: (content: string) => ipcRenderer.invoke('note:create', content),
  getNotes: (limit?: number) => ipcRenderer.invoke('note:list', limit),
  getNote: (id: string) => ipcRenderer.invoke('note:get', id),
  updateNote: (id: string, content: string) => ipcRenderer.invoke('note:update', id, content),
  deleteNote: (id: string) => ipcRenderer.invoke('note:delete', id),
  
  // 搜索操作
  searchSemantic: (query: string) => ipcRenderer.invoke('search:semantic', query),
  searchKeyword: (query: string) => ipcRenderer.invoke('search:keyword', query),
  
  // 版本操作
  getVersions: (noteId: string) => ipcRenderer.invoke('version:list', noteId),
  revertVersion: (noteId: string, version: number) => ipcRenderer.invoke('version:revert', noteId, version),
  
  // 导出
  exportMarkdown: () => ipcRenderer.invoke('export:markdown'),
  
  // 统计
  getStats: () => ipcRenderer.invoke('stats:get'),
});
```

---

## 二、IPC 通道

### 2.1 笔记通道

| 通道 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `note:create` | content: string | Note | 创建笔记 |
| `note:list` | limit?: number | Note[] | 获取笔记列表 |
| `note:get` | id: string | Note \| null | 获取单条笔记 |
| `note:update` | id, content | Note \| null | 更新笔记 |
| `note:delete` | id: string | boolean | 删除笔记 |

### 2.2 搜索通道

| 通道 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `search:semantic` | query: string | SearchResult[] | 语义搜索 |
| `search:keyword` | query: string | Note[] | 关键词搜索 |

### 2.3 版本通道

| 通道 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `version:list` | noteId: string | Version[] | 获取版本列表 |
| `version:revert` | noteId, version | Note \| null | 恢复到指定版本 |

### 2.4 其他通道

| 通道 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `export:markdown` | - | string | 导出为 Markdown |
| `stats:get` | - | Stats | 获取统计信息 |

---

## 三、数据类型

### 3.1 Note

```typescript
interface Note {
  id: string;
  content: string;
  layer: 'L0' | 'L1' | 'L2';
  source: 'text' | 'voice' | 'link';
  url?: string;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  aiEnhanced?: AIEnhanced;
  deleted: boolean;
}

interface AIEnhanced {
  summary?: string;
  tags?: string[];
  keywords?: string[];
}
```

### 3.2 SearchResult

```typescript
interface SearchResult {
  note: Note;
  score: number;           // 0-1 相似度
  matchType: 'semantic' | 'keyword';
}
```

### 3.3 Version

```typescript
interface Version {
  id: string;
  noteId: string;
  content: string;
  version: number;
  isMarked: boolean;
  markNote?: string;
  createdAt: number;
}
```

### 3.4 Stats

```typescript
interface Stats {
  totalNotes: number;
  vectorizedNotes: number;
  avgWordCount: number;
}
```

---

## 四、核心服务

### 4.1 NoteService

```typescript
// src/core/services/note.ts

class NoteService {
  async create(input: CreateNoteInput): Promise<Note>;
  async getById(id: string): Promise<Note | null>;
  async getAll(limit?: number): Promise<Note[]>;
  async update(id: string, content: string): Promise<Note | null>;
  async delete(id: string): Promise<boolean>;
}

interface CreateNoteInput {
  content: string;
  source?: 'text' | 'voice' | 'link';
  url?: string;
}
```

### 4.2 SearchService

```typescript
// src/core/services/search.ts

class SearchService {
  async semantic(query: string, limit?: number): Promise<SearchResult[]>;
  async keyword(query: string): Promise<Note[]>;
  async hybrid(query: string): Promise<SearchResult[]>;
}
```

### 4.3 VectorService

```typescript
// src/core/services/vector.ts

class VectorService {
  async initialize(): Promise<void>;
  async vectorize(noteId: string, content: string): Promise<void>;
  async search(query: string, limit?: number): Promise<VectorMatch[]>;
  async remove(noteId: string): Promise<void>;
}
```

---

## 五、React Hooks

### 5.1 useNotes

```typescript
// src/renderer/hooks/use-notes.ts

function useNotes(): {
  notes: Note[];
  loading: boolean;
  error: Error | null;
  create: (content: string) => Promise<Note>;
  update: (id: string, content: string) => Promise<Note | null>;
  remove: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}
```

### 5.2 useSearch

```typescript
// src/renderer/hooks/use-search.ts

function useSearch(): {
  query: string;
  results: SearchResult[];
  searching: boolean;
  search: (query: string) => Promise<void>;
  clear: () => void;
}
```

### 5.3 useNote

```typescript
// src/renderer/hooks/use-note.ts

function useNote(id: string): {
  note: Note | null;
  loading: boolean;
  error: Error | null;
  update: (content: string) => Promise<Note | null>;
}
```

### 5.4 useToast

```typescript
// src/renderer/hooks/use-toast.ts

function useToast(): {
  toast: (options: ToastOptions) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}
```

---

## 六、使用示例

### 6.1 创建笔记

```tsx
import { useNotes } from '@/hooks/use-notes';

function NoteInput() {
  const { create } = useNotes();
  const [content, setContent] = useState('');
  
  const handleSubmit = async () => {
    await create(content);
    setContent('');
  };
  
  return (
    <div>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <button onClick={handleSubmit}>发送</button>
    </div>
  );
}
```

### 6.2 搜索笔记

```tsx
import { useSearch } from '@/hooks/use-search';

function SearchPage() {
  const { query, results, searching, search } = useSearch();
  
  return (
    <div>
      <input 
        value={query}
        onChange={e => search(e.target.value)}
        placeholder="搜索..."
      />
      {results.map(result => (
        <NoteCard key={result.note.id} note={result.note} />
      ))}
    </div>
  );
}
```

### 6.3 IPC 调用

```typescript
// 渲染进程
const notes = await window.api.getNotes(20);

// 主进程处理 (ipcMain.handle)
ipcMain.handle('note:list', async (event, limit = 20) => {
  return await noteService.getAll(limit);
});
```

---

## 七、错误码

| 错误码 | 说明 |
|--------|------|
| `NOTE_NOT_FOUND` | 笔记不存在 |
| `NOTE_CREATE_FAILED` | 创建笔记失败 |
| `NOTE_UPDATE_FAILED` | 更新笔记失败 |
| `NOTE_DELETE_FAILED` | 删除笔记失败 |
| `SEARCH_FAILED` | 搜索失败 |
| `VECTOR_FAILED` | 向量化失败 |
| `DB_ERROR` | 数据库错误 |

---

*最后更新: 2026-03-23*