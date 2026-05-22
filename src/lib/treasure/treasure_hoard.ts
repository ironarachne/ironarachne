import {
  addItemToContainer,
  canFit,
  filterContainerTypes,
  generateContainer,
  getDefaultContainerGeneratorConfig,
  getVolume,
  type Container,
  type ContainerGeneratorConfig,
  type ContainerType,
  type Item,
  getDefaultGenerationConfig,
  generateItem,
} from '$lib/equipment';
import { getArtObjectsForValue, getRandomArtObjectsForValue } from './art_objects';
import {
  combinePilesOfCoins,
  distributeCoins,
  generateRandomPileOfCoins,
  getAppropriateCoinTypes,
  getDefaultCoinGenerationConfig,
  getDefaultCoinSystem,
  getDenominationProportionsUpToDenomination,
  getIndexOfCoinType,
  getMaxCoinTypeForValue,
  getSetOfCoinsForValue,
} from './coins';
import { getGemsForValue, getRandomGemsForValue } from './gems';
import {
  flattenPotionsToItems,
  getDefaultPotionConfig,
  getRandomPotionsForValue,
  packPotionContainers,
} from './potion_loot';
import type { TreasureHoardGeneratorConfig } from './treasure_types';
import type { CoinGenerationConfig, PileOfCoins } from './coins';
import type { CurrencySystem } from '../currency';
import type { Gem } from './gems';
import { RNG } from '@ironarachne/rng';

export function generateRandomTreasureHoard(
  seed: string,
  config: TreasureHoardGeneratorConfig,
): Item[] {
  const rng = new RNG(seed);

  const containerTypes = config.allowedContainerTypes ?? [];
  const roomDimensions = config.roomDimensions;
  const targetValue = config.targetValue;

  const proportions = {
    coins: config.coinProportions,
    artObjects: config.artObjectProportion,
    gems: config.gemProportion,
    mundaneItems: config.mundaneItemProportion,
    magicItems: config.magicItemProportion,
    potions: config.potionProportion ?? 0,
  };

  const { coinsValue, artObjectsValue, gemsValue, mundaneItemsValue, magicItemsValue, potionsValue } =
    calculateHoardValues(targetValue, proportions);

  const coinGeneratorConfig = getDefaultCoinGenerationConfig();
  coinGeneratorConfig.maxValue = coinsValue;
  const pilesOfCoins = generateRandomCoinPiles(
    rng.randomString(13),
    coinsValue,
    coinGeneratorConfig,
  );
  const artObjects = getRandomArtObjectsForValue(rng.randomString(13), artObjectsValue);
  const gems = getRandomGemsForValue(rng.randomString(13), gemsValue);

  const mundaneItemGeneratorConfig = getDefaultGenerationConfig();
  mundaneItemGeneratorConfig.enchantmentChance = 0;
  mundaneItemGeneratorConfig.useEnchant = false;
  const mundaneItems = getRandomItemsForValue(
    rng.randomString(13),
    mundaneItemsValue,
    mundaneItemGeneratorConfig,
  );

  const magicItemGeneratorConfig = getDefaultGenerationConfig();
  magicItemGeneratorConfig.enchantmentChance = 100;
  magicItemGeneratorConfig.useUniqueNames = true;
  const magicItems = getRandomItemsForValue(
    rng.randomString(13),
    magicItemsValue,
    magicItemGeneratorConfig,
  );

  const potionGeneratorConfig = config.potionGeneratorConfig ?? getDefaultPotionConfig();
  const potions =
    potionsValue > 0 ? getRandomPotionsForValue(rng.randomString(13), potionsValue, potionGeneratorConfig) : [];
  const potionItems = flattenPotionsToItems(potions);

  const items = [...mundaneItems, ...magicItems, ...potionItems];

  const roomVolume = roomDimensions
    ? roomDimensions.width * roomDimensions.height * roomDimensions.length * 1000
    : undefined;
  const availableVolumeForContainers = roomVolume;

  const containerCapacityNeeded = calculateCapacityNeeded(
    pilesOfCoins,
    gems,
    artObjects,
    items,
    rng,
  );
  const containerGeneratorConfig = getDefaultContainerGeneratorConfig();
  containerGeneratorConfig.allowedContainerTypes = containerTypes;
  const containers = generateRandomContainersForCapacity(
    rng.randomString(13),
    containerCapacityNeeded.volume,
    containerCapacityNeeded.weight,
    containerGeneratorConfig,
    availableVolumeForContainers,
  );

  packGems(gems, containers, rng);
  packArtObjects(artObjects, containers, rng);
  packPotionContainers(
    potions.map((potion) => potion.container),
    containers,
    rng,
  );
  const { filledContainers, containedCoins, looseCoins } = packCoins(
    pilesOfCoins,
    containers,
    coinGeneratorConfig.coinSystem,
    rng,
  );

  return [...filledContainers, ...containedCoins, ...looseCoins, ...artObjects, ...gems, ...items];
}

