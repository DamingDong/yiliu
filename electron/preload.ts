import { contextBridge, ipcRenderer } from 'electron';

const api = {
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  onFocusInput: (callback: () => void) => {
    ipcRenderer.on('focus-input', callback);
    return () => ipcRenderer.removeListener('focus-input', callback);
  },
  platform: process.platform,
  
  createNote: (content: string, source?: string, url?: string) => ipcRenderer.invoke('note:create', content, source, url),
  getNote: (id: string) => ipcRenderer.invoke('note:get', id),
  getAllNotes: (limit?: number) => ipcRenderer.invoke('note:getAll', limit),
  updateNote: (id: string, content: string) => ipcRenderer.invoke('note:update', id, content),
  deleteNote: (id: string) => ipcRenderer.invoke('note:delete', id),
  searchNotes: (keyword: string) => ipcRenderer.invoke('note:search', keyword),
  semanticSearch: (query: string, topK?: number) => ipcRenderer.invoke('note:semanticSearch', query, topK),
  exportToMarkdown: (format?: string) => ipcRenderer.invoke('note:export', format),
  getStats: () => ipcRenderer.invoke('note:stats'),
  getVersions: (noteId: string) => ipcRenderer.invoke('note:getVersions', noteId),
  revertToVersion: (noteId: string, version: number) => ipcRenderer.invoke('note:revertToVersion', noteId, version),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: { apiKey?: string; embeddingModel?: string }) => ipcRenderer.invoke('settings:save', settings),
  openDataDir: () => ipcRenderer.invoke('settings:openDataDir'),
  openExternal: (url: string) => ipcRenderer.invoke('settings:openExternal', url),
  testAIConnection: () => ipcRenderer.invoke('settings:testAI'),
  onError: (callback: (error: string) => void) => {
    const handler = (_: any, error: string) => callback(error);
    ipcRenderer.on('error', handler);
    return () => ipcRenderer.removeListener('error', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);