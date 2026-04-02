import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../src/renderer/api';

describe('Frontend API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNote', () => {
    it('should create a note', async () => {
      const mockNote = {
        id: 'test-id',
        content: 'Test content',
        title: 'Test content',
        tags: ['test'],
        time: '10:00',
        date: '今天',
        source: 'text',
        createdAt: Date.now(),
      };
      
      vi.mocked(window.electronAPI.createNote).mockResolvedValue(mockNote);
      
      const result = await api.createNote('Test content');
      expect(result?.content).toBe('Test content');
      expect(window.electronAPI.createNote).toHaveBeenCalledWith('Test content', 'text');
    });

    it('should return null when createNote returns null', async () => {
      vi.mocked(window.electronAPI.createNote).mockResolvedValue(null);
      
      const result = await api.createNote('Test content');
      expect(result).toBeNull();
    });

    it('should use custom source when provided', async () => {
      vi.mocked(window.electronAPI.createNote).mockResolvedValue({
        id: 'test-id',
        content: 'Voice note',
        source: 'voice',
        createdAt: Date.now(),
      });
      
      await api.createNote('Voice note', 'voice');
      expect(window.electronAPI.createNote).toHaveBeenCalledWith('Voice note', 'voice');
    });
  });

  describe('getNote', () => {
    it('should get a note by id', async () => {
      const mockNote = {
        id: 'test-id',
        content: 'Test content',
        source: 'text',
        createdAt: Date.now(),
      };
      
      vi.mocked(window.electronAPI.getNote).mockResolvedValue(mockNote);
      
      const result = await api.getNote('test-id');
      expect(result?.id).toBe('test-id');
      expect(window.electronAPI.getNote).toHaveBeenCalledWith('test-id');
    });
  });

  describe('getAllNotes', () => {
    it('should get all notes with default limit', async () => {
      const mockNotes = [
        { id: '1', content: 'Note 1', source: 'text', createdAt: Date.now() },
        { id: '2', content: 'Note 2', source: 'text', createdAt: Date.now() },
      ];
      
      vi.mocked(window.electronAPI.getAllNotes).mockResolvedValue(mockNotes);
      
      const result = await api.getAllNotes();
      expect(result.length).toBe(2);
      expect(window.electronAPI.getAllNotes).toHaveBeenCalledWith(50);
    });

    it('should use custom limit when provided', async () => {
      vi.mocked(window.electronAPI.getAllNotes).mockResolvedValue([]);
      
      await api.getAllNotes(10);
      expect(window.electronAPI.getAllNotes).toHaveBeenCalledWith(10);
    });

    it('should transform note dates to relative format', async () => {
      const now = Date.now();
      vi.mocked(window.electronAPI.getAllNotes).mockResolvedValue([
        { id: '1', content: 'Today note', source: 'text', createdAt: now },
      ]);
      
      const result = await api.getAllNotes();
      expect(result[0].date).toBe('今天');
    });
  });

  describe('updateNote', () => {
    it('should update a note', async () => {
      const mockNote = {
        id: 'test-id',
        content: 'Updated content',
        source: 'text',
        createdAt: Date.now(),
      };
      
      vi.mocked(window.electronAPI.updateNote).mockResolvedValue(mockNote);
      
      const result = await api.updateNote('test-id', 'Updated content');
      expect(result?.content).toBe('Updated content');
      expect(window.electronAPI.updateNote).toHaveBeenCalledWith('test-id', 'Updated content');
    });
  });

  describe('deleteNote', () => {
    it('should delete a note', async () => {
      vi.mocked(window.electronAPI.deleteNote).mockResolvedValue(true);
      
      const result = await api.deleteNote('test-id');
      expect(result).toBe(true);
      expect(window.electronAPI.deleteNote).toHaveBeenCalledWith('test-id');
    });
  });

  describe('searchNotes', () => {
    it('should search notes by keyword', async () => {
      vi.mocked(window.electronAPI.searchNotes).mockResolvedValue([]);
      
      await api.searchNotes('test');
      expect(window.electronAPI.searchNotes).toHaveBeenCalledWith('test');
    });

    it('should return transformed notes', async () => {
      const mockNotes = [
        { id: '1', content: 'Search result', source: 'text', createdAt: Date.now() },
      ];
      
      vi.mocked(window.electronAPI.searchNotes).mockResolvedValue(mockNotes);
      
      const result = await api.searchNotes('search');
      expect(result.length).toBe(1);
      expect(result[0].content).toBe('Search result');
    });
  });

  describe('semanticSearch', () => {
    it('should perform semantic search', async () => {
      vi.mocked(window.electronAPI.semanticSearch).mockResolvedValue([]);
      
      await api.semanticSearch('test query', 10);
      expect(window.electronAPI.semanticSearch).toHaveBeenCalledWith('test query', 10);
    });

    it('should return transformed results with scores', async () => {
      const mockResults = [
        { note: { id: '1', content: 'Semantic result', source: 'text', createdAt: Date.now() }, score: 0.95 },
      ];
      
      vi.mocked(window.electronAPI.semanticSearch).mockResolvedValue(mockResults);
      
      const result = await api.semanticSearch('test', 5);
      expect(result.length).toBe(1);
      expect(result[0].score).toBe(0.95);
      expect(result[0].note.content).toBe('Semantic result');
    });
  });

  describe('exportToMarkdown', () => {
    it('should export to markdown', async () => {
      vi.mocked(window.electronAPI.exportToMarkdown).mockResolvedValue('/path/to/export.md');
      
      const result = await api.exportToMarkdown('md');
      expect(result).toBe('/path/to/export.md');
      expect(window.electronAPI.exportToMarkdown).toHaveBeenCalledWith('md');
    });

    it('should use default format when not specified', async () => {
      vi.mocked(window.electronAPI.exportToMarkdown).mockResolvedValue('/path/to/export.md');
      
      await api.exportToMarkdown();
      expect(window.electronAPI.exportToMarkdown).toHaveBeenCalledWith('md');
    });
  });

  describe('getStats', () => {
    it('should get stats', async () => {
      const mockStats = { notes: 10, vectorized: 5, avgLength: 100 };
      vi.mocked(window.electronAPI.getStats).mockResolvedValue(mockStats);
      
      const result = await api.getStats();
      expect(result.notes).toBe(10);
      expect(result.vectorized).toBe(5);
    });
  });

  describe('getVersions', () => {
    it('should get note versions', async () => {
      vi.mocked(window.electronAPI.getVersions).mockResolvedValue([
        { version: 1, content: 'v1' },
        { version: 2, content: 'v2' },
      ]);
      
      const result = await api.getVersions('test-id');
      expect(result.length).toBe(2);
      expect(window.electronAPI.getVersions).toHaveBeenCalledWith('test-id');
    });
  });

  describe('revertToVersion', () => {
    it('should revert to a specific version', async () => {
      const mockNote = {
        id: 'test-id',
        content: 'Reverted content',
        source: 'text',
        createdAt: Date.now(),
      };
      
      vi.mocked(window.electronAPI.revertToVersion).mockResolvedValue(mockNote);
      
      const result = await api.revertToVersion('test-id', 1);
      expect(result?.content).toBe('Reverted content');
      expect(window.electronAPI.revertToVersion).toHaveBeenCalledWith('test-id', 1);
    });
  });

  describe('onError', () => {
    it('should register error callback', () => {
      const callback = vi.fn();
      const unsubscribe = api.onError(callback);
      
      expect(window.electronAPI.onError).toHaveBeenCalledWith(callback);
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('openFile', () => {
    it('should open a file', () => {
      api.openFile('/path/to/file.md');
      expect(window.electronAPI.openFile).toHaveBeenCalledWith('/path/to/file.md');
    });
  });

  describe('openDataDir', () => {
    it('should open data directory', () => {
      api.openDataDir();
      expect(window.electronAPI.openDataDir).toHaveBeenCalled();
    });
  });

  describe('onModelLoadProgress', () => {
    it('should register model load progress callback', () => {
      const callback = vi.fn();
      const unsubscribe = api.onModelLoadProgress(callback);
      
      expect(window.electronAPI.onModelLoadProgress).toHaveBeenCalledWith(callback);
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
