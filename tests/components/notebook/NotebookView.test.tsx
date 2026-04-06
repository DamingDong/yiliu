import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import * as apiModule from '../../../src/renderer/api';
import { NotebookView } from '../../../src/renderer/components/notebook/NotebookView';

const mockApi = {
  getNotesInNotebook: vi.fn(),
  removeNoteFromNotebook: vi.fn(),
};

vi.spyOn(apiModule, 'api', 'get').mockReturnValue(mockApi as any);

describe('NotebookView Component', () => {
  const mockNotebook = {
    id: '1',
    name: '工作项目',
    icon: '💼',
    color: '#3B82F6',
    noteCount: 3,
  };

  const mockNotes = [
    { id: 'n1', title: '项目进展', content: '项目进展笔记', createdAt: Date.now(), tags: ['工作'], date: '今天', time: '10:30', source: 'text' },
    { id: 'n2', title: '需求讨论', content: '需求讨论笔记', createdAt: Date.now() - 86400000, tags: ['工作'], date: '昨天', time: '14:20', source: 'text' },
    { id: 'n3', title: '技术方案', content: '技术方案笔记', createdAt: Date.now() - 172800000, tags: ['工作'], date: '3天前', time: '09:00', source: 'text' },
  ];

  const mockOnBack = vi.fn();
  const mockOnSelectNote = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render notebook header with name and count', async () => {
    mockApi.getNotesInNotebook.mockResolvedValue(mockNotes);

    render(
      <NotebookView 
        notebook={mockNotebook} 
        onBack={mockOnBack}
        onSelectNote={mockOnSelectNote}
      />
    );
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    expect(screen.getByText('💼')).toBeInTheDocument();
    expect(screen.getByText('工作项目')).toBeInTheDocument();
    expect(screen.getByText('3 条笔记')).toBeInTheDocument();
  });

  it('should render back button', async () => {
    mockApi.getNotesInNotebook.mockResolvedValue([]);

    render(
      <NotebookView 
        notebook={mockNotebook} 
        onBack={mockOnBack}
        onSelectNote={mockOnSelectNote}
      />
    );
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    expect(screen.getByText('←')).toBeInTheDocument();
  });

  it('should call onBack when clicking back button', async () => {
    mockApi.getNotesInNotebook.mockResolvedValue([]);

    render(
      <NotebookView 
        notebook={mockNotebook} 
        onBack={mockOnBack}
        onSelectNote={mockOnSelectNote}
      />
    );
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    fireEvent.click(screen.getByText('←'));
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should display notes in notebook', async () => {
    mockApi.getNotesInNotebook.mockResolvedValue(mockNotes);

    render(
      <NotebookView 
        notebook={mockNotebook} 
        onBack={mockOnBack}
        onSelectNote={mockOnSelectNote}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('项目进展笔记')).toBeInTheDocument();
    });
    expect(screen.getByText('需求讨论笔记')).toBeInTheDocument();
    expect(screen.getByText('技术方案笔记')).toBeInTheDocument();
  });

  it('should show empty state when no notes', async () => {
    mockApi.getNotesInNotebook.mockResolvedValue([]);

    render(
      <NotebookView 
        notebook={mockNotebook} 
        onBack={mockOnBack}
        onSelectNote={mockOnSelectNote}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('暂无笔记')).toBeInTheDocument();
    });
  });

  it('should call onSelectNote when clicking a note', async () => {
    mockApi.getNotesInNotebook.mockResolvedValue(mockNotes);

    render(
      <NotebookView 
        notebook={mockNotebook} 
        onBack={mockOnBack}
        onSelectNote={mockOnSelectNote}
      />
    );
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('项目进展笔记'));
    });
    expect(mockOnSelectNote).toHaveBeenCalledWith('n1');
  });

  it('should display remove button for each note', async () => {
    mockApi.getNotesInNotebook.mockResolvedValue(mockNotes);

    render(
      <NotebookView 
        notebook={mockNotebook} 
        onBack={mockOnBack}
        onSelectNote={mockOnSelectNote}
      />
    );
    
    await waitFor(() => {
      const removeButtons = screen.getAllByText('移除');
      expect(removeButtons.length).toBe(3);
    });
  });

  it('should remove note from notebook when clicking remove', async () => {
    mockApi.getNotesInNotebook.mockResolvedValue(mockNotes);
    mockApi.removeNoteFromNotebook.mockResolvedValue(true);

    render(
      <NotebookView 
        notebook={mockNotebook} 
        onBack={mockOnBack}
        onSelectNote={mockOnSelectNote}
      />
    );
    
    await waitFor(() => {
      const removeButtons = screen.getAllByText('移除');
      fireEvent.click(removeButtons[0]);
    });
    
    expect(mockApi.removeNoteFromNotebook).toHaveBeenCalledWith('n1', '1');
  });

  it('should have search input', async () => {
    mockApi.getNotesInNotebook.mockResolvedValue(mockNotes);

    render(
      <NotebookView 
        notebook={mockNotebook} 
        onBack={mockOnBack}
        onSelectNote={mockOnSelectNote}
      />
    );
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    expect(screen.getByPlaceholderText('搜索笔记本内容...')).toBeInTheDocument();
  });

  it('should filter notes by search query', async () => {
    mockApi.getNotesInNotebook.mockResolvedValue(mockNotes);

    render(
      <NotebookView 
        notebook={mockNotebook} 
        onBack={mockOnBack}
        onSelectNote={mockOnSelectNote}
      />
    );
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('搜索笔记本内容...');
      fireEvent.change(searchInput, { target: { value: '进展' } });
    });
    
    await waitFor(() => {
      expect(screen.getByText('项目进展笔记')).toBeInTheDocument();
    });
    expect(screen.queryByText('需求讨论笔记')).not.toBeInTheDocument();
  });
});
