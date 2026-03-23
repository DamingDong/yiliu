import { describe, it, expect } from 'vitest';
import { generateEmbedding, isAIAvailable, getEmbedderProvider, getEmbeddingModelInfo } from '../src/ai/index.js';

describe('AI Module', () => {
  it('should check AI availability', () => {
    const available = isAIAvailable();
    expect(typeof available).toBe('boolean');
  });

  it('should return correct provider', () => {
    const provider = getEmbedderProvider();
    expect(['openai', 'local', 'huggingface']).toContain(provider);
  });

  it('should return embedding model info', () => {
    const info = getEmbeddingModelInfo();
    expect(info.provider).toBeDefined();
    expect(info.model).toBeDefined();
    expect(typeof info.isLocal).toBe('boolean');
  });

  it('should generate embedding (may take time on first run)', async () => {
    const result = await generateEmbedding('test embedding generation');
    
    if (result) {
      expect(result.embedding).toBeInstanceOf(Array);
      expect(result.embedding.length).toBeGreaterThan(0);
      expect(result.model).toBeDefined();
    }
  }, 60000);
});
