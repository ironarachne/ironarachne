"use strict";

import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import random from "random";
import type ReligionGeneratorConfig from "./generatorconfig.js";
import PantheonGenerator from "./pantheons/generator.js";
import PantheonGeneratorConfig from "./pantheons/generatorconfig.js";
import RealmGenerator from "./realms/generator.js";
import RealmGeneratorConfig from "./realms/generatorconfig.js";
import Religion from "./religion.js";

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

    const religion = new Religion(this.config.nameGenerator.generate(1)[0]);
    religion.realms = realms;

    if (category.hasDeities) {
      let pantheonGenConfig = new PantheonGeneratorConfig();
      pantheonGenConfig.realms = realms;
      pantheonGenConfig.speciesOptions = this.config.deitySpeciesOptions;
      pantheonGenConfig.minDeities = category.minDeities;
      pantheonGenConfig.maxDeities = category.maxDeities;
      pantheonGenConfig.femaleNameGenerator = this.config.femaleNameGenerator;
      pantheonGenConfig.maleNameGenerator = this.config.maleNameGenerator;
      let pantheonGen = new PantheonGenerator(pantheonGenConfig);
      let pantheon = pantheonGen.generate();
      pantheon.description = category.description;
      religion.pantheon = pantheon;

      if (category.hasLeader) {
        religion.pantheon.leader = random.int(0, religion.pantheon.members.length - 1);

        let leaderTitle = "Queen of the Gods";
        if (religion.pantheon.members[religion.pantheon.leader].deity.gender.name === "male") {
          leaderTitle = "King of the Gods";
        }

        religion.pantheon.members[religion.pantheon.leader].deity.titles.push(leaderTitle);
        religion.pantheon.description += ` ${
          religion.pantheon.members[religion.pantheon.leader].deity.name
        } is the ${leaderTitle}.`;
      }
    }

    if (religion.pantheon !== null) {
      religion.description = religion.pantheon.description
        + " "
        + randomGatheringTimes()
        + " "
        + Words.capitalize(randomGatheringPlace())
        + ".";
    } else {
      religion.description = category.description + " " + randomGatheringTimes()
        + " "
        + Words.capitalize(randomGatheringPlace())
        + ".";
    }

    return religion;
  }
}

function randomGatheringPlace(): string {
  let description = RND.item([
    "{follower} gather in {place} for {service}",
    "{follower} congregate in {place} to be led in {service} by {leader}",
    "{follower} meet in {place} to engage in {service} and hear from {leader}",
    "At {place}, {follower} come together for {service} led by {leader}",
    "Join {follower} at {place} for {service} and fellowship with {leader}",
    "{follower} assemble in {place} to participate in {service} and share with {leader}",
    "{follower} unite at {place} for {service} and to learn from {leader}",
    "At {place}, {follower} come together to seek guidance and wisdom from {leader} through {service}",
  ]);

  const follower = RND.item([
    "adherents",
    "believers",
    "disciples",
    "devotees",
    "faithful",
    "followers",
    "pilgrims",
    "worshippers",
    "zealots",
  ]);

  const place = RND.item([
    "temples",
    "churches",
    "mosques",
    "synagogues",
    "chapels",
    "shrines",
    "sanctuaries",
    "meeting halls",
    "community centers",
    "outdoor arenas",
  ]);

  const service = RND.item([
    "silent meditation",
    "guided meditation",
    "chanting",
    "prayer",
    "sacrament",
    "communion",
    "worship",
    "ritual dance",
    "ritual music",
    "structured recitation",
    "spontaneous sharing",
    "teachings and discussions",
    "ritual sacrifice",
  ]);

  const leader = RND.item([
    "priest",
    "priestess",
    "minister",
    "shaman",
    "spiritual guide",
    "community leader",
    "wise elder",
    "prophet",
    "guru",
    "ascended master",
    "enlightened one",
    "mystic",
    "oracle",
  ]);

  description = description
    .replace("{follower}", follower)
    .replace("{place}", place)
    .replace("{service}", service)
    .replace("{leader}", Words.article(leader) + " " + leader);

  return description;
}

function randomGatheringTimes(): string {
  let description = RND.item([
    "Regular gatherings happen once a week.",
    "Regular gatherings happen daily.",
    "Regular gatherings happen once a month.",
    "Weekly gatherings take place every {weekday}.",
    "They come together every {weekday} for a time of {service}.",
    "Their community meets {frequency} for {service} at {time}.",
    "Their gatherings occur {frequency}, bringing {follower} together for {service}.",
    "They gather {frequency} at {place} for {service} and {activity}.",
    "Every {weekday} they gather for {service}, followed by {activity}.",
    "Their gatherings happen {frequency} at {place} and feature {service}, {activity}, and food/drink.",
    "People are invited to the {occasion} gathering, where they partake in {service} and {activity}.",
  ]);

  description = description
    .replace(
      "{weekday}",
      RND.item(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
    )
    .replace("{frequency}", RND.item(["weekly", "bi-weekly", "monthly", "quarterly", "annually"]))
    .replace(
      "{follower}",
      RND.item(["worshipers", "devotees", "believers", "faithful", "followers", "pilgrims"]),
    )
    .replace(
      "{service}",
      RND.item(["prayer", "worship", "meditation", "reflection", "ritual", "sermon", "teaching"]),
    )
    .replace("{time}", RND.item(["sunrise", "midday", "sunset", "evening", "night"]))
    .replace(
      "{place}",
      RND.item([
        "the temple",
        "the church",
        "the mosque",
        "the synagogue",
        "the chapel",
        "the shrine",
        "the sanctuary",
        "the meeting hall",
      ]),
    )
    .replace(
      "{activity}",
      RND.item([
        "fellowship",
        "conversation",
        "sharing",
        "food and drink",
        "community service",
        "study",
      ]),
    )
    .replace("{occasion}", RND.item(["special", "holiday", "festive", "solemn"]));

  return description;
}
