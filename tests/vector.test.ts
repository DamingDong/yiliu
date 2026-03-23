import { describe, it, expect, beforeEach } from 'vitest';
import { initVectorStore, addVector, hasVector, getStats, semanticSearch, removeVector } from '../src/storage/vector.js';

describe('Vector Store', () => {
  beforeEach(() => {
    initVectorStore('/tmp/yiliu-test-vectors');
  });

  it('should add a vector', () => {
    const embedding = new Array(384).fill(0.1);
    addVector('test-1', embedding, 'test content');
    expect(hasVector('test-1')).toBe(true);
  });

  it('should remove a vector', () => {
    const embedding = new Array(384).fill(0.2);
    addVector('test-remove', embedding, 'content to remove');
    expect(hasVector('test-remove')).toBe(true);
    removeVector('test-remove');
    expect(hasVector('test-remove')).toBe(false);
  });

  it('should perform semantic search', () => {
    const embedding = new Array(384).fill(0.5);
    addVector('search-test', embedding, 'searchable content here');
    
    const results = semanticSearch(embedding, 5, 0.0);
    expect(results.length).toBeGreaterThan(0);
  });

  it('should return correct stats', () => {
    const embedding = new Array(384).fill(0.3);
    addVector('stats-test', embedding, 'stats content');
    
    const stats = getStats();
    expect(stats.count).toBeGreaterThanOrEqual(1);
  });
});
