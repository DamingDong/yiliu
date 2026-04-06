import { randomUUID } from 'crypto';
import { type InValue } from '@libsql/client';
import { getDB } from '../storage/db.js';
import { 
  type Notebook, 
  type NoteNotebook, 
  type NoteInNotebook,
  type NotebookMatch,
  type NotebookAssociation,
  type CreateNotebookData, 
  type UpdateNotebookData,
  type Note
} from '../types/index.js';

export async function initNotebookService(): Promise<void> {
  const db = getDB();
  
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
}

function rowToNotebook(row: any, columns: string[]): Notebook {
  const obj: Record<string, any> = {};
  columns.forEach((col, i) => {
    obj[col] = row[i];
  });
  
  return {
    id: obj.id,
    name: obj.name,
    icon: obj.icon,
    color: obj.color,
    description: obj.description,
    createdAt: obj.created_at,
    updatedAt: obj.updated_at,
    noteCount: obj.noteCount || 0,
  };
}

async function updateNotebookNoteCount(notebookId: string): Promise<void> {
  const db = getDB();
  const countResult = await db.execute({
    sql: `SELECT COUNT(*) as count FROM note_notebooks WHERE notebook_id = ?`,
    args: [notebookId]
  });
  const count = countResult.rows.length > 0 ? Number(countResult.rows[0][0]) : 0;
  
  await db.execute({
    sql: `UPDATE notebooks SET noteCount = ? WHERE id = ?`,
    args: [count, notebookId] as InValue[]
  });
}

