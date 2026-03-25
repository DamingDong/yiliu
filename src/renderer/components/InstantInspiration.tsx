import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  tags?: string[];
}

interface InstantInspirationProps {
  onSend: (content: string) => void;
}

export function InstantInspiration({ onSend }: InstantInspirationProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, content: '开会被问到项目的进展，需要准备一个清晰的汇报。明天上午 10 点前要发给项目经理。', isUser: true, tags: ['会议', '项目'] },
    { id: 1, content: '已保存！', isUser: false, tags: ['记录', '想法'] },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleFocusInput = () => {
      inputRef.current?.focus();
    };
    
    window.addEventListener('focus-input', handleFocusInput);
    return () => window.removeEventListener('focus-input', handleFocusInput);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now(),
      content: input,
      isUser: true,
    };
    
    setMessages(prev => [...prev, userMessage]);
    onSend(input);
    setInput('');
    
    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        content: '已保存！',
        isUser: false,
        tags: ['记录', '想法'],
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 500);
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
        {messages.map(msg => (
          <div key={msg.id} className="message">
            <div className={`message-avatar ${msg.isUser ? 'user' : 'ai'}`}>
              {msg.isUser ? '我' : 'AI'}
            </div>
            <div className="message-content">
              <div className="message-label">{msg.isUser ? '你' : '忆流'}</div>
              <div className="message-text">
                {msg.isUser ? (
                  <p>{msg.content}</p>
                ) : (
                  <>
                    <p>{msg.content}</p>
                    {msg.tags && (
                      <blockquote>
                        📝 <strong>已自动添加标签</strong>
                        <br />
                        🏷️ <em>{msg.tags.map(t => `#${t}`).join(' ')}</em>
                      </blockquote>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
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
          <button className="send-btn" onClick={handleSend}>
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