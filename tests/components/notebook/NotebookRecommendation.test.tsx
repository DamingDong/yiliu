import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotebookRecommendation } from '../../../src/renderer/components/notebook/NotebookRecommendation';
import * as apiModule from '../../../src/renderer/api';

const mockApi = {
  recommendNotebooks: vi.fn(),
  addNoteToNotebook: vi.fn(),
};

vi.spyOn(apiModule, 'api', 'get').mockReturnValue(mockApi as any);

describe('NotebookRecommendation Component', () => {
  const mockNoteId = 'note-123';
  
  const mockRecommendations = [
    { notebook: { id: '1', name: '工作项目', icon: '💼', color: '#3B82F6' }, score: 0.85 },
    { notebook: { id: '2', name: '学习笔记', icon: '📚', color: '#10B981' }, score: 0.72 },
  ];

  const mockOnAccept = vi.fn();
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render recommendation header', async () => {
    mockApi.recommendNotebooks.mockResolvedValue(mockRecommendations);

    render(
      <NotebookRecommendation 
        noteId={mockNoteId}
        onAccept={mockOnAccept}
        onDismiss={mockOnDismiss}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('AI 推荐')).toBeInTheDocument();
    });
  });

  it('should display recommendation text', async () => {
    mockApi.recommendNotebooks.mockResolvedValue(mockRecommendations);

    render(
      <NotebookRecommendation 
        noteId={mockNoteId}
        onAccept={mockOnAccept}
        onDismiss={mockOnDismiss}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText(/推荐添加到/)).toBeInTheDocument();
    });
  });

  it('should display recommended notebooks', async () => {
    mockApi.recommendNotebooks.mockResolvedValue(mockRecommendations);

    render(
      <NotebookRecommendation 
        noteId={mockNoteId}
        onAccept={mockOnAccept}
        onDismiss={mockOnDismiss}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('💼')).toBeInTheDocument();
      expect(screen.getByText('工作项目')).toBeInTheDocument();
      expect(screen.getByText('📚')).toBeInTheDocument();
      expect(screen.getByText('学习笔记')).toBeInTheDocument();
    });
  });

  it('should show confidence score', async () => {
    mockApi.recommendNotebooks.mockResolvedValue(mockRecommendations);

    render(
      <NotebookRecommendation 
        noteId={mockNoteId}
        onAccept={mockOnAccept}
        onDismiss={mockOnDismiss}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('72%')).toBeInTheDocument();
    });
  });

  it('should accept recommendation when clicking accept button', async () => {
    mockApi.recommendNotebooks.mockResolvedValue(mockRecommendations);
    mockApi.addNoteToNotebook.mockResolvedValue(true);

    render(
      <NotebookRecommendation 
        noteId={mockNoteId}
        onAccept={mockOnAccept}
        onDismiss={mockOnDismiss}
      />
    );
    
    await waitFor(() => {
      const acceptButtons = screen.getAllByText('接受');
      fireEvent.click(acceptButtons[0]);
    });
    
    await waitFor(() => {
      expect(mockApi.addNoteToNotebook).toHaveBeenCalledWith(mockNoteId, '1', 'ai');
    });
  });

  it('should dismiss recommendation when clicking ignore button', async () => {
    mockApi.recommendNotebooks.mockResolvedValue(mockRecommendations);

    render(
      <NotebookRecommendation 
        noteId={mockNoteId}
        onAccept={mockOnAccept}
        onDismiss={mockOnDismiss}
      />
    );
    
    await waitFor(() => {
      const ignoreButtons = screen.getAllByText('忽略');
      fireEvent.click(ignoreButtons[0]);
    });
    
    expect(mockOnDismiss).toHaveBeenCalledWith('1');
  });

  it('should show loading state initially', async () => {
    mockApi.recommendNotebooks.mockImplementation(() => new Promise(() => {}));

    render(
      <NotebookRecommendation 
        noteId={mockNoteId}
        onAccept={mockOnAccept}
        onDismiss={mockOnDismiss}
      />
    );
    
    expect(screen.getByText('🤖 AI 分析中...')).toBeInTheDocument();
  });

  it('should show empty state when no recommendations', async () => {
    mockApi.recommendNotebooks.mockResolvedValue([]);

    render(
      <NotebookRecommendation 
        noteId={mockNoteId}
        onAccept={mockOnAccept}
        onDismiss={mockOnDismiss}
      />
    );
    
    await waitFor(() => {
      expect(screen.queryByText('AI 推荐')).not.toBeInTheDocument();
    });
  });
});
