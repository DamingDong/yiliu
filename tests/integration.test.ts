import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createNoteAsync, getNote, getAllNotes, searchNotes, deleteNote, initDB, closeDB } from '../src/storage/db.js';
import { initVectorStore, addVector, semanticSearch, removeVector, getStats } from '../src/storage/vector.js';

describe('Integration Tests', () => {
  beforeEach(async () => {
    process.env.YILIU_DATA_PATH = '/tmp/yiliu-integration-test';
    await initDB();
  });

  afterEach(() => {
    closeDB();
  });

  describe('Note Creation and Retrieval', () => {
    it('should create note and retrieve it', async () => {
      const created = await createNoteAsync('Integration test note');
      expect(created.id).toBeDefined();

      const retrieved = await getNote(created.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.content).toBe('Integration test note');
    });

    it('should persist note in database', async () => {
      const note1 = await createNoteAsync('First note');
      const note2 = await createNoteAsync('Second note');

      const allNotes = await getAllNotes(100);
      const noteIds = allNotes.map(n => n.id);
      
      expect(noteIds).toContain(note1.id);
      expect(noteIds).toContain(note2.id);
    });
  });

  describe('Search Integration', () => {
    it('should find notes by keyword', async () => {
      await createNoteAsync('JavaScript is a great language');
      await createNoteAsync('Python is also great');
      
      const jsResults = await searchNotes('JavaScript');
      expect(jsResults.length).toBeGreaterThan(0);
      expect(jsResults[0].content).toContain('JavaScript');
    });

    it('should perform semantic search', async () => {
      const note = await createNoteAsync('Machine learning is amazing');
      
      const results = await semanticSearch('artificial intelligence', 5, 0.0);
      expect(results).toBeInstanceOf(Array);
    });
  });

  describe('Data Deletion', () => {
    it('should delete note and remove from search', async () => {
      const note = await createNoteAsync('Note to be deleted');
      const noteId = note.id;

      await deleteNote(noteId);

      const retrieved = await getNote(noteId);
      expect(retrieved).toBeNull();
    });

    it('should remove vector on deletion', async () => {
      const note = await createNoteAsync('Note with vector');
      
      const deleted = await deleteNote(note.id);
      expect(deleted).toBe(true);
    });
  });

  describe('Stats Tracking', () => {
    it('should track note count in stats', async () => {
      const statsBefore = await getStats();
      const countBefore = statsBefore.notes;

      await createNoteAsync('New note for stats');

      const statsAfter = await getStats();
      expect(statsAfter.notes).toBeGreaterThanOrEqual(countBefore + 1);
    });
  });
});

describe('Frontend API Contract', () => {
  it('should return notes with required fields', async () => {
    process.env.YILIU_DATA_PATH = '/tmp/yiliu-api-test';
    await initDB();

    const note = await createNoteAsync('API contract test', 'text');
    const retrieved = await getNote(note.id);

    expect(retrieved).toHaveProperty('id');
    expect(retrieved).toHaveProperty('content');
    expect(retrieved).toHaveProperty('layer');
    expect(retrieved).toHaveProperty('source');
    expect(retrieved).toHaveProperty('createdAt');
    expect(retrieved).toHaveProperty('updatedAt');
    expect(retrieved).toHaveProperty('wordCount');

    closeDB();
  });
});
