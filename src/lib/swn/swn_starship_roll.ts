/**
 * The single path from a seed to a Stars Without Number starship.
 *
 * Requirement 2.2 of docs/workshop.md wants the same seed and settings to give the same ship.
 * `starships.generate` was already a pure function of the RNG it is handed; what was not was the
 * page. `SwnStarshipGenerator.svelte` reseeded its own RNG from the seed field inside an `$effect`
 * *and* again inside `generate()`, so the seed of the next press depended on the *text* of the
 * previous one — the same fault the rest of this domain had. The page now draws a new seed from an
 * RNG seeded once at mount, and the roll itself starts from a fresh `RNG(seed)`.
 *
 * **There is no config.** The tool has one control, the seed, and everything else about a ship —
 * the owner type, the hull, the drive, what it is armed with and what it carries — is the
 * generator's own decision drawn from that seed. So there is nothing to record as provenance
 * beyond the seed, and no reader here to read it back with; `ARTIFACT_EDITORS` registers the roller
 * as the seed alone.
 */

import { RNG } from '@ironarachne/rng';

import { generate, type SWNStarship } from './starship.js';
import { toSwnStarshipSnapshot, type SwnStarshipSnapshot } from './swn_starship_snapshot.js';

/** Roll a ship from a seed — the one path the generator page and a re-roll both take. */
export function rollSwnStarship(seed: string): SWNStarship {
  return generate(new RNG(seed));
}

/**
 * Roll a fresh ship snapshot from the seed it was first made with — the destructive half of
 * editing (requirement 4.3), and what `ARTIFACT_EDITORS` registers as this kind's roller.
 */
export function rollSwnStarshipSnapshot(seed: string): SwnStarshipSnapshot {
  return toSwnStarshipSnapshot(rollSwnStarship(seed));
}
