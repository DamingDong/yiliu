import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // 以下测试需要本地嵌入模型，在网络环境不好时会超时
    // 运行方式: pnpm vitest run tests/ai.test.ts tests/db.test.ts tests/integration.test.ts
    exclude: [
      'tests/ai.test.ts',        // 需要 huggingface.co 下载模型
      'tests/db.test.ts',        // 依赖本地嵌入模型
      'tests/integration.test.ts' // 依赖本地嵌入模型
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    testTimeout: 60000,  // 60 秒超时，适应模型下载
  },
});
