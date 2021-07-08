export class EquipmentList {
  title: string;
  items: EquipmentItem[];

  constructor(title: string, items: EquipmentItem[]) {
    this.title = title;
    this.items = items;
  }
}

export class EquipmentItem {
  name: string;
  cost: number;

  constructor(name: string, cost: number) {
    this.name = name;
    this.cost = cost;
  }
}
