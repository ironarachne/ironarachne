import { describe, expect, it } from 'vitest';
import type { Container, ContainerType, Item } from './equipment_types';
import {
  addItemToContainer,
  baseContainerTypes,
  canFit,
  filterContainerTypes,
  filterOutContainers,
  generateContainer,
  generateContainerTypes,
  generateRandomContainer,
  getContainerContents,
  getContainerTypeForCapacity,
  getContainerVariations,
  getDefaultContainerGeneratorConfig,
  getLooseItems,
  getTotalRequiredVolumeCapacity,
  getTotalRequiredWeightCapacity,
  isContainer,
  removeItemFromContainer,
  separateContainersFromItems,
} from './containers';

function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    name: 'a rock',
    itemMajorType: 'misc',
    description: 'a rock',
    value: 1,
    rarity: 'common',
    densityCategory: 'standard',
    weight: 2,
    properties: [],
    ...overrides,
  };
}

function makeContainer(overrides: Partial<Container> = {}): Container {
  return {
    ...makeItem({ id: 'container-1', itemMajorType: 'container' }),
    maxWeight: 100,
    maxVolume: 100,
    currentWeight: 0,
    currentVolume: 0,
    isOpen: false,
    contents: [],
    ...overrides,
  };
}

describe('baseContainerTypes', () => {
  it('describes every base type with usable capacities', () => {
    expect(baseContainerTypes.length).toBeGreaterThan(0);

    for (const type of baseContainerTypes) {
      expect(type.name.length).toBeGreaterThan(0);
      expect(type.defaultVolume).toBeGreaterThan(0);
      expect(type.defaultWeight).toBeGreaterThan(0);
      expect(type.weight).toBeGreaterThan(0);
    }
  });

  it('names every base type uniquely', () => {
    const names = baseContainerTypes.map((type) => type.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('gives every type at least one thing it can hold', () => {
    for (const type of baseContainerTypes) {
      expect(type.canHoldItems || type.canHoldLiquid).toBe(true);
    }
  });
});

describe('addItemToContainer', () => {
  it('records the item and accrues its weight and volume', () => {
    const container = makeContainer();
    const item = makeItem({ weight: 3 });

    addItemToContainer(container, item);

    expect(container.contents).toEqual(['item-1']);
    expect(container.currentWeight).toBe(3);
    expect(container.currentVolume).toBe(3);
    expect(item.containerId).toBe('container-1');
  });

  it('ignores an item already in the container but still claims ownership', () => {
    const container = makeContainer();
    const item = makeItem({ weight: 3 });

    addItemToContainer(container, item);
    addItemToContainer(container, item);

    expect(container.contents).toEqual(['item-1']);
    expect(container.currentWeight).toBe(3);
  });

  it('keeps running totals free of floating point drift', () => {
    const container = makeContainer();

    addItemToContainer(container, makeItem({ id: 'a', weight: 0.1 }));
    addItemToContainer(container, makeItem({ id: 'b', weight: 0.2 }));

    expect(container.currentWeight).toBe(0.3);
  });

  it('uses a manual volume in preference to the density calculation', () => {
    const container = makeContainer();

    addItemToContainer(container, makeItem({ weight: 8, manualVolume: 0.5 }));

    expect(container.currentWeight).toBe(8);
    expect(container.currentVolume).toBe(0.5);
  });
});

describe('removeItemFromContainer', () => {
  it('reverses an add', () => {
    const container = makeContainer();
    const item = makeItem({ weight: 3 });

    addItemToContainer(container, item);
    removeItemFromContainer(container, item);

    expect(container.contents).toEqual([]);
    expect(container.currentWeight).toBe(0);
    expect(container.currentVolume).toBe(0);
    expect(item.containerId).toBeUndefined();
  });

  it('leaves totals alone when the item was never inside', () => {
    const container = makeContainer({ currentWeight: 5, currentVolume: 5 });

    removeItemFromContainer(container, makeItem({ id: 'absent' }));

    expect(container.currentWeight).toBe(5);
    expect(container.currentVolume).toBe(5);
  });

  it('clears containerId even for an item that was not inside', () => {
    const container = makeContainer();
    const item = makeItem({ containerId: 'somewhere-else' });

    removeItemFromContainer(container, item);

    expect(item.containerId).toBeUndefined();
  });
});

describe('canFit', () => {
  it('accepts an item within both limits', () => {
    expect(canFit(makeContainer(), makeItem({ weight: 2 }))).toBe(true);
  });

  it('accepts an item that exactly reaches the limits', () => {
    const container = makeContainer({ maxWeight: 2, maxVolume: 2 });

    expect(canFit(container, makeItem({ weight: 2 }))).toBe(true);
  });

  it('rejects an item that would exceed the weight limit', () => {
    const container = makeContainer({ maxWeight: 1, maxVolume: 1000 });

    expect(canFit(container, makeItem({ weight: 2 }))).toBe(false);
  });

  it('rejects an item that would exceed the volume limit', () => {
    const container = makeContainer({ maxWeight: 1000, maxVolume: 1 });

    expect(canFit(container, makeItem({ weight: 2, densityCategory: 'airy' }))).toBe(false);
  });

  it('accounts for what the container already holds', () => {
    const container = makeContainer({ maxWeight: 3, maxVolume: 1000, currentWeight: 2 });

    expect(canFit(container, makeItem({ weight: 2 }))).toBe(false);
  });
});

describe('filterContainerTypes', () => {
  const types: ContainerType[] = [
    {
      name: 'tiny open crate',
      canBeLocked: false,
      canHoldItems: true,
      canHoldLiquid: false,
      defaultVolume: 5,
      defaultWeight: 10,
      description: 'a tiny open crate',
      value: 1,
      weight: 1,
    },
    {
      name: 'big locked vat',
      canBeLocked: true,
      canHoldItems: false,
      canHoldLiquid: true,
      defaultVolume: 500,
      defaultWeight: 900,
      description: 'a big locked vat',
      value: 1,
      weight: 1,
    },
  ];

  it('returns everything for an empty filter', () => {
    expect(filterContainerTypes({}, types)).toHaveLength(2);
  });

  it.each([
    ['minWeight', { minWeight: 100 }, 'big locked vat'],
    ['maxWeight', { maxWeight: 100 }, 'tiny open crate'],
    ['minVolume', { minVolume: 100 }, 'big locked vat'],
    ['maxVolume', { maxVolume: 100 }, 'tiny open crate'],
    ['canBeLocked', { canBeLocked: true }, 'big locked vat'],
    ['canHoldItems', { canHoldItems: true }, 'tiny open crate'],
    ['canHoldLiquid', { canHoldLiquid: true }, 'big locked vat'],
  ])('narrows on %s', (_label, filter, expected) => {
    const result = filterContainerTypes(filter, types);

    expect(result.map((type) => type.name)).toEqual([expected]);
  });

  it('applies several criteria together', () => {
    expect(filterContainerTypes({ canBeLocked: true, maxWeight: 100 }, types)).toEqual([]);
  });
});

describe('isContainer', () => {
  it('identifies a container by its contents array', () => {
    expect(isContainer(makeContainer())).toBe(true);
  });

  it('rejects a plain item', () => {
    expect(isContainer(makeItem())).toBe(false);
  });

  it('treats an empty contents array as a container', () => {
    expect(isContainer(makeContainer({ contents: [] }))).toBe(true);
  });
});

describe('filterOutContainers', () => {
  it('keeps only the plain items', () => {
    const result = filterOutContainers([makeItem({ id: 'a' }), makeContainer({ id: 'b' })]);

    expect(result.map((item) => item.id)).toEqual(['a']);
  });
});

describe('separateContainersFromItems', () => {
  it('splits a mixed list into both buckets', () => {
    const { containers, looseItems } = separateContainersFromItems([
      makeItem({ id: 'a' }),
      makeContainer({ id: 'b' }),
      makeItem({ id: 'c' }),
    ]);

    expect(containers.map((container) => container.id)).toEqual(['b']);
    expect(looseItems.map((item) => item.id)).toEqual(['a', 'c']);
  });

  it('returns two empty buckets for an empty list', () => {
    expect(separateContainersFromItems([])).toEqual({ containers: [], looseItems: [] });
  });
});

describe('generateContainer', () => {
  const type = baseContainerTypes.find((candidate) => candidate.canBeLocked)!;

  it('takes its shape from the container type', () => {
    const container = generateContainer('c1', type);

    expect(container.id).toBe('c1');
    expect(container.name).toBe(type.name);
    expect(container.maxVolume).toBe(type.defaultVolume);
    expect(container.maxWeight).toBe(type.defaultWeight);
    expect(container.currentVolume).toBe(0);
    expect(container.currentWeight).toBe(0);
    expect(container.contents).toEqual([]);
    expect(container.itemMajorType).toBe('container');
  });

  it('defaults value and rarity when they are not supplied', () => {
    const container = generateContainer('c1', type);

    expect(container.value).toBe(1);
    expect(container.rarity).toBe('common');
  });

  it('accepts an override name, value and rarity', () => {
    const container = generateContainer('c1', type, 'Grandmother’s chest', 250, 'rare');

    expect(container.name).toBe('Grandmother’s chest');
    expect(container.value).toBe(250);
    expect(container.rarity).toBe('rare');
  });

  it('omits a lock unless one is asked for', () => {
    expect(generateContainer('c1', type).lock).toBeUndefined();
  });

  it('fits a lock when the type allows it and one is asked for', () => {
    const container = generateContainer('c1', type, undefined, undefined, undefined, true, 7);

    expect(container.lock).toBeDefined();
    expect(container.lock!.id).toBe('c1-lock');
    expect(container.lock!.difficulty).toBe(7);
    expect(container.lock!.isLocked).toBe(true);
  });

  it('defaults lock difficulty when none is given', () => {
    const container = generateContainer('c1', type, undefined, undefined, undefined, true);

    expect(container.lock!.difficulty).toBe(2);
  });

  it('refuses a lock on a type that cannot be locked', () => {
    const unlockable = baseContainerTypes.find((candidate) => !candidate.canBeLocked)!;

    const container = generateContainer('c1', unlockable, undefined, undefined, undefined, true);

    expect(container.lock).toBeUndefined();
  });
});

describe('getContainerVariations', () => {
  it('offers a plain variation alongside the modified ones', () => {
    const variations = getContainerVariations();

    expect(variations.length).toBeGreaterThan(1);
    expect(variations.some((variation) => variation.namePrefix === '')).toBe(true);
  });
});

describe('generateContainerTypes', () => {
  const types = generateContainerTypes();

  it('produces one entry per base type and variation', () => {
    expect(types).toHaveLength(baseContainerTypes.length * getContainerVariations().length);
  });

  it('names every entry exactly once', () => {
    const names = types.map((type) => type.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('orders small below plain below large, for every base type', () => {
    for (const baseType of baseContainerTypes) {
      const small = types.find((type) => type.name === `small ${baseType.name}`)!;
      const plain = types.find((type) => type.name === baseType.name)!;
      const large = types.find((type) => type.name === `large ${baseType.name}`)!;

      expect(small.defaultVolume, baseType.name).toBeLessThan(plain.defaultVolume);
      expect(plain.defaultVolume, baseType.name).toBeLessThan(large.defaultVolume);
      expect(small.defaultWeight, baseType.name).toBeLessThan(plain.defaultWeight);
      expect(plain.defaultWeight, baseType.name).toBeLessThan(large.defaultWeight);
    }
  });

  // `reinforced` is the one variation that does not scale volume: it carries more weight in the
  // same space, so it ties with the plain variation and only the weight capacity separates them.
  it('reinforces without enlarging', () => {
    for (const baseType of baseContainerTypes) {
      const plain = types.find((type) => type.name === baseType.name)!;
      const reinforced = types.find((type) => type.name === `reinforced ${baseType.name}`)!;

      expect(reinforced.defaultVolume, baseType.name).toBe(plain.defaultVolume);
      expect(reinforced.defaultWeight, baseType.name).toBeGreaterThan(plain.defaultWeight);
    }
  });

  // Pinned to the arithmetic rather than the ordering: a glass bottle's 2 litres sat under the old
  // floor of 5, so every one of its variations clamped to the same capacity. An ordering assertion
  // alone would not notice that floor coming back for a base type below it.
  it('scales a container smaller than the old floor by its modifier', () => {
    const small = types.find((type) => type.name === 'small glass bottle')!;

    expect(small.defaultVolume).toBe(1.5);
    expect(small.defaultWeight).toBe(3.75);
  });

  // The same, for the container's own weight: a cloth pouch weighs 0.1, which the old floor of 0.1
  // clamped its small variation back up to. This is the only figure in the table that moves.
  it('scales the lightest container’s own weight by its modifier', () => {
    const small = types.find((type) => type.name === 'small cloth pouch')!;

    expect(small.weight).toBe(0.08);
  });

  it('carries the base type’s affordances onto each variation', () => {
    const barrelVariants = types.filter((type) => type.name.endsWith('wooden barrel'));

    expect(barrelVariants.length).toBeGreaterThan(1);
    for (const variant of barrelVariants) {
      expect(variant.canHoldLiquid).toBe(true);
      expect(variant.canBeLocked).toBe(true);
    }
  });

  it('scales a large variation above its small counterpart', () => {
    const small = types.find((type) => type.name === 'small wooden chest')!;
    const large = types.find((type) => type.name === 'large wooden chest')!;

    expect(large.defaultVolume).toBeGreaterThan(small.defaultVolume);
    expect(large.weight).toBeGreaterThan(small.weight);
  });
});

describe('getContainerTypeForCapacity', () => {
  it('returns the smallest type that meets both requirements', () => {
    const type = getContainerTypeForCapacity(10, 10);

    expect(type).not.toBeNull();
    expect(type!.defaultVolume).toBeGreaterThanOrEqual(10);
    expect(type!.defaultWeight).toBeGreaterThanOrEqual(10);

    const alternatives = generateContainerTypes().filter(
      (candidate) => candidate.defaultVolume >= 10 && candidate.defaultWeight >= 10,
    );
    for (const alternative of alternatives) {
      expect(type!.defaultVolume).toBeLessThanOrEqual(alternative.defaultVolume);
    }
  });

  it('returns null when nothing is big enough', () => {
    expect(getContainerTypeForCapacity(1_000_000, 1_000_000)).toBeNull();
  });
});

describe('getDefaultContainerGeneratorConfig', () => {
  it('allows both locked and unlocked item containers', () => {
    const config = getDefaultContainerGeneratorConfig();

    expect(config.allowLockedContainers).toBe(true);
    expect(config.allowUnlockedContainers).toBe(true);
    expect(config.onlyItemContainers).toBe(true);
    expect(config.onlyLiquidContainers).toBe(false);
  });
});

describe('generateRandomContainer', () => {
  it('is reproducible from a seed', () => {
    const config = getDefaultContainerGeneratorConfig();

    expect(generateRandomContainer('seed-a', config)).toEqual(
      generateRandomContainer('seed-a', config),
    );
  });

  it('varies with the seed', () => {
    const config = getDefaultContainerGeneratorConfig();
    const names = new Set(
      ['a', 'b', 'c', 'd', 'e', 'f'].map((seed) => generateRandomContainer(seed, config).name),
    );

    expect(names.size).toBeGreaterThan(1);
  });

  it('starts empty', () => {
    const container = generateRandomContainer('seed-a', getDefaultContainerGeneratorConfig());

    expect(container.contents).toEqual([]);
    expect(container.currentVolume).toBe(0);
    expect(container.currentWeight).toBe(0);
    expect(container.isOpen).toBe(false);
  });

  it('honours onlyLiquidContainers', () => {
    for (const seed of ['a', 'b', 'c', 'd']) {
      const container = generateRandomContainer(seed, {
        allowLockedContainers: false,
        allowUnlockedContainers: true,
        onlyLiquidContainers: true,
      });
      const type = generateContainerTypes().find(
        (candidate) => candidate.name === container.itemMinorType,
      )!;

      expect(type.canHoldLiquid).toBe(true);
    }
  });

  it('never locks a container when only unlocked ones are allowed', () => {
    for (const seed of ['a', 'b', 'c', 'd']) {
      const container = generateRandomContainer(seed, {
        allowLockedContainers: false,
        allowUnlockedContainers: true,
        onlyItemContainers: true,
      });

      expect(container.lock).toBeUndefined();
    }
  });

  it('always locks a lockable container when only locked ones are allowed', () => {
    const lockableTypes = generateContainerTypes().filter((type) => type.canBeLocked);

    for (const seed of ['a', 'b', 'c', 'd']) {
      const container = generateRandomContainer(seed, {
        allowedContainerTypes: lockableTypes,
        allowLockedContainers: true,
        allowUnlockedContainers: false,
      });

      expect(container.lock).toBeDefined();
    }
  });

  it('restricts itself to an explicit list of allowed types', () => {
    const only = [baseContainerTypes[0]];

    const container = generateRandomContainer('seed-a', {
      allowedContainerTypes: only,
      allowLockedContainers: false,
      allowUnlockedContainers: true,
    });

    expect(container.itemMinorType).toBe(only[0].name);
  });

  it('throws when the configuration matches no container type', () => {
    expect(() =>
      generateRandomContainer('seed-a', {
        allowLockedContainers: true,
        allowUnlockedContainers: true,
        minVolumeCapacity: 1_000_000,
      }),
    ).toThrow(/No container types available/);
  });
});

describe('getContainerContents', () => {
  it('returns only the items the container lists', () => {
    const container = makeContainer({ contents: ['a', 'c'] });
    const all = [makeItem({ id: 'a' }), makeItem({ id: 'b' }), makeItem({ id: 'c' })];

    expect(getContainerContents(container, all).map((item) => item.id)).toEqual(['a', 'c']);
  });

  it('returns nothing for an empty container', () => {
    expect(getContainerContents(makeContainer(), [makeItem()])).toEqual([]);
  });
});

describe('getLooseItems', () => {
  it('excludes anything held by any of the containers', () => {
    const containers = [
      makeContainer({ id: 'c1', contents: ['a'] }),
      makeContainer({ id: 'c2', contents: ['b'] }),
    ];
    const all = [makeItem({ id: 'a' }), makeItem({ id: 'b' }), makeItem({ id: 'c' })];

    expect(getLooseItems(containers, all).map((item) => item.id)).toEqual(['c']);
  });

  it('returns everything when no container holds anything', () => {
    expect(getLooseItems([], [makeItem({ id: 'a' })]).map((item) => item.id)).toEqual(['a']);
  });
});

describe('getTotalRequiredWeightCapacity', () => {
  it('sums the weights', () => {
    const total = getTotalRequiredWeightCapacity([
      makeItem({ weight: 2 }),
      makeItem({ weight: 3.5 }),
    ]);

    expect(total).toBe(5.5);
  });

  it('is zero for no items', () => {
    expect(getTotalRequiredWeightCapacity([])).toBe(0);
  });
});

describe('getTotalRequiredVolumeCapacity', () => {
  it('sums the volumes, respecting manual overrides', () => {
    const total = getTotalRequiredVolumeCapacity([
      makeItem({ weight: 8, densityCategory: 'dense' }),
      makeItem({ weight: 100, manualVolume: 2 }),
    ]);

    expect(total).toBe(3);
  });

  it('is zero for no items', () => {
    expect(getTotalRequiredVolumeCapacity([])).toBe(0);
  });
});
