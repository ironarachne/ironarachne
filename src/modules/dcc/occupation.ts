'use strict';

import DCCItem from './equipment/item';
import DCCWeapon from './equipment/weapon';

export default class DCCOccupation {
  name: string;
  trainedWeapon: DCCWeapon;
  tradeGoods: DCCItem;
  commonality: number;
  apply: Function;

  constructor(
    name: string,
    weapon: DCCWeapon,
    good: DCCItem,
    commonality: number,
    apply: Function,
  ) {
    this.name = name;
    this.trainedWeapon = weapon;
    this.tradeGoods = good;
    this.commonality = commonality;
    this.apply = apply;
  }
}
