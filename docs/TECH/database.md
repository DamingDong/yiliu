# 数据库设计

> 忆流 V2.0 数据模型和表结构

---

## 一、数据库概述

| 属性 | 说明 |
|------|------|
| 数据库 | LibSQL (SQLite 兼容) |
| 位置 | 用户数据目录 |
| 文件 | `yiliu.db` |
| 备份 | 导出为 JSON |

---

## 二、表结构

### 2.1 笔记表 (notes)

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  layer TEXT DEFAULT 'L0',
  source TEXT DEFAULT 'text',
  url TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  wordCount INTEGER DEFAULT 0,
  aiEnhanced TEXT,
  embedding BLOB,
  deleted INTEGER DEFAULT 0
);

CREATE INDEX idx_notes_created ON notes(createdAt DESC);
CREATE INDEX idx_notes_updated ON notes(updatedAt DESC);
CREATE INDEX idx_notes_deleted ON notes(deleted);
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | UUID 主键 |
| content | TEXT | 笔记内容 |
| layer | TEXT | 层级 (L0/L1/L2) |
| source | TEXT | 来源: text/voice/link |
| url | TEXT | 链接 URL (如果有) |
| createdAt | INTEGER | 创建时间戳 |
| updatedAt | INTEGER | 更新时间戳 |
| wordCount | INTEGER | 字数统计 |
| aiEnhanced | TEXT | AI 增强数据 (JSON) |
| embedding | BLOB | 向量数据 |
| deleted | INTEGER | 软删除标记 |

### 2.2 笔记版本表 (note_versions)

```sql
CREATE TABLE note_versions (
  id TEXT PRIMARY KEY,
  noteId TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL,
  isMarked INTEGER DEFAULT 0,
  markNote TEXT,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (noteId) REFERENCES notes(id)
);

CREATE INDEX idx_versions_note ON note_versions(noteId);
CREATE INDEX idx_versions_created ON note_versions(createdAt DESC);
```

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | UUID 主键 |
| noteId | TEXT | 关联笔记 ID |
| content | TEXT | 版本内容 |
| version | INTEGER | 版本号 |
| isMarked | INTEGER | 是否标记 |
| markNote | TEXT | 标记备注 |
| createdAt | INTEGER | 创建时间 |

### 2.3 向量索引 (向量存储在 notes 表的 embedding 字段)

```sql
-- 向量索引（可选，用于优化查询）
CREATE INDEX IF NOT EXISTS idx_notes_embedding ON notes(embedding);
```

---

## 三、数据模型

### 3.1 Note 类型

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
  embedding?: number[];
  deleted: boolean;
}

