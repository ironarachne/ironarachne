import { expect, describe, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { generate, generateChopShop } from './chop_shop_generation';

describe('generate', () => {
  it('is deterministic for a given seed', () => {
    expect(generate(new RNG('chrome'))).toBe(generate(new RNG('chrome')));
  });

  it('produces different descriptions for different seeds', () => {
    const descriptions = new Set(
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((seed) => generate(new RNG(seed))),
    );

    expect(descriptions.size).toBeGreaterThan(1);
  });

  it('joins its five sections into one prose description', () => {
    const description = generate(new RNG('neon'));

    expect(description).not.toContain('undefined');
    expect(description.split(' ').length).toBeGreaterThan(50);
  });

  it('describes the back room with a room, tools and technicians', () => {
    const description = generate(new RNG('back-room'));

    expect(description).toMatch(
      /The (operating room|cyberlab|research and development area|operation facility) is dimly lit/,
    );
    expect(description).toMatch(
      /Rows of (microscalpels|precision drills|laser scalpels|cybernetic grafting tools) line the walls/,
    );
    expect(description).toMatch(
      /(Two technicians in immaculate uniforms|A team of cyber specialists|A group of cyberpunk techies|An experienced team of surgeons) stand ready/,
    );
  });

  it('advances the RNG so successive calls on one instance differ', () => {
    const rng = new RNG('shared');
    const first = generate(rng);
    const second = generate(rng);

    expect(first).not.toBe(second);
  });

  it('draws product displays from screens, models and attendants across seeds', () => {
    const descriptions = Array.from({ length: 60 }, (_, index) =>
      generate(new RNG(`display-${index}`)),
    );

    expect(descriptions.some((text) => text.includes('screen'))).toBe(true);
    expect(descriptions.some((text) => text.includes('model cybernetic'))).toBe(true);
    expect(descriptions.some((text) => text.includes('attendants'))).toBe(true);
  });
});

describe('generateChopShop', () => {
  it('wraps the paragraph in the library’s one type', () => {
    expect(generateChopShop(new RNG('typed'))).toEqual({ text: generate(new RNG('typed')) });
  });

  it('never doubles a space between sentences, so the page and the export read the same', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(generate(new RNG(seed))).not.toMatch(/ {2}/);
    }
  });
});
