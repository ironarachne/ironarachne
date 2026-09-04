import type { Spell } from './magic_types';

export function getSpellSummary(spell: Spell): string {
  const elements = spell.elements.join(', ');
  return `${spell.name} (Magnitude ${spell.magnitude} ${spell.intent} - ${elements})`;
}

export function hasComponent(spell: Spell, componentType: string): boolean {
  return spell.components.some((c) => c.type === componentType);
}

export function formatComponents(spell: Spell): string {
  const comps = spell.components.map((c) => {
    if (c.description) {
      return `${c.type} (${c.description})`;
    }
    return c.type;
  });
  return comps.join(', ');
}
