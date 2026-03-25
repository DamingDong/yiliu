import { useState } from 'react';
import { type FrontendNote } from '../api';
import { api } from '../api';

interface ExportBackupProps {
  notes: FrontendNote[];
}

export function ExportBackup({ notes }: ExportBackupProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'md' | 'json') => {
    setExporting(true);
    try {
      if (format === 'md') {
        const filePath = await api.exportToMarkdown('md');
        if (filePath) {
          alert(`导出成功：${filePath}`);
        } else {
          let md = '# 忆流笔记导出\n\n';
          notes.forEach(note => {
            md += `## ${note.title}\n\n${note.content}\n\n---\n\n`;
          });
          const blob = new Blob([md], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `yiliu-notes-${Date.now()}.md`;
          a.click();
          URL.revokeObjectURL(url);
          alert('Markdown 导出成功');
        }
      } else {
        const json = JSON.stringify(notes, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `yiliu-notes-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        alert('JSON 导出成功');
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('导出失败');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="write-note">
      <div className="panel-header">
        <div className="panel-title">导出备份</div>
        <div className="panel-subtitle">导出你的数据</div>
      </div>
      
      <div className="export-list">
        <div className="export-item">
          <div className="export-icon" style={{ background: '#eef2ff' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <div className="export-info">
            <div className="export-title">Markdown</div>
            <div className="export-desc">导出为 .md 文件</div>
          </div>
          <button className="export-btn primary" onClick={() => handleExport('md')}>
            导出
          </button>
        </div>
        
        <div className="export-item">
          <div className="export-icon" style={{ background: '#ecfdf5' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="export-info">
            <div className="export-title">JSON</div>
            <div className="export-desc">导出为 .json 文件</div>
          </div>
          <button className="export-btn secondary" onClick={() => handleExport('json')}>
            导出
          </button>
        </div>
        
        <div className="export-item">
          <div className="export-icon" style={{ background: '#fef3c7' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17,8 12,3 7,8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="export-info">
            <div className="export-title">WebDAV 同步</div>
            <div className="export-desc">同步到你的云盘</div>
          </div>
          <button className="export-btn secondary">
            设置
          </button>
        </div>
      </div>
    </div>
  );
}