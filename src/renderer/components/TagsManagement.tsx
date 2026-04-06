import { useState, useEffect } from 'react';

interface TagStats {
  name: string;
  count: number;
}

interface TagsManagementProps {
  tags?: TagStats[];
  onRefresh?: () => Promise<TagStats[]>;
  onRenameTag?: (oldName: string, newName: string) => Promise<boolean>;
  onDeleteTag?: (name: string) => Promise<boolean>;
  onMergeTags?: (source: string, target: string) => Promise<boolean>;
}

export function TagsManagement({ 
  tags: initialTags = [], 
  onRefresh,
  onRenameTag,
  onDeleteTag,
  onMergeTags
}: TagsManagementProps) {
  const [tags, setTags] = useState<TagStats[]>(initialTags);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'count' | 'name'>('count');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 编辑状态
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // 合并状态
  const [mergingTag, setMergingTag] = useState<string | null>(null);
  const [mergeTarget, setMergeTarget] = useState('');
  
  // 删除确认
  const [deletingTag, setDeletingTag] = useState<string | null>(null);

  useEffect(() => {
    if (initialTags.length > 0) {
      setTags(initialTags);
    }
  }, [initialTags]);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setLoading(true);
    try {
      const refreshed = await onRefresh();
      setTags(refreshed);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (oldName: string) => {
    if (!onRenameTag || !editValue.trim() || editValue === oldName) {
      setEditingTag(null);
      return;
    }
    
    const success = await onRenameTag(oldName, editValue.trim());
    if (success) {
      setTags(tags.map(t => t.name === oldName ? { ...t, name: editValue.trim() } : t));
    }
    setEditingTag(null);
    setEditValue('');
  };

  const handleDelete = async (name: string) => {
    if (!onDeleteTag) return;
    
    const success = await onDeleteTag(name);
    if (success) {
      setTags(tags.filter(t => t.name !== name));
    }
    setDeletingTag(null);
  };

  const handleMerge = async (source: string) => {
    if (!onMergeTags || !mergeTarget.trim()) {
      setMergingTag(null);
      setMergeTarget('');
      return;
    }
    
    const success = await onMergeTags(source, mergeTarget.trim());
    if (success) {
      await handleRefresh();
    }
    setMergingTag(null);
    setMergeTarget('');
  };

  // 过滤和排序标签
  const filteredTags = tags
    .filter(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'count') {
        comparison = a.count - b.count;
      } else {
        comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totalCount = tags.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="tags-management">
      <div className="panel-header">
        <div className="panel-title">标签管理</div>
        <div className="panel-subtitle">管理你的知识标签</div>
      </div>
      
      <div className="panel-content" style={{ padding: '20px 24px' }}>
        {/* 统计概览 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 16,
          marginBottom: 24 
        }}>
          <div style={{ 
            padding: 16, 
            background: 'var(--color-bg)', 
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-primary)' }}>
              {tags.length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              标签总数
            </div>
          </div>
          <div style={{ 
            padding: 16, 
            background: 'var(--color-bg)', 
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-primary)' }}>
              {totalCount}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              总使用次数
            </div>
          </div>
          <div style={{ 
            padding: 16, 
            background: 'var(--color-bg)', 
            borderRadius: 8,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-primary)' }}>
              {tags.length > 0 ? Math.round(totalCount / tags.length) : 0}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              平均使用
            </div>
          </div>
        </div>
        
        {/* 工具栏 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16,
          gap: 12
        }}>
          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            <input
              type="text"
              placeholder="搜索标签..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={e => {
                const [by, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(by);
                setSortOrder(order);
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              <option value="count-desc">使用次数 ↓</option>
              <option value="count-asc">使用次数 ↑</option>
              <option value="name-asc">名称 A-Z</option>
              <option value="name-desc">名称 Z-A</option>
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={loading || !onRefresh}
              style={{
                padding: '8px 16px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? '刷新中...' : '刷新'}
            </button>
          </div>
        </div>
        
        {/* 标签列表 */}
        <div style={{ 
          background: 'white',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 140px',
            padding: '12px 16px',
            background: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-border)',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-text-secondary)'
          }}>
            <div>标签名称</div>
            <div style={{ textAlign: 'center' }}>使用次数</div>
            <div style={{ textAlign: 'right' }}>操作</div>
          </div>
          
          {filteredTags.length === 0 ? (
            <div style={{ 
              padding: 40, 
              textAlign: 'center',
              color: 'var(--color-text-muted)'
            }}>
              {searchQuery ? '未找到匹配的标签' : '暂无标签'}
            </div>
          ) : (
            filteredTags.map(tag => (
              <div 
                key={tag.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 100px 140px',
                  padding: '12px 16px',
                  borderBottom: filteredTags.indexOf(tag) === filteredTags.length - 1 ? 'none' : '1px solid var(--color-border)',
                  alignItems: 'center'
                }}
              >
                {/* 标签名称 */}
                <div>
                  {editingTag === tag.name ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRename(tag.name);
                          if (e.key === 'Escape') {
                            setEditingTag(null);
                            setEditValue('');
                          }
                        }}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          border: '1px solid var(--color-primary)',
                          borderRadius: 4,
                          fontSize: 14,
                        }}
                      />
                      <button
                        onClick={() => handleRename(tag.name)}
                        style={{
                          padding: '4px 8px',
                          background: 'var(--color-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setEditingTag(null);
                          setEditValue('');
                        }}
                        style={{
                          padding: '4px 8px',
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 4,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        取消
                      </button>
                    </div>
                  ) : mergingTag === tag.name ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select
                        value={mergeTarget}
                        onChange={e => setMergeTarget(e.target.value)}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          border: '1px solid var(--color-primary)',
                          borderRadius: 4,
                          fontSize: 14,
                        }}
                      >
                        <option value="">选择目标标签</option>
                        {tags.filter(t => t.name !== tag.name).map(t => (
                          <option key={t.name} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleMerge(tag.name)}
                        disabled={!mergeTarget}
                        style={{
                          padding: '4px 8px',
                          background: 'var(--color-primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          fontSize: 12,
                          cursor: mergeTarget ? 'pointer' : 'not-allowed',
                          opacity: mergeTarget ? 1 : 0.5
                        }}
                      >
                        合并
                      </button>
                      <button
                        onClick={() => {
                          setMergingTag(null);
                          setMergeTarget('');
                        }}
                        style={{
                          padding: '4px 8px',
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 4,
                          fontSize: 12,
                          cursor: 'pointer'
                        }}
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <span 
                      className="note-tag manual"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setEditingTag(tag.name);
                        setEditValue(tag.name);
                      }}
                    >
                      #{tag.name}
                    </span>
                  )}
                </div>
                
                {/* 使用次数 */}
                <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 500 }}>
                  {tag.count}
                </div>
                
                {/* 操作按钮 */}
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setEditingTag(tag.name);
                      setEditValue(tag.name);
                    }}
                    title="重命名"
                    style={{
                      padding: '4px 8px',
                      background: 'transparent',
                      border: '1px solid var(--color-border)',
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: 'pointer',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    重命名
                  </button>
                  
                  {tags.length > 1 && (
                    <button
                      onClick={() => setMergingTag(tag.name)}
                      title="合并"
                      style={{
                        padding: '4px 8px',
                        background: 'transparent',
                        border: '1px solid var(--color-border)',
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      合并
                    </button>
                  )}
                  
                  <button
                    onClick={() => setDeletingTag(tag.name)}
                    title="删除"
                    style={{
                      padding: '4px 8px',
                      background: 'transparent',
                      border: '1px solid #ef4444',
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: 'pointer',
                      color: '#ef4444'
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* 删除确认对话框 */}
        {deletingTag && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: 24,
              borderRadius: 8,
              maxWidth: 400,
              width: '90%'
            }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                确认删除标签
              </div>
              <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 20 }}>
                确定要删除标签 <strong>#{deletingTag}</strong> 吗？<br />
                此操作将从所有笔记中移除该标签，且无法撤销。
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setDeletingTag(null)}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(deletingTag)}
                  style={{
                    padding: '8px 16px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