export function getDefaultTreasureHoardGeneratorConfig(): TreasureHoardGeneratorConfig {
  return {
    artObjectProportion: 5,
    coinProportions: 80,
    gemProportion: 15,
    mundaneItemProportion: 50,
    magicItemProportion: 10,
    potionProportion: 0,
    targetValue: 200,
  };
}

/**
 * Get a treasure horde for a target value, distributed among coins, art objects, and gems.
 *
 * @param value the value to fill
 * @param proportions the proportions of coins, art objects, and gems to create
 * @returns
 */
export function getTreasureHoardForValue(
  value: number,
  proportions: { coins: number; artObjects: number; gems: number },
  containerTypes: ContainerType[],
  roomDimensions?: { width: number; height: number; length: number },
): Item[] {
  if (value <= 0) {
    return [];
  }

  const { coinsValue, artObjectsValue, gemsValue } = calculateHoardValues(value, proportions);
  const coinSystem = getDefaultCoinSystem();

  const pilesOfCoins = generateCoinPiles(coinsValue, coinSystem);
  const artObjects = getArtObjectsForValue(artObjectsValue);
  const gems = getGemsForValue(gemsValue);

  const roomVolume = roomDimensions
    ? roomDimensions.width * roomDimensions.height * roomDimensions.length * 1000
    : undefined;
  const availableVolumeForContainers = roomVolume;

  const containerCapacityNeeded = calculateCapacityNeeded(pilesOfCoins, gems, artObjects);
  const containers = selectContainersForCapacity(
    containerCapacityNeeded,
    containerTypes,
    availableVolumeForContainers,
  );

  packGems(gems, containers);
  packArtObjects(artObjects, containers);
  const { filledContainers, containedCoins, looseCoins } = packCoins(
    pilesOfCoins,
    containers,
    coinSystem,
  );

  return [...filledContainers, ...containedCoins, ...looseCoins, ...artObjects, ...gems];
}

function calculateHoardValues(
  value: number,
  proportions: {
    coins: number;
    artObjects: number;
    gems: number;
    mundaneItems?: number;
    magicItems?: number;
    potions?: number;
  },
) {
  const mundaneItemsProportion = proportions.mundaneItems ?? 0;
  const magicItemsProportion = proportions.magicItems ?? 0;
  const potionsProportion = proportions.potions ?? 0;
  const totalProportion =
    proportions.coins +
    proportions.artObjects +
    proportions.gems +
    mundaneItemsProportion +
    magicItemsProportion +
    potionsProportion;

  const coinsValue = Math.floor((proportions.coins / totalProportion) * value);
  const artObjectsValue = Math.floor((proportions.artObjects / totalProportion) * value);
  const mundaneItemsValue = Math.floor((mundaneItemsProportion / totalProportion) * value);
  const magicItemsValue = Math.floor((magicItemsProportion / totalProportion) * value);
  const potionsValue = Math.floor((potionsProportion / totalProportion) * value);
  const gemsValue =
    value - coinsValue - artObjectsValue - mundaneItemsValue - magicItemsValue - potionsValue;

  return { coinsValue, artObjectsValue, gemsValue, mundaneItemsValue, magicItemsValue, potionsValue };
}

function generateCoinPiles(value: number, coinSystem: CurrencySystem): PileOfCoins[] {
  if (value <= 0) return [];
  const highestDenomination = getMaxCoinTypeForValue(value, coinSystem);
  const denominationProportions = getDenominationProportionsUpToDenomination(
    highestDenomination.name,
    coinSystem,
  );
  return getSetOfCoinsForValue(value, denominationProportions, coinSystem);
}

