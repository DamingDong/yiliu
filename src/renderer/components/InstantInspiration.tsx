import { useState, useRef, useEffect } from 'react';
import { api, type FrontendNote } from '../api';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  tags?: string[];
  summary?: string;
  time?: string;
}

interface InstantInspirationProps {
  onSend?: (content: string) => void;
}

export function InstantInspiration({ onSend }: InstantInspirationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    const unsubscribe = window.electronAPI.onFocusInput(() => {
      inputRef.current?.focus();
    });
    return unsubscribe;
  }, []);

  const loadHistory = async () => {
    try {
      const notes = await api.getAllNotes(10);
      const historyMessages: Message[] = notes.map(n => ({
        id: n.id,
        content: n.content,
        isUser: true,
        tags: n.tags,
        summary: n.summary,
        time: n.time,
      }));
      setMessages(historyMessages);
    } catch (err) {
      console.error('[即时灵感] 加载历史失败:', err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const note = await api.createNote(input, 'text');

      if (note) {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          content: '已保存！',
          isUser: false,
          tags: note.tags,
          summary: note.summary,
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error('[即时灵感] 保存失败:', err);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        content: '保存失败，请重试',
        isUser: false,
      }]);
    } finally {
      setLoading(false);
    }

    setInput('');
    if (onSend) onSend(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="instant-inspiration">
      <div className="panel-header">
        <div className="panel-title">即时灵感</div>
        <div className="panel-subtitle">快速记录想法，AI 自动整理</div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>还没有记录任何想法</p>
            <p>输入内容开始记录吧</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className="message">
            <div className={`message-avatar ${msg.isUser ? 'user' : 'ai'}`}>
              {msg.isUser ? '我' : 'AI'}
            </div>
            <div className="message-content">
              <div className="message-label">
                {msg.isUser ? '你' : '忆流'}
                {msg.time && <span className="message-time">{msg.time}</span>}
              </div>
              <div className="message-text">
                {msg.isUser ? (
                  <p>{msg.content}</p>
                ) : (
                  <>
                    <p>{msg.content}</p>
                    {(msg.tags?.length || msg.summary) && (
                      <blockquote>
                        {msg.summary && (
                          <>
                            📝 <strong>摘要</strong>
                            <br />
                            <span className="summary-text">{msg.summary}</span>
                            <br /><br />
                          </>
                        )}
                        {msg.tags && msg.tags.length > 0 && (
                          <>
                            🏷️ <em>{msg.tags.map(t => `#${t}`).join(' ')}</em>
                          </>
                        )}
                      </blockquote>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message">
            <div className="message-avatar ai">AI</div>
            <div className="message-content">
              <div className="message-label">忆流</div>
              <div className="message-text">
                <p className="loading-text">正在处理...</p>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="记录你的想法..."
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
              }}
              onKeyDown={handleKeyDown}
              rows={1}
            />
          </div>
          <button className="send-btn" onClick={handleSend} disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22,2 15,22 11,13 2,9 22,2" />
            </svg>
          </button>
        </div>
        <div className="input-hint">
          <span><kbd>Enter</kbd> 发送</span>
          <span><kbd>⌘K</kbd> 快速记录</span>
        </div>
      </div>
    </div>
  );
}
