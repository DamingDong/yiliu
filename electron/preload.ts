import { contextBridge, ipcRenderer } from 'electron';

export interface Note {
  id: string;
  content: string;
  layer: string;
  source: string;
  url?: string;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  aiEnhanced?: {
    summary: string;
    tags: string[];
    relatedIds: string[];
  };
}

export interface SearchResult {
  note: Note;
  score: number;
}

export interface ElectronAPI {
  getAppPath: () => Promise<string>;
  onFocusInput: (callback: () => void) => () => void;
  platform: string;
  
  // 笔记操作
  createNote: (content: string, source?: string, url?: string) => Promise<Note>;
  getNote: (id: string) => Promise<Note | null>;
  getAllNotes: (limit?: number) => Promise<Note[]>;
  updateNote: (id: string, content: string) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<boolean>;
  searchNotes: (keyword: string) => Promise<Note[]>;
  semanticSearch: (query: string, topK?: number) => Promise<SearchResult[]>;
  exportToMarkdown: (format?: string) => Promise<string>;
  getStats: () => Promise<{ notes: number; vectorized: number; avgLength: number }>;
  
  // 版本操作
  getVersions: (noteId: string) => Promise<any[]>;
  revertToVersion: (noteId: string, version: number) => Promise<Note | null>;
  
  // 错误处理
  onError: (callback: (error: string) => void) => () => void;
}

const api: ElectronAPI = {
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  onFocusInput: (callback: () => void) => {
    ipcRenderer.on('focus-input', callback);
    return () => ipcRenderer.removeListener('focus-input', callback);
  },
  platform: process.platform,
  
  // 笔记操作
  createNote: (content, source, url) => ipcRenderer.invoke('note:create', content, source, url),
  getNote: (id) => ipcRenderer.invoke('note:get', id),
  getAllNotes: (limit) => ipcRenderer.invoke('note:getAll', limit),
  updateNote: (id, content) => ipcRenderer.invoke('note:update', id, content),
  deleteNote: (id) => ipcRenderer.invoke('note:delete', id),
  searchNotes: (keyword) => ipcRenderer.invoke('note:search', keyword),
  semanticSearch: (query, topK) => ipcRenderer.invoke('note:semanticSearch', query, topK),
  exportToMarkdown: (format) => ipcRenderer.invoke('note:export', format),
  getStats: () => ipcRenderer.invoke('note:stats'),
  
  // 版本操作
  getVersions: (noteId) => ipcRenderer.invoke('note:getVersions', noteId),
  revertToVersion: (noteId, version) => ipcRenderer.invoke('note:revertToVersion', noteId, version),
  
  // 错误处理
  onError: (callback) => {
    const handler = (_: any, error: string) => callback(error);
    ipcRenderer.on('error', handler);
    return () => ipcRenderer.removeListener('error', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);