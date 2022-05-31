'use strict';

import EncounterTemplate from '../../template';
import * as Cult from './cult';
import * as Magic from './magic';
import * as Martial from './martial';
import * as Undead from './undead';

export function all(): EncounterTemplate[] {
  let result = [];

  result = result.concat(Cult.all());
  result = result.concat(Magic.all());
  result = result.concat(Martial.all());
  result = result.concat(Undead.all());

  return result;
}

export function withTag(tag: string, templates: EncounterTemplate[]): EncounterTemplate[] {
  let result = [];

  for (let i = 0; i < templates.length; i++) {
    if (templates[i].tags.includes(tag)) {
      result.push(templates[i]);
    }
  }

  return result;
}

export function withoutTag(tag: string, templates: EncounterTemplate[]): EncounterTemplate[] {
  let result = [];

  for (let i = 0; i < templates.length; i++) {
    if (!templates[i].tags.includes(tag)) {
      result.push(templates[i]);
    }
  }

  return result;
}