export async function createNotebook(data: CreateNotebookData): Promise<Notebook> {
  const db = getDB();
  const id = randomUUID();
  const now = Date.now();
  
  await db.execute({
    sql: `INSERT INTO notebooks (id, name, icon, color, description, created_at, updated_at, noteCount) 
          VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
    args: [
      id,
      data.name,
      data.icon || null,
      data.color || null,
      data.description || null,
      now,
      now,
    ] as InValue[]
  });
  
  return {
    id,
    name: data.name,
    icon: data.icon,
    color: data.color,
    description: data.description,
    createdAt: now,
    updatedAt: now,
    noteCount: 0,
  };
}

export async function getNotebook(id: string): Promise<Notebook | null> {
  const db = getDB();
  const result = await db.execute({
    sql: `SELECT * FROM notebooks WHERE id = ?`,
    args: [id]
  });
  
  if (result.rows.length === 0) return null;
  
  return rowToNotebook(result.rows[0], result.columns);
}

export async function getAllNotebooks(): Promise<Notebook[]> {
  const db = getDB();
  const result = await db.execute(`SELECT * FROM notebooks ORDER BY updated_at DESC`);
  
  return result.rows.map(row => rowToNotebook(row, result.columns));
}

export async function updateNotebook(id: string, data: UpdateNotebookData): Promise<Notebook | null> {
  const db = getDB();
  const existing = await getNotebook(id);
  if (!existing) return null;
  
  const now = Date.now();
  const name = data.name ?? existing.name;
  const icon = data.icon !== undefined ? data.icon : existing.icon;
  const color = data.color !== undefined ? data.color : existing.color;
  const description = data.description !== undefined ? data.description : existing.description;
  
  await db.execute({
    sql: `UPDATE notebooks SET name = ?, icon = ?, color = ?, description = ?, updated_at = ? WHERE id = ?`,
    args: [name, icon, color, description, now, id] as InValue[]
  });
  
  return {
    ...existing,
    name,
    icon,
    color,
    description,
    updatedAt: now,
  };
}

export async function deleteNotebook(id: string): Promise<boolean> {
  const db = getDB();
  
  await db.execute({
    sql: `DELETE FROM note_notebooks WHERE notebook_id = ?`,
    args: [id]
  });
  
  const result = await db.execute({
    sql: `DELETE FROM notebooks WHERE id = ?`,
    args: [id]
  });
  
  return result.rowsAffected > 0;
}

export async function addNoteToNotebook(
  noteId: string, 
  notebookId: string, 
  source: 'ai' | 'manual' = 'manual',
  isPrimary: boolean = false
): Promise<boolean> {
  const db = getDB();
  const now = Date.now();
  
  try {
    await db.execute({
      sql: `INSERT OR REPLACE INTO note_notebooks (note_id, notebook_id, is_primary, source, added_at) 
            VALUES (?, ?, ?, ?, ?)`,
      args: [noteId, notebookId, isPrimary ? 1 : 0, source, now] as InValue[]
    });
    
    await updateNotebookNoteCount(notebookId);
    return true;
  } catch {
    return false;
  }
}

export async function removeNoteFromNotebook(noteId: string, notebookId: string): Promise<boolean> {
  const db = getDB();
  
  const result = await db.execute({
    sql: `DELETE FROM note_notebooks WHERE note_id = ? AND notebook_id = ?`,
    args: [noteId, notebookId]
  });
  
  await updateNotebookNoteCount(notebookId);
  return result.rowsAffected > 0;
}

export async function getNotesInNotebook(notebookId: string): Promise<NoteInNotebook[]> {
  const db = getDB();
  
  const result = await db.execute({
    sql: `SELECT nn.*, n.id as nid, n.content, n.layer, n.source as nsource, n.url, n.createdAt as ncreatedAt, 
                 n.updatedAt as nupdatedAt, n.wordCount, n.aiEnhanced, n.embedding
          FROM note_notebooks nn
          JOIN notes n ON nn.note_id = n.id
          WHERE nn.notebook_id = ?
          ORDER BY nn.added_at DESC`,
    args: [notebookId]
  });
  
  const notes: NoteInNotebook[] = [];
  
  for (const row of result.rows) {
    const note: Note = {
      id: row[5] as string,
      content: row[6] as string,
      layer: (row[7] as string) as any,
      source: (row[8] as string) as any,
      url: row[9] as string | undefined,
      createdAt: row[10] as number,
      updatedAt: row[11] as number,
      wordCount: row[12] as number,
      aiEnhanced: row[13] ? JSON.parse(row[13] as string) : undefined,
      embedding: row[14] ? JSON.parse(row[14] as string) : undefined,
    };
    
    notes.push({
      note,
      isPrimary: Boolean(row[2]),
      addedAt: row[4] as number,
      source: (row[3] as string) as 'ai' | 'manual',
    });
  }
  
  return notes;
}

export async function getNotebooksForNote(noteId: string): Promise<NotebookAssociation[]> {
  const db = getDB();
  
  const result = await db.execute({
    sql: `SELECT nn.note_id, nn.notebook_id, nn.is_primary, nn.source, nn.added_at,
                 n.name, n.icon, n.color, n.description, n.created_at, n.updated_at, n.noteCount
          FROM note_notebooks nn
          JOIN notebooks n ON nn.notebook_id = n.id
          WHERE nn.note_id = ?
          ORDER BY nn.added_at DESC`,
    args: [noteId]
  });
  
  const associations: NotebookAssociation[] = [];
  
  for (const row of result.rows) {
    const notebook: Notebook = {
      id: row[1] as string,
      name: row[5] as string,
      icon: row[6] as string | undefined,
      color: row[7] as string | undefined,
      description: row[8] as string | undefined,
      createdAt: row[9] as number,
      updatedAt: row[10] as number,
      noteCount: row[11] as number,
    };
    
    associations.push({
      notebook,
      isPrimary: Boolean(row[2]),
      source: (row[3] as string) as 'ai' | 'manual',
      addedAt: row[4] as number,
    });
  }
  
  return associations;
}

export async function recommendNotebooksForNote(noteId: string): Promise<NotebookMatch[]> {
  const note = await import('../storage/db.js').then(m => m.getNote(noteId));
  if (!note) return [];
  
  const notebooks = await getAllNotebooks();
  if (notebooks.length === 0) return [];
  
  const matches: NotebookMatch[] = [];
  
  for (const notebook of notebooks) {
    const notesInNotebook = await getNotesInNotebook(notebook.id);
    
    if (notesInNotebook.length === 0) continue;
    
    let totalSimilarity = 0;
    for (const noteInNb of notesInNotebook) {
      const content1 = note.content.toLowerCase();
      const content2 = noteInNb.note.content.toLowerCase();
      
      const words1 = new Set(content1.split(/\s+/).filter(w => w.length > 2));
      const words2 = new Set(content2.split(/\s+/).filter(w => w.length > 2));
      
      let intersection = 0;
      for (const word of words1) {
        if (words2.has(word)) intersection++;
      }
      
      const union = words1.size + words2.size - intersection;
      const jaccard = union > 0 ? intersection / union : 0;
      
      totalSimilarity += jaccard;
    }
    
    const avgSimilarity = totalSimilarity / notesInNotebook.length;
    
    if (avgSimilarity > 0.1) {
      matches.push({
        notebook,
        score: Math.min(avgSimilarity, 1),
      });
    }
  }
  
  return matches.sort((a, b) => b.score - a.score).slice(0, 3);
}
