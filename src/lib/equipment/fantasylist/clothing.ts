import { EquipmentItem } from '../list.js';

type ClothingItemDef = {
  name: string;
  materialType: string;
  materialAmount: number;
};

const clothingDefs: ClothingItemDef[] = [
  { name: 'shirt', materialType: 'cloth', materialAmount: 2 },
  { name: 'tunic', materialType: 'cloth', materialAmount: 3 },
  { name: 'shoes', materialType: 'cloth', materialAmount: 0.75 },
  { name: 'boots', materialType: 'cloth', materialAmount: 1 },
  { name: 'tall boots', materialType: 'leather', materialAmount: 1.2 },
  { name: 'dress', materialType: 'cloth', materialAmount: 5 },
  { name: 'layered dress', materialType: 'cloth', materialAmount: 12 },
  { name: 'leggings', materialType: 'cloth', materialAmount: 2.2 },
  { name: 'trews', materialType: 'cloth', materialAmount: 2 },
  { name: 'trousers', materialType: 'cloth', materialAmount: 2.5 },
  { name: 'belt', materialType: 'leather', materialAmount: 0.5 },
  { name: 'half-circle cloak', materialType: 'cloth', materialAmount: 3 },
  { name: 'full-circle cloak', materialType: 'cloth', materialAmount: 6 },
  { name: 'cape', materialType: 'cloth', materialAmount: 2 },
  { name: 'cap', materialType: 'cloth', materialAmount: 1 },
  { name: 'floppy hat', materialType: 'cloth', materialAmount: 1.2 },
  { name: 'cavalier hat', materialType: 'leather', materialAmount: 1.5 },
  { name: 'muffin hat', materialType: 'cloth', materialAmount: 2 },
  { name: 'capitano hat', materialType: 'cloth', materialAmount: 1.4 },
];

function getClothingCost(materialType: string, materialAmount: number, quality: string) {
  let result = materialType === 'cloth' ? materialAmount : materialAmount * 2;

  if (quality === 'fine') {
    result *= 2;
  } else if (quality === 'courtly') {
    result *= 3;
  }

  result *= materialAmount * 24;

  return Math.floor(result + 8);
}

export function getClothingItems(): EquipmentItem[] {
  const equipmentItems: EquipmentItem[] = [];

  for (const item of clothingDefs) {
    equipmentItems.push(
      new EquipmentItem(
        item.name + ', cheap',
        getClothingCost(item.materialType, item.materialAmount, 'cheap'),
      ),
      new EquipmentItem(
        item.name + ', fine',
        getClothingCost(item.materialType, item.materialAmount, 'fine'),
      ),
      new EquipmentItem(
        item.name + ', courtly',
        getClothingCost(item.materialType, item.materialAmount, 'courtly'),
      ),
    );
  }

  return equipmentItems;
}
