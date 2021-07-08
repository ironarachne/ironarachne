import { EquipmentList, EquipmentItem } from "./list";

export function all() {
  return [
    new EquipmentList("Books and Education",
      [
        new EquipmentItem("book", 1344),
        new EquipmentItem("fencing instruction (1 month)", 480),
        new EquipmentItem("monastery instruction (1 year)", 1920),
        new EquipmentItem("university instruction (1 year)", 2880),
      ]),
    new EquipmentList("Clothing",
      [
        new EquipmentItem("boots, cheap", 14),
        new EquipmentItem("boots, fine", 24),
        new EquipmentItem("tunic, cheap", 144),
        new EquipmentItem("tunic, fine", 180),
      ]),
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
