interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export function LoadingSpinner({ size = 'medium', text }: LoadingSpinnerProps) {
  const sizeConfig = {
    small: { width: 16, height: 16, fontSize: 11 },
    medium: { width: 24, height: 24, fontSize: 12 },
    large: { width: 32, height: 32, fontSize: 14 },
  };
  
  const config = sizeConfig[size];
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: 16,
    }}>
      <div style={{
        width: config.width,
        height: config.height,
        border: '2px solid var(--color-border)',
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {text && (
        <span style={{
          fontSize: config.fontSize,
          color: 'var(--color-text-muted)',
        }}>
          {text}
        </span>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

interface LoadingOverlayProps {
  text?: string;
}

export function LoadingOverlay({ text = '加载中...' }: LoadingOverlayProps) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255, 255, 255, 0.9)',
      zIndex: 100,
    }}>
      <LoadingSpinner size="large" text={text} />
    </div>
  );
}
