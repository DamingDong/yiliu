import '@testing-library/jest-dom';
import { vi } from 'vitest';

interface ElectronAPI {
  createNote: (content: string, source?: string, url?: string) => Promise<any>;
  getNote: (id: string) => Promise<any>;
  getAllNotes: (limit?: number) => Promise<any[]>;
  updateNote: (id: string, content: string) => Promise<any>;
  deleteNote: (id: string) => Promise<boolean>;
  searchNotes: (keyword: string) => Promise<any[]>;
  semanticSearch: (query: string, topK?: number) => Promise<any[]>;
  exportToMarkdown: (format?: string) => Promise<string>;
  getStats: () => Promise<{ notes: number; vectorized: number; avgLength: number }>;
  getVersions: (noteId: string) => Promise<any[]>;
  revertToVersion: (noteId: string, version: number) => Promise<any>;
  getSettings: () => Promise<{ apiKey: string; embeddingModel: string; autoTagEnabled?: boolean; dataPath: string }>;
  saveSettings: (settings: { apiKey?: string; embeddingModel?: string; autoTagEnabled?: boolean }) => Promise<boolean>;
  openDataDir: () => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  openFile: (filePath: string) => Promise<void>;
  testAIConnection: () => Promise<{ success: boolean; message: string }>;
  // 标签管理
  getAllTags: () => Promise<Array<{ name: string; count: number }>>;
  renameTag: (oldName: string, newName: string) => Promise<boolean>;
  deleteTag: (name: string) => Promise<boolean>;
  mergeTags: (source: string, target: string) => Promise<boolean>;
  onError: (callback: (error: string) => void) => () => void;
  onModelLoadProgress: (callback: (data: { stage: string; progress: number }) => void) => () => void;
  onFocusInput: (callback: () => void) => () => void;
  platform: string;
}

const mockElectronAPI: ElectronAPI = {
  createNote: vi.fn().mockResolvedValue({
    id: 'test-id',
    content: 'Test content',
    source: 'text',
    createdAt: Date.now(),
  }),
  getNote: vi.fn().mockResolvedValue({
    id: 'test-id',
    content: 'Test content',
    source: 'text',
    createdAt: Date.now(),
  }),
  getAllNotes: vi.fn().mockResolvedValue([]),
  updateNote: vi.fn().mockResolvedValue({
    id: 'test-id',
    content: 'Updated content',
    source: 'text',
    createdAt: Date.now(),
  }),
  deleteNote: vi.fn().mockResolvedValue(true),
  searchNotes: vi.fn().mockResolvedValue([]),
  semanticSearch: vi.fn().mockResolvedValue([]),
  exportToMarkdown: vi.fn().mockResolvedValue('/Users/test/yiliu-export.md'),
  getStats: vi.fn().mockResolvedValue({ notes: 10, vectorized: 5, avgLength: 100 }),
  getVersions: vi.fn().mockResolvedValue([]),
  revertToVersion: vi.fn().mockResolvedValue(null),
  getSettings: vi.fn().mockResolvedValue({ apiKey: '', embeddingModel: 'local', autoTagEnabled: true, dataPath: '/Users/test' }),
  saveSettings: vi.fn().mockResolvedValue(true),
  openDataDir: vi.fn().mockResolvedValue(undefined),
  openExternal: vi.fn().mockResolvedValue(undefined),
  openFile: vi.fn().mockResolvedValue(undefined),
  testAIConnection: vi.fn().mockResolvedValue({ success: true, message: 'OK' }),
  // 标签管理
  getAllTags: vi.fn().mockResolvedValue([
    { name: '技术', count: 5 },
    { name: '工作', count: 3 },
    { name: '想法', count: 2 },
  ]),
  renameTag: vi.fn().mockResolvedValue(true),
  deleteTag: vi.fn().mockResolvedValue(true),
  mergeTags: vi.fn().mockResolvedValue(true),
  onError: vi.fn(() => () => {}),
  onModelLoadProgress: vi.fn(() => () => {}),
  onFocusInput: vi.fn(() => () => {}),
  platform: 'darwin',
};

if (typeof window !== 'undefined') {
  window.electronAPI = mockElectronAPI;
}

(global as any).matchMedia = vi.fn(() => ({
  matches: false,
  media: '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

(global as any).IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
}));

(global as any).ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

(global as any).MutationObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
}));

(global as any).getComputedStyle = vi.fn(() => ({
  getPropertyValue: vi.fn(() => ''),
  length: 0,
  item: vi.fn(() => ''),
}));
