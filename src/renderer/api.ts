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
};

export { type FrontendNote };
