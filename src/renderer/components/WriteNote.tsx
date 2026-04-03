import { useState, useEffect } from 'react';
import { MarkdownEditor, type EditorMode } from './MarkdownEditor';

interface WriteNoteProps {
  mode: 'new' | 'continue';
  noteTitle: string;
  initialContent?: string;
  onSave: (content: string) => void;
  onDiscard: () => void;
}

export function WriteNote({ mode, noteTitle, initialContent = '', onSave, onDiscard }: WriteNoteProps) {
  const [content, setContent] = useState('');
  const [editorMode, setEditorMode] = useState<EditorMode>('edit');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (mode === 'continue' && initialContent) {
      setContent(initialContent);
    } else if (mode === 'new') {
      setContent('');
    }
  }, [mode, initialContent]);

  useEffect(() => {
    const chars = content.length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    setCharCount(chars);
    setWordCount(words);
  }, [content]);

  const handleSave = () => {
    if (!content.trim()) {
      alert('请先输入内容');
      return;
    }
    onSave(content);
    setContent('');
    setWordCount(0);
    setCharCount(0);
  };

  return (
    <div className="write-note">
      <div className="panel-header">
        <div className="panel-title">写笔记</div>
        <div className="panel-subtitle">支持 Markdown 语法</div>
      </div>
      
      <div className="write-mode-bar">
        <div className={`write-mode-badge ${mode}`}>
          <span>{mode === 'new' ? '🆕' : '✏️'}</span>
          <span>
            {mode === 'new' ? '新建笔记' : `续写：${noteTitle}`}
          </span>
        </div>
        <div className="write-mode-actions">
          <button className="write-mode-btn secondary" onClick={onDiscard}>
            放弃
          </button>
          <button className="write-mode-btn primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
      
      <div className="panel-content">
        <div className="editor-container markdown-container">
          <MarkdownEditor
            value={content}
            onChange={setContent}
            mode={editorMode}
            onModeChange={setEditorMode}
            placeholder={mode === 'new' ? '开始记录你的想法...\n\n支持 Markdown 语法：\n- 标题使用 #\n- 列表使用 - 或 1.\n- 代码使用 ```\n- 公式使用 $...$' : '在现有内容后继续书写...'}
          />
          <div className="editor-footer">
            <div className="editor-stats">
              {charCount} 字符 · {wordCount} 词
            </div>
            <div className="editor-hints">
              <span className="hint-item"><kbd>⌘B</kbd> 加粗</span>
              <span className="hint-item"><kbd>⌘I</kbd> 斜体</span>
              <span className="hint-item"><kbd>⌘K</kbd> 链接</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
