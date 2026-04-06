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
  openFile: (filePath: string) => ipcRenderer.invoke('settings:openFile', filePath),
  testAIConnection: () => ipcRenderer.invoke('settings:testAI'),
  // 标签管理
  getAllTags: () => ipcRenderer.invoke('tags:getAll'),
  renameTag: (oldName: string, newName: string) => ipcRenderer.invoke('tags:rename', oldName, newName),
  deleteTag: (name: string) => ipcRenderer.invoke('tags:delete', name),
  mergeTags: (source: string, target: string) => ipcRenderer.invoke('tags:merge', source, target),
  // 笔记本管理
  createNotebook: (data: { name: string; icon?: string; color?: string; description?: string }) => 
    ipcRenderer.invoke('notebook:create', data),
  listNotebooks: () => ipcRenderer.invoke('notebook:list'),
  getNotebook: (id: string) => ipcRenderer.invoke('notebook:get', id),
  updateNotebook: (id: string, data: { name?: string; icon?: string; color?: string; description?: string }) => 
    ipcRenderer.invoke('notebook:update', id, data),
  deleteNotebook: (id: string) => ipcRenderer.invoke('notebook:delete', id),
  addNoteToNotebook: (noteId: string, notebookId: string, source?: 'ai' | 'manual', isPrimary?: boolean) => 
    ipcRenderer.invoke('notebook:addNote', noteId, notebookId, source, isPrimary),
  removeNoteFromNotebook: (noteId: string, notebookId: string) => 
    ipcRenderer.invoke('notebook:removeNote', noteId, notebookId),
  getNotesInNotebook: (notebookId: string) => ipcRenderer.invoke('notebook:getNotes', notebookId),
  getNotebooksForNote: (noteId: string) => ipcRenderer.invoke('notebook:getForNote', noteId),
  recommendNotebooks: (noteId: string) => ipcRenderer.invoke('notebook:recommend', noteId),
  onError: (callback: (error: string) => void) => {
    const handler = (_: any, error: string) => callback(error);
    ipcRenderer.on('error', handler);
    return () => ipcRenderer.removeListener('error', handler);
  },
  onModelLoadProgress: (callback: (data: { stage: string; progress: number }) => void) => {
    const handler = (_: any, data: { stage: string; progress: number }) => callback(data);
    ipcRenderer.on('model-load-progress', handler);
    return () => ipcRenderer.removeListener('model-load-progress', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);