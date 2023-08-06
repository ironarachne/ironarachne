import { c as create_ssr_component, g as getContext, b as add_attribute, f as each, e as escape } from './ssr-93f4de0f.js';
import * as MUN from '@ironarachne/made-up-names';
import * as RND from '@ironarachne/rng';
import random from 'random';
import { R as ReligionGeneratorConfig, a as ReligionGenerator } from './generator-89dd53de.js';
import seedrandom from 'seedrandom';
import '@ironarachne/words';
import 'lodash';
import './fantasy-9c67857f.js';
import './agecategories-48d71175.js';
import './dice-aedbe0e0.js';
import './premadeconfigs-97e1b388.js';
import './domains-c6580b1b.js';

const css = {
  code: 'div.svelte-4q74qx.svelte-4q74qx,h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,h3.svelte-4q74qx.svelte-4q74qx,h4.svelte-4q74qx.svelte-4q74qx,p.svelte-4q74qx.svelte-4q74qx,strong.svelte-4q74qx.svelte-4q74qx,label.svelte-4q74qx.svelte-4q74qx,section.svelte-4q74qx.svelte-4q74qx{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-4q74qx.svelte-4q74qx{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,h3.svelte-4q74qx.svelte-4q74qx,h4.svelte-4q74qx.svelte-4q74qx{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-4q74qx.svelte-4q74qx{font-size:2rem;line-height:2rem}h4.svelte-4q74qx.svelte-4q74qx{font-size:1.5rem;line-height:1.5rem}p.svelte-4q74qx.svelte-4q74qx{margin:1rem 0}label.svelte-4q74qx.svelte-4q74qx{font-weight:700;margin-right:1rem}input.svelte-4q74qx.svelte-4q74qx,select.svelte-4q74qx.svelte-4q74qx{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-4q74qx.svelte-4q74qx{margin-bottom:1rem}strong.svelte-4q74qx.svelte-4q74qx{font-weight:700}section.main.svelte-4q74qx.svelte-4q74qx{padding:0.5rem}#seed.svelte-4q74qx.svelte-4q74qx{font-family:monospace}.fantasy.svelte-4q74qx button.svelte-4q74qx{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-4q74qx button.svelte-4q74qx:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-4q74qx button.svelte-4q74qx:disabled{background:#666;color:#777;border-color:#999}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const user = getContext("user");
  new MUN.HumanSet();
  let useSavedCulture = false;
  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let genConfig = new ReligionGeneratorConfig();
  let generator = new ReligionGenerator(genConfig);
  let religion = generator.generate();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-3nkg7h_START -->${$$result.title = `<title>Religion Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-3nkg7h_END -->`, ""} <section class="fantasy main svelte-4q74qx"><h1 class="svelte-4q74qx" data-svelte-h="svelte-dmd45w">Fantasy Religion Generator</h1> <p class="svelte-4q74qx" data-svelte-h="svelte-1qegzps">Generate a fictional fantasy religion.</p> <div class="input-group svelte-4q74qx"><label for="seed" class="svelte-4q74qx" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-4q74qx"${add_attribute("value", seed, 0)}></div> ${user.savedCultures !== void 0 && user.savedCultures.length > 0 ? `<div class="input-group svelte-4q74qx"><label for="useSavedCulture" class="svelte-4q74qx" data-svelte-h="svelte-14j9oxd">Use a saved culture for naming?</label> <input type="checkbox" name="useSavedCulture" id="useSavedCulture" class="svelte-4q74qx"${add_attribute("checked", useSavedCulture, 1)}></div> <div class="input-group svelte-4q74qx"><label for="savedCulture" class="svelte-4q74qx" data-svelte-h="svelte-32ylm8">Select a saved culture to load</label> <select class="svelte-4q74qx">${each(user.savedCultures, (saved) => {
    return `<option${add_attribute("value", saved.name, 0)}>${escape(saved.name)}</option>`;
  })}</select></div>` : ``} <button class="svelte-4q74qx" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-4q74qx" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <h2 class="svelte-4q74qx">${escape(religion.name)}</h2> <p class="svelte-4q74qx">${escape(religion.description)}</p> <h3 class="svelte-4q74qx" data-svelte-h="svelte-bfry80">Realms</h3> ${each(religion.realms, (realm) => {
    return `<div class="svelte-4q74qx"><h4 class="svelte-4q74qx">${escape(realm.name)}</h4> <p class="svelte-4q74qx">${escape(realm.description)}</p> </div>`;
  })} <h3 class="svelte-4q74qx" data-svelte-h="svelte-18hxmnh">Deities</h3> ${religion.pantheon ? `<p class="svelte-4q74qx">${escape(religion.pantheon.description)}</p> ${each(religion.pantheon.members, (member) => {
    return `<div class="svelte-4q74qx"><h4 class="svelte-4q74qx">${escape(member.deity.name)}</h4> <p class="svelte-4q74qx">${escape(member.deity.titles.join(","))}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-1v11p99">Holy Item:</strong> ${escape(member.deity.holyItem)}</p> <p class="svelte-4q74qx"><strong class="svelte-4q74qx" data-svelte-h="svelte-i4u5qk">Holy Symbol:</strong> ${escape(member.deity.holySymbol)}</p> <p class="svelte-4q74qx">${escape(member.deity.description)}</p> </div>`;
  })}` : ``}</section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-dfe7ae0d.js.map
