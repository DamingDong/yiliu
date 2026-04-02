import { useState } from 'react';
import { type FrontendNote } from '../api';
import { api } from '../api';

interface ExportBackupProps {
  notes: FrontendNote[];
}

interface ExportResult {
  success: boolean;
  filePath?: string;
  message?: string;
}

export function ExportBackup({ notes }: ExportBackupProps) {
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  const handleExport = async (format: 'md' | 'json') => {
    setExporting(true);
    setExportResult(null);
    try {
      if (format === 'md') {
        const filePath = await api.exportToMarkdown('md');
        if (filePath) {
          setExportResult({
            success: true,
            filePath,
            message: 'Markdown 导出成功',
          });
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
          setExportResult({
            success: true,
            message: 'Markdown 导出成功（浏览器下载）',
          });
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
        setExportResult({
          success: true,
          message: 'JSON 导出成功（浏览器下载）',
        });
      }
    } catch (err) {
      console.error('Export failed:', err);
      setExportResult({
        success: false,
        message: '导出失败',
      });
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
          <button className="export-btn primary" onClick={() => handleExport('md')} disabled={exporting}>
            {exporting ? '导出中...' : '导出'}
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
          <button className="export-btn secondary" onClick={() => handleExport('json')} disabled={exporting}>
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

      {exportResult && (
        <div className={`export-result ${exportResult.success ? 'success' : 'error'}`}>
          <div className="export-result-message">
            {exportResult.success ? '✓' : '✗'} {exportResult.message}
          </div>
          {exportResult.filePath && (
            <div className="export-result-path">
              <span className="path-label">保存位置：</span>
              <span className="path-value" title={exportResult.filePath}>
                {exportResult.filePath.split('/').pop()}
              </span>
            </div>
          )}
          <div className="export-result-actions">
            {exportResult.filePath && (
              <button 
                className="export-action-btn"
                onClick={() => api.openFile(exportResult.filePath!)}
              >
                打开文件
              </button>
            )}
            <button 
              className="export-action-btn secondary"
              onClick={() => api.openDataDir()}
            >
              打开目录
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
