import { c as create_ssr_component, b as add_attribute, f as each, e as escape } from './ssr-93f4de0f.js';
import * as RND from '@ironarachne/rng';
import './sentry-release-injection-file-e93f6426.js';
import random from 'random';
import seedrandom from 'seedrandom';
import '@ironarachne/made-up-names';
import '@ironarachne/words';

class PlanetClassification {
  name;
  diameter_min;
  // in km
  diameter_max;
  // in km
  mass_min;
  // in 10^24 kg
  mass_max;
  // in 10^24 kg
  orbital_period_min;
  // in Earth days
  orbital_period_max;
  // in Earth days
  distance_from_sun_min;
  // in AU
  distance_from_sun_max;
  // in AU
  is_inhabitable;
  has_clouds;
  has_atmosphere;
  constructor(name, diameter_min, diameter_max, mass_min, mass_max, orbital_period_min, orbital_period_max, distance_from_sun_min, distance_from_sun_max, is_inhabitable, has_clouds, has_atmosphere) {
    this.name = name;
    this.diameter_min = diameter_min;
    this.diameter_max = diameter_max;
    this.mass_min = mass_min;
    this.mass_max = mass_max;
    this.orbital_period_min = orbital_period_min;
    this.orbital_period_max = orbital_period_max;
    this.distance_from_sun_min = distance_from_sun_min;
    this.distance_from_sun_max = distance_from_sun_max;
    this.is_inhabitable = is_inhabitable;
    this.has_clouds = has_clouds;
    this.has_atmosphere = has_atmosphere;
  }
}
function getClassificationNames() {
  const classifications = all();
  let results = [];
  for (let i = 0; i < classifications.length; i++) {
    results.push(classifications[i].name);
  }
  return results;
}
function all() {
  return [
    new PlanetClassification("arid", 9500, 19e3, 1, 8, 237, 500, 0.4, 2.4, true, true, true),
    new PlanetClassification(
      "barren",
      4800,
      19e3,
      0.3,
      0.65,
      80,
      1500,
      0.3,
      6,
      false,
      false,
      false
    ),
    new PlanetClassification(
      "garden",
      1e4,
      14e3,
      3,
      7,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true
    ),
    new PlanetClassification(
      "gas giant",
      45e3,
      15e4,
      85,
      1900,
      4e3,
      7e4,
      5,
      40,
      false,
      false,
      true
    ),
    new PlanetClassification(
      "ice",
      4800,
      19e3,
      0.3,
      0.65,
      4e3,
      8e4,
      5,
      60,
      true,
      true,
      true
    ),
    new PlanetClassification(
      "jungle",
      9500,
      19e3,
      3.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true
    ),
    new PlanetClassification(
      "ocean",
      9500,
      19e3,
      1.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true
    ),
    new PlanetClassification(
      "swamp",
      9500,
      19e3,
      3.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true
    ),
    new PlanetClassification(
      "toxic",
      9500,
      19e3,
      1.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true
    ),
    new PlanetClassification(
      "volcanic",
      9500,
      19e3,
      1.791,
      11.94,
      237,
      500,
      0.95,
      2.4,
      true,
      true,
      true
    )
  ];
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
//# sourceMappingURL=_page.svelte-df401961.js.map
