interface SidebarProps {
  activePanel: number;
  onNavigate: (panel: number) => void;
}

export function Sidebar({ activePanel, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 0, label: '即时灵感', icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z' },
    { id: 1, label: '写笔记', icon: 'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z' },
    { id: 2, label: '知识库', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' },
    { id: 3, label: '导出备份', icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12' },
    { id: 4, label: '设置', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">忆</div>
          <span>忆流</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">记录</div>
          {navItems.slice(0, 2).map(item => (
            <div
              key={item.id}
              className={`nav-item ${activePanel === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="nav-section">
          <div className="nav-section-title">工具</div>
          {navItems.slice(2, 4).map(item => (
            <div
              key={item.id}
              className={`nav-item ${activePanel === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="nav-section" style={{ marginTop: 'auto' }}>
          {navItems.slice(4).map(item => (
            <div
              key={item.id}
              className={`nav-item ${activePanel === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
}