import { RNG } from '@ironarachne/rng';
import { expect, describe, it } from 'vitest';
import { add_trait, generate } from './physical_traits';
import type PhysicalTrait from './physical_trait';
import type PhysicalTraitGeneratorConfig from './physical_trait_generator_config';

function trait(name: string, category: string): PhysicalTrait {
  return { name, description: `a ${name}`, category, tags: [] };
}

describe('add_trait', () => {
  it('appends a trait to an empty list', () => {
    const eyes = trait('eyes', 'face');
    expect(add_trait(eyes, [])).toEqual([eyes]);
  });

  it('keeps traits in other categories', () => {
    const eyes = trait('eyes', 'face');
    const hair = trait('hair', 'head');

    expect(add_trait(hair, [eyes])).toEqual([eyes, hair]);
  });

  it('replaces an existing trait in the same category', () => {
    const blueEyes = trait('blue eyes', 'face');
    const greenEyes = trait('green eyes', 'face');

    expect(add_trait(greenEyes, [blueEyes])).toEqual([greenEyes]);
  });

  it('replaces every trait sharing the category', () => {
    const first = trait('first', 'face');
    const second = trait('second', 'face');
    const hair = trait('hair', 'head');
    const replacement = trait('replacement', 'face');

    expect(add_trait(replacement, [first, hair, second])).toEqual([hair, replacement]);
  });

  it('does not mutate the traits it is given', () => {
    const existing = [trait('blue eyes', 'face')];
    add_trait(trait('green eyes', 'face'), existing);

    expect(existing).toEqual([trait('blue eyes', 'face')]);
  });
});

describe('generate', () => {
  const config: PhysicalTraitGeneratorConfig = {
    name: 'eyes',
    category: 'face',
    options: ['blue', 'green', 'brown'],
    tags: ['visible'],
  };

  it('carries the config name, category, and tags onto the trait', () => {
    const result = generate(config, new RNG('seed'));

    expect(result.name).toBe('eyes');
    expect(result.category).toBe('face');
    expect(result.tags).toEqual(['visible']);
  });

  it('builds the description from a chosen option and the name', () => {
    const result = generate(config, new RNG('seed'));

    expect(config.options).toContain(result.description.replace(' eyes', ''));
    expect(result.description).toMatch(/^(blue|green|brown) eyes$/);
  });

  it('is deterministic for a given seed', () => {
    expect(generate(config, new RNG('same-seed'))).toEqual(generate(config, new RNG('same-seed')));
  });

  it('always picks the only option when there is one', () => {
    const single: PhysicalTraitGeneratorConfig = { ...config, options: ['violet'] };

    expect(generate(single, new RNG('seed')).description).toBe('violet eyes');
  });
});
