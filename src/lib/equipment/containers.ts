import type {
  Container,
  ContainerFilter,
  ContainerGeneratorConfig,
  ContainerType,
  ContainerVariation,
  Item,
  ItemValue,
  Rarity,
} from './equipment_types';
import { getVolume } from './items';
import * as Words from '@ironarachne/words';
import { generateRandomLock, getDefaultLockGeneratorConfig } from './locks';
import { RNG } from '@ironarachne/rng';

export const baseContainerTypes: ContainerType[] = [
  {
    name: 'glass bottle',
    canHoldItems: false,
    canHoldLiquid: true,
    defaultWeight: 5,
    defaultVolume: 2,
    description: 'glass bottle',
    canBeLocked: false,
    weight: 0.5,
    value: 10,
  },
  {
    name: 'wooden barrel',
    canHoldItems: true,
    canHoldLiquid: true,
    defaultWeight: 200,
    defaultVolume: 150,
    description: 'wooden barrel',
    canBeLocked: true,
    weight: 15,
    value: 300,
  },
  {
    name: 'wooden bucket',
    canHoldItems: true,
    canHoldLiquid: true,
    defaultWeight: 20,
    defaultVolume: 15,
    description: 'wooden bucket',
    canBeLocked: false,
    weight: 2,
    value: 30,
  },
  {
    name: 'wooden chest',
    canHoldItems: true,
    canHoldLiquid: false,
    defaultWeight: 150,
    defaultVolume: 100,
    description: 'wooden chest',
    canBeLocked: true,
    weight: 10,
    value: 500,
  },
  {
    name: 'wooden crate',
    canHoldItems: true,
    canHoldLiquid: false,
    defaultWeight: 60,
    defaultVolume: 40,
    description: 'wooden crate',
    canBeLocked: false,
    weight: 5,
    value: 200,
  },
  {
    name: 'leather satchel',
    canHoldItems: true,
    canHoldLiquid: false,
    defaultWeight: 10,
    defaultVolume: 4,
    description: 'leather satchel',
    canBeLocked: false,
    weight: 1,
    value: 20,
  },
  {
    name: 'iron safe',
    canHoldItems: true,
    canHoldLiquid: false,
    defaultWeight: 500,
    defaultVolume: 200,
    description: 'iron safe',
    canBeLocked: true,
    weight: 50,
    value: 10000,
  },
  {
    name: 'cloth bag',
    canHoldItems: true,
    canHoldLiquid: false,
    defaultWeight: 2,
    defaultVolume: 0.5,
    description: 'cloth bag',
    canBeLocked: false,
    weight: 0.25,
    value: 1,
  },
  {
    name: 'cloth pouch',
    canHoldItems: true,
    canHoldLiquid: false,
    defaultWeight: 1,
    defaultVolume: 0.2,
    description: 'cloth pouch',
    canBeLocked: false,
    weight: 0.1,
    value: 5,
  },
  {
    name: 'cloth sack',
    canHoldItems: true,
    canHoldLiquid: false,
    defaultWeight: 25,
    defaultVolume: 20,
    description: 'cloth sack',
    canBeLocked: false,
    weight: 0.5,
    value: 50,
  },
  {
    name: 'waterskin',
    canHoldItems: false,
    canHoldLiquid: true,
    defaultWeight: 8,
    defaultVolume: 3,
    description: 'waterskin',
    canBeLocked: false,
    weight: 0.75,
    value: 15,
  },
];

export function addItemToContainer(container: Container, item: Item): void {
  if (!container.contents.includes(item.id)) {
    container.contents.push(item.id);
    container.currentWeight = parseFloat((container.currentWeight + item.weight).toFixed(6));
    container.currentVolume = parseFloat((container.currentVolume + getVolume(item)).toFixed(6));
  }

  item.containerId = container.id;
}

export function canFit(container: Container, item: Item): boolean {
  const newWeight = container.currentWeight + item.weight;
  const newVolume = container.currentVolume + getVolume(item);
  return newWeight <= container.maxWeight && newVolume <= container.maxVolume;
}

