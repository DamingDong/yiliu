# 编码规范

> 忆流 V2.0 代码风格和最佳实践

---

## 一、代码风格

### 1.1 通用规范

| 规则 | 说明 |
|------|------|
| 缩进 | 2 空格 |
| 行宽 | 100 字符 |
| 引号 | 单引号（字符串） |
| 分号 | 不使用 |
| 逗号 | 尾随逗号 |
| 空行 | 单行空行分隔逻辑块 |

### 1.2 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `NoteCard.tsx` |
| 工具函数 | kebab-case | `date-utils.ts` |
| 类型/接口 | PascalCase | `NoteType.ts` |
| 测试文件 | `*.test.ts` | `note.test.ts` |
| 样式文件 | 同名 `.module.css` | `Button.module.css` |

### 1.3 导入顺序

```typescript
// 1. React / 框架
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. 第三方库
import { clsx } from 'clsx';
import { format } from 'date-fns';

// 3. 内部模块
import { Button } from '@/components/ui/button';
import { useNotes } from '@/hooks/use-notes';

// 4. 类型定义
import type { Note } from '@/core/types';

// 5. 常量/配置
import { API_BASE } from '@/config/constants';
```

---

## 二、TypeScript 规范

### 2.1 类型定义

```typescript
// 使用 interface 定义对象类型
interface Note {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

// 使用 type 定义联合类型/别名
type NoteSource = 'text' | 'voice' | 'link';

// 使用 enum 定义枚举
enum NoteLayer {
  L0 = 'L0',
  L1 = 'L1',
  L2 = 'L2',
}

// 避免使用 any，使用 unknown 替代
function parseJSON(input: string): unknown {
  return JSON.parse(input);
}
```

### 2.2 函数定义

```typescript
// 使用箭头函数
const addNote = (content: string): Note => {
  return { id: generateId(), content, createdAt: Date.now() };
};

// 使用 async/await
async function fetchNotes(): Promise<Note[]> {
  const response = await api.get('/notes');
  return response.data;
}

// 显式返回类型
function calculateScore(a: number, b: number): number {
  return (a + b) / 2;
}
```

### 2.3 组件定义

```tsx
// 函数式组件 + 显式类型
interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onDelete?: () => void;
}

export function NoteCard({ note, onClick, onDelete }: NoteCardProps) {
  return (
    <div onClick={onClick}>
      <p>{note.content}</p>
      {onDelete && <button onClick={onDelete}>删除</button>}
    </div>
  );
}
```

---

## 三、React 规范

### 3.1 Hooks 使用

```tsx
// 组件顶部声明 hooks
function NoteEditor({ noteId }: NoteEditorProps) {
  // State
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Effects
  useEffect(() => {
    loadNote(noteId);
  }, [noteId]);
  
  // Callbacks
  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      await saveNote(noteId, content);
    } finally {
      setLoading(false);
    }
  }, [noteId, content]);
  
  return <div>...</div>;
}
```

### 3.2 Props 传递

```tsx
// 避免不必要的 props
// 好的: 传递必要的数据
<NoteCard note={note} />

// 避免: 传递过多 props
// <NoteCard id={note.id} content={note.content} createdAt={note.createdAt} />

// 使用展开运算符传递 props
const noteCardProps = { onClick, onDelete, isSelected };
<NoteCard {...noteCardProps} note={note} />
```

### 3.3 条件渲染

```tsx
// 使用短路运算
{isLoading && <Spinner />}

// 使用三元运算符
{isEmpty ? <EmptyState /> : <NoteList notes={notes} />}

// 避免嵌套三元
// 提取为组件或变量
const emptyMessage = isLoading 
  ? '加载中...' 
  : hasError 
    ? '加载失败' 
    : '暂无数据';
```

---

## 四、样式规范

### 4.1 Tailwind CSS

