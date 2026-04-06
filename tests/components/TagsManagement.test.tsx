import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TagsManagement } from '../../src/renderer/components/TagsManagement';

describe('TagsManagement Component', () => {
  const mockTags = [
    { name: '技术', count: 10 },
    { name: '工作', count: 5 },
    { name: '学习', count: 3 },
  ];

  const mockOnRefresh = vi.fn();
  const mockOnRenameTag = vi.fn();
  const mockOnDeleteTag = vi.fn();
  const mockOnMergeTags = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render tags management header', () => {
    render(<TagsManagement tags={mockTags} />);
    expect(screen.getByText('标签管理')).toBeInTheDocument();
    expect(screen.getByText('管理你的知识标签')).toBeInTheDocument();
  });

  it('should display tag statistics section', () => {
    render(<TagsManagement tags={mockTags} />);
    expect(screen.getByText('标签总数')).toBeInTheDocument();
    expect(screen.getByText('总使用次数')).toBeInTheDocument();
    expect(screen.getByText('平均使用')).toBeInTheDocument();
  });

  it('should display all tags', () => {
    render(<TagsManagement tags={mockTags} />);
    expect(screen.getByText('#技术')).toBeInTheDocument();
    expect(screen.getByText('#工作')).toBeInTheDocument();
    expect(screen.getByText('#学习')).toBeInTheDocument();
  });

  it('should show empty state when no tags', () => {
    render(<TagsManagement tags={[]} />);
    expect(screen.getByText('暂无标签')).toBeInTheDocument();
  });

  it('should filter tags by search query', () => {
    render(<TagsManagement tags={mockTags} />);
    const searchInput = screen.getByPlaceholderText('搜索标签...');
    fireEvent.change(searchInput, { target: { value: '技' } });
    expect(screen.getByText('#技术')).toBeInTheDocument();
    expect(screen.queryByText('#工作')).not.toBeInTheDocument();
  });

  it('should show empty state when search has no matches', () => {
    render(<TagsManagement tags={mockTags} />);
    const searchInput = screen.getByPlaceholderText('搜索标签...');
    fireEvent.change(searchInput, { target: { value: '不存在的标签' } });
    expect(screen.getByText('未找到匹配的标签')).toBeInTheDocument();
  });

  it('should have refresh button', () => {
    render(<TagsManagement tags={mockTags} onRefresh={mockOnRefresh} />);
    expect(screen.getByText('刷新')).toBeInTheDocument();
  });

  it('should call onRefresh when refresh button clicked', async () => {
    mockOnRefresh.mockResolvedValue(mockTags);
    render(<TagsManagement tags={mockTags} onRefresh={mockOnRefresh} />);
    
    const refreshButton = screen.getByText('刷新');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  it('should have action buttons for each tag', () => {
    render(<TagsManagement tags={mockTags} />);
    // 每个标签应该有重命名、合并、删除按钮
    const renameButtons = screen.getAllByText('重命名');
    const mergeButtons = screen.getAllByText('合并');
    const deleteButtons = screen.getAllByText('删除');
    
    expect(renameButtons.length).toBe(3);
    expect(mergeButtons.length).toBe(3);
    expect(deleteButtons.length).toBe(3);
  });

  it('should enter edit mode when clicking tag name', () => {
    render(<TagsManagement tags={mockTags} />);
    const tagElement = screen.getByText('#技术');
    fireEvent.click(tagElement);
    
    expect(screen.getByDisplayValue('技术')).toBeInTheDocument();
    expect(screen.getByText('保存')).toBeInTheDocument();
    expect(screen.getByText('取消')).toBeInTheDocument();
  });

  it('should cancel edit mode when clicking cancel', () => {
    render(<TagsManagement tags={mockTags} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('#技术'));
    
    // Cancel
    fireEvent.click(screen.getByText('取消'));
    
    expect(screen.getByText('#技术')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('技术')).not.toBeInTheDocument();
  });

  it('should show delete confirmation when clicking delete', () => {
    render(<TagsManagement tags={mockTags} />);
    const deleteButtons = screen.getAllByText('删除');
    fireEvent.click(deleteButtons[0]);
    
    expect(screen.getByText('确认删除标签')).toBeInTheDocument();
    expect(screen.getByText(/确定要删除标签/)).toBeInTheDocument();
  });

  it('should call onDeleteTag when confirming delete', async () => {
    mockOnDeleteTag.mockResolvedValue(true);
    render(<TagsManagement tags={mockTags} onDeleteTag={mockOnDeleteTag} />);
    
    // Click delete
    const deleteButtons = screen.getAllByText('删除');
    fireEvent.click(deleteButtons[0]);
    
    // Confirm
    fireEvent.click(screen.getByText('确认删除'));
    
    await waitFor(() => {
      expect(mockOnDeleteTag).toHaveBeenCalledWith('技术');
    });
  });

  it('should cancel delete when clicking cancel in dialog', () => {
    render(<TagsManagement tags={mockTags} />);
    
    // Click delete
    const deleteButtons = screen.getAllByText('删除');
    fireEvent.click(deleteButtons[0]);
    
    // Cancel in dialog
    fireEvent.click(screen.getByText('取消', { selector: 'button' }));
    
    // Dialog should be closed
    expect(screen.queryByText('确认删除标签')).not.toBeInTheDocument();
  });

  it('should have sort select', () => {
    render(<TagsManagement tags={mockTags} />);
    expect(screen.getByText('使用次数 ↓')).toBeInTheDocument();
  });

  it('should have search input', () => {
    render(<TagsManagement tags={mockTags} />);
    expect(screen.getByPlaceholderText('搜索标签...')).toBeInTheDocument();
  });
});
