import type { RulesetFailureReason, RulesetResult } from './ruleset_types';

export function acceptedRuleset<T>(value: T): RulesetResult<T> {
  return { ok: true, value };
}

export function rejectedRuleset(
  reason: RulesetFailureReason,
  message: string,
): RulesetResult<never> {
  return { ok: false, reason, message };
}
