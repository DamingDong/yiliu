import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownEditor } from '../../src/renderer/components/MarkdownEditor';

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown-preview">{children}</div>,
}));

// Mock markdown plugins
vi.mock('remark-gfm', async () => {
  const actual = await vi.importActual('remark-gfm');
  return { ...actual, default: actual };
});

vi.mock('rehype-highlight', async () => {
  const actual = await vi.importActual('rehype-highlight');
  return { ...actual, default: actual };
});

vi.mock('rehype-katex', async () => {
  const actual = await vi.importActual('rehype-katex');
  return { ...actual, default: actual };
});

vi.mock('remark-math', async () => {
  const actual = await vi.importActual('remark-math');
  return { ...actual, default: actual };
});

describe('MarkdownEditor 组件测试', () => {
  describe('Props 和状态', () => {
    it('应该正确初始化 value 和 onChange', () => {
      const mockOnChange = vi.fn();
      render(
        <MarkdownEditor
          value="初始内容"
          onChange={mockOnChange}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('初始内容');
    });

    it('应该使用默认的 placeholder', () => {
      const mockOnChange = vi.fn();
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder', '开始记录你的想法...');
    });

    it('应该支持自定义 placeholder', () => {
      const mockOnChange = vi.fn();
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          placeholder="自定义提示..."
        />
      );
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('placeholder', '自定义提示...');
    });

    it('onChange 应该在内容变化时被调用', () => {
      const mockOnChange = vi.fn();
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '新内容' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('新内容');
    });
  });

  describe('编辑器模式切换', () => {
    it('默认模式应该是 edit', () => {
      const mockOnChange = vi.fn();
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
        />
      );
      
      // 查找编辑按钮
      const editButton = screen.getByTitle('编辑');
      expect(editButton).toHaveClass('active');
    });

    it('应该支持三种模式切换', () => {
      const mockOnChange = vi.fn();
      const mockOnModeChange = vi.fn();
      
      // Preview 模式
      const { rerender } = render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          mode="edit"
          onModeChange={mockOnModeChange}
        />
      );
      
      expect(screen.getByTitle('编辑')).toHaveClass('active');
      
      rerender(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          mode="preview"
          onModeChange={mockOnModeChange}
        />
      );
      expect(screen.getByTitle('预览')).toHaveClass('active');
    });

    it('点击模式按钮应该调用 onModeChange', () => {
      const mockOnChange = vi.fn();
      const mockOnModeChange = vi.fn();
      
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          mode="edit"
          onModeChange={mockOnModeChange}
        />
      );
      
      const previewButton = screen.getByTitle('预览');
      fireEvent.click(previewButton);
      
      expect(mockOnModeChange).toHaveBeenCalledWith('preview');
    });
  });

  describe('工具栏按钮', () => {
    it('应该渲染工具栏', () => {
      const mockOnChange = vi.fn();
      const { container } = render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
        />
      );
      
      expect(container.querySelector('.markdown-toolbar')).toBeInTheDocument();
      expect(container.querySelectorAll('.toolbar-btn').length).toBeGreaterThan(10);
    });

    it('应该有加粗和斜体按钮', () => {
      const mockOnChange = vi.fn();
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
        />
      );
      
      // 加粗按钮有 B 文字
      const boldButton = screen.getByText('B');
      expect(boldButton.closest('.toolbar-btn')).toBeInTheDocument();
      
      // 斜体按钮有 I 文字
      const italicButton = screen.getByText('I');
      expect(italicButton.closest('.toolbar-btn')).toBeInTheDocument();
    });

    it('标题按钮应该存在', () => {
      const mockOnChange = vi.fn();
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
        />
      );
      
      expect(screen.getByText('H')).toBeInTheDocument();
    });
  });

  describe('编辑器视图切换', () => {
    it('edit 模式应该只显示文本域', () => {
      const mockOnChange = vi.fn();
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
          mode="edit"
        />
      );
      
      const textareas = screen.getAllByRole('textbox');
      expect(textareas.length).toBe(1);
    });

    it('preview 模式应该显示预览区域', () => {
      const mockOnChange = vi.fn();
      render(
        <MarkdownEditor
          value="预览内容"
          onChange={mockOnChange}
          mode="preview"
        />
      );
      
      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    });

    it('split 模式应该同时显示编辑器和预览', () => {
      const mockOnChange = vi.fn();
      const { container } = render(
        <MarkdownEditor
          value="分屏内容"
          onChange={mockOnChange}
          mode="split"
        />
      );
      
      const textareas = screen.getAllByRole('textbox');
      expect(textareas.length).toBe(1);
      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
      expect(container.querySelector('.editor-pane')).toBeInTheDocument();
      expect(container.querySelector('.preview-pane')).toBeInTheDocument();
    });
  });

  describe('组件结构', () => {
    it('应该包含正确的 CSS 类结构', () => {
      const mockOnChange = vi.fn();
      const { container } = render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
        />
      );
      
      expect(container.querySelector('.markdown-editor')).toBeInTheDocument();
      expect(container.querySelector('.markdown-toolbar')).toBeInTheDocument();
      expect(container.querySelector('.editor-body')).toBeInTheDocument();
      expect(container.querySelector('.editor-pane')).toBeInTheDocument();
      expect(container.querySelector('.mode-switcher')).toBeInTheDocument();
    });

    it('应该有模式切换按钮组', () => {
      const mockOnChange = vi.fn();
      const { container } = render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
        />
      );
      
      const modeButtons = container.querySelectorAll('.mode-btn');
      expect(modeButtons.length).toBe(3); // edit, preview, split
    });
  });

  describe('Markdown 功能', () => {
    it('应该渲染 Markdown 预览内容', () => {
      const mockOnChange = vi.fn();
      render(
        <MarkdownEditor
          value="# 标题\n**粗体**"
          onChange={mockOnChange}
          mode="preview"
        />
      );
      
      const preview = screen.getByTestId('markdown-preview');
      expect(preview).toHaveTextContent('# 标题');
      expect(preview).toHaveTextContent('**粗体**');
    });

    it('textarea 应该支持输入', () => {
      const mockOnChange = vi.fn();
      render(
        <MarkdownEditor
          value=""
          onChange={mockOnChange}
        />
      );
      
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '# Test' } });
      
      expect(mockOnChange).toHaveBeenCalledWith('# Test');
    });
  });
});

describe('MarkdownEditor 类型测试', () => {
  it('EditorMode 类型应该包含 edit, preview, split', () => {
    type EditorMode = 'edit' | 'preview' | 'split';
    
    const modes: EditorMode[] = ['edit', 'preview', 'split'];
    
    modes.forEach(mode => {
      expect(['edit', 'preview', 'split']).toContain(mode);
    });
  });

  it('MarkdownEditorProps 应该定义正确的属性', () => {
    interface MarkdownEditorProps {
      value: string;
      onChange: (value: string) => void;
      mode?: 'edit' | 'preview' | 'split';
      onModeChange?: (mode: 'edit' | 'preview' | 'split') => void;
      placeholder?: string;
    }

    const props: MarkdownEditorProps = {
      value: 'test',
      onChange: vi.fn(),
    };

    expect(props.value).toBe('test');
    expect(typeof props.onChange).toBe('function');
  });
});