```tsx
// 使用 clsx 组合类名
import { clsx } from 'clsx';

<button
  className={clsx(
    'px-4 py-2 rounded-lg font-medium transition-colors',
    'bg-indigo-500 text-white hover:bg-indigo-600',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    isActive && 'ring-2 ring-indigo-500'
  )}
>
  按钮
</button>
```

### 4.2 CSS Modules

```css
/* NoteCard.module.css */
.container {
  padding: 16px;
  border-radius: 12px;
  background: var(--color-bg);
}

.title {
  font-size: 16px;
  font-weight: 500;
}
```

```tsx
import styles from './NoteCard.module.css';

export function NoteCard({ note }: NoteCardProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{note.content}</h3>
    </div>
  );
}
```

---

## 五、错误处理

### 5.1 同步函数

```typescript
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error('除数不能为零');
  }
  return a / b;
}
```

### 5.2 异步函数

```typescript
async function fetchNote(id: string): Promise<Note> {
  try {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new Error(`笔记 ${id} 不存在`);
    }
    throw new Error('获取笔记失败');
  }
}
```

### 5.3 组件错误边界

```tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, info: ErrorInfo) {
    log.error('Error:', error, info);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
```

---

## 六、日志规范

### 6.1 日志级别

| 级别 | 用途 | 示例 |
|------|------|------|
| debug | 开发调试 | `log.debug('API called')` |
| info | 一般信息 | `log.info('App started')` |
| warn | 警告信息 | `log.warn('Deprecated API')` |
| error | 错误信息 | `log.error('Failed to save')` |

### 6.2 日志格式

```typescript
// 好的: 结构化日志
log.info('Note created', { id: note.id, length: note.content.length });

// 避免: 字符串拼接
log.info('Note created: ' + note.id);
```

---

## 七、Git 规范

### 7.1 分支命名

| 类型 | 格式 | 示例 |
|------|------|------|
| 功能 | feature/功能名 | feature/note-search |
| 修复 | fix/问题描述 | fix/search-performance |
| 重构 | refactor/范围 | refactor/db-layer |
| 文档 | docs/范围 | docs/api-reference |

### 7.2 提交信息

```
<type>(<scope>): <subject>

<body>

<footer>
```

示例：

```
feat(notes): 添加笔记搜索功能

- 实现语义搜索
- 添加关键词回退
- 优化搜索性能

Closes #123
```

类型：`feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore`

### 7.3 Commit Hooks

项目使用 husky + lint-staged：

```bash
# .husky/commit-msg
pnpm exec commitlint --edit $1

# .husky/pre-commit
pnpm exec lint-staged
```

---

## 八、测试规范

### 8.1 测试文件命名

```bash
# 单元测试
src/core/storage/db.test.ts

# 组件测试
src/components/note-card.test.tsx
```

### 8.2 测试结构 (AAA)

```typescript
describe('NoteService', () => {
  describe('createNote', () => {
    it('should create a note with correct properties', async () => {
      // Arrange
      const content = 'Test note';
      
      // Act
      const note = await createNote(content);
      
      // Assert
      expect(note.content).toBe(content);
      expect(note.id).toBeDefined();
      expect(note.createdAt).toBeDefined();
    });
    
    it('should throw error for empty content', async () => {
      await expect(createNote('')).rejects.toThrow('Content is required');
    });
  });
});
```

---

## 九、Lint 配置

### 9.1 ESLint 规则

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react/prop-types": "off"
  }
}
```

### 9.2 Prettier 配置

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

---

## 十、代码审查清单

| 检查项 | 说明 |
|--------|------|
| 类型 | 所有函数有返回类型 |
| 错误处理 | 关键路径有 try/catch |
| 注释 | 复杂逻辑有注释 |
| 性能 | 无明显性能问题 |
| 测试 | 核心逻辑有测试 |
| 命名 | 命名清晰一致 |
| 安全 | 无硬编码敏感信息 |

---

*最后更新: 2026-03-23*