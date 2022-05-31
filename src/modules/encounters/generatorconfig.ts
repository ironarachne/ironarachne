'use strict';

import type Species from '../species/species';
import * as FantasyCreatures from '../creatures/fantasy/all';
import * as FantasySpecies from '../species/fantasy';
import Creature from '../creatures/creature';
import EncounterTemplate from './template';

export default class EncounterGeneratorConfig {
  isHostile: boolean;
  template: EncounterTemplate;
  sentientOptions: Species[];
  creatureOptions: Creature[];

  constructor() {
    this.isHostile = true;
    this.sentientOptions = FantasySpecies.all();
    this.creatureOptions = FantasyCreatures.all();
  }
}
