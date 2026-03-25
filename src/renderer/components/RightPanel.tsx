import { type FrontendNote } from '../api';

interface RightPanelProps {
  notes: FrontendNote[];
  currentNote: FrontendNote | null;
  view: 'list' | 'detail';
  onSelectNote: (note: FrontendNote) => void;
  onEditNote: (note: FrontendNote) => void;
  onDeleteNote: (note: FrontendNote) => void;
  onUpdateNote?: (id: string, content: string) => void;
  onViewChange: (view: 'list' | 'detail') => void;
  loading?: boolean;
}

export function RightPanel({ notes, currentNote, view, onSelectNote, onEditNote, onDeleteNote, onUpdateNote, onViewChange, loading }: RightPanelProps) {
  return (
    <aside className="right-panel">
      <header className="right-header">
        <div className="panel-title">{view === 'list' ? '笔记列表' : '笔记详情'}</div>
        <div className="view-tabs">
          <button 
            className={`view-tab ${view === 'list' ? 'active' : ''}`}
            onClick={() => onViewChange('list')}
          >
            列表
          </button>
          <button 
            className={`view-tab ${view === 'detail' ? 'active' : ''}`}
            onClick={() => onViewChange('detail')}
          >
            详情
          </button>
        </div>
      </header>

      {view === 'list' ? (
        <div className="note-list">
          {notes.map(note => (
            <div 
              key={note.id} 
              className={`note-item ${currentNote?.id === note.id ? 'active' : ''}`}
              onClick={() => onSelectNote(note)}
            >
              <div className="note-title">{note.title}</div>
              <div className="note-preview">{note.content.slice(0, 50)}...</div>
              <div className="note-meta">{note.time} · #{note.tags[0] || '无标签'}</div>
            </div>
          ))}
        </div>
      ) : currentNote ? (
        <div className="note-detail">
          <div className="note-tags">
            {currentNote.tags.map(tag => (
              <span key={tag} className="note-tag manual">#{tag}</span>
            ))}
            <span className="note-tag ai-recommend">推荐 #项目</span>
          </div>
          <div className="note-detail-title">{currentNote.title}</div>
          <div className="note-detail-time">创建于 {currentNote.date} {currentNote.time} · 更新于 {currentNote.date} {currentNote.time}</div>
          <div className="note-detail-content">
            {currentNote.content.split('\n').map((line, i) => (
              <p key={i} style={{ marginBottom: line ? 8 : 0 }}>{line || <br />}</p>
            ))}
          </div>
          <div className="note-detail-actions">
            <button className="note-action edit" onClick={() => onEditNote(currentNote)}>
              编辑
            </button>
            <button className="note-action delete" onClick={() => onDeleteNote(currentNote)}>
              删除
            </button>
          </div>
        </div>
      ) : (
        <div className="note-list">
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 40 }}>
            选择一条笔记查看详情
          </div>
        </div>
      )}
    </aside>
  );
}