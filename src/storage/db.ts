/**
 * 数据库模块 - LibSQL 版本
 * 使用 @libsql/client 替代 sql.js
 */

import { createClient, type Client, type InValue, type ResultSet } from '@libsql/client';
import { Note, NoteVersion } from '../types/index.js';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import { generateEmbedding, enhanceNote, isAIAvailable, type AIEnhanceResult } from '../ai/index.js';
import { initVectorStore, addVector, removeVector, semanticSearch, hybridSearch, getStats } from './vector.js';

const getDataPath = (): string => {
  if (process.env.YILIU_DATA_PATH) {
    return process.env.YILIU_DATA_PATH;
  }
  return path.join(process.cwd(), 'data');
};

const CURRENT_DB_VERSION = 2;

let db: Client;

async function runMigrations(): Promise<void> {
  // 创建版本表（如果不存在）
  await db.execute(`
    CREATE TABLE IF NOT EXISTS db_version (
      id INTEGER PRIMARY KEY,
      version INTEGER NOT NULL,
      appliedAt INTEGER NOT NULL
    )
  `);

  // 获取当前版本
  const result = await db.execute(`SELECT version FROM db_version ORDER BY id DESC LIMIT 1`);
  const currentVersion = result.rows.length > 0 ? Number(result.rows[0][0]) : 0;

  console.log(`[yiliu] 数据库版本: ${currentVersion} -> ${CURRENT_DB_VERSION}`);

  if (currentVersion < CURRENT_DB_VERSION) {
    console.log('[yiliu] 执行数据库迁移...');
  }

  // v1: 初始版本，创建 notes 和 note_versions 表
  if (currentVersion < 1) {
    console.log('[yiliu] 迁移 v1: 初始版本...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        layer TEXT DEFAULT 'L0',
        source TEXT DEFAULT 'text',
        url TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        wordCount INTEGER DEFAULT 0,
        aiEnhanced TEXT,
        embedding TEXT
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS note_versions (
        id TEXT PRIMARY KEY,
        noteId TEXT NOT NULL,
        content TEXT NOT NULL,
        version INTEGER NOT NULL,
        isMarked INTEGER DEFAULT 0,
        markNote TEXT,
        createdAt INTEGER NOT NULL
      )
    `);

    // 记录版本
    await db.execute({
      sql: `INSERT INTO db_version (id, version, appliedAt) VALUES (?, ?, ?)`,
      args: [1, 1, Date.now()] as InValue[]
    });
    console.log('[yiliu] 迁移 v1 完成');
  }

  if (currentVersion < 2) {
    console.log('[yiliu] 迁移 v2: 笔记本系统...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS notebooks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        noteCount INTEGER DEFAULT 0
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS note_notebooks (
        note_id TEXT NOT NULL,
        notebook_id TEXT NOT NULL,
        is_primary INTEGER DEFAULT 0,
        source TEXT DEFAULT 'manual',
        added_at INTEGER NOT NULL,
        PRIMARY KEY (note_id, notebook_id),
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
        FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE
      )
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_note_notebooks_notebook ON note_notebooks(notebook_id)
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_note_notebooks_note ON note_notebooks(note_id)
    `);

    await db.execute({
      sql: `INSERT INTO db_version (id, version, appliedAt) VALUES (?, ?, ?)`,
      args: [2, 2, Date.now()] as InValue[]
    });
    console.log('[yiliu] 迁移 v2 完成');
  }

  // 未来版本迁移可以在这里添加:
  // if (currentVersion < 2) {
  //   console.log('[yiliu] 迁移 v2: ...');
  //   // 执行 v2 迁移
  //   await db.execute({ ... });
  //   await db.execute({
  //     sql: `INSERT INTO db_version (id, version, appliedAt) VALUES (?, ?, ?)`,
  //     args: [2, 2, Date.now()] as InValue[]
  //   });
  // }
}

/**
 * 初始化数据库
 */
export async function initDB(): Promise<void> {
  const dataDir = getDataPath();
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const DB_PATH = path.join(dataDir, 'yiliu.db');

  // 使用 LibSQL 本地文件数据库
  db = createClient({
    url: `file:${DB_PATH}`,
  });

  // 运行数据库迁移
  await runMigrations();

  // 初始化向量存储
  initVectorStore(dataDir);
}

/**
 * 将 ResultSet 转换为对象数组
 */
