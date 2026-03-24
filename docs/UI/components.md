# 组件规范

> 忆流 V2.0 UI 组件库和使用指南

---

## 一、组件概览

| Component | 说明 | 状态 |
|------|------|------|
| Button | 按钮 | ✅ |
| Input | 输入框 | ✅ |
| Textarea | 多行文本 | ✅ |
| Card | 笔记卡片 | ✅ |
| NoteList | 笔记列表 | ✅ |
| SearchBar | 搜索栏 | ✅ |
| Sidebar | 侧边栏 | ✅ |
| Toast | 提示 | ✅ |
| Modal | 模态框 | ✅ |
| Skeleton | 骨架屏 | ✅ |
| WriteModeBar | 写笔记模式状态栏 | 🆕 新增 |
| TagBadge | 标签徽章（手动/AI推荐） | 🆕 新增 |

---

## 二、基础组件

### 2.1 Button

```tsx
import { Button } from '@/components/ui/button';

// 变体
<Button variant="primary">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="destructive">危险按钮</Button>

// 尺寸
<Button size="sm">小</Button>
<Button size="md">中</Button>
<Button size="lg">大</Button>

// 状态
<Button loading>加载中</Button>
<Button disabled>禁用</Button>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | primary \| secondary \| ghost \| destructive | primary | 样式变体 |
| size | sm \| md \| lg | md | 尺寸 |
| loading | boolean | false | 加载状态 |
| disabled | boolean | false | 禁用状态 |

### 2.2 Input

```tsx
import { Input } from '@/components/ui/input';

<Input placeholder="输入你的想法..." />
<Input error="输入有误" />
<Input disabled />
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| placeholder | string | - | 占位文本 |
| error | string | - | 错误信息 |
| disabled | boolean | false | 禁用状态 |

### 2.3 Textarea

```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea 
  placeholder="输入你的想法..." 
  rows={3}
  autoFocus
/>
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| placeholder | string | - | 占位文本 |
| rows | number | 3 | 行数 |
| autoFocus | boolean | false | 自动聚焦 |
| maxLength | number | - | 最大长度 |

---

## 三、业务组件

### 3.1 NoteCard

笔记卡片组件

```tsx
import { NoteCard } from '@/components/notes/note-card';

<NoteCard 
  note={note}
  onClick={() => handleClick(note.id)}
  onDelete={() => handleDelete(note.id)}
/>
```

**样式**:

```
┌────────────────────────────────────────────────┐
│ 📝 笔记预览内容...                    📅 时间   │
│ 🏷️ #标签1 #标签2                              │
└────────────────────────────────────────────────┘
```

**属性**:

| 属性 | 类型 | 说明 |
|------|------|------|
| note | Note | 笔记数据 |
| onClick | () => void | 点击回调 |
| onDelete | () => void | 删除回调 |

### 3.2 NoteList

笔记列表组件

```tsx
import { NoteList } from '@/components/notes/note-list';

<NoteList 
  notes={notes}
  loading={loading}
  onNoteClick={handleClick}
  onNoteDelete={handleDelete}
/>
```

**状态**:

| 状态 | 展示 |
|------|------|
| 加载中 | Skeleton 骨架屏 |
| 空 | 空状态插画 |
| 有数据 | 笔记列表 |

### 3.3 NoteInput

笔记输入组件

```tsx
import { NoteInput } from '@/components/notes/note-input';

<NoteInput 
  onSubmit={handleSubmit}
  placeholder="输入你的想法..."
  autoFocus
/>
```

**样式**:

```
┌─────────────────────────────────────────────────────────┐
│ 输入你的想法...                                    [发送]│
└─────────────────────────────────────────────────────────┘
```

**行为**:

| 行为 | 说明 |
|------|------|
| Enter | 提交（Shift+Enter 换行） |
| 点击发送 | 提交 |
| 空内容 | 禁用发送按钮 |

### 3.4 SearchBar

搜索栏组件

```tsx
import { SearchBar } from '@/components/search/search-bar';

<SearchBar 
  onSearch={handleSearch}
  placeholder="搜索笔记..."
  autoFocus
/>
```

**样式**:

```
┌────────────────────────────────────────────────┐
│ 🔍  搜索笔记...                          ✕    │
└────────────────────────────────────────────────┘
```

---

## 四、布局组件

### 4.1 Sidebar

侧边栏组件

```tsx
import { Sidebar } from '@/components/layout/sidebar';

<Sidebar 
  activeRoute="/"
  onNavigate={handleNavigate}
/>
```

**菜单项**:

```typescript
const menuItems = [
  { icon: FileText, label: '笔记', route: '/' },
  { icon: Search, label: '搜索', route: '/search' },
  { icon: Settings, label: '设置', route: '/settings' },
];
```

### 4.2 Header

顶部栏组件

```tsx
import { Header } from '@/components/layout/header';

<Header 
  title="忆流"
  showSearch
  showSettings
