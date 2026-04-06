import { useState } from 'react';
import { api } from '../../api';

interface Notebook {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  noteCount: number;
}

interface NotebookListProps {
  notebooks: Notebook[];
  selectedNotebookId: string | null;
  onSelectNotebook: (id: string | null) => void;
  onCreateNotebook?: (notebook: Notebook) => void;
}

const ICONS = ['📂', '📁', '📚', '💡', '📝', '💼', '🎯', '⭐'];
const COLORS = [
  { name: 'blue', class: 'bg-blue-500', hex: '#3B82F6' },
  { name: 'green', class: 'bg-green-500', hex: '#10B981' },
  { name: 'yellow', class: 'bg-yellow-500', hex: '#F59E0B' },
  { name: 'red', class: 'bg-red-500', hex: '#EF4444' },
  { name: 'purple', class: 'bg-purple-500', hex: '#8B5CF6' },
];

export function NotebookList({ notebooks, selectedNotebookId, onSelectNotebook, onCreateNotebook }: NotebookListProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📂');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [contextMenu, setContextMenu] = useState<{ notebook: Notebook; x: number; y: number } | null>(null);
  const [editingNotebook, setEditingNotebook] = useState<Notebook | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Notebook | null>(null);

  const handleCreate = async () => {
    if (!newNotebookName.trim()) return;
    
    try {
      const notebook = await api.createNotebook({
        name: newNotebookName.trim(),
        icon: selectedIcon,
        color: selectedColor.hex,
      });
      
      if (notebook && onCreateNotebook) {
        onCreateNotebook(notebook);
      }
      
      setShowCreateDialog(false);
      setNewNotebookName('');
      setSelectedIcon('📂');
      setSelectedColor(COLORS[0]);
    } catch (err) {
      console.error('Failed to create notebook:', err);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, notebook: Notebook) => {
    e.preventDefault();
    setContextMenu({ notebook, x: e.clientX, y: e.clientY });
  };

  const handleRename = () => {
    if (!contextMenu) return;
    setEditingNotebook(contextMenu.notebook);
    setEditName(contextMenu.notebook.name);
    setContextMenu(null);
  };

  const handleSaveRename = async () => {
    if (!editingNotebook || !editName.trim()) return;
    
    try {
      await api.updateNotebook(editingNotebook.id, { name: editName.trim() });
      setEditingNotebook(null);
      setEditName('');
    } catch (err) {
      console.error('Failed to rename notebook:', err);
    }
  };

  const handleDelete = () => {
    if (!contextMenu) return;
    setDeleteConfirm(contextMenu.notebook);
    setContextMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await api.deleteNotebook(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete notebook:', err);
    }
  };

  return (
    <div className="notebook-list">
      <div className="notebook-list-header">
        <span className="notebook-list-title">笔记本</span>
        <button 
          className="notebook-create-btn"
          onClick={() => setShowCreateDialog(true)}
        >
          +新
        </button>
      </div>

      {notebooks.length === 0 ? (
        <div className="notebook-empty">
          <p>暂无笔记本</p>
          <p>点击上方 + 创建笔记本</p>
        </div>
      ) : (
        <div className="notebook-items">
          {notebooks.map(notebook => (
            <div
              key={notebook.id}
              className={`notebook-item ${selectedNotebookId === notebook.id ? 'selected' : ''}`}
              onClick={() => onSelectNotebook(notebook.id)}
              onContextMenu={(e) => handleContextMenu(e, notebook)}
            >
              <span className="notebook-icon">{notebook.icon || '📂'}</span>
              <span className="notebook-name">{notebook.name}</span>
              <span className="notebook-count">({notebook.noteCount})</span>
            </div>
          ))}
        </div>
      )}

      {showCreateDialog && (
        <div className="dialog-overlay" onClick={() => setShowCreateDialog(false)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <h3 className="dialog-title">新建笔记本</h3>
            
            <div className="dialog-field">
              <input
                type="text"
                className="dialog-input"
                placeholder="笔记本名称"
                value={newNotebookName}
                onChange={e => setNewNotebookName(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="dialog-field">
              <label className="dialog-label">图标</label>
              <div className="icon-options" data-testid="selected-icon">
                {ICONS.map(icon => (
                  <button
                    key={icon}
                    className={`icon-option ${selectedIcon === icon ? 'selected' : ''}`}
                    onClick={() => setSelectedIcon(icon)}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="dialog-field">
              <label className="dialog-label">颜色</label>
              <div className="color-options">
                {COLORS.map(color => (
                  <button
                    key={color.name}
                    data-testid={`color-${color.name}`}
                    className={`color-option ${selectedColor.name === color.name ? 'selected' : ''} ${color.class}`}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
            
            <div className="dialog-actions">
              <button className="dialog-btn cancel" onClick={() => setShowCreateDialog(false)}>
                取消
              </button>
              <button className="dialog-btn primary" onClick={handleCreate}>
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {editingNotebook && (
        <div className="dialog-overlay" onClick={() => setEditingNotebook(null)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <h3 className="dialog-title">重命名笔记本</h3>
            
            <div className="dialog-field">
              <input
                type="text"
                className="dialog-input"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="dialog-actions">
              <button className="dialog-btn cancel" onClick={() => setEditingNotebook(null)}>
                取消
              </button>
              <button className="dialog-btn primary" onClick={handleSaveRename}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="dialog-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <h3 className="dialog-title">确认删除笔记本</h3>
            <p className="dialog-message">
              确定要删除笔记本「{deleteConfirm.name}」吗？笔记不会被删除。
            </p>
            
            <div className="dialog-actions">
              <button className="dialog-btn cancel" onClick={() => setDeleteConfirm(null)}>
                取消
              </button>
              <button className="dialog-btn danger" onClick={handleConfirmDelete}>
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {contextMenu && (
        <>
          <div className="context-menu-overlay" onClick={() => setContextMenu(null)} />
          <div 
            className="context-menu"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button className="context-menu-item" onClick={handleRename}>
              重命名
            </button>
            <button className="context-menu-item danger" onClick={handleDelete}>
              删除
            </button>
          </div>
        </>
      )}
    </div>
  );
}
