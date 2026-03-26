import { useState, useEffect } from 'react';

export function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [embeddingModel, setEmbeddingModel] = useState('local');
  const [dataPath, setDataPath] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await window.electronAPI.getSettings();
    setApiKey(settings.apiKey || '');
    setEmbeddingModel(settings.embeddingModel || 'local');
    setDataPath(settings.dataPath);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    const success = await window.electronAPI.saveSettings({ 
      apiKey, 
      embeddingModel 
    });
    setSaveStatus(success ? 'saved' : 'error');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleTest = async () => {
    setTestStatus('testing');
    const result = await window.electronAPI.testAIConnection();
    setTestStatus(result.success ? 'success' : 'error');
    setTestMessage(result.message);
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  return (
    <div className="write-note">
      <div className="panel-header">
        <div className="panel-title">设置</div>
        <div className="panel-subtitle">配置你的忆流</div>
      </div>
      
      <div className="settings" style={{ padding: 20 }}>
        <div className="settings-section" style={{ marginBottom: 30 }}>
          <div className="settings-title" style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            AI 配置
          </div>
          
          <div className="settings-item" style={{ 
            display: 'block', 
            padding: 0, 
            border: 'none',
            marginBottom: 16 
          }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>
              OpenAI API Key
            </label>
            <input 
              type="password" 
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="sk-..."
              style={{ 
                width: '100%',
                border: '1px solid var(--color-border)', 
                borderRadius: 6, 
                padding: '10px 12px', 
                fontSize: 14,
              }} 
            />
          </div>
          
          <div className="settings-item" style={{ 
            display: 'block', 
            padding: 0, 
            border: 'none',
            marginBottom: 16 
          }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>
              嵌入模型
            </label>
            <select 
              value={embeddingModel}
              onChange={e => setEmbeddingModel(e.target.value)}
              style={{ 
                width: '100%',
                border: '1px solid var(--color-border)', 
                borderRadius: 6, 
                padding: '10px 12px', 
                fontSize: 14,
              }}
            >
              <option value="local">Xenova/all-MiniLM-L6-v2 (本地，免费)</option>
              <option value="openai">text-embedding-3-small (云端，需 API Key)</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              style={{
                padding: '10px 20px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: saveStatus === 'saving' ? 'not-allowed' : 'pointer',
                opacity: saveStatus === 'saving' ? 0.7 : 1,
              }}
            >
              {saveStatus === 'saving' ? '保存中...' : 
               saveStatus === 'saved' ? '已保存 ✓' : 
               saveStatus === 'error' ? '保存失败 ✗' : '保存设置'}
            </button>
            
            <button 
              onClick={handleTest}
              disabled={testStatus === 'testing' || !apiKey}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                cursor: (testStatus === 'testing' || !apiKey) ? 'not-allowed' : 'pointer',
                opacity: (!apiKey) ? 0.5 : 1,
              }}
            >
              {testStatus === 'testing' ? '测试中...' : 
               testStatus === 'success' ? '连接成功 ✓' : 
               testStatus === 'error' ? '连接失败 ✗' : '测试连接'}
            </button>
          </div>
          
          {testMessage && (
            <div style={{ marginTop: 8, fontSize: 13, color: testStatus === 'success' ? '#22c55e' : '#ef4444' }}>
              {testMessage}
            </div>
          )}
        </div>
        
        <div className="settings-section" style={{ marginBottom: 30 }}>
          <div className="settings-title" style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            数据管理
          </div>
          
          <div className="settings-item" style={{ 
            display: 'block', 
            padding: 0, 
            border: 'none',
            marginBottom: 16 
          }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>
              数据目录
            </label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              padding: '10px 12px',
              background: 'var(--color-bg)',
              borderRadius: 6,
              fontSize: 13,
              fontFamily: 'monospace',
            }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text-secondary)' }}>
                {dataPath}
              </span>
              <button 
                onClick={() => window.electronAPI.openDataDir()}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: 4,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                打开目录
              </button>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <div className="settings-title" style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            关于
          </div>
          <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            <p>忆流 v2.0.1</p>
            <p style={{ marginTop: 8 }}>让知识像水一样流动</p>
            <p style={{ marginTop: 8 }}>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  window.electronAPI.openExternal('https://github.com/DamingDong/yiliu');
                }}
                style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
              >
                GitHub 仓库
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
