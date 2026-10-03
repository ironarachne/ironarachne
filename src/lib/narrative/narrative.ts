import type { RNG } from '@ironarachne/rng';
import type {
  NarrativeCandidate,
  NarrativeContext,
  NarrativePolicy,
  NarrativeResult,
  NarrativeSelection,
  NarrativeSubject,
  NarrativeTemplate,
} from './narrative_types';

const importance = { defining: 0, distinctive: 1, supporting: 2 };
const lexical = (a: { id: string }, b: { id: string }) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

function validateIds(entries: { id: string }[]): void {
  if (
    entries.some((entry) => !entry.id.trim()) ||
    new Set(entries.map((entry) => entry.id)).size !== entries.length
  )
    throw new Error('Narrative IDs must be nonempty and unique within their pool.');
}

function validateTemplate(template: NarrativeTemplate): void {
  if (template.parts.length === 0) throw new Error('Narrative templates need parts.');
  validateIds(template.parts);
  for (const part of template.parts) {
    if (part.options.length === 0 || new Set(part.options).size !== part.options.length)
      throw new Error('Narrative parts need a nonempty pool of distinct options.');
  }
  if (template.parts.every((part) => part.options.some((option) => !option.trim())))
    throw new Error('Narrative templates must not produce empty sentences.');
}

function validate(subject: NarrativeSubject, policy: NarrativePolicy): void {
  if (!subject.id.trim() || !subject.kind.trim())
    throw new Error('Narrative subjects need an identity and kind.');
  if (Object.values(policy).some((value) => !Number.isSafeInteger(value) || value < 0))
    throw new Error('Narrative budgets must be nonnegative safe integers.');
  validateIds(subject.candidates);
  for (const candidate of subject.candidates) {
    if (
      !Object.hasOwn(importance, candidate.importance) ||
      !candidate.topic.trim() ||
      candidate.templates.length === 0
    )
      throw new Error('Narrative candidates need importance, a topic and templates.');
    validateIds(candidate.templates);
    candidate.templates.forEach(validateTemplate);
  }
}

function preferFresh<T>(pool: T[], isRecent: (entry: T) => boolean): T[] {
  const fresh = pool.filter((entry) => !isRecent(entry));
  return fresh.length > 0 ? fresh : pool;
}

function chooseCandidate(
  candidates: NarrativeCandidate[],
  recent: NarrativeSelection[],
  rng: RNG,
): NarrativeCandidate {
  const rank = Math.min(...candidates.map((candidate) => importance[candidate.importance]));
  const peers = candidates.filter((candidate) => importance[candidate.importance] === rank);
  return rng.item(
    preferFresh(peers, (candidate) => recent.some((entry) => entry.candidateId === candidate.id)),
  );
}

function shuffleIndexes(length: number, rng: RNG): number[] {
  const remaining = Array.from({ length }, (_, index) => index);
  const indexes: number[] = [];
  while (remaining.length > 0) {
    const index = rng.item(remaining);
    indexes.push(index);
    remaining.splice(remaining.indexOf(index), 1);
  }
  return indexes;
}

/** Search only until a fresh combination is found; never materialize the Cartesian product. */
function findCombination(
  pools: number[][],
  used: Set<string>,
  prefix: number[] = [],
): number[] | undefined {
  if (prefix.length === pools.length) return used.has(prefix.join(',')) ? undefined : prefix;
  for (const index of pools[prefix.length]) {
    const found = findCombination(pools, used, [...prefix, index]);
    if (found) return found;
  }
  return undefined;
}

function selectSentence(
  subjectId: string,
  candidate: NarrativeCandidate,
  recent: NarrativeSelection[],
  rng: RNG,
): NarrativeSelection {
  const alternatives = [...candidate.templates].sort(lexical).map((template) => {
    const pools = template.parts.map((part) => shuffleIndexes(part.options.length, rng));
    const used = new Set(
      recent
        .filter((entry) => entry.candidateId === candidate.id && entry.templateId === template.id)
        .map((entry) => entry.optionIndexes.join(',')),
    );
    return {
      template,
      fresh: findCombination(pools, used),
      fallback: pools.map((pool) => pool[0]),
    };
  });
  const fresh = alternatives.filter((alternative) => alternative.fresh !== undefined);
  const pool = fresh.length > 0 ? fresh : alternatives;
  const chosen = rng.item(
    preferFresh(pool, (entry) =>
      recent.some(
        (selection) =>
          selection.candidateId === candidate.id && selection.templateId === entry.template.id,
      ),
    ),
  );
  return {
    subjectId,
    candidateId: candidate.id,
    templateId: chosen.template.id,
    optionIndexes: chosen.fresh ?? chosen.fallback,
  };
}

function sentence(candidate: NarrativeCandidate, selection: NarrativeSelection): string {
  const template = candidate.templates.find((entry) => entry.id === selection.templateId)!;
  // Pools contain literal fragments, including intentional spacing and punctuation.
  return template.parts
    .map((part, index) => part.options[selection.optionIndexes[index]])
    .join('')
    .trim();
}

/** Compose only supplied meanings, using the caller's RNG; inputs and saved prose are never mutated. */
export function composeNarrative(
  subject: NarrativeSubject,
  policy: NarrativePolicy,
  context: NarrativeContext,
  rng: RNG,
): NarrativeResult {
  validate(subject, policy);
  const history =
    policy.repetitionWindow === 0 ? [] : context.recentSelections.slice(-policy.repetitionWindow);
  const available = [...subject.candidates].sort(lexical);
  const topics = new Map<string, number>();
  const selections: NarrativeSelection[] = [];
  const sentences: string[] = [];
  while (selections.length < policy.maxSentences) {
    const eligible = available.filter(
      (candidate) => (topics.get(candidate.topic) ?? 0) < policy.maxPerTopic,
    );
    if (eligible.length === 0) break;
    const candidate = chooseCandidate(eligible, history, rng);
    const selection = selectSentence(subject.id, candidate, history, rng);
    sentences.push(sentence(candidate, selection));
    selections.push(selection);
    available.splice(available.indexOf(candidate), 1);
    topics.set(candidate.topic, (topics.get(candidate.topic) ?? 0) + 1);
  }
  return {
    text: sentences.join(' '),
    selections,
    nextContext: {
      recentSelections:
        policy.repetitionWindow === 0
          ? []
          : [...history, ...selections].slice(-policy.repetitionWindow),
    },
  };
}
