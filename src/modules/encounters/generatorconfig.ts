'use strict';

import type Species from '../species/species';
import * as FantasyCreatures from '../creatures/fantasy/all';
import * as FantasySpecies from '../species/fantasy';
import Creature from '../creatures/creature';
import EncounterTemplate from './template';

export default class EncounterGeneratorConfig {
  isHostile: boolean;
  template: EncounterTemplate;
  environment: string;
  sentientOptions: Species[];
  creatureOptions: Creature[];
  minThreatLevel: number;
  maxThreatLevel: number;

  constructor() {
    this.isHostile = true;
    this.environment = 'dungeon';
    this.template = null;
    this.sentientOptions = FantasySpecies.all();
    this.creatureOptions = FantasyCreatures.all();
    this.minThreatLevel = 1;
    this.maxThreatLevel = 4;
  }
}
