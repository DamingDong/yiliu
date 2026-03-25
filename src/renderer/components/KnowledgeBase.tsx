import { useState, useEffect } from 'react';
import { type FrontendNote } from '../api';

interface KnowledgeBaseProps {
  notes: FrontendNote[];
  onSearch: (query: string) => Promise<FrontendNote[]>;
  onFilterByTag: (tag: string) => FrontendNote[];
  onSelectNote: (note: FrontendNote) => void;
}

export function KnowledgeBase({ notes, onSearch, onFilterByTag, onSelectNote }: KnowledgeBaseProps) {
  const [query, setQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [searchResults, setSearchResults] = useState<FrontendNote[] | null>(null);
  const [searching, setSearching] = useState(false);
  
  const allTags = ['技术', '工作', '读书', '想法', '学习', '会议', '项目', '想法'];
  
  useEffect(() => {
    const performSearch = async () => {
      if (query.trim()) {
        setSearching(true);
        try {
          const results = await onSearch(query);
          setSearchResults(results);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults(null);
      }
    };
    
    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [query, onSearch]);
  
  const displayedNotes = searchResults !== null
    ? searchResults
    : filterTag === 'all' 
      ? notes 
      : onFilterByTag(filterTag);

  return (
    <div className="knowledge-base">
      <div className="panel-header">
        <div className="panel-title">知识库</div>
        <div className="panel-subtitle">你的知识资产</div>
      </div>
      
      <div className="panel-content">
        <div className="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 12 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="搜索笔记内容..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        
        <div className="tag-filters">
          <button 
            className={`tag-filter ${filterTag === 'all' ? 'active' : ''}`}
            onClick={() => setFilterTag('all')}
          >
            全部
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              className={`tag-filter ${filterTag === tag ? 'active' : ''}`}
              onClick={() => setFilterTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
        
        {!query && filterTag === 'all' ? (
          <div className="grid-cards">
            <div className="grid-card" onClick={() => setFilterTag('技术')}>
              <div className="grid-card-icon">📚</div>
              <div className="grid-card-title">技术学习</div>
              <div className="grid-card-desc">{notes.filter(n => n.tags.includes('技术')).length} 篇笔记</div>
            </div>
            <div className="grid-card" onClick={() => setFilterTag('工作')}>
              <div className="grid-card-icon">💼</div>
              <div className="grid-card-title">工作项目</div>
              <div className="grid-card-desc">{notes.filter(n => n.tags.includes('工作')).length} 篇笔记</div>
            </div>
            <div className="grid-card" onClick={() => setFilterTag('读书')}>
              <div className="grid-card-icon">📖</div>
              <div className="grid-card-title">读书笔记</div>
              <div className="grid-card-desc">{notes.filter(n => n.tags.includes('读书')).length} 篇笔记</div>
            </div>
            <div className="grid-card" onClick={() => setFilterTag('想法')}>
              <div className="grid-card-icon">💡</div>
              <div className="grid-card-title">想法创意</div>
              <div className="grid-card-desc">{notes.filter(n => n.tags.includes('想法')).length} 篇笔记</div>
            </div>
          </div>
        ) : (
          <div className="note-list" style={{ padding: '0 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 12 }}>
              {query ? (searching ? '搜索中...' : `找到 ${displayedNotes.length} 条相关笔记`) : `${filterTag} 分类 · ${displayedNotes.length} 篇笔记`}
            </div>
            {displayedNotes.map(note => (
              <div key={note.id} className="note-item" onClick={() => onSelectNote(note)}>
                <div className="note-title">{note.title}</div>
                <div className="note-preview">{note.content.slice(0, 50)}...</div>
                <div className="note-meta">{note.time} · #{note.tags[0] || '无标签'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}