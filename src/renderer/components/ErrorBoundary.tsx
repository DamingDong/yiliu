import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: 40,
          textAlign: 'center',
          background: 'var(--color-bg)',
        }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>⚠️</div>
          <h2 style={{ marginBottom: 16 }}>出错了</h2>
          <p style={{ 
            color: 'var(--color-text-muted)', 
            marginBottom: 24,
            maxWidth: 400,
          }}>
            {this.state.error?.message || '应用遇到了意外错误'}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              刷新页面
            </button>
            <button 
              onClick={() => window.electronAPI?.openDataDir?.()}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              查看日志
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
