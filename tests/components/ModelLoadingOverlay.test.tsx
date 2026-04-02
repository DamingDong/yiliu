import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ModelLoadingOverlay } from '../../src/renderer/components/ModelLoadingOverlay';

describe('ModelLoadingOverlay Component', () => {
  it('should render main title', () => {
    render(<ModelLoadingOverlay stage="loading-model" progress={50} />);
    expect(screen.getByText('正在加载 AI 模型')).toBeInTheDocument();
  });

  it('should show progress bar container', () => {
    const { container } = render(<ModelLoadingOverlay stage="loading-model" progress={50} />);
    const progressBar = container.querySelector('div[style*="height: 8px"]');
    expect(progressBar).toBeTruthy();
  });

  it('should show initiating stage label', async () => {
    render(<ModelLoadingOverlay stage="initiating" progress={10} />);
    await waitFor(() => {
      expect(screen.getByText('初始化中...')).toBeInTheDocument();
    });
  });

  it('should show downloading-model stage label', async () => {
    render(<ModelLoadingOverlay stage="downloading-model" progress={30} />);
    await waitFor(() => {
      expect(screen.getByText('下载模型中...')).toBeInTheDocument();
    });
  });

  it('should show loading-tokenizer stage label', async () => {
    render(<ModelLoadingOverlay stage="loading-tokenizer" progress={60} />);
    await waitFor(() => {
      expect(screen.getByText('加载分词器...')).toBeInTheDocument();
    });
  });

  it('should show loading-model stage label', async () => {
    render(<ModelLoadingOverlay stage="loading-model" progress={70} />);
    await waitFor(() => {
      expect(screen.getByText('加载模型中...')).toBeInTheDocument();
    });
  });

  it('should show finalizing stage label', async () => {
    render(<ModelLoadingOverlay stage="finalizing" progress={90} />);
    await waitFor(() => {
      expect(screen.getByText('完成中...')).toBeInTheDocument();
    });
  });

  it('should show complete stage label', async () => {
    render(<ModelLoadingOverlay stage="complete" progress={100} />);
    await waitFor(() => {
      expect(screen.getByText('加载完成')).toBeInTheDocument();
    });
  });

  it('should show error stage label', async () => {
    render(<ModelLoadingOverlay stage="error" progress={0} />);
    await waitFor(() => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });
  });

  it('should show default stage label for unknown stage', async () => {
    render(<ModelLoadingOverlay stage="unknown-stage" progress={50} />);
    await waitFor(() => {
      expect(screen.getByText('unknown-stage')).toBeInTheDocument();
    });
  });

  it('should show 0% at start', async () => {
    render(<ModelLoadingOverlay stage="initiating" progress={0} />);
    await waitFor(() => {
      expect(screen.getByText(/^0%$/)).toBeInTheDocument();
    });
  });

  it('should show 50% at half progress after animation', async () => {
    render(<ModelLoadingOverlay stage="loading-model" progress={50} />);
    await waitFor(() => {
      expect(screen.getByText(/^50%$/)).toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('should show 100% when complete', async () => {
    render(<ModelLoadingOverlay stage="complete" progress={100} />);
    await waitFor(() => {
      expect(screen.getByText(/^100%$/)).toBeInTheDocument();
    });
  });

  it('should show help text about first run', async () => {
    render(<ModelLoadingOverlay stage="initiating" progress={0} />);
    await waitFor(() => {
      expect(screen.getByText(/首次运行需要下载 AI 模型/)).toBeInTheDocument();
      expect(screen.getByText(/下载完成后会自动缓存到本地/)).toBeInTheDocument();
    });
  });

  it('should display brain emoji', async () => {
    const { container } = render(<ModelLoadingOverlay stage="initiating" progress={0} />);
    await waitFor(() => {
      expect(container.textContent).toContain('🧠');
    });
  });
});
