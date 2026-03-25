import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { InstantInspiration } from './components/InstantInspiration';
import { WriteNote } from './components/WriteNote';
import { KnowledgeBase } from './components/KnowledgeBase';
import { ExportBackup } from './components/ExportBackup';
import { Settings } from './components/Settings';
import { RightPanel } from './components/RightPanel';
import { api, type FrontendNote } from './api';

const rightPanelConfig: Record<number, boolean> = {
  0: true,   // 即时灵感
  1: false,  // 写笔记
  2: true,   // 知识库
  3: false,  // 导出备份
  4: false,  // 设置
};

function App() {
  const [activePanel, setActivePanel] = useState(0);
  const [notes, setNotes] = useState<FrontendNote[]>([]);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [rightView, setRightView] = useState<'list' | 'detail'>('list');
  const [writeMode, setWriteMode] = useState<'new' | 'continue'>('new');
  const [continueNoteTitle, setContinueNoteTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
    
    const unsubscribe = api.onError((err) => {
      setError(err);
      setTimeout(() => setError(null), 5000);
    });
    
    return () => unsubscribe();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const loadedNotes = await api.getAllNotes(50);
      setNotes(loadedNotes);
    } catch (err) {
      console.error('Failed to load notes:', err);
      setError('加载笔记失败');
    } finally {
      setLoading(false);
    }
  };

  const showRightPanel = rightPanelConfig[activePanel] ?? true;

  const handleSendMessage = useCallback(async (content: string) => {
    try {
      const newNote = await api.createNote(content, 'text');
      if (newNote) {
        setNotes(prev => [newNote, ...prev]);
      }
    } catch (err) {
      console.error('Failed to create note:', err);
      setError('保存笔记失败');
    }
  }, []);

  const handleSaveNote = useCallback(async (content: string) => {
    try {
      const newNote = await api.createNote(content, 'text');
      if (newNote) {
        setNotes(prev => [newNote, ...prev]);
        setWriteMode('new');
        setContinueNoteTitle('');
      }
    } catch (err) {
      console.error('Failed to save note:', err);
      setError('保存笔记失败');
    }
  }, []);

  const handleEditNote = useCallback((note: FrontendNote) => {
    setWriteMode('continue');
    setContinueNoteTitle(note.title);
    setActivePanel(1);
  }, []);

  const handleDeleteNote = useCallback(async (note: FrontendNote) => {
    if (confirm('确定要删除这条笔记吗？')) {
      try {
        const success = await api.deleteNote(note.id);
        if (success) {
          setNotes(prev => prev.filter(n => n.id !== note.id));
          if (currentNoteId === note.id) {
            setCurrentNoteId(null);
            setRightView('list');
          }
        }
      } catch (err) {
        console.error('Failed to delete note:', err);
        setError('删除笔记失败');
      }
    }
  }, [currentNoteId]);

  const handleSearch = useCallback(async (query: string): Promise<FrontendNote[]> => {
    if (!query.trim()) return notes;
    try {
      return await api.semanticSearch(query).then(results => 
        results.map(r => r.note)
      );
    } catch (err) {
      console.error('Search failed:', err);
      return notes.filter(n => 
        n.content.includes(query) || n.title.includes(query)
      );
    }
  }, [notes]);

  const handleFilterByTag = useCallback((tag: string): FrontendNote[] => {
    if (tag === 'all') return notes;
    return notes.filter(n => n.tags.includes(tag));
  }, [notes]);

  const handleUpdateNote = useCallback(async (id: string, content: string) => {
    try {
      const updated = await api.updateNote(id, content);
      if (updated) {
        setNotes(prev => prev.map(n => n.id === id ? updated : n));
      }
    } catch (err) {
      console.error('Failed to update note:', err);
      setError('更新笔记失败');
    }
  }, []);

  return (
    <div className={`app-container ${!showRightPanel ? 'panel-hide-right' : ''}`}>
      {error && (
        <div className="error-toast" style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ef4444',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 8,
          zIndex: 9999,
        }}>
          {error}
        </div>
      )}
      
      <Sidebar activePanel={activePanel} onNavigate={setActivePanel} />
      
      <main className="panel-content-area">
        {activePanel === 0 && (
          <InstantInspiration onSend={handleSendMessage} />
        )}
        {activePanel === 1 && (
          <WriteNote 
            mode={writeMode} 
            noteTitle={writeMode === 'continue' ? continueNoteTitle : ''}
            onSave={handleSaveNote}
            onDiscard={() => {
              setWriteMode('new');
              setContinueNoteTitle('');
            }}
          />
        )}
        {activePanel === 2 && (
          <KnowledgeBase 
            notes={notes}
            onSearch={handleSearch}
            onFilterByTag={handleFilterByTag}
            onSelectNote={(note) => {
              setCurrentNoteId(note.id);
              setRightView('detail');
            }}
          />
        )}
        {activePanel === 3 && <ExportBackup notes={notes} />}
        {activePanel === 4 && <Settings />}
      </main>

      {showRightPanel && (
        <RightPanel
          notes={notes}
          currentNote={notes.find(n => n.id === currentNoteId) || null}
          view={rightView}
          onSelectNote={(note) => {
            setCurrentNoteId(note.id);
            setRightView('detail');
          }}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          onUpdateNote={handleUpdateNote}
          onViewChange={setRightView}
          loading={loading}
        />
      )}
    </div>
  );
}

export default App;