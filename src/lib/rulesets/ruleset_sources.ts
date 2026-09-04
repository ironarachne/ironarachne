import { CONTENT_SCOPES } from './ruleset_types';
import type { RulesDataSource } from './ruleset_types';

function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Production source manifests pass through this gate. Research-only or ambiguous grants are kept
 * outside the production catalog rather than receiving a permissive fallback.
 */
export function defineRulesDataSource(source: RulesDataSource): RulesDataSource {
  if (
    !isNonEmpty(source.id) ||
    !isNonEmpty(source.title) ||
    !isNonEmpty(source.version) ||
    !isNonEmpty(source.publisher) ||
    !isNonEmpty(source.grant.id) ||
    !isNonEmpty(source.grant.name) ||
    !isNonEmpty(source.grant.notice) ||
    !isNonEmpty(source.attribution)
  ) {
    throw new Error('rules data source metadata must not be empty');
  }
  if (!(CONTENT_SCOPES as readonly unknown[]).includes(source.grant.scope)) {
    throw new Error(`rules data source "${source.id}" has no approved content scope`);
  }
  if (source.redistributable !== true) {
    throw new Error(`rules data source "${source.id}" is not approved for redistribution`);
  }
  return source;
}
