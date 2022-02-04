'use strict';

import * as Charges from '../../heraldry/charges';
import * as CommonNames from '../../names/common';
import CharacterGenerator from '../../characters/generator';
import * as PremadeConfigs from '../../characters/premadeconfigs';
import * as Heraldry from '../../heraldry/heraldry';
import Rank from '../rank';
import Title from '../../characters/title';
import OrganizationType from '../type';
import * as RND from '../../random';
import Character from '../../characters/character';

export function generateType(): OrganizationType {
  let config = Heraldry.getDefaultConfig();
  config.chargeCount = RND.item([0, 1]);
  config.chargeOptions = Charges.matchingAnyTags(['coin', 'money', 'ocean'], Charges.all());

  let company = new OrganizationType(
    'trading company',
    30,
    200,
    'proprietor',
    function (): string {
      const nameTypes = [
        {
          name: 'generic',
          randomName: function () {
            const prefixes = ['Dynasty', 'Gilded', 'Luxury'];

            const prefix = RND.item(prefixes);

            const suffix = RND.item([
              'Trading Company',
              'Traders',
              'Navigation Company',
              'Trade Company',
              'Trade and Navigation Company',
            ]);

            return prefix + ' ' + suffix;
          },
        },
        {
          name: 'geographic',
          randomName: function () {
            const direction = RND.item(['North', 'West', 'South', 'East']);
            const feature = RND.item(['Wind', 'Sea', 'Mountain', 'Ocean']);

            const suffix = RND.item([
              'Trading Company',
              'Traders',
              'Navigation Company',
              'Trade Company',
              'Trade and Navigation Company',
            ]);

            return direction + ' ' + feature + ' ' + suffix;
          },
        },
        {
          name: 'family',
          randomName: function () {
            const familyNames = CommonNames.lastNames();

            const familyName = RND.item(familyNames);

            const moniker = RND.item([' Brothers', ' & Sons', ' & Son', ' Family', '']);

            const suffix = RND.item([
              'Trading Company',
              'Traders',
              'Navigation Company',
              'Trade Company',
              'Trade and Navigation Company',
            ]);

            return familyName + ' ' + moniker + ' ' + suffix;
          },
        },
      ];

      const namer = RND.item(nameTypes);

      return namer.randomName();
    },
    function (): string {
      return RND.item([
        'The {name} is noted for the quality of their goods.',
        'The {name} has a reputation for always delivering goods to their intended destination.',
        'The {name} appears to be reputable on the surface, but are rumored to be involved in many underhanded dealings.',
        'The {name} often openly uses bullying and strong-arming in their dealings.',
        'The {name} deals in a wide variety of goods.',
      ]);
    },
    function (): Character {
      let charGenConfig = PremadeConfigs.getFantasy();
      charGenConfig.ageCategories = ['adult'];

      const charGen = new CharacterGenerator(charGenConfig);
      const leader = charGen.generate();
      const ranks = this.getRanks();
      leader.titles.push(ranks.title);

      return leader;
    },
    function () {
      const owner = new Rank(
        new Title('Proprietor', 'Proprietor', '', '', false, '', 0),
        'commercial',
        'adult',
      );
      const manager = new Rank(
        new Title('Manager', 'Manager', '', '', false, '', 1),
        'commercial',
        'adult',
      );
      const employee = new Rank(
        new Title('Employee', 'Employee', '', '', false, '', 2),
        'commercial',
        'adult',
      );

      manager.addInferior(employee);
      owner.addInferior(manager);
      return owner;
    },
    config,
  );

  return company;
}