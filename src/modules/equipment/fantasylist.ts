import { EquipmentList, EquipmentItem } from "./list";

class ClothingItem {
  name: string;
  materialType: string;
  materialAmount: number;

  constructor(name: string, materialType: string, materialAmount: number) {
    this.name = name;
    this.materialType = materialType;
    this.materialAmount = materialAmount;
  }
}

export function all() {
  return [
    new EquipmentList("Books and Education",
      [
        new EquipmentItem("book", 1344),
        new EquipmentItem("fencing instruction (1 month)", 480),
        new EquipmentItem("monastery instruction (1 year)", 1920),
        new EquipmentItem("university instruction (1 year)", 2880),
      ]),
    new EquipmentList("Clothing", getClothingItems()),
    new EquipmentList("Drinks",
      [
        new EquipmentItem("ale, cheap (1 gallon)", 3),
        new EquipmentItem("ale, cheap (1 mug)", 1),
        new EquipmentItem("ale, good (1 gallon)", 6),
        new EquipmentItem("ale, good (1 mug)", 2),
        new EquipmentItem("beer, cheap (1 gallon)", 8),
        new EquipmentItem("beer, cheap (1 mug)", 2),
        new EquipmentItem("beer, good (1 gallon)", 24),
        new EquipmentItem("beer, good (1 mug)", 4),
        new EquipmentItem("mead, cheap (1 gallon)", 10),
        new EquipmentItem("mead, cheap (1 mug)", 3),
        new EquipmentItem("mead, good (1 gallon)", 28),
        new EquipmentItem("mead, good (1 mug)", 5),
        new EquipmentItem("wine, cheap (1 gallon)", 12),
        new EquipmentItem("wine, cheap (1 mug)", 2),
        new EquipmentItem("wine, good (1 gallon)", 32),
        new EquipmentItem("wine, good (1 mug)", 6),
      ]),
    new EquipmentList("Livestock",
      [
        new EquipmentItem("chicken", 2),
        new EquipmentItem("cow", 480),
        new EquipmentItem("goat", 57),
        new EquipmentItem("goose", 24),
        new EquipmentItem("ox", 584),
        new EquipmentItem("pig", 144),
        new EquipmentItem("sheep", 68),
      ]),
    new EquipmentList("Mounts",
      [
        new EquipmentItem("draught horse", 480),
        new EquipmentItem("riding horse", 2400),
        new EquipmentItem("war horse", 19200),
      ]),
    new EquipmentList("Property",
      [
        new EquipmentItem("castle", 5616000),
        new EquipmentItem("church", 115200),
        new EquipmentItem("cottage", 1920),
        new EquipmentItem("craftsman's house", 9600),
        new EquipmentItem("merchant's house", 31680),
        new EquipmentItem("row house", 4800),
      ]),
    new EquipmentList("Tools",
      [
        new EquipmentItem("anvil", 240),
        new EquipmentItem("augur", 12),
        new EquipmentItem("axe", 20),
        new EquipmentItem("bellows", 360),
        new EquipmentItem("chisel", 16),
        new EquipmentItem("hammer", 32),
        new EquipmentItem("shovel", 8),
        new EquipmentItem("spade", 4),
        new EquipmentItem("spinning wheel", 40),
        new EquipmentItem("vice", 176),
        new EquipmentItem("yoke", 96),
      ]
    )
  ];
}

function getClothingItems(): EquipmentItem[] {
  const items = [
    new ClothingItem('shirt', 'cloth', 2),
    new ClothingItem('tunic', 'cloth', 3),
    new ClothingItem('shoes', 'cloth', 0.75),
    new ClothingItem('boots', 'cloth', 1),
    new ClothingItem('tall boots', 'leather', 1.2),
    new ClothingItem('dress', 'cloth', 5),
    new ClothingItem('layered dress', 'cloth', 12),
    new ClothingItem('leggings', 'cloth', 2.2),
    new ClothingItem('trews', 'cloth', 2),
    new ClothingItem('trousers', 'cloth', 2.5),
    new ClothingItem('belt', 'leather', 0.5),
    new ClothingItem('half-circle cloak', 'cloth', 3),
    new ClothingItem('full-circle cloak', 'cloth', 6),
    new ClothingItem('cape', 'cloth', 2),
    new ClothingItem('cap', 'cloth', 1),
    new ClothingItem('floppy hat', 'cloth', 1.2),
    new ClothingItem('cavalier hat', 'leather', 1.5),
    new ClothingItem('muffin hat', 'cloth', 2),
    new ClothingItem('capitano hat', 'cloth', 1.4),
  ];

  let equipmentItems = [];

  for (let i=0;i<items.length;i++) {
    equipmentItems.push(
      new EquipmentItem(items[i].name + ', cheap', getClothingCost(items[i].materialType, items[i].materialAmount, 'cheap')),
      new EquipmentItem(items[i].name + ', fine', getClothingCost(items[i].materialType, items[i].materialAmount, 'fine')),
      new EquipmentItem(items[i].name + ', courtly', getClothingCost(items[i].materialType, items[i].materialAmount, 'courtly')),
    )
  }

  return equipmentItems;
}

function getClothingCost(materialType: string, materialAmount: number, quality: string) {
  let result = materialAmount;

  if (materialType == 'cloth') {
    result = result;
  } else {
    result = result * 2;
  }

  if (quality == 'cheap') {
    result = result;
  } else if (quality == 'fine') {
    result *= 2;
  } else {
    result *= 3;
  }

  result *= materialAmount * 24;

  return Math.floor(result + 8);
}
