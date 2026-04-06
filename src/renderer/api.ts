import type { ElectronAPI, Note, SearchResult } from '../../electron/preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export interface FrontendNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  time: string;
  date: string;
  source: string;
  createdAt: number;
  summary?: string;
}

function noteToFrontend(note: Note): FrontendNote {
  const d = new Date(note.createdAt);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  let date = d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
  if (isToday) date = '今天';
  else if (isYesterday) date = '昨天';

  return {
    id: note.id,
    title: note.content.slice(0, 20) + (note.content.length > 20 ? '...' : ''),
    content: note.content,
    tags: note.aiEnhanced?.tags?.slice(0, 3) || [],
    time: d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    date,
    source: note.source,
    createdAt: note.createdAt,
    summary: note.aiEnhanced?.summary,
  };
}

export const api = {
  async createNote(content: string, source: string = 'text'): Promise<FrontendNote | null> {
    const note = await window.electronAPI.createNote(content, source);
    return note ? noteToFrontend(note) : null;
  },

  async getNote(id: string): Promise<FrontendNote | null> {
    const note = await window.electronAPI.getNote(id);
    return note ? noteToFrontend(note) : null;
  },

  async getAllNotes(limit: number = 50): Promise<FrontendNote[]> {
    const notes = await window.electronAPI.getAllNotes(limit);
    return notes.map(noteToFrontend);
  },

  async updateNote(id: string, content: string): Promise<FrontendNote | null> {
    const note = await window.electronAPI.updateNote(id, content);
    return note ? noteToFrontend(note) : null;
  },

  async deleteNote(id: string): Promise<boolean> {
    return await window.electronAPI.deleteNote(id);
  },

  async searchNotes(keyword: string): Promise<FrontendNote[]> {
    const notes = await window.electronAPI.searchNotes(keyword);
    return notes.map(noteToFrontend);
  },

  async semanticSearch(query: string, topK: number = 10): Promise<Array<{ note: FrontendNote; score: number }>> {
    const results = await window.electronAPI.semanticSearch(query, topK);
    return results.map((r: SearchResult) => ({
      note: noteToFrontend(r.note),
      score: r.score,
    }));
  },

  async exportToMarkdown(format: string = 'md'): Promise<string> {
    return await window.electronAPI.exportToMarkdown(format);
  },

  async getStats(): Promise<{ notes: number; vectorized: number; avgLength: number }> {
    return await window.electronAPI.getStats();
  },

  async getVersions(noteId: string): Promise<any[]> {
    return await window.electronAPI.getVersions(noteId);
  },

  async revertToVersion(noteId: string, version: number): Promise<FrontendNote | null> {
    const note = await window.electronAPI.revertToVersion(noteId, version);
    return note ? noteToFrontend(note) : null;
  },

  onError(callback: (error: string) => void): () => void {
    return window.electronAPI.onError(callback);
  },

  openFile(filePath: string): void {
    window.electronAPI.openFile(filePath);
  },

  openDataDir(): void {
    window.electronAPI.openDataDir();
  },

  onModelLoadProgress(callback: (data: { stage: string; progress: number }) => void): () => void {
    return window.electronAPI.onModelLoadProgress(callback);
  },

  // 标签管理
  async getAllTags(): Promise<Array<{ name: string; count: number }>> {
    return await window.electronAPI.getAllTags();
  },

  async renameTag(oldName: string, newName: string): Promise<boolean> {
    return await window.electronAPI.renameTag(oldName, newName);
  },

  async deleteTag(name: string): Promise<boolean> {
    return await window.electronAPI.deleteTag(name);
  },

  async mergeTags(source: string, target: string): Promise<boolean> {
    return await window.electronAPI.mergeTags(source, target);
  },

  async listNotebooks(): Promise<Array<{ id: string; name: string; icon?: string; color?: string; noteCount: number }>> {
    return await window.electronAPI.listNotebooks();
  },

  async createNotebook(data: { name: string; icon?: string; color?: string }): Promise<{ id: string; name: string; icon?: string; color?: string; noteCount: number }> {
    return await window.electronAPI.createNotebook(data);
  },

  async updateNotebook(id: string, data: { name?: string; icon?: string; color?: string }): Promise<{ id: string; name: string; icon?: string; color?: string; noteCount: number }> {
    return await window.electronAPI.updateNotebook(id, data);
  },

  async deleteNotebook(id: string): Promise<boolean> {
    return await window.electronAPI.deleteNotebook(id);
  },

  async getNotesInNotebook(notebookId: string): Promise<FrontendNote[]> {
    const notes = await window.electronAPI.getNotesInNotebook(notebookId);
    return notes.map((n: any) => noteToFrontend(n.note));
  },

  async addNoteToNotebook(noteId: string, notebookId: string, source: 'ai' | 'manual' = 'manual'): Promise<boolean> {
    return await window.electronAPI.addNoteToNotebook(noteId, notebookId, source);
  },

  async removeNoteFromNotebook(noteId: string, notebookId: string): Promise<boolean> {
    return await window.electronAPI.removeNoteFromNotebook(noteId, notebookId);
  },

  async getNotebooksForNote(noteId: string): Promise<Array<{ notebook: { id: string; name: string; icon?: string; color?: string }; isPrimary: boolean; source: 'ai' | 'manual' }>> {
    return await window.electronAPI.getNotebooksForNote(noteId);
  },

  async recommendNotebooks(noteId: string): Promise<Array<{ notebook: { id: string; name: string; icon?: string; color?: string }; score: number }>> {
    return await window.electronAPI.recommendNotebooks(noteId);
  },
};

export { type FrontendNote };
