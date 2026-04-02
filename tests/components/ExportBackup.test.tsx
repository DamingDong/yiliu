import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ExportBackup } from '../../src/renderer/components/ExportBackup';
import { api } from '../../src/renderer/api';

vi.mock('../../src/renderer/api', () => ({
  api: {
    exportToMarkdown: vi.fn().mockResolvedValue('/Users/test/yiliu-export.md'),
    getAllNotes: vi.fn().mockResolvedValue([]),
    openFile: vi.fn(),
    openDataDir: vi.fn(),
  },
}));

describe('ExportBackup Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('should render export panel header', async () => {
    render(<ExportBackup notes={[]} />);
    await waitFor(() => {
      expect(screen.getByText('导出备份')).toBeInTheDocument();
    });
  });

  it('should render Markdown export option', async () => {
    render(<ExportBackup notes={[]} />);
    await waitFor(() => {
      expect(screen.getByText('Markdown')).toBeInTheDocument();
      expect(screen.getByText('导出为 .md 文件')).toBeInTheDocument();
    });
  });

  it('should render JSON export option', async () => {
    render(<ExportBackup notes={[]} />);
    await waitFor(() => {
      expect(screen.getByText('JSON')).toBeInTheDocument();
      expect(screen.getByText('导出为 .json 文件')).toBeInTheDocument();
    });
  });

  it('should render WebDAV sync option', async () => {
    render(<ExportBackup notes={[]} />);
    await waitFor(() => {
      expect(screen.getByText('WebDAV 同步')).toBeInTheDocument();
      expect(screen.getByText('同步到你的云盘')).toBeInTheDocument();
    });
  });

  it('should call exportToMarkdown when clicking MD export button', async () => {
    render(<ExportBackup notes={[]} />);
    await waitFor(() => {
      expect(screen.getAllByText('导出').length).toBeGreaterThan(0);
    });
    const mdButtons = screen.getAllByText('导出');
    fireEvent.click(mdButtons[0]);
    
    await waitFor(() => {
      expect(api.exportToMarkdown).toHaveBeenCalledWith('md');
    });
  });

  it('should show exporting state when clicked', async () => {
    vi.mocked(api.exportToMarkdown).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('/path'), 100)));
    
    render(<ExportBackup notes={[]} />);
    await waitFor(() => {
      expect(screen.getAllByText('导出').length).toBeGreaterThan(0);
    });
    const mdButtons = screen.getAllByText('导出');
    fireEvent.click(mdButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('导出中...')).toBeInTheDocument();
    });
  });

  it('should show success message after successful export', async () => {
    render(<ExportBackup notes={[]} />);
    await waitFor(() => {
      expect(screen.getAllByText('导出').length).toBeGreaterThan(0);
    });
    const mdButtons = screen.getAllByText('导出');
    fireEvent.click(mdButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText(/✓ Markdown 导出成功/)).toBeInTheDocument();
    });
  });

  it('should show file path after successful export', async () => {
    render(<ExportBackup notes={[]} />);
    await waitFor(() => {
      expect(screen.getAllByText('导出').length).toBeGreaterThan(0);
    });
    const mdButtons = screen.getAllByText('导出');
    fireEvent.click(mdButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('保存位置：')).toBeInTheDocument();
    });
  });

  it('should show open file button after export', async () => {
    render(<ExportBackup notes={[]} />);
    await waitFor(() => {
      expect(screen.getAllByText('导出').length).toBeGreaterThan(0);
    });
    const mdButtons = screen.getAllByText('导出');
    fireEvent.click(mdButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('打开文件')).toBeInTheDocument();
    });
  });

  it('should show open directory button after export', async () => {
    render(<ExportBackup notes={[]} />);
    await waitFor(() => {
      expect(screen.getAllByText('导出').length).toBeGreaterThan(0);
    });
    const mdButtons = screen.getAllByText('导出');
    fireEvent.click(mdButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('打开目录')).toBeInTheDocument();
    });
  });

  it('should handle JSON export via browser download', async () => {
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    
    URL.createObjectURL = vi.fn(() => 'blob:test-url');
    URL.revokeObjectURL = vi.fn();
    
    const mockClick = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = vi.fn((tag: string) => {
      if (tag === 'a') {
        return { click: mockClick, href: '', download: '' };
      }
      return originalCreateElement(tag);
    }) as any;

    render(<ExportBackup notes={[{ id: '1', title: 'Test', content: 'Test content', tags: [], time: '10:00', date: '今天', source: 'text', createdAt: Date.now() }]} />);
    
    await waitFor(() => {
      expect(screen.getAllByText('导出').length).toBeGreaterThan(0);
    });
    const jsonButtons = screen.getAllByText('导出');
    fireEvent.click(jsonButtons[1]);
    
    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
    });

    document.createElement = originalCreateElement;
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('should disable buttons during export', async () => {
    vi.mocked(api.exportToMarkdown).mockImplementation(() => new Promise(resolve => setTimeout(() => resolve('/path'), 100)));
    
    render(<ExportBackup notes={[]} />);
    await waitFor(() => {
      expect(screen.getAllByText('导出').length).toBeGreaterThan(0);
    });
    const mdButtons = screen.getAllByText('导出');
    const mdButton = mdButtons[0];
    
    fireEvent.click(mdButton);
    
    expect(mdButton).toBeDisabled();
  });
});
