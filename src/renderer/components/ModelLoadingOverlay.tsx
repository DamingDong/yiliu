import { useState, useEffect } from 'react';

interface ModelLoadingOverlayProps {
  stage: string;
  progress: number;
}

const stageLabels: Record<string, string> = {
  'initiating': '初始化中...',
  'downloading-model': '下载模型中...',
  'finalizing': '完成中...',
  'loading-tokenizer': '加载分词器...',
  'loading-model': '加载模型中...',
  'complete': '加载完成',
  'error': '加载失败',
};

export function ModelLoadingOverlay({ stage, progress }: ModelLoadingOverlayProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const label = stageLabels[stage] || stage || '加载中...';
  const displayPercent = Math.round(displayProgress);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(255, 255, 255, 0.95)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        maxWidth: 400,
        padding: 40,
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
        }}>
          🧠
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 8,
          }}>
            正在加载 AI 模型
          </div>
          <div style={{
            fontSize: 14,
            color: 'var(--color-text-secondary)',
          }}>
            {label}
          </div>
        </div>
        
        <div style={{
          width: '100%',
          height: 8,
          background: '#e5e7eb',
          borderRadius: 4,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${displayPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-primary) 0%, #8b5cf6 100%)',
            borderRadius: 4,
            transition: 'width 0.3s ease',
          }} />
        </div>
        
        <div style={{
          fontSize: 13,
          color: 'var(--color-text-muted)',
          fontFamily: 'monospace',
        }}>
          {displayPercent}%
        </div>
        
        <div style={{
          fontSize: 12,
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          maxWidth: 300,
          lineHeight: 1.5,
        }}>
          首次运行需要下载 AI 模型<br/>
          下载完成后会自动缓存到本地
        </div>
      </div>
    </div>
  );
}
