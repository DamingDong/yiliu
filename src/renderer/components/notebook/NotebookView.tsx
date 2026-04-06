import { useState, useEffect } from 'react';
import { api } from '../../api';
import type { FrontendNote } from '../../api';

interface Notebook {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  noteCount: number;
}

interface NotebookViewProps {
  notebook: Notebook;
  onBack: () => void;
  onSelectNote: (noteId: string) => void;
}

export function NotebookView({ notebook, onBack, onSelectNote }: NotebookViewProps) {
  const [notes, setNotes] = useState<FrontendNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadNotes();
  }, [notebook.id]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const result = await api.getNotesInNotebook(notebook.id);
      setNotes(result);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveNote = async (noteId: string) => {
    try {
      await api.removeNoteFromNotebook(noteId, notebook.id);
      loadNotes();
    } catch (err) {
      console.error('Failed to remove note:', err);
    }
  };

  const filteredNotes = searchQuery
    ? notes.filter(n => n.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : notes;

  return (
    <div className="notebook-view">
      <div className="notebook-view-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div className="notebook-title">
          <span className="notebook-icon">{notebook.icon || '📂'}</span>
          <span className="notebook-name">{notebook.name}</span>
          <span className="notebook-count">{notes.length} 条笔记</span>
        </div>
      </div>

      <div className="notebook-view-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="搜索笔记本内容..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="notebook-view-content">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="empty-state">
            <p>暂无笔记</p>
            <p>这个笔记本还没有笔记</p>
          </div>
        ) : (
          <div className="note-list">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className="note-item"
                onClick={() => onSelectNote(note.id)}
              >
                <div className="note-content">
                  <p className="note-text">{note.content.slice(0, 100)}</p>
                  <div className="note-meta">
                    <span className="note-date">{note.date}</span>
                    {note.tags.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="note-tag">#{tag}</span>
                    ))}
                  </div>
                </div>
                <button
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveNote(note.id);
                  }}
                >
                  移除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
