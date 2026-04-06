import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initDB, closeDB, getNote, deleteNote, createNoteAsync } from '../../src/storage/db.js';
import { 
  initNotebookService,
  createNotebook,
  getNotebook,
  getAllNotebooks,
  updateNotebook,
  deleteNotebook,
  addNoteToNotebook,
  removeNoteFromNotebook,
  getNotesInNotebook,
  getNotebooksForNote
} from '../../src/services/notebook-service.js';

vi.mock('../../src/ai/index.js', () => ({
  generateEmbedding: vi.fn().mockResolvedValue(null),
  enhanceNote: vi.fn().mockResolvedValue(null),
  isAIAvailable: vi.fn().mockReturnValue(false),
}));

describe('Notebook Database Operations', () => {
  beforeEach(async () => {
    process.env.YILIU_DATA_PATH = '/tmp/yiliu-test-notebook-' + Date.now();
    await initDB();
    await initNotebookService();
  });

  afterEach(() => {
    closeDB();
  });

  describe('Notebook CRUD', () => {
    it('should create a notebook', async () => {
      const notebook = await createNotebook({
        name: '工作项目',
        icon: '💼',
        color: '#3B82F6',
        description: '工作相关的笔记'
      });
      
      expect(notebook.id).toBeDefined();
      expect(notebook.name).toBe('工作项目');
      expect(notebook.icon).toBe('💼');
      expect(notebook.color).toBe('#3B82F6');
      expect(notebook.description).toBe('工作相关的笔记');
      expect(notebook.noteCount).toBe(0);
      expect(notebook.createdAt).toBeDefined();
      expect(notebook.updatedAt).toBeDefined();
    });

    it('should create a notebook with minimal data', async () => {
      const notebook = await createNotebook({
        name: '简单笔记本'
      });
      
      expect(notebook.id).toBeDefined();
      expect(notebook.name).toBe('简单笔记本');
      expect(notebook.icon).toBeUndefined();
      expect(notebook.color).toBeUndefined();
      expect(notebook.noteCount).toBe(0);
    });

    it('should get a notebook by id', async () => {
      const created = await createNotebook({ name: '测试笔记本' });
      const retrieved = await getNotebook(created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('测试笔记本');
    });

    it('should return null for non-existent notebook', async () => {
      const retrieved = await getNotebook('non-existent-id');
      expect(retrieved).toBeNull();
    });

    it('should get all notebooks', async () => {
      await createNotebook({ name: '笔记本1' });
      await createNotebook({ name: '笔记本2' });
      await createNotebook({ name: '笔记本3' });
      
      const notebooks = await getAllNotebooks();
      
      expect(notebooks.length).toBe(3);
    });

    it('should update a notebook', async () => {
      const notebook = await createNotebook({ name: '原名称' });
      const updated = await updateNotebook(notebook.id, {
        name: '新名称',
        icon: '📝',
        color: '#10B981'
      });
      
      expect(updated).toBeDefined();
      expect(updated?.name).toBe('新名称');
      expect(updated?.icon).toBe('📝');
      expect(updated?.color).toBe('#10B981');
    });

    it('should update notebook partially', async () => {
      const notebook = await createNotebook({ 
        name: '测试',
        icon: '📂',
        color: '#3B82F6'
      });
      
      const updated = await updateNotebook(notebook.id, { name: '新名称' });
      
      expect(updated?.name).toBe('新名称');
      expect(updated?.icon).toBe('📂');
      expect(updated?.color).toBe('#3B82F6');
    });

    it('should return null when updating non-existent notebook', async () => {
      const updated = await updateNotebook('non-existent-id', { name: 'test' });
      expect(updated).toBeNull();
    });

    it('should delete a notebook', async () => {
      const notebook = await createNotebook({ name: '待删除' });
      const deleted = await deleteNotebook(notebook.id);
      
      expect(deleted).toBe(true);
      const retrieved = await getNotebook(notebook.id);
      expect(retrieved).toBeNull();
    });

    it('should return false when deleting non-existent notebook', async () => {
      const deleted = await deleteNotebook('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('Note-Notebook Association', () => {
    it('should add a note to a notebook', async () => {
      const notebook = await createNotebook({ name: '测试笔记本' });
      const note = await createNoteAsync('测试笔记内容');
      
      const result = await addNoteToNotebook(note.id, notebook.id, 'manual');
      
      expect(result).toBe(true);
    });

    it('should add a note to a notebook from AI source', async () => {
      const notebook = await createNotebook({ name: 'AI笔记本' });
      const note = await createNoteAsync('AI推荐笔记');
      
      const result = await addNoteToNotebook(note.id, notebook.id, 'ai');
      
      expect(result).toBe(true);
    });

    it('should get notebooks for a note', async () => {
      const notebook1 = await createNotebook({ name: '笔记本1' });
      const notebook2 = await createNotebook({ name: '笔记本2' });
      const note = await createNoteAsync('多笔记本笔记');
      
      await addNoteToNotebook(note.id, notebook1.id, 'manual');
      await addNoteToNotebook(note.id, notebook2.id, 'ai');
      
      const notebooks = await getNotebooksForNote(note.id);
      
      expect(notebooks.length).toBe(2);
      expect(notebooks.map(n => n.notebook.name)).toContain('笔记本1');
      expect(notebooks.map(n => n.notebook.name)).toContain('笔记本2');
    });

    it('should get notes in a notebook', async () => {
      const notebook = await createNotebook({ name: '笔记笔记本' });
      const note1 = await createNoteAsync('笔记内容1');
      const note2 = await createNoteAsync('笔记内容2');
      
      await addNoteToNotebook(note1.id, notebook.id, 'manual');
      await addNoteToNotebook(note2.id, notebook.id, 'manual');
      
      const notes = await getNotesInNotebook(notebook.id);
      
      expect(notes.length).toBe(2);
      expect(notes.map(n => n.note.content)).toContain('笔记内容1');
      expect(notes.map(n => n.note.content)).toContain('笔记内容2');
    });

    it('should update notebook noteCount when adding note', async () => {
      const notebook = await createNotebook({ name: '计数测试' });
      const note = await createNoteAsync('计数笔记');
      
      await addNoteToNotebook(note.id, notebook.id, 'manual');
      
      const updated = await getNotebook(notebook.id);
      expect(updated?.noteCount).toBe(1);
    });

    it('should remove a note from a notebook', async () => {
      const notebook = await createNotebook({ name: '移除测试' });
      const note = await createNoteAsync('待移除笔记');
      
      await addNoteToNotebook(note.id, notebook.id, 'manual');
      const removed = await removeNoteFromNotebook(note.id, notebook.id);
      
      expect(removed).toBe(true);
      const notebooks = await getNotebooksForNote(note.id);
      expect(notebooks.length).toBe(0);
    });

    it('should update notebook noteCount when removing note', async () => {
      const notebook = await createNotebook({ name: '计数测试2' });
      const note = await createNoteAsync('待移除计数笔记');
      
      await addNoteToNotebook(note.id, notebook.id, 'manual');
      await removeNoteFromNotebook(note.id, notebook.id);
      
      const updated = await getNotebook(notebook.id);
      expect(updated?.noteCount).toBe(0);
    });

    it('should delete note-notebook associations when note is deleted', async () => {
      const notebook = await createNotebook({ name: '关联测试' });
      const note = await createNoteAsync('关联笔记');
      
      await addNoteToNotebook(note.id, notebook.id, 'manual');
      await deleteNote(note.id);
      
      const notebooks = await getNotebooksForNote(note.id);
      expect(notebooks.length).toBe(0);
    });

    it('should update notebook noteCount when associated note is deleted', async () => {
      const notebook = await createNotebook({ name: '级联删除测试' });
      const note = await createNoteAsync('级联删除笔记');
      
      await addNoteToNotebook(note.id, notebook.id, 'manual');
      expect((await getNotebook(notebook.id))?.noteCount).toBe(1);
      
      await deleteNote(note.id);
      
      const updated = await getNotebook(notebook.id);
      expect(updated?.noteCount).toBe(0);
    });

    it('should delete all associations when notebook is deleted', async () => {
      const notebook = await createNotebook({ name: '删除笔记本' });
      const note1 = await createNoteAsync('笔记1');
      const note2 = await createNoteAsync('笔记2');
      
      await addNoteToNotebook(note1.id, notebook.id, 'manual');
      await addNoteToNotebook(note2.id, notebook.id, 'manual');
      
      await deleteNotebook(notebook.id);
      
      const notes1 = await getNotebooksForNote(note1.id);
      const notes2 = await getNotebooksForNote(note2.id);
      expect(notes1.length).toBe(0);
      expect(notes2.length).toBe(0);
    });
  });

  describe('NoteNotebook Data', () => {
    it('should store isPrimary flag', async () => {
      const notebook = await createNotebook({ name: '主笔记本' });
      const note = await createNoteAsync('主笔记测试');
      
      await addNoteToNotebook(note.id, notebook.id, 'manual', true);
      
      const notebooks = await getNotebooksForNote(note.id);
      expect(notebooks[0].isPrimary).toBe(true);
    });

    it('should store addedAt timestamp', async () => {
      const notebook = await createNotebook({ name: '时间戳测试' });
      const note = await createNoteAsync('时间戳笔记');
      const beforeAdd = Date.now();
      
      await addNoteToNotebook(note.id, notebook.id, 'manual');
      const afterAdd = Date.now();
      
      const notebooks = await getNotebooksForNote(note.id);
      expect(notebooks[0].addedAt).toBeGreaterThanOrEqual(beforeAdd);
      expect(notebooks[0].addedAt).toBeLessThanOrEqual(afterAdd);
    });

    it('should store source correctly', async () => {
      const notebook = await createNotebook({ name: '来源测试' });
      const note = await createNoteAsync('来源笔记');
      
      await addNoteToNotebook(note.id, notebook.id, 'ai');
      
      const notebooks = await getNotebooksForNote(note.id);
      expect(notebooks[0].source).toBe('ai');
    });
  });
});
