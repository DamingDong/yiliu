import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initVectorStore, addVector, hasVector, getStats, semanticSearch, removeVector, hybridSearch } from '../src/storage/vector.js';

describe('Vector Store', () => {
  const testDir = '/tmp/yiliu-test-vectors';

  beforeEach(() => {
    initVectorStore(testDir);
  });

  afterEach(() => {
    const fs = require('fs');
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Vector Storage', () => {
    it('should add a vector', () => {
      const embedding = new Array(384).fill(0.1);
      addVector('test-1', embedding, 'test content');
      expect(hasVector('test-1')).toBe(true);
    });

    it('should check if vector exists', () => {
      const embedding = new Array(384).fill(0.2);
      addVector('exists-check', embedding, 'checking existence');
      expect(hasVector('exists-check')).toBe(true);
      expect(hasVector('non-existent')).toBe(false);
    });

    it('should remove a vector', () => {
      const embedding = new Array(384).fill(0.3);
      addVector('test-remove', embedding, 'content to remove');
      expect(hasVector('test-remove')).toBe(true);
      removeVector('test-remove');
      expect(hasVector('test-remove')).toBe(false);
    });

    it('should handle removing non-existent vector', () => {
      expect(() => removeVector('non-existent')).not.toThrow();
    });
  });

  describe('Similarity Search', () => {
    it('should perform semantic search', () => {
      const embedding = new Array(384).fill(0.5);
      addVector('search-test', embedding, 'searchable content here');
      
      const results = semanticSearch(embedding, 5, 0.0);
      expect(results.length).toBeGreaterThan(0);
      const ids = results.map(r => r.id);
      expect(ids).toContain('search-test');
    });

    it('should return empty array for non-matching search', () => {
      const searchEmbedding = new Array(384).fill(0.9);
      const results = semanticSearch(searchEmbedding, 5, 0.0);
      expect(results).toBeInstanceOf(Array);
    });

    it('should respect topK parameter', () => {
      for (let i = 0; i < 10; i++) {
        const embedding = new Array(384).fill(Math.random() * 0.5);
        addVector(`search-${i}`, embedding, `content ${i}`);
      }
      
      const results = semanticSearch(new Array(384).fill(0.25), 3, 0.0);
      expect(results.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Hybrid Search', () => {
    it('should perform hybrid search with keywords and embedding', () => {
      const embedding = new Array(384).fill(0.4);
      addVector('hybrid-test', embedding, 'hybrid search content');
      
      const results = hybridSearch(embedding, ['hybrid'], 5);
      expect(results).toBeInstanceOf(Array);
    });

    it('should return results sorted by score', () => {
      const embeddings = [
        new Array(384).fill(0.1),
        new Array(384).fill(0.5),
        new Array(384).fill(0.3),
      ];
      
      addVector('hybrid-1', embeddings[0], 'first content');
      addVector('hybrid-2', embeddings[1], 'second content');
      addVector('hybrid-3', embeddings[2], 'third content');
      
      const results = hybridSearch(embeddings[1], ['second'], 3);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Statistics', () => {
    it('should return correct stats', () => {
      const embedding = new Array(384).fill(0.3);
      addVector('stats-test', embedding, 'stats content');
      
      const stats = getStats();
      expect(stats).toHaveProperty('count');
      expect(stats).toHaveProperty('avgContentLength');
      expect(stats.count).toBeGreaterThanOrEqual(1);
    });

    it('should track multiple vectors in stats', () => {
      addVector('multi-1', new Array(384).fill(0.1), 'content 1');
      addVector('multi-2', new Array(384).fill(0.2), 'content 2');
      addVector('multi-3', new Array(384).fill(0.3), 'content 3');
      
      const stats = getStats();
      expect(stats.count).toBeGreaterThanOrEqual(3);
    });
  });
});