/>
```

---

## 五、反馈组件

### 5.1 Toast

提示组件

```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// 成功
toast.success('笔记已保存');

// 错误
toast.error('保存失败');

// 提示
toast.info('提示信息');
```

### 5.2 Modal

模态框组件

```tsx
import { Modal } from '@/components/ui/modal';

<Modal 
  open={isOpen}
  onClose={handleClose}
  title="确认删除"
>
  确定要删除这条笔记吗？
  <Modal.Footer>
    <Button variant="ghost" onClick={handleClose}>取消</Button>
    <Button variant="destructive" onClick={handleConfirm}>删除</Button>
  </Modal.Footer>
</Modal>
```

### 5.3 ConfirmDialog

确认对话框

```tsx
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

<ConfirmDialog
  open={isOpen}
  title="确认删除"
  description="确定要删除这条笔记吗？此操作不可撤销。"
  confirmText="删除"
  cancelText="取消"
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>
```

---

## 六、使用示例

### 6.1 笔记页面

```tsx
import { NoteList } from '@/components/notes/note-list';
import { NoteInput } from '@/components/notes/note-input';
import { useNotes } from '@/hooks/use-notes';

export function NotesPage() {
  const { notes, loading, createNote } = useNotes();
  
  return (
    <div className="flex flex-col h-full">
      <Header title="忆流" />
      
      <div className="flex-1 overflow-auto p-4">
        <NoteList 
          notes={notes}
          loading={loading}
          onNoteClick={(id) => navigate(`/note/${id}`)}
        />
      </div>
      
      <div className="p-4 border-t">
        <NoteInput onSubmit={createNote} />
      </div>
    </div>
  );
}
```

### 6.2 搜索页面

```tsx
import { SearchBar } from '@/components/search/search-bar';
import { NoteList } from '@/components/notes/note-list';
import { useSearch } from '@/hooks/use-search';

export function SearchPage() {
  const { query, results, searching, search } = useSearch();
  
  return (
    <div className="p-4">
      <SearchBar 
        onSearch={search}
        placeholder="搜索笔记..."
      />
      
      {query && (
        <p className="mt-4 text-sm text-muted">
          找到 {results.length} 条相关笔记
        </p>
      )}
      
      <NoteList notes={results} loading={searching} />
    </div>
  );
}
```

---

## 七、主题定制

### 7.1 CSS 变量

```css
/* 亮色主题 */
:root {
  --color-bg: #ffffff;
  --color-text: #111827;
  --color-primary: #6366f1;
}

/* 暗色主题 */
.dark {
  --color-bg: #111827;
  --color-text: #ffffff;
  --color-primary: #818cf8;
}
```

### 7.2 组件样式覆盖

```tsx
// 通过 className 覆盖
<Button className="bg-red-500 hover:bg-red-600">
  自定义按钮
</Button>

// 通过 CSS 变量
<div style={{ '--color-primary': '#ff6b6b' } as React.CSSProperties}>
  <Button>自定义颜色</Button>
</div>
```

---

## 八、新增组件（V2.0 优化）

### 8.1 WriteModeBar 写笔记模式状态栏

显示当前是「新建」还是「续写」模式

```tsx
import { WriteModeBar } from '@/components/write/write-mode-bar';

<WriteModeBar 
  mode="new" | "continue"
  noteTitle="笔记标题"
  onSave={handleSave}
  onDiscard={handleDiscard}
/>
```

**样式**:

```
🆕 新建笔记                    [放弃] [保存]
```

或

```
✏️ 续写：项目需求分析              [放弃] [保存]
```

**属性**:

| 属性 | 类型 | 说明 |
|------|------|------|
| mode | 'new' \| 'continue' | 当前模式 |
| noteTitle | string | 续写时的笔记标题 |
| onSave | () => void | 保存回调 |
| onDiscard | () => void | 放弃回调 |

### 8.2 TagBadge 标签徽章

区分手动标签和 AI 推荐标签

```tsx
import { TagBadge } from '@/components/tags/tag-badge';

// 手动标签
<TagBadge type="manual" tag="技术" />

// AI 推荐标签
<TagBadge type="ai-recommend" tag="项目" onAccept={acceptTag} onIgnore={ignoreTag} />
```

**样式**:

| 类型 | 视觉 |
|------|------|
| manual | 深色背景 (`#eef2ff`)，深色文字 (`#6366f1`) |
| ai-recommend | 浅色背景 (`#f1f5f9`)，虚线边框，右侧带 × 可关闭 |

**属性**:

| 属性 | 类型 | 说明 |
|------|------|------|
| type | 'manual' \| 'ai-recommend' | 标签类型 |
| tag | string | 标签文本 |
| onAccept | () => void | 采纳 AI 推荐（仅 ai-recommend） |
| onIgnore | () => void | 忽略 AI 推荐（仅 ai-recommend） |

---

*最后更新: 2026-03-25*