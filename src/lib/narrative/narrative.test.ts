import { describe, expect, it } from 'vitest';
import { RNG } from '@ironarachne/rng';
import { composeNarrative } from './narrative';
import type {
  NarrativeCandidate,
  NarrativeContext,
  NarrativePolicy,
  NarrativeSubject,
} from './narrative_types';

const policy: NarrativePolicy = { maxSentences: 2, maxPerTopic: 1, repetitionWindow: 8 };
function candidate(
  id: string,
  importance: NarrativeCandidate['importance'] = 'distinctive',
  topic = id,
): NarrativeCandidate {
  return {
    id,
    importance,
    topic,
    sourceIds: ['saved-evidence'],
    templates: [
      {
        id: `${id}:sentence`,
        parts: [{ id: 'sentence', options: [`${id} matters.`, `${id} stands out.`] }],
      },
    ],
  };
}
function subject(
  candidates = [candidate('bog:danger'), candidate('bog:isolation')],
): NarrativeSubject {
  return { id: 'bog:1', kind: 'bog', candidates };
}
const run = (
  input = subject(),
  seed = 'prose',
  settings = policy,
  context: NarrativeContext = { recentSelections: [] },
) => composeNarrative(input, settings, context, new RNG(seed));

describe('focused seeded narrative', () => {
  it('repeats results without mutating subjects, policies or context', () => {
    const input = subject();
    const history = run().nextContext;
    const before = structuredClone({ input, history, policy });
    const first = run(input, 'stable', policy, history);
    expect(run(input, 'stable', policy, history)).toEqual(first);
    expect({ input, history, policy }).toEqual(before);
  });

  it('varies both focus and wording across seeds and remains stable under candidate/template reordering', () => {
    const input = subject([candidate('bog:a'), candidate('bog:b'), candidate('bog:c')]);
    input.candidates[0].templates.push({
      id: 'bog:a:other',
      parts: [{ id: 'text', options: ['Another expression of a.'] }],
    });
    const reversed = structuredClone(input);
    reversed.candidates.reverse().forEach((entry) => entry.templates.reverse());
    expect(run(reversed)).toEqual(run(input));
    const variants = Array.from({ length: 20 }, (_, seed) =>
      run(input, String(seed), { ...policy, maxSentences: 1 }),
    );
    expect(new Set(variants.map((entry) => entry.text)).size).toBeGreaterThan(3);
    expect(new Set(variants.map((entry) => entry.selections[0].candidateId)).size).toBe(3);
  });

  it('respects strict importance, sentence and topic budgets without filling unavailable topics', () => {
    const input = subject([
      candidate('ordinary', 'supporting'),
      candidate('identity', 'defining'),
      candidate('contrast'),
      candidate('another-contrast', 'distinctive', 'contrast'),
    ]);
    const result = run(input);
    expect(result.selections[0].candidateId).toBe('identity');
    expect(result.selections[1].candidateId).not.toBe('ordinary');
    const full = run(input, 'full', { ...policy, maxSentences: 10 });
    expect(full.selections).toHaveLength(3);
    expect(full.selections.at(-1)?.candidateId).toBe('ordinary');
    for (const settings of [
      { ...policy, maxSentences: 0 },
      { ...policy, maxPerTopic: 0 },
    ]) {
      expect(run(input, 'zero', settings).text).toBe('');
    }
    expect(run(subject([]))).toEqual({
      text: '',
      selections: [],
      nextContext: { recentSelections: [] },
    });
  });

  it('prefers a fresh meaning only within the same importance tier', () => {
    const initial = run(subject([candidate('important', 'defining')]));
    const result = run(
      subject([candidate('important', 'defining'), candidate('new', 'supporting')]),
      'fresh',
      { ...policy, maxSentences: 1 },
      initial.nextContext,
    );
    expect(result.selections[0].candidateId).toBe('important');
    const equallyImportant = run(
      subject([candidate('important', 'defining'), candidate('other', 'defining')]),
      'fresh',
      { ...policy, maxSentences: 1 },
      initial.nextContext,
    );
    expect(equallyImportant.selections[0].candidateId).toBe('other');
  });

  it('uses all compatible fragment combinations before repetition, then permits truthful reuse', () => {
    const input = subject([candidate('bog:air')]);
    input.candidates[0].templates = [
      {
        id: 'bog:air:parts',
        parts: [
          { id: 'subject', options: ['This bog ', 'The bog '] },
          { id: 'predicate', options: ['is unusually damp.', 'feels oppressively humid.'] },
        ],
      },
    ];
    let context: NarrativeContext = { recentSelections: [] };
    const texts: string[] = [];
    for (let index = 0; index < 5; index++) {
      const result = run(input, 'batch', { ...policy, maxSentences: 1 }, context);
      context = result.nextContext;
      texts.push(result.text);
      expect(result.text).toMatch(
        /^(This bog|The bog) (is unusually damp|feels oppressively humid)\.$/,
      );
    }
    expect(new Set(texts.slice(0, 4)).size).toBe(4);
    expect(texts.slice(0, 4)).toContain(texts[4]);
  });

  it('prefers unused templates and combinations even when another template is exhausted', () => {
    const input = subject([candidate('bog:air')]);
    input.candidates[0].templates.push({
      id: 'bog:air:single',
      parts: [{ id: 'text', options: ['The air is unusually heavy.'] }],
    });
    let context: NarrativeContext = { recentSelections: [] };
    const texts: string[] = [];
    const templates: string[] = [];
    for (let index = 0; index < 4; index++) {
      const result = run(input, 'templates', policy, context);
      texts.push(result.text);
      templates.push(result.selections[0].templateId);
      context = result.nextContext;
    }
    expect(templates[1]).not.toBe(templates[0]);
    expect(new Set(texts.slice(0, 3)).size).toBe(3);
    expect(texts.slice(0, 3)).toContain(texts[3]);
  });

  it('bounds explicit repetition history and disables it with a zero window', () => {
    const context = run().nextContext;
    expect(
      run(subject(), 'short', { ...policy, repetitionWindow: 1 }, context).nextContext
        .recentSelections,
    ).toHaveLength(1);
    const result = run(subject(), 'off', { ...policy, repetitionWindow: 0 }, context);
    expect(result.nextContext.recentSelections).toEqual([]);
    expect(result.text).toBe(run(subject(), 'off', { ...policy, repetitionWindow: 0 }).text);
  });

  it.each([-1, 1.5, NaN, Infinity])('rejects invalid budgets (%s)', (maxSentences) => {
    expect(() => run(subject(), 'invalid', { ...policy, maxSentences })).toThrow('budgets');
  });

  it('rejects empty identities, invalid importance, duplicate IDs and missing/duplicate option pools', () => {
    const invalid: NarrativeSubject[] = [
      { ...subject(), id: ' ' },
      { ...subject(), kind: '' },
      subject([candidate('same'), candidate('same')]),
      subject([{ ...candidate('missing'), topic: '' }]),
      subject([
        { ...candidate('missing'), importance: 'toString' as NarrativeCandidate['importance'] },
      ]),
      subject([{ ...candidate('missing'), templates: [] }]),
      subject([{ ...candidate('missing'), templates: [{ id: 'empty', parts: [] }] }]),
      subject([
        {
          ...candidate('missing'),
          templates: [{ id: '', parts: [{ id: 'text', options: ['Text.'] }] }],
        },
      ]),
      subject([
        {
          ...candidate('missing'),
          templates: [{ id: 'empty', parts: [{ id: 'text', options: [] }] }],
        },
      ]),
      subject([
        {
          ...candidate('missing'),
          templates: [{ id: 'blank', parts: [{ id: 'text', options: ['', ' '] }] }],
        },
      ]),
      subject([
        {
          ...candidate('missing'),
          templates: [{ id: 'duplicate', parts: [{ id: 'text', options: ['Same.', 'Same.'] }] }],
        },
      ]),
    ];
    for (const input of invalid) expect(() => run(input)).toThrow('Narrative');
  });
});
