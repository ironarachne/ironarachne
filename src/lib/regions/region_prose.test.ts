import { describe, expect, it } from 'vitest';
import { compassPosition, regionHook, sentenceCase } from './region_prose';
import { rollRegionSnapshot } from './region_roll';
import { regionToUiDocument } from './region_ui_presentation';
import { regionToMarkdown, regionToText } from './region_presentation';

describe('region prose grammar', () => {
  it('uses natural adjectives in all nine compass positions', () => {
    expect([0, 0.5, 1].flatMap((y) => [0, 0.5, 1].map((x) => compassPosition(x, y)))).toEqual([
      'northwestern',
      'northern',
      'northeastern',
      'western',
      'central',
      'eastern',
      'southwestern',
      'southern',
      'southeastern',
    ]);
    expect(compassPosition(1 / 3, 2 / 3)).toBe('central');
  });

  it('cases only the initial letter and splits explicit hooks without rewriting authored text', () => {
    expect(sentenceCase('the Woods of Belvorn')).toBe('The Woods of Belvorn');
    expect(sentenceCase('')).toBe('');
    expect(regionHook('an authored sentence: i keep my case. Hook: i keep this too.')).toEqual({
      body: 'an authored sentence: i keep my case.',
      hook: 'i keep this too.',
    });
    expect(regionHook('Hook: part of the body')).toEqual({ body: 'Hook: part of the body' });
  });

  it('preserves authored hook case and punctuation in all three hook sections', () => {
    const saved = rollRegionSnapshot('5wyedz5q272fz');
    const facts = [
      saved.facts.routes[0],
      ...['landmark', 'hazard'].map(
        (kind) => saved.facts.notables.find((fact) => fact.kind === kind)!,
      ),
    ];
    for (const fact of facts) {
      fact.origin = 'authored';
      fact.name = 'the iPhone Road';
      fact.description = 'i wrote this: keep My CASE. Hook: i wrote this hook: keep it.';
    }
    const before = structuredClone(saved);
    const ui = regionToUiDocument(saved);
    for (const fact of facts) {
      const entry = ui.sections
        .flatMap((section) => section.entries)
        .find((entry) => entry.factId === fact.id)!;
      expect(entry.heading).toContain('the iPhone Road');
      expect(entry.body).toBe('i wrote this: keep My CASE.');
      expect(entry.hook).toBe('i wrote this hook: keep it.');
    }
    for (const text of [regionToMarkdown(saved), regionToText(saved)]) {
      expect(text).toContain('i wrote this: keep My CASE.');
      expect(text).toContain('i wrote this hook: keep it.');
    }
    expect(saved).toEqual(before);
  });

  it('covers the Woods of Belvorn regression and retains stored prose through every reading format', () => {
    const saved = rollRegionSnapshot('5wyedz5q272fz');
    const before = structuredClone(saved);
    const prose = [
      saved.description,
      ...Object.values(saved.facts).flatMap((value) =>
        Array.isArray(value) ? value.map((fact) => fact.description ?? '') : [],
      ),
    ].join('\n');
    expect(prose).not.toMatch(
      /freezing temperatures[^.]*, making|Dried provisions is|population of elm tree|food for rabbit|southern eastern|northern western|bear occur|elm tree occur|region: This settlement/,
    );
    expect(saved.facts.notables.some((fact) => fact.name === 'Cold travel country')).toBe(true);
    const ui = regionToUiDocument(saved);
    const markdown = regionToMarkdown(saved);
    const pdfText = regionToText(saved);
    for (const section of ui.sections) {
      for (const entry of section.entries) {
        if (entry.hook) {
          expect(entry.hook).toMatch(/^[A-Z]/);
          expect(markdown).toContain(`#### Suggested adventure\n\n${entry.hook}`);
          expect(pdfText).toContain(`Suggested adventure\n${entry.hook}`);
        }
        if (section.heading === 'Landscape' && entry.heading)
          expect(entry.heading).toMatch(/^[A-Z]/);
      }
    }
    expect(saved).toEqual(before);
    expect(rollRegionSnapshot('5wyedz5q272fz')).toEqual(saved);
  });
});
