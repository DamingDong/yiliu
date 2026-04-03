import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

export type EditorMode = 'edit' | 'preview' | 'split';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  mode?: EditorMode;
  onModeChange?: (mode: EditorMode) => void;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  mode = 'edit',
  onModeChange,
  placeholder = '开始记录你的想法...',
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const isMod = isMac ? e.metaKey : e.ctrlKey;

      if (isMod && e.key === 'b') {
        e.preventDefault();
        wrapSelection('**', '**');
      } else if (isMod && e.key === 'i') {
        e.preventDefault();
        wrapSelection('*', '*');
      } else if (isMod && e.key === 'k') {
        e.preventDefault();
        insertLink();
      } else if (isMod && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        insertCodeBlock();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        insertAtCursor('  ');
      }
    },
    [isMac]
  );

  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || '链接文字';
    const linkTemplate = `[${selectedText}](url)`;
    const newText = value.substring(0, start) + linkTemplate + value.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const urlStart = start + selectedText.length + 3;
      textarea.setSelectionRange(urlStart, urlStart + 3);
    }, 0);
  };

  const insertCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const selectedText = value.substring(start, textarea.selectionEnd) || '代码';
    const codeBlock = `\n\`\`\`\n${selectedText}\n\`\`\`\n`;
    const newText = value.substring(0, start) + codeBlock + value.substring(textarea.selectionEnd);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const codeStart = start + 4;
      textarea.setSelectionRange(codeStart, codeStart + selectedText.length);
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + text + value.substring(start);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleToolbarAction = (action: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus();

    switch (action) {
      case 'bold':
        wrapSelection('**', '**');
        break;
      case 'italic':
        wrapSelection('*', '*');
        break;
      case 'heading':
        insertAtCursor('\n## ');
        break;
      case 'list':
        insertAtCursor('\n- ');
        break;
      case 'ordered-list':
        insertAtCursor('\n1. ');
        break;
      case 'link':
        insertLink();
        break;
      case 'image':
        insertAtCursor('\n![alt](image-url)\n');
        break;
      case 'code':
        insertAtCursor('`code`');
        break;
      case 'code-block':
        insertCodeBlock();
        break;
      case 'quote':
        insertAtCursor('\n> ');
        break;
      case 'math':
        insertAtCursor('\n$$\nformula\n$$\n');
        break;
      case 'hr':
        insertAtCursor('\n---\n');
        break;
    }
  };

  const modes: { key: EditorMode; label: string; icon: string }[] = [
    { key: 'edit', label: '编辑', icon: '✏️' },
    { key: 'preview', label: '预览', icon: '👁️' },
    { key: 'split', label: '分屏', icon: '◐' },
  ];

  return (
    <div className="markdown-editor">
      <div className="markdown-toolbar">
        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            title={`加粗 (${isMac ? '⌘' : 'Ctrl'}+B)`}
            onClick={() => handleToolbarAction('bold')}
          >
            <strong>B</strong>
          </button>
          <button
            className="toolbar-btn"
            title={`斜体 (${isMac ? '⌘' : 'Ctrl'}+I)`}
            onClick={() => handleToolbarAction('italic')}
          >
            <em>I</em>
          </button>
          <button
            className="toolbar-btn"
            title="标题"
            onClick={() => handleToolbarAction('heading')}
          >
            H
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            title="无序列表"
            onClick={() => handleToolbarAction('list')}
          >
            ☰
          </button>
          <button
            className="toolbar-btn"
            title="有序列表"
            onClick={() => handleToolbarAction('ordered-list')}
          >
            1.
          </button>
          <button
            className="toolbar-btn"
            title="引用"
            onClick={() => handleToolbarAction('quote')}
          >
            "
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            title={`链接 (${isMac ? '⌘' : 'Ctrl'}+K)`}
            onClick={() => handleToolbarAction('link')}
          >
            🔗
          </button>
          <button
            className="toolbar-btn"
            title="图片"
            onClick={() => handleToolbarAction('image')}
          >
            🖼️
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            title="行内代码"
            onClick={() => handleToolbarAction('code')}
          >
            {'</>'}
          </button>
          <button
            className="toolbar-btn"
            title={`代码块 (${isMac ? '⌘' : 'Ctrl'}+⇧+C)`}
            onClick={() => handleToolbarAction('code-block')}
          >
            ⌨️
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            className="toolbar-btn"
            title="数学公式"
            onClick={() => handleToolbarAction('math')}
          >
            ∑
          </button>
          <button
            className="toolbar-btn"
            title="分隔线"
            onClick={() => handleToolbarAction('hr')}
          >
            —
          </button>
        </div>

        <div className="toolbar-spacer" />

        <div className="mode-switcher">
          {modes.map((m) => (
            <button
              key={m.key}
              className={`mode-btn ${mode === m.key ? 'active' : ''}`}
              onClick={() => onModeChange?.(m.key)}
              title={m.label}
            >
              {m.icon}
            </button>
          ))}
        </div>
      </div>

      <div className={`editor-body ${mode}`}>
        {(mode === 'edit' || mode === 'split') && (
          <div className="editor-pane">
            <textarea
              ref={textareaRef}
              className="markdown-textarea"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              spellCheck={false}
            />
          </div>
        )}
        {(mode === 'preview' || mode === 'split') && (
          <div className="preview-pane">
            <div className="markdown-preview">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
              >
                {value || '*暂无内容*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
