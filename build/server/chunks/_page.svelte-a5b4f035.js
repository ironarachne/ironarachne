import { c as create_ssr_component, b as add_attribute, f as each, e as escape } from './ssr-93f4de0f.js';
import { c as convertCopper } from './currency2-811230b1.js';
import * as RND from '@ironarachne/rng';
import * as Words from '@ironarachne/words';
import random from 'random';
import { a as getDefaultCharacterGeneratorConfig, g as generate$2 } from './characters-b77e95cc.js';
import { a as all, f as forCategory, b as all$4 } from './patterns-3b0d9d08.js';
import './sentry-release-injection-file-2a50013d.js';
import 'seedrandom';
import './size_matrix-c687e067.js';
import './dice-dc54744c.js';
import '@ironarachne/made-up-names';

function generate$1(category, components, amount, valueThreshold) {
  let result = [];
  let patterns = [];
  if (category == "general") {
    patterns = all();
  } else {
    patterns = forCategory(category);
  }
  for (let i = 0; i < amount; i++) {
    let pattern = RND.item(patterns);
    let item = pattern.complete(components, valueThreshold);
    result.push(item);
  }
  return result;
}
function getList(category, amount, valueThreshold) {
  let components = all$4();
  let items = generate$1(category, components, amount, valueThreshold);
  return items;
}
class Merchant {
  character;
  description;
  wares;
  priceVariance;
  constructor(character, description, wares, priceVariance) {
    this.character = character;
    this.description = description;
    this.wares = wares;
    this.priceVariance = priceVariance;
  }
}
function generate(itemCategory, valueThreshold) {
  let charGenConfig = getDefaultCharacterGeneratorConfig();
  charGenConfig.ageCategoryNames = ["adult"];
  let character = generate$2(charGenConfig);
  let description = RND.item([
    `${character.firstName} ${character.lastName} is ${Words.article(
      itemCategory
    )} ${itemCategory} merchant.`,
    `${character.firstName} ${character.lastName}, ${Words.article(character.species.name)} ${character.species.name} ${character.ageCategory.noun}, is ${Words.article(itemCategory)} ${itemCategory} merchant.`
  ]);
  let wares = getList(itemCategory, 10, valueThreshold);
  let priceVariance = random.float(0.8, 1.2);
  if (priceVariance > 1) {
    description += " " + Words.capitalize(character.gender.pronouns.subjective) + " charges more than others.";
  } else if (priceVariance < 1) {
    description += " " + Words.capitalize(character.gender.pronouns.subjective) + " charges less than others.";
  }
  return new Merchant(character, description, wares, priceVariance);
}
const css = {
  code: 'div.svelte-4q74qx.svelte-4q74qx,h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,h4.svelte-4q74qx.svelte-4q74qx,p.svelte-4q74qx.svelte-4q74qx,strong.svelte-4q74qx.svelte-4q74qx,label.svelte-4q74qx.svelte-4q74qx,section.svelte-4q74qx.svelte-4q74qx{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-4q74qx.svelte-4q74qx{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,h4.svelte-4q74qx.svelte-4q74qx{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h4.svelte-4q74qx.svelte-4q74qx{font-size:1.5rem;line-height:1.5rem}p.svelte-4q74qx.svelte-4q74qx{margin:1rem 0}label.svelte-4q74qx.svelte-4q74qx{font-weight:700;margin-right:1rem}input.svelte-4q74qx.svelte-4q74qx,select.svelte-4q74qx.svelte-4q74qx{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-4q74qx.svelte-4q74qx{margin-bottom:1rem}strong.svelte-4q74qx.svelte-4q74qx{font-weight:700}section.main.svelte-4q74qx.svelte-4q74qx{padding:0.5rem}#seed.svelte-4q74qx.svelte-4q74qx{font-family:monospace}.fantasy.svelte-4q74qx button.svelte-4q74qx{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-4q74qx button.svelte-4q74qx:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-4q74qx button.svelte-4q74qx:disabled{background:#666;color:#777;border-color:#999}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let category = "general";
  let valueThreshold = 50;
  let categories = ["armor", "clothing", "general", "weapon"];
  let merchant = generate(category, valueThreshold);
  let seed = RND.randomString(13);
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-977j56_START -->${$$result.title = `<title>Fantasy Merchant Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-977j56_END -->`, ""} <section class="fantasy main svelte-4q74qx"><h1 class="svelte-4q74qx" data-svelte-h="svelte-1e36sgb">Fantasy Merchant Generator</h1> <p class="svelte-4q74qx" data-svelte-h="svelte-ofmwpk">This generates a fantasy merchant and a list of their wares.</p> <div class="input-group svelte-4q74qx"><label for="seed" class="svelte-4q74qx" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-4q74qx"${add_attribute("value", seed, 0)}></div> <div class="input-group svelte-4q74qx"><label for="value" class="svelte-4q74qx" data-svelte-h="svelte-rrnuoy">Material Rarity Threshold</label> <select name="value" class="svelte-4q74qx"><option value="50" data-svelte-h="svelte-1wajrme">Common</option><option value="100" data-svelte-h="svelte-5n7ygf">Rare</option><option value="10000" data-svelte-h="svelte-1l5yh5m">Legendary</option></select></div> <div class="input-group svelte-4q74qx"><label for="value" class="svelte-4q74qx" data-svelte-h="svelte-130nxmy">Type of Goods</label> <select name="value" class="svelte-4q74qx">${each(categories, (cat) => {
    return `<option${add_attribute("value", cat, 0)}>${escape(cat)}</option>`;
  })}</select></div> <button class="svelte-4q74qx" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-4q74qx" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <p class="svelte-4q74qx">${escape(merchant.description)} ${escape(Words.capitalize(merchant.character.gender.possessivePronoun))} wares include:</p> <h2 class="svelte-4q74qx" data-svelte-h="svelte-16g6os4">Stock List</h2> ${each(merchant.wares, (item) => {
    return `<h4 class="svelte-4q74qx">${escape(Words.capitalize(item.name))}</h4> <p class="svelte-4q74qx">${escape(Words.capitalize(item.description))}.</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-fhmlx1">Cost:</strong> ${escape(convertCopper(Math.floor(item.value * merchant.priceVariance), false, false, false))}</p>`;
  })}</section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-a5b4f035.js.map
