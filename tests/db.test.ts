import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createNoteAsync, getNote, getAllNotes, searchNotes, deleteNote, getVersions, initDB, closeDB } from '../src/storage/db.js';

describe('Database Operations', () => {
  beforeEach(async () => {
    await initDB();
  });

  afterEach(() => {
    closeDB();
  });

  it('should create a note', async () => {
    const note = await createNoteAsync('Test note content');
    expect(note.id).toBeDefined();
    expect(note.content).toBe('Test note content');
  });

  it('should get a note by id', async () => {
    const created = await createNoteAsync('Note to retrieve');
    const retrieved = await getNote(created.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.content).toBe('Note to retrieve');
  });

  it('should get all notes', async () => {
    await createNoteAsync('Note 1');
    await createNoteAsync('Note 2');
    const notes = await getAllNotes(10);
    expect(notes.length).toBeGreaterThanOrEqual(2);
  });

  it('should search notes by keyword', async () => {
    await createNoteAsync('Unique search term xyz123');
    const results = await searchNotes('xyz123');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toContain('xyz123');
  });

  it('should delete a note', async () => {
    const created = await createNoteAsync('Note to delete');
    const deleted = await deleteNote(created.id);
    expect(deleted).toBe(true);
    const retrieved = await getNote(created.id);
    expect(retrieved).toBeNull();
  });

  it('should create version history', async () => {
    const note = await createNoteAsync('Version test');
    const versions = await getVersions(note.id);
    expect(versions.length).toBe(1);
    expect(versions[0].version).toBe(1);
  });
});
