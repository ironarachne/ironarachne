import { c as create_ssr_component, b as add_attribute, e as escape, f as each } from './ssr-93f4de0f.js';
import * as RND from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import random from 'random';
import seedrandom from 'seedrandom';
import './sentry-release-injection-file-2a50013d.js';
import { S as SVGStarRenderer, a as SVGPlanetRenderer, b as StarSystemGenerator, c as StarSystemGeneratorConfig } from './star-svg-74e76975.js';
import * as MUN from '@ironarachne/made-up-names';
import { GenericNameGenerator } from '@ironarachne/made-up-names';
import './generator2-51759e2b.js';

class StarNationGovernment {
  name;
  minSystems;
  maxSystems;
  nameGenerator;
  constructor() {
    this.name = "";
    this.minSystems = 0;
    this.maxSystems = 1;
    this.nameGenerator = {};
  }
}
class StarNation {
  name;
  adjective;
  description;
  government;
  capitalSystem;
  // the index of the systems array for the system
  capitalPlanet;
  // the index of the planet in the planets array for the system
  systems;
  primaryGoal;
  technology;
  military;
  culture;
  economy;
  constructor() {
    this.systems = [];
  }
}
class StarNationGenerator {
  config;
  constructor(config) {
    this.config = config;
  }
  generate() {
    let nation = new StarNation();
    nation.government = RND.item(this.config.governmentOptions);
    let name = this.config.nameGenerator.generate(1)[0];
    nation.adjective = name + RND.item(["n", "i", "ish"]);
    nation.name = `the ${nation.government.nameGenerator.generate(1)[0]} ${name}`;
    nation.description = `${Words.title(nation.name)} is ${Words.article(nation.government.name)} ${nation.government.name}.`;
    let minSystems = Math.max(this.config.minSystems, nation.government.minSystems);
    let maxSystems = Math.max(this.config.maxSystems, nation.government.maxSystems);
    let numberOfSystems = random.int(minSystems, maxSystems);
    let systemGenConfig = new StarSystemGeneratorConfig();
    let systemGen = new StarSystemGenerator(systemGenConfig);
    let population = 0;
    let inhabitedPlanets = 0;
    let possibleCapitals = [];
    for (let i = 0; i < numberOfSystems; i++) {
      let system = systemGen.generate();
      for (let j = 0; j < system.planets.length - 1; j++) {
        if (system.planets[j].is_inhabited) {
          population += system.planets[j].population;
          inhabitedPlanets++;
          possibleCapitals.push([i, j]);
        }
      }
      nation.systems.push(system);
    }
    let capital = RND.item(possibleCapitals);
    nation.capitalSystem = capital[0];
    nation.capitalPlanet = capital[1];
    nation.primaryGoal = RND.item([
      "conquest",
      "to spread their beliefs",
      "to share their knowledge",
      "to always be learning",
      "to always make a profit",
      "to discover new worlds and new people",
      "to bring order",
      "to unite the universe",
      "to unite the universe under their rule",
      "to bring order to the universe",
      "to ever be increasing their knowledge",
      "to learn all the secrets of the universe"
    ]);
    nation.technology = RND.item([
      "highly advanced",
      "advanced",
      "comparable",
      "relatively primitive"
    ]);
    nation.military = RND.item([
      "well-funded and large",
      "poorly funded but large",
      "poorly funded and small",
      "aggressive",
      "belligerent",
      "cautious",
      "orderly",
      "well-disciplined"
    ]);
    nation.culture = RND.item([
      "fragmented",
      "homogeneous",
      "melting pot",
      "controlled",
      "decaying"
    ]);
    nation.economy = RND.item([
      "strong",
      "thriving",
      "collapsing",
      "corrupt",
      "growing",
      "shrinking"
    ]);
    nation.description += ` Its capital is ${nation.systems[nation.capitalSystem].planets[nation.capitalPlanet].name} in the ${nation.systems[nation.capitalSystem].name} system. There are ${nation.systems.length} systems under its sway, with ${inhabitedPlanets} inhabited worlds and a total population of ${getFriendlyPopulation(
      population
    )}.`;
    return nation;
  }
}
function getFriendlyPopulation(pop) {
  const formatter = new Intl.NumberFormat();
  if (pop < 1e6) {
    return formatter.format(Math.floor(pop / 1e3)) + " thousand";
  }
  if (pop < 1e9) {
    return formatter.format(pop / 1e6) + " million";
  }
  if (pop < 1e12) {
    return formatter.format(pop / 1e9) + " billion";
  }
  return formatter.format(pop / 1e12) + " trillion";
}
function all() {
  return [getEmpire(), getMonarchy(), getRepublic(), getTheocracy()];
}
function getEmpire() {
  let gov = new StarNationGovernment();
  gov.name = "empire";
  gov.minSystems = 10;
  gov.maxSystems = 100;
  let nameGen = new GenericNameGenerator();
  nameGen.patterns = ["EMPIRE OF", "GRAND EMPIRE OF", "STAR EMPIRE OF", "STELLAR EMPIRE OF"];
  gov.nameGenerator = nameGen;
  return gov;
}
function getMonarchy() {
  let gov = new StarNationGovernment();
  gov.name = "monarchy";
  gov.minSystems = 1;
  gov.maxSystems = 30;
  let nameGen = new GenericNameGenerator();
  nameGen.patterns = [
    "KINGDOM OF",
    "GRAND KINGDOM OF",
    "STAR KINGDOM OF",
    "STELLAR KINGDOM OF",
    "MONARCHY OF",
    "GRAND MONARCHY OF",
    "STAR MONARCHY OF",
    "STELLAR MONARCHY OF"
  ];
  gov.nameGenerator = nameGen;
  return gov;
}
function getRepublic() {
  let gov = new StarNationGovernment();
  gov.name = "republic";
  gov.minSystems = 1;
  gov.maxSystems = 100;
  let nameGen = new GenericNameGenerator();
  nameGen.patterns = [
    "REPUBLIC OF",
    "STAR REPUBLIC OF",
    "STELLAR REPUBLIC OF",
    "UNITED REPUBLIC OF",
    "UNITED FEDERATION OF",
    "GRAND REPUBLIC OF"
  ];
  gov.nameGenerator = nameGen;
  return gov;
}
function getTheocracy() {
  let gov = new StarNationGovernment();
  gov.name = "theocracy";
  gov.minSystems = 1;
  gov.maxSystems = 10;
  let nameGen = new GenericNameGenerator();
  nameGen.patterns = [
    "HOLY EMPIRE OF",
    "GRAND HOLY DOMINION OF",
    "HOLY KINGDOM OF",
    "HOLY MONARCHY OF",
    "BLESSED DOMINION OF"
  ];
  gov.nameGenerator = nameGen;
  return gov;
}
class StarNationGeneratorConfig {
  minSystems;
  maxSystems;
  governmentOptions;
  nameGenerator;
  constructor() {
    this.minSystems = -1;
    this.maxSystems = -1;
    this.governmentOptions = all();
    this.nameGenerator = new MUN.StarNationNameGenerator();
  }
}
const css = {
  code: 'div.svelte-bol62s.svelte-bol62s,h1.svelte-bol62s.svelte-bol62s,h2.svelte-bol62s.svelte-bol62s,h3.svelte-bol62s.svelte-bol62s,p.svelte-bol62s.svelte-bol62s,strong.svelte-bol62s.svelte-bol62s,label.svelte-bol62s.svelte-bol62s,section.svelte-bol62s.svelte-bol62s{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-bol62s.svelte-bol62s{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-bol62s.svelte-bol62s,h2.svelte-bol62s.svelte-bol62s,h3.svelte-bol62s.svelte-bol62s{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-bol62s.svelte-bol62s{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-bol62s.svelte-bol62s{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-bol62s.svelte-bol62s{font-size:2rem;line-height:2rem}p.svelte-bol62s.svelte-bol62s{margin:1rem 0}label.svelte-bol62s.svelte-bol62s{font-weight:700;margin-right:1rem}input.svelte-bol62s.svelte-bol62s{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-bol62s.svelte-bol62s{margin-bottom:1rem}strong.svelte-bol62s.svelte-bol62s{font-weight:700}section.main.svelte-bol62s.svelte-bol62s{padding:0.5rem}#seed.svelte-bol62s.svelte-bol62s{font-family:monospace}.scifi.svelte-bol62s.svelte-bol62s{background:rgb(16, 17, 25);background:linear-gradient(90deg, rgb(16, 17, 25) 0%, rgb(38, 58, 96) 49%, rgb(16, 17, 25) 100%);color:white}.scifi.svelte-bol62s h1.svelte-bol62s,.scifi.svelte-bol62s h2.svelte-bol62s,.scifi.svelte-bol62s h3.svelte-bol62s{color:#a2d4ff;text-shadow:0 0 6px #0086ff;font-family:"alienleague", sans-serif}.scifi.svelte-bol62s button.svelte-bol62s{background:rgb(2, 37, 95);background:linear-gradient(165deg, rgb(2, 37, 95) 0%, rgb(10, 10, 10) 100%);border:3px solid rgb(108, 146, 255);border-radius:3px;color:#fff;font-family:"alienleague", sans-serif;font-size:1.15rem;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.scifi.svelte-bol62s button.svelte-bol62s:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:rgb(108, 146, 255);transform:translateY(2px)}.scifi.svelte-bol62s button.svelte-bol62s:disabled{background:#666;color:#777;border-color:#999}.star-system.svelte-bol62s.svelte-bol62s{display:flex;max-width:600px}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let config = new StarNationGeneratorConfig();
  let gen = new StarNationGenerator(config);
  let nation = new StarNation();
  let seed = RND.randomString(13);
  let planetRenderer = new SVGPlanetRenderer(64, 64);
  let starRenderer = new SVGStarRenderer(64, 64);
  function generate() {
    random.use(seedrandom(seed));
    nation = gen.generate();
  }
  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }
  newSeed();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-1s6fia1_START -->${$$result.title = `<title>Star Nation Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-1s6fia1_END -->`, ""} <section class="scifi main svelte-bol62s"><h1 class="svelte-bol62s" data-svelte-h="svelte-1d0dl3g">Star Nation Generator</h1> <p class="svelte-bol62s" data-svelte-h="svelte-1x31don">Generate a star nation.</p> <div class="input-group svelte-bol62s"><label for="seed" class="svelte-bol62s" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-bol62s"${add_attribute("value", seed, 0)}></div> <button class="svelte-bol62s" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-bol62s" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <h2 class="svelte-bol62s">${escape(nation.name)}</h2> <p class="svelte-bol62s">${escape(nation.description)}</p> <p class="svelte-bol62s">Their primary goal is ${escape(nation.primaryGoal)}.</p> <p class="svelte-bol62s"><strong class="svelte-bol62s" data-svelte-h="svelte-ywc3a4">Culture:</strong> ${escape(nation.culture)}</p> <p class="svelte-bol62s"><strong class="svelte-bol62s" data-svelte-h="svelte-ugjvva">Economy:</strong> ${escape(nation.economy)}</p> <p class="svelte-bol62s"><strong class="svelte-bol62s" data-svelte-h="svelte-kz1usf">Military:</strong> ${escape(nation.military)}</p> <p class="svelte-bol62s"><strong class="svelte-bol62s" data-svelte-h="svelte-1xfuo96">Technology:</strong> ${escape(nation.technology)}</p> <h3 class="svelte-bol62s">The ${escape(nation.systems[nation.capitalSystem].name)} System</h3> <p class="svelte-bol62s">${escape(nation.systems[nation.capitalSystem].planets[nation.capitalPlanet].name)} is the ${escape(nation.capitalPlanet + 1)}${escape(Words.getOrdinal(nation.capitalPlanet + 1))} planet in this system. It has a population of ${escape(nation.systems[nation.capitalSystem].planets[nation.capitalPlanet].populationFriendly)}.</p> <div class="star-system svelte-bol62s"><!-- HTML_TAG_START -->${starRenderer.render(nation.systems[nation.capitalSystem].stars[0])}<!-- HTML_TAG_END --> ${each(nation.systems[nation.capitalSystem].planets, (planet) => {
    return `<!-- HTML_TAG_START -->${planetRenderer.render(planet)}<!-- HTML_TAG_END -->`;
  })}</div></section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-38333e0d.js.map