export function filterContainerTypes(
  filter: ContainerFilter,
  containerTypes: ContainerType[],
): ContainerType[] {
  return containerTypes.filter((ct) => {
    if (filter.minWeight !== undefined && ct.defaultWeight < filter.minWeight) {
      return false;
    }
    if (filter.maxWeight !== undefined && ct.defaultWeight > filter.maxWeight) {
      return false;
    }
    if (filter.minVolume !== undefined && ct.defaultVolume < filter.minVolume) {
      return false;
    }
    if (filter.maxVolume !== undefined && ct.defaultVolume > filter.maxVolume) {
      return false;
    }
    if (filter.canBeLocked !== undefined && ct.canBeLocked !== filter.canBeLocked) {
      return false;
    }
    if (filter.canHoldItems !== undefined && ct.canHoldItems !== filter.canHoldItems) {
      return false;
    }
    if (filter.canHoldLiquid !== undefined && ct.canHoldLiquid !== filter.canHoldLiquid) {
      return false;
    }
    return true;
  });
}

export function filterOutContainers(items: Item[]): Item[] {
  return items.filter((item) => !item.hasOwnProperty('contents'));
}

export function generateContainer(
  id: string,
  type: ContainerType,
  name?: string,
  value?: ItemValue,
  rarity?: Rarity,
  shouldLock?: boolean,
  lockDifficulty?: number,
): Container {
  return {
    id,
    name: name || type.name,
    description: type.description,
    maxVolume: type.defaultVolume,
    maxWeight: type.defaultWeight,
    currentWeight: 0,
    currentVolume: 0,
    value: value || 1,
    rarity: rarity || 'common',
    itemMajorType: 'container',
    itemMinorType: type.name,
    isOpen: false,
    contents: [],
    properties: [],
    densityCategory: 'standard',
    weight: type.weight,
    lock:
      type.canBeLocked && shouldLock
        ? {
            id: `${id}-lock`,
            name: `${type.name} lock`,
            description: `A lock for the ${type.name}.`,
            value: 5,
            rarity: 'uncommon',
            itemMajorType: 'lock',
            itemMinorType: 'mechanical',
            lockType: 'mechanical',
            difficulty: lockDifficulty || 2,
            isLocked: true,
            densityCategory: 'dense',
            weight: 0.25,
            properties: [],
          }
        : undefined,
  };
}

export function generateContainerTypes(): ContainerType[] {
  const containerTypes: ContainerType[] = [];
  const variations = getContainerVariations();

  for (const baseType of baseContainerTypes) {
    for (const variation of variations) {
      containerTypes.push({
        name: variation.namePrefix + baseType.name + (variation.nameSuffix || ''),
        canHoldItems: baseType.canHoldItems,
        canHoldLiquid: baseType.canHoldLiquid,
        defaultVolume: Math.max(
          5,
          Math.floor(baseType.defaultVolume * (variation.volumeCapacityModifier || 1)),
        ),
        defaultWeight: Math.max(
          1,
          Math.floor(baseType.defaultWeight * (variation.weightCapacityModifier || 1)),
        ),
        description: `${Words.article(variation.namePrefix || baseType.name)} ${variation.namePrefix || ''}${baseType.name}${variation.descriptionSuffix || ''}`,
        canBeLocked: baseType.canBeLocked,
        weight: Math.max(
          0.1,
          parseFloat((baseType.weight * (variation.weightModifier || 1)).toFixed(2)),
        ),
        value: baseType.value,
      });
    }
    containerTypes.push(baseType);
  }

  return containerTypes;
}

