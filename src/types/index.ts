export type Layer = 'L0' | 'L1' | 'L2' | 'L3';
export type Source = 'text' | 'link' | 'ocr';

export interface Note {
  id: string;
  content: string;
  layer: Layer;
  source: Source;
  url?: string;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  summary?: string;
  tags?: string[];
  embedding?: number[];
  aiEnhanced?: {
    summary: string;
    tags: string[];
    relatedIds: string[];
  };
}

export interface NoteVersion {
  id: string;
  noteId: string;
  content: string;
  version: number;
  isMarked: boolean;
  markNote?: string;
  createdAt: number;
}

export interface SearchResult {
  note: Note;
  score: number;
  type: 'keyword' | 'semantic' | 'hybrid';
}

export interface SyncResult {
  success: boolean;
  updated: number;
  conflicts: number;
}

export interface AIConfig {
  openaiApiKey?: string;
  embeddingModel?: string;
  chatModel?: string;
}

export interface Notebook {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  noteCount: number;
}

export interface NoteNotebook {
  noteId: string;
  notebookId: string;
  isPrimary: boolean;
  addedAt: number;
  source: 'ai' | 'manual';
}

export interface NotebookAssociation {
  notebook: Notebook;
  isPrimary: boolean;
  addedAt: number;
  source: 'ai' | 'manual';
}

export interface NotebookWithNote extends Notebook {
  note: Note;
}

export interface NoteInNotebook {
  note: Note;
  isPrimary: boolean;
  addedAt: number;
  source: 'ai' | 'manual';
}

export interface NotebookMatch {
  notebook: Notebook;
  score: number;
}

export interface CreateNotebookData {
  name: string;
  icon?: string;
  color?: string;
  description?: string;
}

export interface UpdateNotebookData {
  name?: string;
  icon?: string;
  color?: string;
  description?: string;
}