import type { Duration } from '$lib/magic';
import { valueToString, COMMON_FANTASY } from '$lib/currency';
import type { Potion, PotionEffect, PotionForm } from './potion_types';

function describeDuration(duration: Duration): string {
  if (duration.description) {
    return duration.description;
  }

  switch (duration.type) {
    case 'instantaneous':
      return 'The effect is instantaneous.';
    case 'permanent':
      return 'The effect is permanent.';
    case 'sustained':
      return 'The effect is sustained while active.';
    case 'conditional':
      if (duration.value && duration.unit) {
        return `The effect lasts up to ${duration.value} ${duration.unit}(s), unless its condition ends it sooner.`;
      }
      return 'The effect lasts until a specific condition ends it.';
    case 'timed':
      if (duration.value && duration.unit) {
        return `The effect lasts for ${duration.value} ${duration.unit}(s).`;
      }
      return 'The effect lasts for a limited time.';
    default:
      return '';
  }
}

function describeParameters(effect: PotionEffect): string {
  if (!effect.parameters) {
    return '';
  }

  switch (effect.parameters.kind) {
    case 'healing':
      return ` It restores or inflicts ${effect.parameters.dice}.`;
    case 'strength':
      return ` It sets Strength to ${effect.parameters.score} (${effect.parameters.giantType} giant).`;
    case 'resistance':
      return ` It grants resistance to ${effect.parameters.damageType} damage.`;
    case 'spell':
      return effect.parameters.saveDc
        ? ` It mimics ${effect.parameters.spellName} (save DC ${effect.parameters.saveDc}).`
        : ` It mimics the ${effect.parameters.spellName} spell.`;
    case 'bonus':
      return ` ${effect.parameters.description}.`;
    case 'homebrew':
      return '';
    default:
      return '';
  }
}

function formVerb(form: PotionForm): string {
  switch (form) {
    case 'oil':
      return 'applied';
    case 'ointment':
      return 'applied topically';
    case 'drink':
    default:
      return 'drunk';
  }
}

export function describeEffect(effect: PotionEffect): string {
  let text = effect.description;
  text += describeParameters(effect);
  text += ` ${describeDuration(effect.duration)}`;
  return text.trim();
}

export function describePotion(potion: Potion, form: PotionForm = 'drink'): string {
  const { sensory, liquid, displayName, effect } = potion;
  const verb = formVerb(form);
  const effectText = describeEffect(effect);
  const effectSentence = effectText.charAt(0).toLowerCase() + effectText.slice(1);

  let description = `${displayName} is a magical ${form === 'drink' ? 'potion' : form}. `;
  description += `When ${verb}, ${effectSentence} `;
  description += `It appears as ${sensory.appearance}. `;
  description += `The liquid is ${sensory.viscosity}, tastes ${sensory.flavor}, and smells of ${sensory.scent}. `;
  description += `The liquid alone is worth ${valueToString(liquid.value, COMMON_FANTASY)}. `;
  description += `It is contained in a ${potion.container.name} (${potion.container.description}).`;

  return description.trim();
}

export function describeDurationShort(duration: Duration): string {
  if (duration.description) {
    return duration.description;
  }
  if (duration.type === 'instantaneous') {
    return 'Instantaneous';
  }
  if (duration.type === 'permanent') {
    return 'Permanent';
  }
  if (duration.type === 'conditional') {
    return duration.value && duration.unit
      ? `Conditional (${duration.value} ${duration.unit})`
      : 'Conditional';
  }
  if (duration.type === 'timed' && duration.value && duration.unit) {
    return `${duration.value} ${duration.unit}(s)`;
  }
  return duration.type;
}
