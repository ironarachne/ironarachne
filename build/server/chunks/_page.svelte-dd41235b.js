import { c as create_ssr_component, g as getContext, b as add_attribute, f as each, e as escape } from './ssr-93f4de0f.js';
import * as MUN from '@ironarachne/made-up-names';
import * as RND from '@ironarachne/rng';
import { s as sentient } from './characters-ea7ef542.js';
import { R as ReligionGeneratorConfig, b as all, a as ReligionGenerator } from './generatorconfig-c8a32b7c.js';
import random from 'random';
import seedrandom from 'seedrandom';
import './size_matrix-8d8a96c2.js';
import './sentry-release-injection-file-50b0c374.js';
import './dice-02e4f861.js';
import '@ironarachne/words';
import './domains-c69d5c94.js';
import './premade_configs-524bc1a8.js';

const css = {
  code: 'div.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8,h1.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8,h2.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8,h3.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8,h4.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8,p.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8,strong.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8,ul.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8,li.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8,label.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8,section.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{display:block}ul.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{list-style:none}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8,h2.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8,h3.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8,h4.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{font-size:2rem;line-height:2rem}h4.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{font-size:1.5rem;line-height:1.5rem}p.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{margin:1rem 0}label.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{font-weight:700;margin-right:1rem}input.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8,select.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{margin-bottom:1rem}ul.svelte-177t5t8 li.svelte-177t5t8.svelte-177t5t8{list-style-type:disc;margin-left:2rem}strong.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{font-weight:700}section.main.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{padding:0.5rem}#seed.svelte-177t5t8.svelte-177t5t8.svelte-177t5t8{font-family:monospace}.fantasy.svelte-177t5t8 button.svelte-177t5t8.svelte-177t5t8{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-177t5t8 button.svelte-177t5t8.svelte-177t5t8:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-177t5t8 button.svelte-177t5t8.svelte-177t5t8:disabled{background:#666;color:#777;border-color:#999}.input-group.svelte-177t5t8 ul.svelte-177t5t8>li.svelte-177t5t8{list-style:none}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const user = getContext("user");
  MUN.getSetByName("human", MUN.fantasyRaceSets());
  let useSavedCulture = false;
  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let genConfig = new ReligionGeneratorConfig();
  let generator = new ReligionGenerator(genConfig);
  let religion = generator.generate();
  let allSpeciesNames = [];
  const allSpecies = sentient();
  const allReligionCategories = all();
  let allReligionCategoriesNames = [];
  for (let i = 0; i < allSpecies.length; i++) {
    allSpeciesNames.push(allSpecies[i].name);
  }
  for (let i = 0; i < allReligionCategories.length; i++) {
    allReligionCategoriesNames.push(allReligionCategories[i].name);
  }
  let selectedSpecies = ["human"];
  let selectedCategories = ["polytheism"];
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-3nkg7h_START -->${$$result.title = `<title>Religion Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-3nkg7h_END -->`, ""} <section class="fantasy main svelte-177t5t8"><h1 class="svelte-177t5t8" data-svelte-h="svelte-dmd45w">Fantasy Religion Generator</h1> <p class="svelte-177t5t8" data-svelte-h="svelte-1qegzps">Generate a fictional fantasy religion.</p> <div class="input-group svelte-177t5t8"><label for="seed" class="svelte-177t5t8" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-177t5t8"${add_attribute("value", seed, 0)}></div> <div class="input-group svelte-177t5t8"><label for="selected-categories" class="svelte-177t5t8" data-svelte-h="svelte-j3oq01">Allow these religion categories</label> ${each(allReligionCategoriesNames, (categoryName) => {
    return `<ul class="svelte-177t5t8"><li class="svelte-177t5t8"><input type="checkbox" name="selected-categories" id="selected-categories"${add_attribute("value", categoryName, 0)} class="svelte-177t5t8"${~selectedCategories.indexOf(categoryName) ? add_attribute("checked", true, 1) : ""}> ${escape(categoryName)}</li> </ul>`;
  })}</div> <div class="input-group svelte-177t5t8"><label for="selected-species" class="svelte-177t5t8" data-svelte-h="svelte-3z3qr8">Allow deities of these species</label> ${each(allSpeciesNames, (speciesName) => {
    return `<ul class="svelte-177t5t8"><li class="svelte-177t5t8"><input type="checkbox" name="selected-species" id="selected-species"${add_attribute("value", speciesName, 0)} class="svelte-177t5t8"${~selectedSpecies.indexOf(speciesName) ? add_attribute("checked", true, 1) : ""}> ${escape(speciesName)}</li> </ul>`;
  })}</div> ${user.savedCultures !== void 0 && user.savedCultures.length > 0 ? `<div class="input-group svelte-177t5t8"><label for="useSavedCulture" class="svelte-177t5t8" data-svelte-h="svelte-14j9oxd">Use a saved culture for naming?</label> <input type="checkbox" name="useSavedCulture" id="useSavedCulture" class="svelte-177t5t8"${add_attribute("checked", useSavedCulture, 1)}></div> <div class="input-group svelte-177t5t8"><label for="savedCulture" class="svelte-177t5t8" data-svelte-h="svelte-32ylm8">Select a saved culture to load</label> <select class="svelte-177t5t8">${each(user.savedCultures, (saved) => {
    return `<option${add_attribute("value", saved.name, 0)}>${escape(saved.name)}</option>`;
  })}</select></div>` : ``} <button class="svelte-177t5t8" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-177t5t8" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <h2 class="svelte-177t5t8">${escape(religion.name)}</h2> <p class="svelte-177t5t8">${escape(religion.description)}</p> <h3 class="svelte-177t5t8" data-svelte-h="svelte-bfry80">Realms</h3> ${each(religion.realms, (realm) => {
    return `<div class="svelte-177t5t8"><h4 class="svelte-177t5t8">${escape(realm.name)}</h4> <p class="svelte-177t5t8">${escape(realm.description)}</p> </div>`;
  })} ${religion.pantheon !== null ? `<h3 class="svelte-177t5t8" data-svelte-h="svelte-18hxmnh">Deities</h3> <p class="svelte-177t5t8">${escape(religion.pantheon.description)}</p> ${each(religion.pantheon.members, (member) => {
    return `<div class="svelte-177t5t8"><h4 class="svelte-177t5t8">${escape(member.deity.name)}</h4> <p class="svelte-177t5t8">${escape(member.deity.titles.join(","))}</p> <p class="svelte-177t5t8"><strong class="svelte-177t5t8" data-svelte-h="svelte-1v11p99">Holy Item:</strong> ${escape(member.deity.holyItem)}</p> <p class="svelte-177t5t8"><strong class="svelte-177t5t8" data-svelte-h="svelte-i4u5qk">Holy Symbol:</strong> ${escape(member.deity.holySymbol)}</p> <p class="svelte-177t5t8">${escape(member.deity.description)}</p> </div>`;
  })}` : ``}</section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-dd41235b.js.map