function generateRandomCoinPiles(
  seed: string,
  totalValue: number,
  config: CoinGenerationConfig = getDefaultCoinGenerationConfig(),
): PileOfCoins[] {
  const rng = new RNG(seed);
  const piles: PileOfCoins[] = [];
  let remainingValue = totalValue;

  while (remainingValue > 0) {
    const possibleDenominations = getAppropriateCoinTypes(remainingValue, config.coinSystem);

    if (possibleDenominations.length === 0) {
      break; // No more coins can be afforded
    }

    const weightedOptions = possibleDenominations.map((d) => ({
      value: d,
      commonality: d.rarity || 1,
    }));
    const denomination = rng.weighted(weightedOptions);

    const pileConfig: CoinGenerationConfig = {
      ...config,
      minDenomination: getIndexOfCoinType(denomination.name, config.coinSystem),
      maxDenomination: getIndexOfCoinType(denomination.name, config.coinSystem),
      maxValue: remainingValue,
    };

    const pile = generateRandomPileOfCoins(rng.randomString(13), pileConfig);
    piles.push(pile);

    remainingValue -= pile.value;
  }

  return piles;
}

function calculateCapacityNeeded(
  coins: PileOfCoins[],
  gems: Gem[],
  artObjects: Item[],
  items: Item[] = [],
  rng?: RNG,
): { weight: number; volume: number } {
  const coinsWeight = coins.reduce((sum, pile) => sum + pile.weight, 0);
  const gemsWeight = gems.reduce((sum, gem) => sum + gem.weight, 0);
  const artWeight = artObjects.reduce((sum, art) => sum + art.weight, 0);
  const itemsWeight = items.reduce((sum, item) => sum + item.weight, 0);

  const coinsVolume = coins.reduce((sum, pile) => sum + getVolume(pile), 0);
  const gemsVolume = gems.reduce((sum, gem) => sum + getVolume(gem), 0);
  const artVolume = artObjects.reduce((sum, art) => sum + getVolume(art), 0);
  const itemsVolume = items.reduce((sum, item) => sum + getVolume(item), 0);

  // Target random capacity utilization between 10% and 50%
  const utilization = rng ? rng.float(0.1, 0.5) : 0.25;
  return {
    weight: (coinsWeight + gemsWeight + artWeight + itemsWeight) / utilization,
    volume: (coinsVolume + gemsVolume + artVolume + itemsVolume) / utilization,
  };
}

function generateRandomContainersForCapacity(
  seed: string,
  volumeNeeded: number,
  weightNeeded: number,
  config: ContainerGeneratorConfig,
  maxTotalVolume?: number,
): Container[] {
  const rng = new RNG(seed);

  let remainingVolume = volumeNeeded;
  let remainingWeight = weightNeeded;

  let remainingSpace = maxTotalVolume || Infinity;

  if (maxTotalVolume !== undefined && remainingVolume > maxTotalVolume) {
    remainingVolume = maxTotalVolume;
  }

  const containers: Container[] = [];

  // Target a random number of containers to make the hoard look interesting
  const targetContainerCount = rng.int(2, 6);
  let containersGenerated = 0;

  while (remainingVolume > 0 || remainingWeight > 0) {
    let found = false;

    // If we haven't reached our target count, try to pick smaller containers
    // so we don't use up all the required volume in one go.
    let maxContainerVolume = Infinity;
    const remainingTargets = targetContainerCount - containersGenerated;
    if (remainingTargets > 0 && remainingVolume > 0) {
      // Allow a bit more than the average share, but cap it
      maxContainerVolume = (remainingVolume / remainingTargets) * 1.5;
    }

    // First try to find containers that fit our "spread" criteria
    let filteredTypes = filterContainerTypes(
      {
        maxVolume:
          maxTotalVolume !== undefined
            ? Math.min(maxTotalVolume, maxContainerVolume)
            : maxContainerVolume,
        canHoldItems: true,
      },
      config.allowedContainerTypes || [],
    );

    // If no small containers found, fall back to any container that fits the space
    if (filteredTypes.length === 0) {
      filteredTypes = filterContainerTypes(
        {
          maxVolume: maxTotalVolume !== undefined ? maxTotalVolume : undefined,
          canHoldItems: true,
        },
        config.allowedContainerTypes || [],
      );
    }

    if (filteredTypes.length === 0) {
      break;
    }

    const containerType = rng.item(filteredTypes);

    const shouldLock = containerType.canBeLocked
      ? config.allowLockedContainers && config.allowUnlockedContainers
        ? rng.item([true, false])
        : config.allowLockedContainers
          ? true
          : false
      : false;

    const container = generateContainer(
      rng.randomString(13),
      containerType,
      undefined,
      undefined,
      undefined,
      shouldLock,
    );

    if (containerType.defaultVolume <= remainingSpace) {
      containers.push(container);
      remainingVolume -= containerType.defaultVolume;
      remainingWeight -= containerType.defaultWeight;
      remainingSpace -= containerType.defaultVolume;
      containersGenerated++;
      found = true;
    }

    if (!found) {
      break;
    }
  }

  return containers;
}

