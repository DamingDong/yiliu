import { useState, useEffect, useRef } from 'react';

interface WriteNoteProps {
  mode: 'new' | 'continue';
  noteTitle: string;
  initialContent?: string;
  onSave: (content: string) => void;
  onDiscard: () => void;
}

export function WriteNote({ mode, noteTitle, initialContent = '', onSave, onDiscard }: WriteNoteProps) {
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'continue' && initialContent) {
      setContent(initialContent);
      if (editorRef.current) {
        editorRef.current.innerText = initialContent;
        editorRef.current.focus();
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      setWordCount(initialContent.length);
    } else if (mode === 'new') {
      setContent('');
      setWordCount(0);
      if (editorRef.current) {
        editorRef.current.innerText = '';
      }
    }
  }, [mode, initialContent]);

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    setContent(text);
    setWordCount(text.length);
  };

  const handleSave = () => {
    if (!content.trim()) {
      alert('请先输入内容');
      return;
    }
    onSave(content);
    setContent('');
    setWordCount(0);
    if (editorRef.current) {
      editorRef.current.innerText = '';
    }
  };

  return (
    <div className="write-note">
      <div className="panel-header">
        <div className="panel-title">写笔记</div>
        <div className="panel-subtitle">手动输入，记录你的想法</div>
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
        <div className="editor-container">
          <div className="editor-toolbar">
            <button className="tool-btn" title="加粗">B</button>
            <button className="tool-btn" title="斜体"><i>I</i></button>
            <button className="tool-btn" title="标题">H</button>
            <button className="tool-btn" title="列表">☰</button>
            <button className="tool-btn" title="链接">🔗</button>
          </div>
          <div
            ref={editorRef}
            className="editor-content"
            contentEditable
            onInput={handleContentChange}
            suppressContentEditableWarning
            placeholder={mode === 'new' ? '开始记录你的想法...' : '在现有内容后继续书写...'}
          />
          <div className="editor-footer">
            <div className="editor-stats">{wordCount} 字</div>
          </div>
        </div>
      </div>
    </div>
  );
}
