import type { Container, ContainerType, ItemValue, Rarity } from './equipment_types';

export const containerTypes: ContainerType[] = [
  {
    name: 'wooden chest',
    defaultCapacity: 20,
    description: 'A sturdy wooden chest reinforced with iron bands.',
    canBeLocked: true,
  },
  {
    name: 'leather satchel',
    defaultCapacity: 10,
    description: 'A small leather satchel, perfect for carrying light items.',
    canBeLocked: false,
  },
  {
    name: 'iron safe',
    defaultCapacity: 30,
    description: 'A heavy iron safe that offers excellent protection for valuables.',
    canBeLocked: true,
  },
  {
    name: 'cloth bag',
    defaultCapacity: 15,
    description: 'A simple cloth bag, easy to carry but not very secure.',
    canBeLocked: false,
  },
];

export function generateContainer(id: string, type: ContainerType, name?: string, value?: ItemValue, rarity?: Rarity, shouldLock?: boolean, lockDifficulty?: number): Container {
  return {
    id,
    name: name || type.name,
    description: type.description,
    capacity: type.defaultCapacity,
    value: value || 1,
    rarity: rarity || 'common',
    isOpen: false,
    contents: [],
    properties: [],
    lock: type.canBeLocked && shouldLock ? {
      id: `${id}-lock`,
      name: `${type.name} lock`,
      description: `A lock for the ${type.name}.`,
      value: 5,
      rarity: 'uncommon',
      lockType: 'mechanical',
      difficulty: lockDifficulty || 2,
      isLocked: true,
      properties: []
    } : undefined,
  }
}

export function getContainerTypeForCapacity(requiredCapacity: number): ContainerType | null {
  const suitableContainers = containerTypes.filter(ct => ct.defaultCapacity >= requiredCapacity);
  if (suitableContainers.length === 0) {
    return null;
  }
  suitableContainers.sort((a, b) => a.defaultCapacity - b.defaultCapacity);
  return suitableContainers[0];
}