function selectContainersForCapacity(
  capacityNeeded: { weight: number; volume: number },
  containerTypes: ContainerType[],
  maxTotalVolume?: number,
): Container[] {
  const containers: Container[] = [];
  let remainingWeightCapacity = capacityNeeded.weight;
  let remainingVolumeCapacity = capacityNeeded.volume;
  let currentTotalVolume = 0;
  const sortedTypes = [...containerTypes].sort((a, b) => b.defaultVolume - a.defaultVolume);

  while (remainingWeightCapacity > 0 || remainingVolumeCapacity > 0) {
    let found = false;
    for (const type of sortedTypes) {
      if (
        maxTotalVolume !== undefined &&
        currentTotalVolume + type.defaultVolume > maxTotalVolume
      ) {
        continue;
      }

      containers.push(generateContainer(`container-${containers.length + 1}-${Date.now()}`, type));
      remainingWeightCapacity -= type.defaultWeight;
      remainingVolumeCapacity -= type.defaultVolume;
      currentTotalVolume += type.defaultVolume;
      found = true;
      break;
    }

    if (!found) {
      break;
    }
  }

  return containers;
}

function packCoins(
  piles: PileOfCoins[],
  containers: Container[],
  coinSystem: CurrencySystem,
  rng?: RNG,
) {
  let currentContainers = containers;
  const containedCoins: PileOfCoins[] = [];
  const looseCoins: PileOfCoins[] = [];

  const combinedPiles = combinePilesOfCoins(piles, coinSystem);

  for (const pile of combinedPiles) {
    const distribution = distributeCoins(pile, currentContainers, coinSystem, rng);
    currentContainers = distribution.containers;
    containedCoins.push(...distribution.containedItems);
    looseCoins.push(...distribution.looseItems);
  }

  return { filledContainers: currentContainers, containedCoins, looseCoins };
}

function packGems(gems: Gem[], containers: Container[], rng?: RNG) {
  // Sort containers by available volume descending
  let sortedContainers = [...containers].sort(
    (a, b) => b.maxVolume - b.currentVolume - (a.maxVolume - a.currentVolume),
  );

  if (rng) {
    sortedContainers = rng.shuffle(sortedContainers);
  }

  for (const gem of gems) {
    for (const container of sortedContainers) {
      if (canFit(container, gem)) {
        addItemToContainer(container, gem);
        break;
      }
    }
  }
}

function packArtObjects(artObjects: Item[], containers: Container[], rng?: RNG) {
  // Sort containers by available volume descending
  let sortedContainers = [...containers].sort(
    (a, b) => b.maxVolume - b.currentVolume - (a.maxVolume - a.currentVolume),
  );

  if (rng) {
    sortedContainers = rng.shuffle(sortedContainers);
  }

  for (const art of artObjects) {
    for (const container of sortedContainers) {
      if (canFit(container, art)) {
        addItemToContainer(container, art);
        break;
      }
    }
  }
}

function getRandomItemsForValue(
  seed: string,
  targetValue: number,
  config = getDefaultGenerationConfig(),
): Item[] {
  const rng = new RNG(seed);
  const items: Item[] = [];
  let currentItemsValue = 0;
  let attempts = 0;
  const maxAttempts = 100;

  while (currentItemsValue < targetValue && attempts < maxAttempts) {
    const item = generateItem(rng.randomString(13), config);
    if (currentItemsValue + item.value <= targetValue * 1.1) {
      items.push(item);
      currentItemsValue += item.value;
    }
    attempts++;
  }

  return items;
}
