import { useState, useEffect } from 'react';
import { type FrontendNote } from '../api';

type SearchMode = 'auto' | 'keyword' | 'semantic';

interface SearchResultNote extends FrontendNote {
  matchType?: 'keyword' | 'semantic' | 'hybrid';
  score?: number;
}

interface SearchResult {
  note: FrontendNote;
  score: number;
}

interface KnowledgeBaseProps {
  notes: FrontendNote[];
  onSearch: (query: string) => Promise<SearchResult[]>;
  onFilterByTag: (tag: string) => FrontendNote[];
  onSelectNote: (note: FrontendNote) => void;
}

export function KnowledgeBase({ notes, onSearch, onFilterByTag, onSelectNote }: KnowledgeBaseProps) {
  const [query, setQuery] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [searchResults, setSearchResults] = useState<SearchResultNote[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('auto');
  const [tagSortBy, setTagSortBy] = useState<'usage' | 'name'>('usage');
  
  // 从笔记中动态计算所有标签及其使用次数
  const tagStats = notes.reduce((acc, note) => {
    note.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  // 按使用次数或名称排序标签
  const allTags = Object.entries(tagStats)
    .sort((a, b) => {
      if (tagSortBy === 'usage') {
        return b[1] - a[1]; // 按使用次数降序
      }
      return a[0].localeCompare(b[0]); // 按名称升序
    })
    .map(([tag]) => tag);
  
  useEffect(() => {
    const performSearch = async () => {
      if (query.trim()) {
        setSearching(true);
        try {
          const results = await onSearch(query);
          const processedResults: SearchResultNote[] = results.map((result) => ({
            ...result.note,
            matchType: searchMode === 'keyword' ? 'keyword' : 
                       searchMode === 'semantic' ? 'semantic' : 'hybrid',
            score: result.score,
          }));
          setSearchResults(processedResults);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults(null);
      }
    };
    
    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [query, onSearch, searchMode]);
  
  const displayedNotes = searchResults !== null
    ? searchResults
    : filterTag === 'all' 
      ? notes 
      : onFilterByTag(filterTag);

  const getModeLabel = (mode: SearchMode) => {
    switch (mode) {
      case 'auto': return '自动';
      case 'keyword': return '关键词';
      case 'semantic': return '语义';
    }
  };

  const getMatchTypeBadge = (matchType?: string, score?: number) => {
    if (!matchType) return null;
    const typeConfig = {
      keyword: { label: '关键词', color: '#6366f1', bg: '#eef2ff' },
      semantic: { label: '语义', color: '#8b5cf6', bg: '#f3e8ff' },
      hybrid: { label: '智能', color: '#10b981', bg: '#d1fae5' },
    };
    const config = typeConfig[matchType as keyof typeof typeConfig] || typeConfig.hybrid;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 10,
        background: config.bg,
        color: config.color,
      }}>
        {config.label}
        {score !== undefined && searchMode === 'semantic' && (
          <span>{(score * 100).toFixed(0)}%</span>
        )}
      </span>
    );
  };

  const highlightKeyword = (text: string, keyword: string) => {
    if (!keyword.trim() || searchMode === 'semantic') return text;
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === keyword.toLowerCase() 
        ? <mark key={i} style={{ background: '#fef08a', padding: '0 2px', borderRadius: 2 }}>{part}</mark>
        : part
    );
  };

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
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="tag-filters" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <button 
              className={`tag-filter ${filterTag === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTag('all')}
            >
              全部
            </button>
            {allTags.slice(0, 8).map(tag => (
              <button
                key={tag}
                className={`tag-filter ${filterTag === tag ? 'active' : ''}`}
                onClick={() => setFilterTag(tag)}
                title={`${tag} (${tagStats[tag]} 次)`}
              >
                {tag}
                <span style={{ 
                  marginLeft: 4, 
                  fontSize: 10, 
                  opacity: 0.6,
                  background: 'rgba(0,0,0,0.1)',
                  padding: '0 4px',
                  borderRadius: 3
                }}>
                  {tagStats[tag]}
                </span>
              </button>
            ))}
            {allTags.length > 8 && (
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                +{allTags.length - 8}
              </span>
            )}
            <button
              onClick={() => setTagSortBy(tagSortBy === 'usage' ? 'name' : 'usage')}
              style={{
                padding: '4px 8px',
                fontSize: 11,
                borderRadius: 4,
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                marginLeft: 8
              }}
              title={tagSortBy === 'usage' ? '按使用次数排序' : '按名称排序'}
            >
              {tagSortBy === 'usage' ? '次数↓' : 'A-Z'}
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: 4 }}>
            {(['auto', 'keyword', 'semantic'] as SearchMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setSearchMode(mode)}
                style={{
                  padding: '4px 10px',
                  fontSize: 11,
                  borderRadius: 6,
                  border: searchMode === mode ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  background: searchMode === mode ? 'var(--color-primary)' : 'white',
                  color: searchMode === mode ? 'white' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {getModeLabel(mode)}
              </button>
            ))}
          </div>
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
              {query ? (
                searching 
                  ? '搜索中...' 
                  : `找到 ${displayedNotes.length} 条相关笔记${searchResults ? ` · ${searchMode === 'auto' ? '智能' : searchMode === 'keyword' ? '关键词' : '语义'}搜索` : ''}`
              ) : `${filterTag} 分类 · ${displayedNotes.length} 篇笔记`}
            </div>
            {displayedNotes.map(note => (
              <div key={note.id} className="note-item" onClick={() => onSelectNote(note)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div className="note-title">{highlightKeyword(note.title, query)}</div>
                  {getMatchTypeBadge((note as SearchResultNote).matchType, (note as SearchResultNote).score)}
                </div>
                <div className="note-preview">{highlightKeyword(note.content.slice(0, 100), query)}...</div>
                <div className="note-meta">
                  {note.time} · #{note.tags[0] || '无标签'}
                  {(note as SearchResultNote).score !== undefined && searchResults && (
                    <span style={{ marginLeft: 8, color: 'var(--color-primary)' }}>
                      匹配度: {((note as SearchResultNote).score! * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
