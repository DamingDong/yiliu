import { useState, useEffect } from 'react';
import { api } from '../../api';

interface NotebookMatch {
  notebook: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  score: number;
}

interface NotebookRecommendationProps {
  noteId: string;
  onAccept?: (notebookId: string) => void;
  onDismiss?: (notebookId: string) => void;
}

export function NotebookRecommendation({ noteId, onAccept, onDismiss }: NotebookRecommendationProps) {
  const [recommendations, setRecommendations] = useState<NotebookMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [noteId]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const result = await api.recommendNotebooks(noteId);
      setRecommendations(result);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (notebookId: string) => {
    try {
      await api.addNoteToNotebook(noteId, notebookId, 'ai');
      setRecommendations(prev => prev.filter(r => r.notebook.id !== notebookId));
      onAccept?.(notebookId);
    } catch (err) {
      console.error('Failed to add note to notebook:', err);
    }
  };

  const handleDismiss = (notebookId: string) => {
    setRecommendations(prev => prev.filter(r => r.notebook.id !== notebookId));
    onDismiss?.(notebookId);
  };

  if (loading) {
    return (
      <div className="notebook-recommendation loading">
        <span>🤖 AI 分析中...</span>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="notebook-recommendation">
      <div className="recommendation-header">
        <span className="recommendation-icon">🤖</span>
        <span className="recommendation-title">AI 推荐</span>
      </div>
      
      <div className="recommendation-text">
        <span>推荐添加到以下笔记本：</span>
      </div>
      
      <div className="recommendation-list">
        {recommendations.map(match => (
          <div key={match.notebook.id} className="recommendation-item">
            <div className="recommendation-info">
              <span className="notebook-icon">{match.notebook.icon || '📂'}</span>
              <span className="notebook-name">{match.notebook.name}</span>
              <span className="confidence-score">{Math.round(match.score * 100)}%</span>
            </div>
            <div className="recommendation-actions">
              <button 
                className="accept-btn"
                onClick={() => handleAccept(match.notebook.id)}
              >
                接受
              </button>
              <button 
                className="ignore-btn"
                onClick={() => handleDismiss(match.notebook.id)}
              >
                忽略
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
