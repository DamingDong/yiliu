import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotebookList } from '../../../src/renderer/components/notebook/NotebookList';

vi.mock('../../../src/renderer/api', () => ({
  api: {
    listNotebooks: vi.fn(),
    createNotebook: vi.fn(),
    updateNotebook: vi.fn(),
    deleteNotebook: vi.fn(),
    getNotesInNotebook: vi.fn(),
    addNoteToNotebook: vi.fn(),
    removeNoteFromNotebook: vi.fn(),
    getNotebooksForNote: vi.fn(),
    recommendNotebooks: vi.fn(),
  },
}));

describe('NotebookList Component', () => {
  const mockNotebooks = [
    { id: '1', name: '工作项目', icon: '💼', color: '#3B82F6', noteCount: 5 },
    { id: '2', name: '学习笔记', icon: '📚', color: '#10B981', noteCount: 3 },
    { id: '3', name: '个人想法', icon: '💡', color: '#F59E0B', noteCount: 8 },
  ];

  const mockOnSelectNotebook = vi.fn();
  const mockOnCreateNotebook = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render notebook list header', () => {
    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    expect(screen.getByText('笔记本')).toBeInTheDocument();
  });

  it('should display create button', () => {
    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    expect(screen.getByText('+新')).toBeInTheDocument();
  });

  it('should render all notebooks', () => {
    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    expect(screen.getByText('工作项目')).toBeInTheDocument();
    expect(screen.getByText('学习笔记')).toBeInTheDocument();
    expect(screen.getByText('个人想法')).toBeInTheDocument();
  });

  it('should display notebook icons', () => {
    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    expect(screen.getByText('💼')).toBeInTheDocument();
    expect(screen.getByText('📚')).toBeInTheDocument();
    expect(screen.getByText('💡')).toBeInTheDocument();
  });

  it('should display note counts', () => {
    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    expect(screen.getByText('(5)')).toBeInTheDocument();
    expect(screen.getByText('(3)')).toBeInTheDocument();
    expect(screen.getByText('(8)')).toBeInTheDocument();
  });

  it('should highlight selected notebook', () => {
    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId="2"
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    const selectedItem = screen.getByText('学习笔记').closest('.notebook-item');
    expect(selectedItem).toHaveClass('selected');
  });

  it('should call onSelectNotebook when clicking notebook', () => {
    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    fireEvent.click(screen.getByText('工作项目'));
    expect(mockOnSelectNotebook).toHaveBeenCalledWith('1');
  });

  it('should show empty state when no notebooks', () => {
    render(
      <NotebookList 
        notebooks={[]} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    expect(screen.getByText('暂无笔记本')).toBeInTheDocument();
    expect(screen.getByText('点击上方 + 创建笔记本')).toBeInTheDocument();
  });

  it('should open create dialog when clicking create button', () => {
    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    fireEvent.click(screen.getByText('+新'));
    expect(screen.getByText('新建笔记本')).toBeInTheDocument();
  });

  it('should call onCreateNotebook when submitting create form', async () => {
    const { api: mockApi } = await import('../../../src/renderer/api');
    vi.mocked(mockApi.createNotebook).mockResolvedValue({
      id: '4',
      name: '新笔记本',
      icon: '📂',
      noteCount: 0,
    });

    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
        onCreateNotebook={mockOnCreateNotebook}
      />
    );
    
    fireEvent.click(screen.getByText('+新'));
    
    const nameInput = screen.getByPlaceholderText('笔记本名称');
    fireEvent.change(nameInput, { target: { value: '新笔记本' } });
    
    fireEvent.click(screen.getByText('创建'));
    
    await waitFor(() => {
      expect(vi.mocked(mockApi.createNotebook)).toHaveBeenCalledWith({
        name: '新笔记本',
        icon: '📂',
        color: '#3B82F6',
      });
    });
  });

  it('should close dialog when clicking cancel', () => {
    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    
    fireEvent.click(screen.getByText('+新'));
    expect(screen.getByText('新建笔记本')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('取消'));
    expect(screen.queryByText('新建笔记本')).not.toBeInTheDocument();
  });

  it('should select icon when clicking icon option', () => {
    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    
    fireEvent.click(screen.getByText('+新'));
    
    const allBookIcons = screen.getAllByText('📚');
    const bookIconInForm = allBookIcons[allBookIcons.length - 1];
    fireEvent.click(bookIconInForm);
    
    expect(bookIconInForm).toHaveClass('selected');
  });

  it('should select color when clicking color option', () => {
    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    
    fireEvent.click(screen.getByText('+新'));
    
    const greenColor = screen.getByTestId('color-green');
    fireEvent.click(greenColor);
    
    expect(greenColor).toHaveClass('selected');
  });

  it('should show edit option when right-clicking notebook', () => {
    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    
    const notebookItem = screen.getByText('工作项目').closest('.notebook-item');
    fireEvent.contextMenu(notebookItem!);
    
    expect(screen.getByText('重命名')).toBeInTheDocument();
    expect(screen.getByText('删除')).toBeInTheDocument();
  });

  it('should delete notebook when confirming delete', async () => {
    const { api: mockApi } = await import('../../../src/renderer/api');
    vi.mocked(mockApi.deleteNotebook).mockResolvedValue(true);

    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    
    const notebookItem = screen.getByText('工作项目').closest('.notebook-item');
    fireEvent.contextMenu(notebookItem!);
    
    fireEvent.click(screen.getByText('删除'));
    fireEvent.click(screen.getByText('确认删除'));
    
    await waitFor(() => {
      expect(vi.mocked(mockApi.deleteNotebook)).toHaveBeenCalledWith('1');
    });
  });

  it('should rename notebook', async () => {
    const { api: mockApi } = await import('../../../src/renderer/api');
    vi.mocked(mockApi.updateNotebook).mockResolvedValue({
      id: '1',
      name: '重命名笔记本',
      noteCount: 5,
    });

    render(
      <NotebookList 
        notebooks={mockNotebooks} 
        selectedNotebookId={null}
        onSelectNotebook={mockOnSelectNotebook}
      />
    );
    
    const notebookItem = screen.getByText('工作项目').closest('.notebook-item');
    fireEvent.contextMenu(notebookItem!);
    
    fireEvent.click(screen.getByText('重命名'));
    
    const nameInput = screen.getByDisplayValue('工作项目');
    fireEvent.change(nameInput, { target: { value: '重命名笔记本' } });
    
    fireEvent.click(screen.getByText('保存'));
    
    await waitFor(() => {
      expect(vi.mocked(mockApi.updateNotebook)).toHaveBeenCalledWith('1', { name: '重命名笔记本' });
    });
  });
});
