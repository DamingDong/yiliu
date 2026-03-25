export function Settings() {
  return (
    <div className="write-note">
      <div className="panel-header">
        <div className="panel-title">设置</div>
        <div className="panel-subtitle">配置你的忆流</div>
      </div>
      
      <div className="settings">
        <div className="settings-section">
          <div className="settings-title">AI 配置</div>
          <div className="settings-item">
            <span>OpenAI API Key</span>
            <input 
              type="password" 
              placeholder="sk-..." 
              style={{ 
                border: '1px solid var(--color-border)', 
                borderRadius: 6, 
                padding: '8px 12px', 
                fontSize: 13, 
                width: 200 
              }} 
            />
          </div>
          <div className="settings-item">
            <span>嵌入模型</span>
            <select style={{ border: '1px solid var(--color-border)', borderRadius: 6, padding: '8px 12px', fontSize: 13 }}>
              <option>Xenova/all-MiniLM-L6-v2 (本地)</option>
              <option>text-embedding-3-small (云端)</option>
            </select>
          </div>
        </div>
        
        <div className="settings-section">
          <div className="settings-title">数据</div>
          <div className="settings-item">
            <span>数据目录</span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
              ~/Library/Application Support/yiliu
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}