import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Settings } from '../../src/renderer/components/Settings';

describe('Settings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(window.electronAPI.getSettings).mockResolvedValue({
      apiKey: '',
      embeddingModel: 'local',
      dataPath: '/Users/test/yiliu-data'
    });
    vi.mocked(window.electronAPI.saveSettings).mockResolvedValue(true);
    vi.mocked(window.electronAPI.testAIConnection).mockResolvedValue({ success: true, message: 'OK' });
    cleanup();
  });

  it('should render settings panel header', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('设置')).toBeInTheDocument();
    });
  });

  it('should render AI configuration section', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('AI 配置')).toBeInTheDocument();
      expect(screen.getByText('OpenAI API Key')).toBeInTheDocument();
    });
  });

  it('should render embedding model select', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('嵌入模型')).toBeInTheDocument();
      expect(screen.getByText('Xenova/all-MiniLM-L6-v2 (本地，免费)')).toBeInTheDocument();
      expect(screen.getByText('text-embedding-3-small (云端，需 API Key)')).toBeInTheDocument();
    });
  });

  it('should load settings on mount', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(window.electronAPI.getSettings).toHaveBeenCalled();
    });
  });

  it('should display API key placeholder', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-...')).toBeInTheDocument();
    });
  });

  it('should update API key on input change', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-...')).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText('sk-...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'sk-test123' } });
    expect(input.value).toBe('sk-test123');
  });

  it('should save settings when clicking save button', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-...')).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText('sk-...');
    fireEvent.change(input, { target: { value: 'sk-test123' } });
    
    await waitFor(() => {
      expect(screen.getByText('保存设置')).toBeInTheDocument();
    });
    const saveButton = screen.getByText('保存设置');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(window.electronAPI.saveSettings).toHaveBeenCalledWith(
        expect.objectContaining({ apiKey: 'sk-test123' })
      );
    });
  });

  it('should show saving state when saving', async () => {
    vi.mocked(window.electronAPI.saveSettings).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(true), 100))
    );
    
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('保存设置')).toBeInTheDocument();
    });
    const saveButton = screen.getByText('保存设置');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('保存中...')).toBeInTheDocument();
    });
  });

  it('should show saved state after successful save', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('保存设置')).toBeInTheDocument();
    });
    const saveButton = screen.getByText('保存设置');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('已保存 ✓')).toBeInTheDocument();
    });
  });

  it('should test AI connection when clicking test button', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-...')).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText('sk-...');
    fireEvent.change(input, { target: { value: 'sk-test123' } });
    
    await waitFor(() => {
      expect(screen.getByText('测试连接')).toBeInTheDocument();
    });
    const testButton = screen.getByText('测试连接');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(window.electronAPI.testAIConnection).toHaveBeenCalled();
    });
  });

  it('should show testing state when testing connection', async () => {
    vi.mocked(window.electronAPI.testAIConnection).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'OK' }), 100))
    );
    
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-...')).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText('sk-...');
    fireEvent.change(input, { target: { value: 'sk-test123' } });
    
    await waitFor(() => {
      expect(screen.getByText('测试连接')).toBeInTheDocument();
    });
    const testButton = screen.getByText('测试连接');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText('测试中...')).toBeInTheDocument();
    });
  });

  it('should show success message after successful test', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-...')).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText('sk-...');
    fireEvent.change(input, { target: { value: 'sk-test123' } });
    
    await waitFor(() => {
      expect(screen.getByText('测试连接')).toBeInTheDocument();
    });
    const testButton = screen.getByText('测试连接');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(screen.getByText('连接成功 ✓')).toBeInTheDocument();
    });
  });

  it('should show data path section', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('数据管理')).toBeInTheDocument();
      expect(screen.getByText('数据目录')).toBeInTheDocument();
    });
  });

  it('should display data path', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('/Users/test/yiliu-data')).toBeInTheDocument();
    });
  });

  it('should have open directory button', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('打开目录')).toBeInTheDocument();
    });
  });

  it('should render about section', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('关于')).toBeInTheDocument();
      expect(screen.getByText('忆流 v2.1.0')).toBeInTheDocument();
      expect(screen.getByText('让知识像水一样流动')).toBeInTheDocument();
    });
  });

  it('should disable test button when API key is empty', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByText('测试连接')).toBeInTheDocument();
    });
    const testButton = screen.getByText('测试连接') as HTMLButtonElement;
    expect(testButton.disabled).toBe(true);
  });

  it('should enable test button when API key is entered', async () => {
    render(<Settings />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('sk-...')).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText('sk-...');
    fireEvent.change(input, { target: { value: 'sk-test123' } });
    
    await waitFor(() => {
      expect(screen.getByText('测试连接')).toBeInTheDocument();
    });
    const testButton = screen.getByText('测试连接') as HTMLButtonElement;
    expect(testButton.disabled).toBe(false);
  });
});
