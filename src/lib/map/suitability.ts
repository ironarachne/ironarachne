import type { MapNode, RegionMap } from './map_graph.js';
import type { RNG } from '@ironarachne/rng';

/**
 * A generic rule for scoring a node's suitability for a settlement/landmark.
 * Returns a score between 0 (completely unsuitable) and 1 (perfectly suitable).
 */
export type SuitabilityRule = (node: MapNode, map: RegionMap) => number;

export interface SuitabilityEngine {
  rules: SuitabilityRule[];
  // If true, a score of 0 from ANY rule means the node is immediately rejected
  strict: boolean;
}

/**
 * Common Suitability Rules used to determine the best locations for humanoids to settle.
 */
export const standardRules = {
  /**
   * Evaluates if the node is near fresh water (a river or lake).
   */
  nearFreshWater: (): SuitabilityRule => {
    return (node: MapNode, map: RegionMap) => {
      if (node.isWater && !node.isOcean) return 0.5; // On a lake
      // Check if any bounding corner is a river or lake
      for (const cornerId of node.corners) {
        const corner = map.corners[cornerId];
        if (corner.river > 0 || (corner.isWater && !corner.isOcean)) {
          return 1.0;
        }
      }
      return 0.1; // Far from water
    };
  },

  /**
   * Avoids settling in the ocean entirely.
   */
  notOcean: (): SuitabilityRule => {
    return (node: MapNode) => {
      return node.isOcean ? 0.0 : 1.0;
    };
  },

  /**
   * Prefers settlement on the coast.
   */
  coastal: (): SuitabilityRule => {
    return (node: MapNode) => {
      return node.isCoast ? 1.0 : 0.2;
    };
  },

  /**
   * Prefers flatter terrain over steep peaks.
   */
  flatTerrain: (): SuitabilityRule => {
    return (node: MapNode) => {
      // Scale based on elevation ranges (lower positive is often flatter coast/plains)
      if (node.elevation < 0) return 0.0;
      if (node.elevation > 0.8) return 0.1; // Too high
      if (node.elevation > 0.4) return 0.5; // Hilly
      return 1.0; // Flat plains/coast
    };
  },

  /**
   * Prefers temperate biomes over harsh extremes.
   */
  temperateClimate: (): SuitabilityRule => {
    return (node: MapNode) => {
      // Ideal temp is roughly 10 - 25 C
      const t = node.temperature;
      if (t < -5 || t > 40) return 0.1; // Extreme
      if (t > 10 && t < 25) return 1.0; // Ideal
      return 0.5; // Moderate
    };
  },
};

/**
 * Scores every node in the map based on the provided SuitabilityEngine.
 *
 * @param {RegionMap} map The map to evaluate
 * @param {SuitabilityEngine} engine The ruleset to apply
 * @returns {Map<number, number>} A Map mapping MapNode ID to its final Suitability Score
 */
export function evaluateSuitability(
  map: RegionMap,
  engine: SuitabilityEngine,
): Map<number, number> {
  const scores = new Map<number, number>();

  for (const node of map.nodes) {
    let totalScore = 0;
    let rejected = false;

    for (const rule of engine.rules) {
      const score = rule(node, map);
      if (engine.strict && score === 0) {
        rejected = true;
        break;
      }
      totalScore += score;
    }

    if (rejected) {
      scores.set(node.id, 0);
    } else {
      // Average the score
      scores.set(node.id, engine.rules.length > 0 ? totalScore / engine.rules.length : 1);
    }
  }

  return scores;
}

/**
 * Finds the top N nodes on the map that best match the suitability rules.
 *
 * @param {Map<number, number>} scores The scored map created by `evaluateSuitability`
 * @param {number} count How many top locations to return
 * @param {number} minimumDistance Ensure selected nodes are at least this many IDs apart (rudimentary spread) or we can use physical distance.
 * @param {RegionMap} map Reference to the map to calculate distance
 * @returns {number[]} Array of best MapNode IDs
 */
export function findBestLocations(
  scores: Map<number, number>,
  count: number,
  minimumDistance: number,
  map: RegionMap,
): number[] {
  // Sort node IDs descending by score
  const sortedIds = Array.from(scores.entries())
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([id, _]) => id);

  const selected: number[] = [];

  for (const id of sortedIds) {
    if (selected.length >= count) break;

    // Check distance against already selected nodes
    let tooClose = false;
    const candidateNode = map.nodes[id];

    for (const sId of selected) {
      const sNode = map.nodes[sId];
      const dx = candidateNode.center.x - sNode.center.x;
      const dy = candidateNode.center.y - sNode.center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minimumDistance) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
      selected.push(id);
    }
  }

  return selected;
}
