import { describe, expect, it } from 'vitest';
import { monotheism, polytheism } from './categories';
import { composePantheonDescriptionLine } from './compose_religion_narrative';

describe('composePantheonDescriptionLine', () => {
  it('does not speak of a pantheon or shared sovereignty for monotheism', () => {
    const line = composePantheonDescriptionLine(monotheism, 1, null, 'Ashuriel', null);
    expect(line.toLowerCase()).not.toContain('pantheon');
    expect(line.toLowerCase()).not.toContain('share');
    expect(line).toContain('Ashuriel');
  });

  it('uses pantheon language for polytheism with several deities', () => {
    const line = composePantheonDescriptionLine(polytheism, 4, null, null, 'hierarchical');
    expect(line.toLowerCase()).toContain('pantheon');
  });

  it('mentions first among them only when there is a leader and more than one deity', () => {
    const withLeader = composePantheonDescriptionLine(polytheism, 3, 'Vessa', null, 'hierarchical');
    expect(withLeader).toContain('Vessa');
    expect(withLeader.toLowerCase()).toContain('first among them');

    const noLeader = composePantheonDescriptionLine(polytheism, 3, null, null, 'hierarchical');
    expect(noLeader.toLowerCase()).not.toContain('first among them');
  });

  it('describes coequal gods for egalitarian polytheism', () => {
    const line = composePantheonDescriptionLine(polytheism, 4, null, null, 'egalitarian');
    expect(line.toLowerCase()).toContain('coequal');
    expect(line.toLowerCase()).not.toContain('first among them');
  });
});
