'use strict';

import * as RND from '../random';
import Religion from './religion';

import random from 'random';
import RealmGeneratorConfig from './realms/generatorconfig';
import RealmGenerator from './realms/generator';
import PantheonGeneratorConfig from './pantheons/generatorconfig';
import PantheonGenerator from './pantheons/generator';
import ReligionGeneratorConfig from './generatorconfig';

export default class ReligionGenerator {
  config: ReligionGeneratorConfig;

  constructor(config: ReligionGeneratorConfig) {
    this.config = config;
  }

  generate(): Religion {
    let realmGenConfig = new RealmGeneratorConfig();
    let realmGen = new RealmGenerator(realmGenConfig);
    const realms = realmGen.generate();

    const category = RND.item(this.config.categories);

    let pantheonGenConfig = new PantheonGeneratorConfig();
    pantheonGenConfig.realms = realms;
    pantheonGenConfig.minDeities = category.minDeities;
    pantheonGenConfig.maxDeities = category.maxDeities;
    pantheonGenConfig.femaleNameGenerator = this.config.femaleNameGenerator;
    pantheonGenConfig.maleNameGenerator = this.config.maleNameGenerator;
    let pantheonGen = new PantheonGenerator(pantheonGenConfig);
    let pantheon = pantheonGen.generate();
    pantheon.description = category.description;

    const religion = new Religion(this.config.nameGenerator.generate(1)[0]);
    religion.realms = realms;
    religion.pantheon = pantheon;

    if (category.hasLeader) {
      religion.pantheon.leader = random.int(0, religion.pantheon.members.length - 1);

      let leaderTitle = 'Queen of the Gods';
      if (religion.pantheon.members[religion.pantheon.leader].deity.gender.name === 'male') {
        leaderTitle = 'King of the Gods';
      }

      religion.pantheon.members[religion.pantheon.leader].deity.titles.push(leaderTitle);
      religion.pantheon.description += ` ${
        religion.pantheon.members[religion.pantheon.leader].deity.name
      } is the ${leaderTitle}.`;
    }

    religion.description =
      randomGatheringTimes() + ' For these gatherings, ' + randomGatheringPlace() + '.';

    return religion;
  }
}

function randomGatheringPlace(): string {
  let description = RND.item([
    '{follower} gather in {place} for {service}',
    '{follower} congregate in {place} to be led in {service} by a {leader}',
  ]);

  const follower = RND.item(['adherents', 'followers', 'the faithful']);

  const place = RND.item(['temples', 'churches', 'open spaces', 'lodges']);

  const service = RND.item([
    'silent meditation',
    'ritual dance',
    'solemn service',
    'wild service',
    'ritual music',
    'structured recitation',
    'ritual chanting',
  ]);

  const leader = RND.item([
    'priest',
    'priestess',
    'shaman',
    'community leader',
    'hereditary priest',
    'hereditary priestess',
    'member of the nobility',
  ]);

  description = description
    .replace('{follower}', follower)
    .replace('{place}', place)
    .replace('{service}', service)
    .replace('{leader}', leader);

  return description;
}

function randomGatheringTimes(): string {
  return RND.item([
    'Regular gatherings happen once a week.',
    'Regular gatherings happen daily.',
    'Regular gatherings happen once a month.',
  ]);
}
