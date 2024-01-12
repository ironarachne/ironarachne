import { c as create_ssr_component, b as add_attribute, f as each, e as escape } from './ssr-kRdx30EW.js';
import * as RND from '@ironarachne/rng';
import random from 'random';
import './sentry-release-injection-file-nUrLnAlE.js';
import '@ironarachne/words';
import '@ironarachne/made-up-names';
import seedrandom from 'seedrandom';

function getClassificationNames() {
  const classifications = all();
  const results = [];
  for (let i = 0; i < classifications.length; i++) {
    results.push(classifications[i].name);
  }
  return results;
}
function all() {
  return [
    {
      name: "arid",
      diameter_min: 9500,
      diameter_max: 19e3,
      mass_min: 1,
      mass_max: 8,
      orbital_period_min: 237,
      orbital_period_max: 500,
      distance_from_sun_min: 0.4,
      distance_from_sun_max: 2.4,
      is_inhabitable: true,
      has_clouds: true,
      has_atmosphere: true,
      getRandomDescription() {
        const possibleFeatures = [
          {
            name: "sandstorms",
            options: [
              "Sandstorms on this planet are frequent and dangerous.",
              "This planet is plagued by sandstorms.",
              "Sandstorms are frequent and dangerous.",
              "Large but infrequent sandstorms sometimes sweep across the planet."
            ]
          },
          {
            name: "thin atmosphere",
            options: [
              "The atmosphere is very thin and breathing apparatus is required outside.",
              "Though the air is thin, breathing apparatus is not required outside.",
              "Because of its thin atmosphere, this planet can suffocate non-native life."
            ]
          },
          {
            name: "high winds",
            options: [
              "This planet is infamous for its high winds.",
              "High winds sometimes create dangerous dust storms that can destroy unprotected buildings and ships.",
              "The winds on this planet are extremely strong."
            ]
          },
          {
            name: "dune seas",
            options: [
              "Dune seas across the planet are home to a dangerous species of predator.",
              "Dune seas cover much of the planet's surface.",
              `The dune seas of this planet are home to ${RND.item([
                "a dangerous species of predator",
                "myriad forms of moisture-conserving life",
                "a strange type of dry plant"
              ])}.`
            ]
          },
          {
            name: "rocky deserts",
            options: [
              "Rocky deserts cover much of the planet's surface.",
              "Rocky deserts are common on this planet.",
              "There are several rocky deserts on this planet."
            ]
          }
        ];
        const featureCount = random.int(1, 3);
        return getDescriptionFromFeatures(possibleFeatures, featureCount);
      }
    },
    {
      name: "barren",
      diameter_min: 4800,
      diameter_max: 19e3,
      mass_min: 0.3,
      mass_max: 0.65,
      orbital_period_min: 80,
      orbital_period_max: 1500,
      distance_from_sun_min: 0.3,
      distance_from_sun_max: 6,
      is_inhabitable: false,
      has_clouds: false,
      has_atmosphere: false,
      getRandomDescription() {
        const possibleFeatures = [
          {
            name: "craters",
            options: [
              "The surface is covered in craters.",
              "Craters from meteor strikes are common."
            ]
          },
          {
            name: "meteor strikes",
            options: [
              "Meteor strikes are frequent.",
              "Meteor strikes are common.",
              "Meteor strikes are frequent and dangerous."
            ]
          },
          {
            name: "unique remnants",
            options: [
              "The surface is dotted with the wreckage of ships both ancient and new.",
              "The surface is covered in the remains of ancient starships.",
              "Old ruins dot the surface of this planet.",
              "In some places, hints of ancient civilizations can be found."
            ]
          },
          {
            name: "mining stations",
            options: [
              "Mining stations are common on this planet.",
              "Mining stations are scattered across the planet's surface.",
              "This planet has a handful of large mining operations."
            ]
          },
          {
            name: "unique terrain",
            options: [
              "The surface is covered in strange rock formations.",
              "Mountains and valleys cover the surface.",
              "Vast canyons and deep ravines cover the surface."
            ]
          }
        ];
        const featureCount = random.int(1, 2);
        return getDescriptionFromFeatures(possibleFeatures, featureCount);
      }
    },
    {
      name: "garden",
      diameter_min: 1e4,
      diameter_max: 14e3,
      mass_min: 3,
      mass_max: 7,
      orbital_period_min: 237,
      orbital_period_max: 500,
      distance_from_sun_min: 0.95,
      distance_from_sun_max: 2.4,
      is_inhabitable: true,
      has_clouds: true,
      has_atmosphere: true,
      getRandomDescription() {
        const possibleFeatures = [
          {
            name: "lush forests",
            options: [
              "Lush forests cover much of the planet's surface.",
              "Lush forests are common on this planet.",
              "There are several lush forests on this planet."
            ]
          },
          {
            name: "rolling hills",
            options: [
              "Rolling hills cover much of the planet's surface.",
              "Rolling hills are common on this planet.",
              "There are several rolling hills on this planet."
            ]
          },
          {
            name: "vast plains",
            options: [
              "Vast plains cover much of the planet's surface.",
              "Vast plains are common on this planet.",
              "There are several vast plains on this planet."
            ]
          },
          {
            name: "unique terrain",
            options: [
              "The surface is covered in strange rock formations.",
              "Mountains and valleys cover the surface.",
              "Vast canyons and deep ravines cover the surface."
            ]
          },
          {
            name: "unique life forms",
            options: [
              "A large and dangerous species of predator is native to this planet.",
              `A species of large herbivore popular in the ${RND.item([
                "galactic meat market",
                "interstellar dairy market",
                "interstellar trade network"
              ])} is native to this planet.`,
              `Several species of local ${RND.item([
                "insect",
                "reptile",
                "predator"
              ])} are highly venomous.`
            ]
          }
        ];
        const featureCount = random.int(1, 3);
        return getDescriptionFromFeatures(possibleFeatures, featureCount);
      }
    },
    {
      name: "gas giant",
      diameter_min: 45e3,
      diameter_max: 15e4,
      mass_min: 85,
      mass_max: 1900,
      orbital_period_min: 4e3,
      orbital_period_max: 7e4,
      distance_from_sun_min: 5,
      distance_from_sun_max: 40,
      is_inhabitable: false,
      has_clouds: false,
      has_atmosphere: true,
      getRandomDescription() {
        const possibleFeatures = [
          {
            name: "storms",
            options: [
              "Vast storms the size of small planets rage across the surface.",
              "Navigating the upper atmosphere is possible but dangerous due to the many chaotic weather systems."
            ]
          },
          {
            name: "leviathans",
            options: [
              "An aggressive species of floating leviathan is widespread across this planet.",
              "A species of floating leviathan is native to this planet."
            ]
          },
          {
            name: "corrosive gasses",
            options: [
              "The gasses making up the planet's atmosphere are highly corrosive and dangerous to spacecraft.",
              "The highly-combustible gasses of the upper atmosphere are easily ignited."
            ]
          }
        ];
        const featureCount = random.int(1, 2);
        return getDescriptionFromFeatures(possibleFeatures, featureCount);
      }
    },
    {
      name: "ice",
      diameter_min: 4800,
      diameter_max: 19e3,
      mass_min: 0.3,
      mass_max: 0.65,
      orbital_period_min: 4e3,
      orbital_period_max: 8e4,
      distance_from_sun_min: 5,
      distance_from_sun_max: 60,
      is_inhabitable: true,
      has_clouds: true,
      has_atmosphere: true,
      getRandomDescription() {
        const possibleFeatures = [
          {
            name: "ice storms",
            options: [
              "Ice storms are common all over the planet.",
              "Ice storms are frequent and dangerous.",
              "Ice storms are frequent."
            ]
          },
          {
            name: "ice characteristics",
            options: [
              "The ice is thinner in places and cannot hold heavy vehicles or starships.",
              "There are patches of ice that are so cold they cause damage to metal on contact.",
              "Thick ice covers the planet's surface.",
              "Spire-like ice formations dot the planet's surface."
            ]
          },
          {
            name: "subsurface oceans",
            options: [
              "There are vast oceans beneath the ice.",
              "Subsurface oceans cover much of the planet.",
              "The warm core of the planet provides subsurface oceans with liquid water."
            ]
          }
        ];
        const featureCount = random.int(1, 2);
        return getDescriptionFromFeatures(possibleFeatures, featureCount);
      }
    },
    {
      name: "jungle",
      diameter_min: 9500,
      diameter_max: 19e3,
      mass_min: 3.791,
      mass_max: 11.94,
      orbital_period_min: 237,
      orbital_period_max: 500,
      distance_from_sun_min: 0.95,
      distance_from_sun_max: 2.4,
      is_inhabitable: true,
      has_clouds: true,
      has_atmosphere: true,
      getRandomDescription() {
        const possibleFeatures = [
          {
            name: "high temperatures",
            options: [
              "The sweltering heat is oppressive.",
              "It is unbearably hot for non-natives most of the time, requiring a suit for outdoor activity."
            ]
          },
          {
            name: "dangerous predators",
            options: [
              "There are numerous species of deadly predator living in the jungle.",
              "Local life is massive and even the herbivores are extremely dangerous.",
              "The local predators are extremely aggressive and will attack anything that moves.",
              "A powerful apex predator is native to this planet."
            ]
          },
          {
            name: "plantlife",
            options: [
              "The plantlife of this planet is extremely aggressive and will quickly overtake settlements.",
              "The heat and humidity of this world make it a constant struggle to keep plantlife from claiming settlements."
            ]
          }
        ];
        const featureCount = random.int(1, 2);
        return getDescriptionFromFeatures(possibleFeatures, featureCount);
      }
    },
    {
      name: "ocean",
      diameter_min: 9500,
      diameter_max: 19e3,
      mass_min: 1.791,
      mass_max: 11.94,
      orbital_period_min: 237,
      orbital_period_max: 500,
      distance_from_sun_min: 0.95,
      distance_from_sun_max: 2.4,
      is_inhabitable: true,
      has_clouds: true,
      has_atmosphere: true,
      getRandomDescription() {
        const possibleFeatures = [
          {
            name: "corrosive substances",
            options: [
              "The water contains acidic substances that erode metal but leave plastics untouched.",
              "The water contains corrosive substances that can eat through metal."
            ]
          },
          {
            name: "wildlife",
            options: [
              "The still waters hide monstrous leviathans that can devour entire cities.",
              "Ferocious swarms of fish plague the surface.",
              "Vast blooms of algae can corrode even the most advanced armor.",
              "A local species of fish emits an unbearable sonic blast when threatened."
            ]
          },
          {
            name: "storms",
            options: [
              "Large storms are common on this planet.",
              "Large storms are frequent and dangerous."
            ]
          }
        ];
        const featureCount = random.int(1, 2);
        return getDescriptionFromFeatures(possibleFeatures, featureCount);
      }
    },
    {
      name: "swamp",
      diameter_min: 9500,
      diameter_max: 19e3,
      mass_min: 3.791,
      mass_max: 11.94,
      orbital_period_min: 237,
      orbital_period_max: 500,
      distance_from_sun_min: 0.95,
      distance_from_sun_max: 2.4,
      is_inhabitable: true,
      has_clouds: true,
      has_atmosphere: true,
      getRandomDescription() {
        const possibleFeatures = [
          {
            name: "uncertain terrain",
            options: [
              "It's very difficult to tell where solid land is. Landing on what appears to be a muddy plain might result in sinking forever into the muck.",
              "The ground is very soft and landing is difficult.",
              "The surface is a mix of bogs and muck."
            ]
          },
          {
            name: "disease",
            options: [
              "A species of parasitic insect local to the planet carries a nasty disease that is highly contagious.",
              "A disease carried by local insects is highly contagious and can be deadly.",
              "A disease carried by local insects is highly contagious."
            ]
          },
          {
            name: "ecosystem",
            options: [
              "The complicated ecosystem is easy to upset, and outside interference can cause widespread destruction.",
              "The ecosystem is very complex and non-native species can upset the balance easily.",
              "Wildlife is extremely varied and prolific."
            ]
          }
        ];
        const featureCount = random.int(1, 2);
        return getDescriptionFromFeatures(possibleFeatures, featureCount);
      }
    },
    {
      name: "toxic",
      diameter_min: 9500,
      diameter_max: 19e3,
      mass_min: 1.791,
      mass_max: 11.94,
      orbital_period_min: 237,
      orbital_period_max: 500,
      distance_from_sun_min: 0.95,
      distance_from_sun_max: 2.4,
      is_inhabitable: true,
      has_clouds: true,
      has_atmosphere: true,
      getRandomDescription() {
        const possibleFeatures = [
          {
            name: "atmosphere",
            options: [
              "The air is corrosive and will erode unprotected equipment.",
              "The air is highly toxic and requires breathing apparatus.",
              "The air is highly toxic and will eat through even heavy protection eventually."
            ]
          },
          {
            name: "bodies of water",
            options: [
              "The planet's surface is covered in many acid lakes.",
              "Acid lakes are common on this planet.",
              "The lakes and oceans of this world are highly acidic."
            ]
          },
          {
            name: "storms",
            options: [
              "Rainstorms are common on this planet, and they're highly corrosive.",
              "Acid rainstorms are frequent."
            ]
          }
        ];
        const featureCount = random.int(1, 2);
        return getDescriptionFromFeatures(possibleFeatures, featureCount);
      }
    },
    {
      name: "volcanic",
      diameter_min: 9500,
      diameter_max: 19e3,
      mass_min: 1.791,
      mass_max: 11.94,
      orbital_period_min: 237,
      orbital_period_max: 500,
      distance_from_sun_min: 0.95,
      distance_from_sun_max: 2.4,
      is_inhabitable: true,
      has_clouds: true,
      has_atmosphere: true,
      getRandomDescription() {
        const possibleFeatures = [
          {
            name: "volcanic activity",
            options: [
              "Deadly eruptions are frequent.",
              "Lava flows in several areas are unpredictable and quick to change direction.",
              "The air is filled with poisonous gases released by eruptions."
            ]
          },
          {
            name: "atmosphere",
            options: [
              "Acid rains frequently plague this world.",
              "Ashes from eruptions cause havoc with unfiltered systems.",
              "The air is highly sulfurous.",
              "The air here is toxic to most species."
            ]
          },
          {
            name: "unique terrain",
            options: [
              "The surface is covered in strange rock formations.",
              "Huge spires of obsidian crisscross the surface.",
              "Obsidian formations cover the surface.",
              "Occasional lava falls provide spectacular views."
            ]
          }
        ];
        const featureCount = random.int(1, 2);
        return getDescriptionFromFeatures(possibleFeatures, featureCount);
      }
    }
  ];
}
function getDescriptionFromFeatures(possibleFeatures, featureCount) {
  const features = RND.shuffle(possibleFeatures);
  const selectedFeatures = features.slice(0, featureCount);
  let description = "";
  for (let i = 0; i < selectedFeatures.length; i++) {
    const feature = selectedFeatures[i];
    const option = RND.item(feature.options);
    description += `${option} `;
  }
  return description;
}
const css = {
  code: 'div.svelte-1s7j80g.svelte-1s7j80g,h1.svelte-1s7j80g.svelte-1s7j80g,h2.svelte-1s7j80g.svelte-1s7j80g,p.svelte-1s7j80g.svelte-1s7j80g,img.svelte-1s7j80g.svelte-1s7j80g,strong.svelte-1s7j80g.svelte-1s7j80g,sup.svelte-1s7j80g.svelte-1s7j80g,label.svelte-1s7j80g.svelte-1s7j80g,section.svelte-1s7j80g.svelte-1s7j80g{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-1s7j80g.svelte-1s7j80g{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-1s7j80g.svelte-1s7j80g,h2.svelte-1s7j80g.svelte-1s7j80g{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}sup.svelte-1s7j80g.svelte-1s7j80g{vertical-align:super;font-size:0.6rem}h1.svelte-1s7j80g.svelte-1s7j80g{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-1s7j80g.svelte-1s7j80g{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}p.svelte-1s7j80g.svelte-1s7j80g{margin:1rem 0}label.svelte-1s7j80g.svelte-1s7j80g{font-weight:700;margin-right:1rem}input.svelte-1s7j80g.svelte-1s7j80g,select.svelte-1s7j80g.svelte-1s7j80g{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-1s7j80g.svelte-1s7j80g{margin-bottom:1rem}strong.svelte-1s7j80g.svelte-1s7j80g{font-weight:700}section.main.svelte-1s7j80g.svelte-1s7j80g{padding:0.5rem}#seed.svelte-1s7j80g.svelte-1s7j80g{font-family:monospace}.scifi.svelte-1s7j80g.svelte-1s7j80g{background:rgb(16, 17, 25);background:linear-gradient(90deg, rgb(16, 17, 25) 0%, rgb(38, 58, 96) 49%, rgb(16, 17, 25) 100%);color:white}.scifi.svelte-1s7j80g h1.svelte-1s7j80g,.scifi.svelte-1s7j80g h2.svelte-1s7j80g{color:#a2d4ff;text-shadow:0 0 6px #0086ff;font-family:"alienleague", sans-serif}.scifi.svelte-1s7j80g button.svelte-1s7j80g{background:rgb(2, 37, 95);background:linear-gradient(165deg, rgb(2, 37, 95) 0%, rgb(10, 10, 10) 100%);border:3px solid rgb(108, 146, 255);border-radius:3px;color:#fff;font-family:"alienleague", sans-serif;font-size:1.15rem;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.scifi.svelte-1s7j80g button.svelte-1s7j80g:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:rgb(108, 146, 255);transform:translateY(2px)}.scifi.svelte-1s7j80g button.svelte-1s7j80g:disabled{background:#666;color:#777;border-color:#999}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let planetTypes = getClassificationNames();
  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-1rxcaiu_START -->${$$result.title = `<title>Planet Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-1rxcaiu_END -->`, ""} <section class="main scifi svelte-1s7j80g"><h1 class="svelte-1s7j80g" data-svelte-h="svelte-32imzj">Planet Generator</h1> <p class="svelte-1s7j80g" data-svelte-h="svelte-ranut0">This lets you generate a planet. It uses WebGL and your graphics card.</p> <div class="input-group svelte-1s7j80g"><label for="seed" class="svelte-1s7j80g" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-1s7j80g"${add_attribute("value", seed, 0)}></div> <div class="input-group svelte-1s7j80g"><label for="planetType" class="svelte-1s7j80g" data-svelte-h="svelte-c877bm">Planet Type</label> <select id="planetType" class="svelte-1s7j80g"><option value="random" data-svelte-h="svelte-15kmviv">random</option>${each(planetTypes, (pType) => {
    return `<option${add_attribute("value", pType, 0)}>${escape(pType)}</option>`;
  })}</select></div> <button class="svelte-1s7j80g" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-1s7j80g" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> ${``} </section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-oWejO5zf.js.map
