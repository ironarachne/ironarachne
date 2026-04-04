import { describe, it, expect } from 'vitest';
import { getRandomPersonalityTraits, allPersonalityTraits } from './personality_traits';

describe('Personality Traits', () => {
  describe('getRandomPersonalityTraits', () => {
    it('should return the requested number of traits', () => {
      const traits = getRandomPersonalityTraits('seed-123', 3);
      expect(traits.length).toBe(3);
    });

    it('should return consistent results for the same seed', () => {
      const traits1 = getRandomPersonalityTraits('fixed-seed', 3);
      const traits2 = getRandomPersonalityTraits('fixed-seed', 3);
      expect(traits1).toEqual(traits2);
    });

    it('should return different results for different seeds', () => {
      const traits1 = getRandomPersonalityTraits('seed-A', 3);
      const traits2 = getRandomPersonalityTraits('seed-B', 3);
      // Very small chance of collision, but practically zero with string adjectives
      expect(traits1).not.toEqual(traits2);
    });

    it('should not return conflicting traits', () => {
      // Generate a large number to force conflicts if logic was broken
      const traits = getRandomPersonalityTraits('conflict-test-seed', 10);

      for (let i = 0; i < traits.length; i++) {
        const trait = traits[i];
        const otherTraits = traits.filter((_, idx) => idx !== i);

        // Check if any other trait is in this trait's conflict list
        if (trait.conflictingTraits) {
          const conflicts = otherTraits.some((other) =>
            trait.conflictingTraits?.includes(other.adjective),
          );
          expect(conflicts).toBe(false);
        }

        // Check reverse just in case (though function only checks one way)
        // If A and B conflict, we shouldn't have both.
        // The function ensures B is not added if it conflicts with A (if A added first).
        // Or A not added if conflicts with B (if B added first).
        // So the result set should be clean.
      }
    });

    it('should return max available traits if count is too high', () => {
      // There are only so many traits, requesting 100 should return as many as possible without conflicts
      const totalTraits = Object.keys(allPersonalityTraits).length;
      const traits = getRandomPersonalityTraits('overflow-seed', 100);
      expect(traits.length).toBeLessThanOrEqual(totalTraits);
      expect(traits.length).toBeGreaterThan(0);
    });
  });
});