interface AIEnhanced {
  summary?: string;
  tags?: string[];
  keywords?: string[];
}
```

### 3.2 NoteVersion 类型

```typescript
interface NoteVersion {
  id: string;
  noteId: string;
  content: string;
  version: number;
  isMarked: boolean;
  markNote?: string;
  createdAt: number;
}
```

### 3.3 SearchResult 类型

```typescript
interface SearchResult {
  note: Note;
  score: number;
  matchType: 'semantic' | 'keyword';
}
```

---

## 四、CRUD 操作

### 4.1 创建笔记

```typescript
async function createNote(input: {
  content: string;
  source?: string;
  url?: string;
}): Promise<Note> {
  const id = crypto.randomUUID();
  const now = Date.now();
  
  await db.execute({
    sql: `INSERT INTO notes (id, content, source, url, createdAt, updatedAt, wordCount)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, input.content, input.source || 'text', input.url, now, now, input.content.length]
  });
  
  // 创建初始版本
  await createVersion(id, input.content, 1);
  
  // 异步向量化
  vectorizeNote(id, input.content);
  
  return getNote(id);
}
```

### 4.2 查询笔记

```typescript
async function getNote(id: string): Promise<Note | null> {
  const result = await db.execute({
    sql: `SELECT * FROM notes WHERE id = ? AND deleted = 0`,
    args: [id]
  });
  
  if (result.rows.length === 0) return null;
  return rowToNote(result.rows[0]);
}
```

### 4.3 更新笔记

```typescript
async function updateNote(id: string, content: string): Promise<Note | null> {
  const note = await getNote(id);
  if (!note) return null;
  
  const now = Date.now();
  const newVersion = (await getVersions(id)).length + 1;
  
  await db.execute({
    sql: `UPDATE notes SET content = ?, updatedAt = ?, wordCount = ?
          WHERE id = ?`,
    args: [content, now, content.length, id]
  });
  
  await createVersion(id, content, newVersion);
  
  // 重新向量化
  vectorizeNote(id, content);
  
  return getNote(id);
}
```

### 4.4 删除笔记

```typescript
async function deleteNote(id: string): Promise<boolean> {
  const result = await db.execute({
    sql: `UPDATE notes SET deleted = 1 WHERE id = ?`,
    args: [id]
  });
  
  return result.rowsAffected > 0;
}
```

### 4.5 搜索笔记

```typescript
async function searchNotes(query: string): Promise<Note[]> {
  const result = await db.execute({
    sql: `SELECT * FROM notes 
          WHERE deleted = 0 
          AND content LIKE ?
          ORDER BY updatedAt DESC
          LIMIT 50`,
    args: [`%${query}%`]
  });
  
  return result.rows.map(rowToNote);
}
```

---

## 五、向量化存储

### 5.1 向量化时机

| 场景 | 时机 | 方式 |
|------|------|------|
| 创建笔记 | 同步 | 创建后立即向量化 |
| 更新笔记 | 异步 | 后台任务队列 |
| 导入笔记 | 批量 | 批量处理 |

### 5.2 向量生成

```typescript
import { pipeline } from '@xenova/transformers';

let embedder: any = null;

async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getEmbedder();
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}
```

### 5.3 相似度计算

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

---

## 六、迁移策略

### 6.1 V1 → V2 迁移

```sql
-- V1 结构 (sql.js)
-- notes: id, content, createdAt, updatedAt, wordCount, aiEnhanced

-- V2 结构 (LibSQL)
-- 新增: layer, source, url, embedding, deleted

ALTER TABLE notes ADD COLUMN layer TEXT DEFAULT 'L0';
ALTER TABLE notes ADD COLUMN source TEXT DEFAULT 'text';
ALTER TABLE notes ADD COLUMN url TEXT;
ALTER TABLE notes ADD COLUMN embedding BLOB;
ALTER TABLE notes ADD COLUMN deleted INTEGER DEFAULT 0;
```

### 6.2 迁移脚本

```typescript
async function migrateV1toV2() {
  // 1. 备份旧数据
  const backup = await exportToJSON();
  
  // 2. 添加新字段
  await db.execute(`ALTER TABLE notes ADD COLUMN layer TEXT DEFAULT 'L0'`);
  await db.execute(`ALTER TABLE notes ADD COLUMN source TEXT DEFAULT 'text'`);
  await db.execute(`ALTER TABLE notes ADD COLUMN url TEXT`);
  await db.execute(`ALTER TABLE notes ADD COLUMN embedding BLOB`);
  await db.execute(`ALTER TABLE notes ADD COLUMN deleted INTEGER DEFAULT 0`);
  
  // 3. 重建索引
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_notes_deleted ON notes(deleted)`);
  
  // 4. 重新向量化
  const notes = await getAllNotes();
  for (const note of notes) {
    await vectorizeNote(note.id, note.content);
  }
}
```

---

## 七、性能优化

### 7.1 索引策略

| 索引 | 用途 |
|------|------|
| idx_notes_created | 按创建时间排序 |
| idx_notes_updated | 按更新时间排序 |
| idx_notes_deleted | 软删除过滤 |
| idx_versions_note | 版本查询 |

### 7.2 查询优化

| 场景 | 优化 |
|------|------|
| 列表查询 | 分页 + 索引 |
| 搜索 | 全文索引 |
| 向量查询 | 近似最近邻 |

---

*最后更新: 2026-03-23*