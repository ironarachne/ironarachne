import { readPersistenceState, requestPersistence } from './storage_estimate';
import { invalidateStorageMeasurement } from './storage_status';
import type { PersistenceRequest, PersistenceRequestOutcome } from './storage_status_types';
import type { PersistenceTrigger } from './storage_status_types';

/**
 * Whether this page has already asked. The whole of the "at most once per session" rule.
 *
 * Module state rather than `sessionStorage`, so a session is the page's lifetime: a reload permits
 * one more request, and only when paired with fresh work because of who is allowed to call. In the
 * browser where the distinction is visible, Firefox remembers an explicit denial and answers
 * `false` without prompting again, so the cost of the looser reading is at most one more silent
 * call. Nothing about a refusal is persisted — a browser-level decision the user can revisit must
 * not become a product-level one they cannot.
 */
let askedThisSession = false;

let lastRequest: PersistenceRequest | null = null;

/** The most recent pass through the policy, or `null` when this session has not run one. */
export function lastPersistenceRequest(): PersistenceRequest | null {
  return lastRequest;
}

/**
 * Forget that this session asked. For tests, and for nothing in the application: a reset reachable
 * from the UI would be a way to prompt somebody twice.
 */
export function resetPersistenceRequestSession(): void {
  askedThisSession = false;
  lastRequest = null;
}

function record(
  trigger: PersistenceTrigger,
  requestedAt: number,
  outcome: PersistenceRequestOutcome,
): PersistenceRequest {
  lastRequest = { trigger, requestedAt, outcome };
  return lastRequest;
}

/**
 * Ask the browser not to evict this origin, if asking is warranted right now.
 *
 * **Only completions of real work may call this**, which is what makes `docs/workshop.md`'s "re-ask
 * only after the user has done more work" structural rather than a counter somebody maintains:
 * there is no page-load, route-change, or timer caller to get wrong. The three triggers are a
 * created project, an exported vault, and an exported project.
 *
 * Three gates, in this order:
 *
 * 1. **Already protected?** A persisted origin is never asked again. Calling `persist()` on one
 *    raises a prompt over a question that is already settled.
 * 2. **Asked already this session?** Once per page lifetime, refused or not.
 * 3. Otherwise ask, and on a grant throw away the cached estimate — what the browser is willing to
 *    give has just changed, which is one of the cases `invalidateStorageMeasurement` exists for.
 *
 * Never rejects, never blocks, and never stops the work that triggered it: the caller has already
 * saved something, and a refusal is recorded rather than reported as a failure. What protects the
 * user's work is export, not this.
 */
export async function requestPersistenceIfWarranted(
  trigger: PersistenceTrigger,
  requestedAt: number = Date.now(),
): Promise<PersistenceRequest> {
  if ((await readPersistenceState()) === 'persisted') {
    return record(trigger, requestedAt, 'alreadyPersisted');
  }
  if (askedThisSession) {
    return record(trigger, requestedAt, 'notAsked');
  }
  // Set before awaiting, not after: two triggers landing in the same tick must not both get past
  // the gate and raise two prompts for one moment's work.
  askedThisSession = true;
  const outcome = await requestPersistence();
  if (outcome === 'granted') {
    invalidateStorageMeasurement();
  }
  return record(trigger, requestedAt, outcome);
}