function resultSetToObjects(result: ResultSet): any[] {
  return result.rows.map(row => {
    const obj: any = {};
    result.columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

/**
 * 将行数据转换为 Note 对象
 */
function rowToNote(row: any, columns: string[]): Note {
  const obj: any = {};
  columns.forEach((col, i) => {
    obj[col] = row[i];
  });
  
  return {
    id: obj.id,
    content: obj.content,
    layer: obj.layer || 'L0',
    source: obj.source || 'text',
    url: obj.url,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    wordCount: obj.wordCount || 0,
    aiEnhanced: obj.aiEnhanced ? JSON.parse(obj.aiEnhanced) : undefined,
    embedding: obj.embedding ? JSON.parse(obj.embedding) : undefined,
  };
}

/**
 * 创建笔记（带 AI 增强）
 */
export async function createNoteAsync(content: string, source: string = 'text', url?: string): Promise<Note> {
  const id = randomUUID();
  const now = Date.now();
  const wordCount = content.length;

  // 初始笔记
  let note: Note = {
    id,
    content,
    layer: 'L0',
    source: source as any,
    url: url || undefined,
    createdAt: now,
    updatedAt: now,
    wordCount
  };

  // AI 增强（仅当 OpenAI 可用时）
  let aiResult: AIEnhanceResult | null = null;
  if (isAIAvailable()) {
    aiResult = await enhanceNote(content);
    if (aiResult) {
      note.aiEnhanced = {
        summary: aiResult.summary,
        tags: aiResult.tags,
        relatedIds: [],
      };
    }
  }

  // 始终尝试生成嵌入（OpenAI 或本地）
  let embedding: number[] | null = null;
  const embResult = await generateEmbedding(content);
  embedding = embResult?.embedding || null;

  // 插入数据库
  await db.execute({
    sql: `INSERT INTO notes (id, content, layer, source, url, createdAt, updatedAt, wordCount, aiEnhanced, embedding) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      note.id,
      note.content,
      note.layer,
      note.source,
      note.url ?? null,
      note.createdAt,
      note.updatedAt,
      note.wordCount,
      note.aiEnhanced ? JSON.stringify(note.aiEnhanced) : null,
      embedding ? JSON.stringify(embedding) : null,
    ] as InValue[]
  });

  // 添加到向量索引
  if (embedding) {
    addVector(id, embedding, content);
    console.log(`[yiliu] Vectorized note ${id.slice(0, 8)}`);
  }

  await createVersion(note);

  return note;
}

/**
 * 内部：创建版本记录
 */
async function createVersion(note: Note): Promise<void> {
  const result = await db.execute({
    sql: `SELECT COUNT(*) as count FROM note_versions WHERE noteId = ?`,
    args: [note.id]
  });
  
  const count = result.rows.length > 0 ? Number(result.rows[0][0]) : 0;
  const version = count + 1;

  await db.execute({
    sql: `INSERT INTO note_versions (id, noteId, content, version, isMarked, createdAt) VALUES (?, ?, ?, ?, 0, ?)`,
    args: [randomUUID(), note.id, note.content, version, Date.now()] as InValue[]
  });
}

/**
 * 更新笔记
 */
export async function updateNote(id: string, content: string): Promise<Note | null> {
  const note = await getNote(id);
  if (!note) return null;

  const now = Date.now();
  const wordCount = content.length;

  await db.execute({
    sql: `UPDATE notes SET content = ?, updatedAt = ?, wordCount = ? WHERE id = ?`,
    args: [content, now, wordCount, id] as InValue[]
  });

  await createVersion({ ...note, content, updatedAt: now, wordCount });

  return getNote(id);
}

/**
 * 获取单个笔记
 */
export async function getNote(id: string): Promise<Note | null> {
  const result = await db.execute({
    sql: `SELECT * FROM notes WHERE id = ?`,
    args: [id]
  });
  
  if (result.rows.length === 0) return null;
  
  return rowToNote(result.rows[0], result.columns);
}

/**
 * 获取所有笔记
 */
export async function getAllNotes(limit: number = 50): Promise<Note[]> {
  const result = await db.execute({
    sql: `SELECT * FROM notes ORDER BY updatedAt DESC LIMIT ?`,
    args: [limit]
  });
  
  return result.rows.map(row => rowToNote(row, result.columns));
}

/**
 * 关键词搜索
 */
export async function searchNotes(keyword: string): Promise<Note[]> {
  const result = await db.execute({
    sql: `SELECT * FROM notes WHERE content LIKE ? ORDER BY updatedAt DESC LIMIT 20`,
    args: [`%${keyword}%`]
  });
  
  return result.rows.map(row => rowToNote(row, result.columns));
}

/**
 * 语义搜索（使用向量相似度）
 */
export async function semanticSearchNotes(query: string, topK: number = 10): Promise<Array<{ note: Note; score: number }>> {
  // 生成查询向量
  const embResult = await generateEmbedding(query);
  
  if (!embResult) {
    // 回退到关键词搜索
    const notes = await searchNotes(query);
    return notes.map(note => ({ note, score: 0.5 }));
  }

  // 使用混合搜索
  const results = hybridSearch(embResult.embedding, [query], topK);
  
  // 获取完整笔记
  const notesWithScores: Array<{ note: Note; score: number }> = [];
  for (const r of results) {
    const note = await getNote(r.id);
    if (note) {
      notesWithScores.push({ note, score: r.score });
    }
  }
  
  return notesWithScores;
}

/**
 * 按标签搜索
 */
export async function searchByTag(tag: string): Promise<Note[]> {
  const result = await db.execute({
    sql: `SELECT * FROM notes WHERE aiEnhanced LIKE ? ORDER BY updatedAt DESC LIMIT 20`,
    args: [`%"${tag}"%`]
  });
  
  return result.rows.map(row => rowToNote(row, result.columns));
}

/**
 * 获取笔记版本历史
 */
export async function getVersions(noteId: string): Promise<NoteVersion[]> {
  const result = await db.execute({
    sql: `SELECT * FROM note_versions WHERE noteId = ? ORDER BY version DESC`,
    args: [noteId]
  });
  
  return result.rows.map(row => {
    const obj: any = {};
    result.columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj as NoteVersion;
  });
}

/**
 * 标记版本
 */
export async function markVersion(noteId: string, version: number, markNote: string): Promise<boolean> {
  const result = await db.execute({
    sql: `UPDATE note_versions SET isMarked = 1, markNote = ? WHERE noteId = ? AND version = ?`,
    args: [markNote, noteId, version] as InValue[]
  });
  
  return result.rowsAffected > 0;
}

/**
 * 回滚到指定版本
 */
export async function revertToVersion(noteId: string, version: number): Promise<Note | null> {
  const result = await db.execute({
    sql: `SELECT * FROM note_versions WHERE noteId = ? AND version = ?`,
    args: [noteId, version]
  });
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  const content = row[2] as string; // content 是第3列
  
  return updateNote(noteId, content);
}

/**
 * 删除笔记
 */
export async function deleteNote(id: string): Promise<boolean> {
  await db.execute({
    sql: `DELETE FROM note_versions WHERE noteId = ?`,
    args: [id]
  });
  
  const affectedNotebooks = await db.execute({
    sql: `SELECT notebook_id FROM note_notebooks WHERE note_id = ?`,
    args: [id]
  });
  
  await db.execute({
    sql: `DELETE FROM note_notebooks WHERE note_id = ?`,
    args: [id]
  });
  
  for (const row of affectedNotebooks.rows) {
    const notebookId = row[0] as string;
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) FROM note_notebooks WHERE notebook_id = ?`,
      args: [notebookId]
    });
    const count = countResult.rows.length > 0 ? Number(countResult.rows[0][0]) : 0;
    await db.execute({
      sql: `UPDATE notebooks SET noteCount = ? WHERE id = ?`,
      args: [count, notebookId] as InValue[]
    });
  }
  
  const result = await db.execute({
    sql: `DELETE FROM notes WHERE id = ?`,
    args: [id]
  });
  
  removeVector(id);
  
  return result.rowsAffected > 0;
}

/**
 * 关闭数据库
 */
export function closeDB(): void {
  // LibSQL 客户端会自动关闭
}

/**
 * 导出为 Markdown
 */
export async function exportToMarkdown(format: string = 'md'): Promise<string> {
  const notes = await getAllNotes(1000);
  const now = new Date().toISOString().slice(0, 10);
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const filePath = path.join(dataDir, `yiliu-export-${now}.md`);
  
  let content = `# 忆流笔记导出\n\n导出时间：${new Date().toLocaleString('zh-CN')}\n\n---\n\n`;
  
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    const time = new Date(note.createdAt).toLocaleString('zh-CN');
    content += `## ${i + 1}. ${note.content.slice(0, 50)}${note.content.length > 50 ? '...' : ''}\n\n`;
    content += `- ID: ${note.id.slice(0, 8)}\n`;
    content += `- 创建时间：${time}\n`;
    content += `- 来源：${note.source}\n`;
    if (note.url) content += `- 链接：${note.url}\n`;
    if (note.aiEnhanced?.tags?.length) {
      content += `- 标签：${note.aiEnhanced.tags.join(', ')}\n`;
    }
    content += `\n${note.content}\n\n---\n\n`;
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

/**
 * 标签统计信息
 */
export interface TagStats {
  name: string;
  count: number;
}

/**
 * 获取所有标签及其使用次数
 */
export async function getAllTags(): Promise<TagStats[]> {
  const result = await db.execute(`SELECT aiEnhanced FROM notes WHERE aiEnhanced IS NOT NULL`);
  const tagCounts = new Map<string, number>();
  
  for (const row of result.rows) {
    const aiEnhanced = row[0] as string;
    if (aiEnhanced) {
      try {
        const data = JSON.parse(aiEnhanced);
        if (data.tags && Array.isArray(data.tags)) {
          for (const tag of data.tags) {
            if (typeof tag === 'string') {
              tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            }
          }
        }
      } catch {
        // 忽略解析错误的记录
      }
    }
  }
  
  // 转换为数组并按使用次数排序
  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 重命名标签（更新所有包含该标签的笔记）
 */
export async function renameTag(oldName: string, newName: string): Promise<number> {
  const notes = await getAllNotes(1000);
  let updatedCount = 0;
  
  for (const note of notes) {
    if (note.aiEnhanced?.tags?.includes(oldName)) {
      const newTags = note.aiEnhanced.tags.map(tag => 
        tag === oldName ? newName : tag
      );
      
      const updatedAiEnhanced = {
        ...note.aiEnhanced,
        tags: newTags
      };
      
      await db.execute({
        sql: `UPDATE notes SET aiEnhanced = ? WHERE id = ?`,
        args: [JSON.stringify(updatedAiEnhanced), note.id] as InValue[]
      });
      
      updatedCount++;
    }
  }
  
  return updatedCount;
}

/**
 * 删除标签（从所有笔记中移除该标签）
 */
export async function deleteTag(tagName: string): Promise<number> {
  const notes = await getAllNotes(1000);
  let updatedCount = 0;
  
  for (const note of notes) {
    if (note.aiEnhanced?.tags?.includes(tagName)) {
      const newTags = note.aiEnhanced.tags.filter(tag => tag !== tagName);
      
      const updatedAiEnhanced = {
        ...note.aiEnhanced,
        tags: newTags
      };
      
      await db.execute({
        sql: `UPDATE notes SET aiEnhanced = ? WHERE id = ?`,
        args: [JSON.stringify(updatedAiEnhanced), note.id] as InValue[]
      });
      
      updatedCount++;
    }
  }
  
  return updatedCount;
}

/**
 * 合并标签（将源标签合并到目标标签）
 */
export async function mergeTags(sourceTag: string, targetTag: string): Promise<number> {
  if (sourceTag === targetTag) return 0;
  
  const notes = await getAllNotes(1000);
  let updatedCount = 0;
  
  for (const note of notes) {
    if (note.aiEnhanced?.tags?.includes(sourceTag)) {
      const newTags = note.aiEnhanced.tags
        .filter(tag => tag !== sourceTag)
        .concat(targetTag);
      
      // 去重
      const uniqueTags = [...new Set(newTags)];
      
      const updatedAiEnhanced = {
        ...note.aiEnhanced,
        tags: uniqueTags
      };
      
      await db.execute({
        sql: `UPDATE notes SET aiEnhanced = ? WHERE id = ?`,
        args: [JSON.stringify(updatedAiEnhanced), note.id] as InValue[]
      });
      
      updatedCount++;
    }
  }
  
  return updatedCount;
}

/**
 * 获取数据库统计信息
 */
export async function getDBStats(): Promise<{ notes: number; vectorized: number; avgLength: number }> {
  const stats = getStats();
  const result = await db.execute(`SELECT COUNT(*) as count FROM notes`);
  const noteCount = result.rows.length > 0 ? Number(result.rows[0][0]) : 0;
  
  return {
    notes: noteCount,
    vectorized: stats.count,
    avgLength: stats.avgContentLength,
  };
}

// ========== 兼容层：同步函数（已弃用，建议使用异步版本）==========

// 为兼容旧代码，提供同步封装（内部使用异步调用）
export function createNote(content: string, source: string = 'text', url?: string): Note {
  // 同步版本已弃用，请使用 createNoteAsync
  // 这里返回一个临时对象，实际创建是异步的
  const id = randomUUID();
  const now = Date.now();
  return {
    id,
    content,
    layer: 'L0',
    source: source as any,
    url: url || undefined,
    createdAt: now,
    updatedAt: now,
    wordCount: content.length
  };
}

export function getNoteSync(id: string): Note | null {
  // 同步版本已弃用，请使用 await getNote(id)
  return null;
}

export function getAllNotesSync(limit: number = 50): Note[] {
  // 同步版本已弃用，请使用 await getAllNotes(limit)
  return [];
}

export function searchNotesSync(keyword: string): Note[] {
  // 同步版本已弃用，请使用 await searchNotes(keyword)
  return [];
}

export function getVersionsSync(noteId: string): NoteVersion[] {
  // 同步版本已弃用，请使用 await getVersions(noteId)
  return [];
}

export function deleteNoteSync(id: string): boolean {
  // 同步版本已弃用，请使用 await deleteNote(id)
  return false;
}

export function updateNoteSync(id: string, content: string): Note | null {
  // 同步版本已弃用，请使用 await updateNote(id, content)
  return null;
}

export function getDBStatsSync(): { notes: number; vectorized: number; avgLength: number } {
  // 同步版本已弃用，请使用 await getDBStats()
  return { notes: 0, vectorized: 0, avgLength: 0 };
}

export function getDB(): Client {
  return db;
}
