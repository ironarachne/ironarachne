import { describe, it, expect } from 'vitest';
import { all } from './landforms';

describe('Landforms List', () => {
  it('should return a list of landforms', () => {
    const list = all();
    expect(list.length).toBeGreaterThan(0);
  });

  it('should include geological constraints on relevant landforms', () => {
    const list = all();

    const plains = list.find((l) => l.name === 'plains');
    expect(plains).toBeDefined();
    expect(plains?.validSoils?.length).toBeGreaterThan(0);

    const canyon = list.find((l) => l.name === 'canyon');
    expect(canyon).toBeDefined();
    expect(canyon?.validRocks?.length).toBeGreaterThan(0);
  });
});
