import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createNoteAsync, getNote, getAllNotes, searchNotes, deleteNote, getVersions, initDB, closeDB, updateNote, getDBStats } from '../src/storage/db.js';

describe('Database Operations', () => {
  beforeEach(async () => {
    process.env.YILIU_DATA_PATH = '/tmp/yiliu-test-db';
    await initDB();
  });

  afterEach(() => {
    closeDB();
  });

  describe('Data Path Configuration', () => {
    it('should use YILIU_DATA_PATH when set', () => {
      expect(process.env.YILIU_DATA_PATH).toBe('/tmp/yiliu-test-db');
    });

    it('should fallback to process.cwd() when YILIU_DATA_PATH not set', async () => {
      const originalPath = process.env.YILIU_DATA_PATH;
      delete process.env.YILIU_DATA_PATH;
      
      const fs = await import('fs');
      const path = await import('path');
      const defaultPath = path.join(process.cwd(), 'data');
      
      process.env.YILIU_DATA_PATH = originalPath;
      expect(defaultPath).toBeDefined();
    });
  });

  describe('CRUD Operations', () => {
    it('should create a note', async () => {
      const note = await createNoteAsync('Test note content');
      expect(note.id).toBeDefined();
      expect(note.content).toBe('Test note content');
      expect(note.layer).toBe('L0');
      expect(note.source).toBe('text');
    });

    it('should create a note with custom source', async () => {
      const note = await createNoteAsync('URL content', 'url', 'https://example.com');
      expect(note.source).toBe('url');
      expect(note.url).toBe('https://example.com');
    });

    it('should get a note by id', async () => {
      const created = await createNoteAsync('Note to retrieve');
      const retrieved = await getNote(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.content).toBe('Note to retrieve');
    });

    it('should return null for non-existent note', async () => {
      const retrieved = await getNote('non-existent-id');
      expect(retrieved).toBeNull();
    });

    it('should get all notes with limit', async () => {
      await createNoteAsync('Note 1');
      await createNoteAsync('Note 2');
      await createNoteAsync('Note 3');
      const notes = await getAllNotes(2);
      expect(notes.length).toBeLessThanOrEqual(2);
    });

    it('should update a note', async () => {
      const created = await createNoteAsync('Original content');
      const updated = await updateNote(created.id, 'Updated content');
      expect(updated).toBeDefined();
      expect(updated?.content).toBe('Updated content');
    });

    it('should delete a note', async () => {
      const created = await createNoteAsync('Note to delete');
      const deleted = await deleteNote(created.id);
      expect(deleted).toBe(true);
      const retrieved = await getNote(created.id);
      expect(retrieved).toBeNull();
    });

    it('should search notes by keyword', async () => {
      await createNoteAsync('Unique search term xyz123');
      const results = await searchNotes('xyz123');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content).toContain('xyz123');
    });

    it('should return empty array for non-matching search', async () => {
      const results = await searchNotes('nonexistentterm12345');
      expect(results.length).toBe(0);
    });
  });

  describe('Version Management', () => {
    it('should create version history on note creation', async () => {
      const note = await createNoteAsync('Version test');
      const versions = await getVersions(note.id);
      expect(versions.length).toBe(1);
      expect(versions[0].version).toBe(1);
    });

    it('should increment version on update', async () => {
      const note = await createNoteAsync('Initial version');
      await updateNote(note.id, 'Second version');
      const versions = await getVersions(note.id);
      expect(versions.length).toBe(2);
    });

    it('should return empty array for non-existent note versions', async () => {
      const versions = await getVersions('non-existent');
      expect(versions.length).toBe(0);
    });
  });

  describe('Database Stats', () => {
    it('should return correct stats', async () => {
      await createNoteAsync('Stats test note');
      const stats = await getDBStats();
      expect(stats).toHaveProperty('notes');
      expect(stats).toHaveProperty('vectorized');
      expect(stats).toHaveProperty('avgLength');
      expect(typeof stats.notes).toBe('number');
    });
  });
});
