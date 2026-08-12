import type { EquipmentList } from '../list.js';
import { adventuringGearList } from './adventuring_gear.js';
import { ammunitionList } from './ammunition.js';
import { armorList } from './armor.js';
import { booksList } from './books.js';
import { getClothingItems } from './clothing.js';
import { containersList } from './containers.js';
import { drinksList } from './drinks.js';
import { foodList } from './food.js';
import { householdList } from './household.js';
import { jewelryAdornmentList } from './jewelry_adornment.js';
import { lightingFuelList } from './lighting_fuel.js';
import { livestockList } from './livestock.js';
import { medicalHerbalList } from './medical_herbal.js';
import { mountsList } from './mounts.js';
import { musicalInstrumentsList } from './musical_instruments.js';
import { propertyList } from './property.js';
import { religiousAlchemicalList } from './religious_alchemical.js';
import { servicesList } from './services.js';
import { toolsList } from './tools.js';
import { tradeGoodsList } from './trade_goods.js';
import { transportList } from './transport.js';
import { weaponsList } from './weapons.js';
import { writingStationeryList } from './writing_stationery.js';

export function all(): EquipmentList[] {
  return [
    foodList,
    drinksList,
    { title: 'Clothing', items: getClothingItems() },
    weaponsList,
    ammunitionList,
    armorList,
    adventuringGearList,
    containersList,
    toolsList,
    householdList,
    tradeGoodsList,
    livestockList,
    mountsList,
    transportList,
    medicalHerbalList,
    religiousAlchemicalList,
    lightingFuelList,
    writingStationeryList,
    booksList,
    jewelryAdornmentList,
    musicalInstrumentsList,
    propertyList,
    servicesList,
  ];
}