export function generateRandomContainer(seed: string, config: ContainerGeneratorConfig): Container {
  const rng = new RNG(seed);
  const availableContainerTypes = config.allowedContainerTypes || generateContainerTypes();

  const filteredContainerTypes = filterContainerTypes(
    {
      minWeight: config.minWeightCapacity,
      maxWeight: config.maxWeightCapacity,
      minVolume: config.minVolumeCapacity,
      maxVolume: config.maxVolumeCapacity,
      canBeLocked:
        config.allowLockedContainers && !config.allowUnlockedContainers
          ? true
          : !config.allowLockedContainers && config.allowUnlockedContainers
            ? false
            : undefined,
      canHoldItems: config.onlyItemContainers
        ? true
        : config.onlyLiquidContainers
          ? false
          : undefined,
      canHoldLiquid: config.onlyLiquidContainers
        ? true
        : config.onlyItemContainers
          ? false
          : undefined,
    },
    availableContainerTypes,
  );

  if (filteredContainerTypes.length === 0) {
    throw new Error('No container types available matching the specified configuration.');
  }

  const containerType = rng.item(filteredContainerTypes);

  const shouldLock = containerType.canBeLocked
    ? config.allowLockedContainers && config.allowUnlockedContainers
      ? rng.item([true, false])
      : config.allowLockedContainers
        ? true
        : false
    : false;

  const lock = shouldLock
    ? generateRandomLock(rng.randomString(13), getDefaultLockGeneratorConfig())
    : undefined;

  return {
    id: `container-${rng.randomString(13)}`,
    name: containerType.name,
    description: containerType.description,
    maxVolume: containerType.defaultVolume,
    maxWeight: containerType.defaultWeight,
    currentWeight: 0,
    currentVolume: 0,
    value: containerType.value,
    rarity: 'common',
    itemMajorType: 'container',
    itemMinorType: containerType.name,
    isOpen: false,
    contents: [],
    properties: [],
    densityCategory: 'standard',
    weight: containerType.weight,
    lock,
  };
}

export function getContainerContents(container: Container, allItems: Item[]): Item[] {
  return allItems.filter((item) => container.contents.includes(item.id));
}

export function getContainerTypeForCapacity(
  requiredVolume: number,
  requiredWeight: number,
): ContainerType | null {
  const suitableContainers = generateContainerTypes().filter(
    (ct) => ct.defaultVolume >= requiredVolume && ct.defaultWeight >= requiredWeight,
  );
  if (suitableContainers.length === 0) {
    return null;
  }
  suitableContainers.sort(
    (a, b) => a.defaultVolume - b.defaultVolume || a.defaultWeight - b.defaultWeight,
  );
  return suitableContainers[0];
}

export function getContainerVariations(): ContainerVariation[] {
  return [
    {
      namePrefix: 'small ',
      volumeCapacityModifier: 0.75,
      weightCapacityModifier: 0.75,
      weightModifier: 0.75,
    },
    {
      namePrefix: '',
      volumeCapacityModifier: 1.0,
      weightCapacityModifier: 1.0,
      weightModifier: 1.0,
    },
    {
      namePrefix: 'large ',
      volumeCapacityModifier: 1.25,
      weightCapacityModifier: 1.25,
      weightModifier: 1.25,
    },
    {
      namePrefix: 'reinforced ',
      volumeCapacityModifier: 1.0,
      weightCapacityModifier: 1.25,
      weightModifier: 1.5,
    },
  ];
}

export function getDefaultContainerGeneratorConfig(): ContainerGeneratorConfig {
  return {
    allowLockedContainers: true,
    allowUnlockedContainers: true,
    onlyItemContainers: true,
    onlyLiquidContainers: false,
  };
}

export function getLooseItems(containers: Container[], allItems: Item[]): Item[] {
  const containerItemIds = new Set<string>();
  for (const container of containers) {
    for (const itemId of container.contents) {
      containerItemIds.add(itemId);
    }
  }

  return allItems.filter((item) => !containerItemIds.has(item.id));
}

export function getTotalRequiredWeightCapacity(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.weight, 0);
}

export function getTotalRequiredVolumeCapacity(items: Item[]): number {
  return items.reduce((sum, item) => sum + getVolume(item), 0);
}

export function removeItemFromContainer(container: Container, item: Item): void {
  const index = container.contents.indexOf(item.id);
  if (index !== -1) {
    container.contents.splice(index, 1);
    container.currentWeight = parseFloat((container.currentWeight - item.weight).toFixed(6));
    container.currentVolume = parseFloat((container.currentVolume - getVolume(item)).toFixed(6));
  }

  delete item.containerId;
}

export function separateContainersFromItems(items: Item[]): {
  containers: Container[];
  looseItems: Item[];
} {
  const containers: Container[] = [];
  const looseItems: Item[] = [];

  for (const item of items) {
    if (item.hasOwnProperty('contents')) {
      containers.push(item as Container);
      continue;
    }

    looseItems.push(item);
  }

  return { containers, looseItems };
}
