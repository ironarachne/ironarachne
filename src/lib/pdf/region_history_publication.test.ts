import { expect, it } from 'vitest';
import { historyEditingFixture } from '../../../test_fixtures/region_history_editing';
import { setRegionHistoryEventText, setRealmText, regionToText } from '$lib/regions';
import { PRESENTERS, presentationMarkdownToBlocks } from './project_publication';
import { buildTextPdf } from './render_text_pdf';

it('publishes saved history in reading order and carries authored review notices into PDF input', async () => {
  let snapshot = historyEditingFixture();
  snapshot = setRegionHistoryEventText(
    snapshot,
    'event:local-founding',
    'description',
    'The Local Realm was founded.',
  );
  snapshot = setRealmText(snapshot, 0, 'name', 'New Realm');
  const markdown = await (await PRESENTERS.region())(snapshot as never);
  const blocks = presentationMarkdownToBlocks(markdown);
  const printed = blocks
    .filter((b) => 'text' in b)
    .map((b) => b.text)
    .join('\n');
  expect(printed).toContain('History needs review');
  expect(printed).toContain('The Local Realm was founded.');
  expect(printed).toContain('Explains: New Realm');
  expect(printed).toContain('Needs review:');
  expect(printed).not.toContain('Saved words for event:fall.');
  expect(printed).not.toContain('<a id=');
  expect(printed.indexOf('The Local Realm was founded.')).toBeLessThan(
    printed.indexOf('Saved words for event:town-founding.'),
  );
  const text = regionToText(snapshot);
  expect(text).toContain('The Local Realm was founded.');
  expect(text).toContain('History needs review');
  const pdf = await buildTextPdf(snapshot.name, text);
  expect(pdf.type).toBe('application/pdf');
  expect(pdf.size).toBeGreaterThan(100);
});

import { RNG } from '@ironarachne/rng';
import { HISTORY_ACCEPTANCE_SCENARIOS } from '../../../test_fixtures/region_history_scenarios';
import { generateRegionHistory, regionHistoryReading } from '$lib/regions';

it.each(HISTORY_ACCEPTANCE_SCENARIOS)(
  'publishes the reviewed $key account without selecting replacement words',
  async ({ build, seed }) => {
    const snapshot = build();
    snapshot.history = generateRegionHistory(snapshot, new RNG(seed));
    const before = structuredClone(snapshot);
    const reading = regionHistoryReading(snapshot);
    const blocks = presentationMarkdownToBlocks(
      await (
        await PRESENTERS.region()
      )(snapshot as never),
    );
    const printed = blocks
      .filter((block) => 'text' in block)
      .map((block) => block.text)
      .join('\n');
    let position = -1;
    for (const entry of reading.entries) {
      const next = printed.indexOf(entry.body);
      expect(next).toBeGreaterThan(position);
      position = next;
      for (const ref of entry.references) expect(printed).toContain(ref.label);
    }
    const pdf = await buildTextPdf(snapshot.name, regionToText(snapshot));
    expect(pdf.type).toBe('application/pdf');
    expect(snapshot).toEqual(before);
  },
);
