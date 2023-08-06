import { c as create_ssr_component, a as add_attribute, e as escape, f as each } from "../../../chunks/ssr.js";
import * as RND from "@ironarachne/rng";
import random from "random";
import seedrandom from "seedrandom";
import { S as StarSystemGenerator, c as SVGPlanetRenderer, b as SVGStarRenderer, a as StarSystemGeneratorConfig } from "../../../chunks/star-svg.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: 'div.svelte-j2o6xt.svelte-j2o6xt,h1.svelte-j2o6xt.svelte-j2o6xt,h2.svelte-j2o6xt.svelte-j2o6xt,h3.svelte-j2o6xt.svelte-j2o6xt,h5.svelte-j2o6xt.svelte-j2o6xt,p.svelte-j2o6xt.svelte-j2o6xt,strong.svelte-j2o6xt.svelte-j2o6xt,sup.svelte-j2o6xt.svelte-j2o6xt,label.svelte-j2o6xt.svelte-j2o6xt,article.svelte-j2o6xt.svelte-j2o6xt,section.svelte-j2o6xt.svelte-j2o6xt{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article.svelte-j2o6xt.svelte-j2o6xt,section.svelte-j2o6xt.svelte-j2o6xt{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-j2o6xt.svelte-j2o6xt,h2.svelte-j2o6xt.svelte-j2o6xt,h3.svelte-j2o6xt.svelte-j2o6xt,h5.svelte-j2o6xt.svelte-j2o6xt{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}sup.svelte-j2o6xt.svelte-j2o6xt{vertical-align:super;font-size:0.6rem}h1.svelte-j2o6xt.svelte-j2o6xt{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-j2o6xt.svelte-j2o6xt{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-j2o6xt.svelte-j2o6xt{font-size:2rem;line-height:2rem}h5.svelte-j2o6xt.svelte-j2o6xt{font-size:1.25rem;border-bottom:1px solid #333}p.svelte-j2o6xt.svelte-j2o6xt{margin:1rem 0}label.svelte-j2o6xt.svelte-j2o6xt{font-weight:700;margin-right:1rem}article.svelte-j2o6xt.svelte-j2o6xt{margin:1rem 0}input.svelte-j2o6xt.svelte-j2o6xt{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-j2o6xt.svelte-j2o6xt{margin-bottom:1rem}strong.svelte-j2o6xt.svelte-j2o6xt{font-weight:700}section.main.svelte-j2o6xt.svelte-j2o6xt{padding:0.5rem}#seed.svelte-j2o6xt.svelte-j2o6xt{font-family:monospace}.scifi.svelte-j2o6xt.svelte-j2o6xt{background:rgb(16, 17, 25);background:linear-gradient(90deg, rgb(16, 17, 25) 0%, rgb(38, 58, 96) 49%, rgb(16, 17, 25) 100%);color:white}.scifi.svelte-j2o6xt h1.svelte-j2o6xt,.scifi.svelte-j2o6xt h2.svelte-j2o6xt,.scifi.svelte-j2o6xt h3.svelte-j2o6xt,.scifi.svelte-j2o6xt h5.svelte-j2o6xt{color:#a2d4ff;text-shadow:0 0 6px #0086ff;font-family:"alienleague", sans-serif}.scifi.svelte-j2o6xt button.svelte-j2o6xt{background:rgb(2, 37, 95);background:linear-gradient(165deg, rgb(2, 37, 95) 0%, rgb(10, 10, 10) 100%);border:3px solid rgb(108, 146, 255);border-radius:3px;color:#fff;font-family:"alienleague", sans-serif;font-size:1.15rem;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.scifi.svelte-j2o6xt button.svelte-j2o6xt:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:rgb(108, 146, 255);transform:translateY(2px)}.scifi.svelte-j2o6xt button.svelte-j2o6xt:disabled{background:#666;color:#777;border-color:#999}article.media-banner.svelte-j2o6xt.svelte-j2o6xt{display:grid;grid-template-columns:128px auto;column-gap:1rem}',
  map: null
};
const width = 128;
const height = 128;
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let planetRenderer = new SVGPlanetRenderer(width, height);
  let starRenderer = new SVGStarRenderer(width, height);
  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let config = new StarSystemGeneratorConfig();
  let generator = new StarSystemGenerator(config);
  let system = generator.generate();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-3gbrdv_START -->${$$result.title = `<title>Star System Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-3gbrdv_END -->`, ""} <section class="main scifi svelte-j2o6xt"><h1 class="svelte-j2o6xt" data-svelte-h="svelte-472aci">Star System Generator</h1> <div class="input-group svelte-j2o6xt"><label for="seed" class="svelte-j2o6xt" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-j2o6xt"${add_attribute("value", seed, 0)}></div> <button class="svelte-j2o6xt" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-j2o6xt" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <h2 class="svelte-j2o6xt">The ${escape(system.name)} System</h2> <p class="svelte-j2o6xt">${escape(system.description)}</p> <h3 class="svelte-j2o6xt" data-svelte-h="svelte-1kgdkbx">Stars</h3> ${each(system.stars, (star) => {
    return `<article class="media-banner svelte-j2o6xt"><div class="image-container svelte-j2o6xt"><!-- HTML_TAG_START -->${starRenderer.render(star)}<!-- HTML_TAG_END --></div> <div class="svelte-j2o6xt"><h5 class="svelte-j2o6xt">${escape(star.name)}</h5> <p class="svelte-j2o6xt">${escape(star.description)}</p> <p class="svelte-j2o6xt"><strong class="svelte-j2o6xt" data-svelte-h="svelte-1ejm75u">Radius:</strong> ${escape(new Intl.NumberFormat().format(star.radius))} km</p> <p class="svelte-j2o6xt"><strong class="svelte-j2o6xt" data-svelte-h="svelte-1dyh534">Mass:</strong> ${escape(new Intl.NumberFormat().format(star.mass))} × 10<sup class="svelte-j2o6xt" data-svelte-h="svelte-uph1t9">30</sup> kg</p> <p class="svelte-j2o6xt"><strong class="svelte-j2o6xt" data-svelte-h="svelte-1ut2ta1">Luminosity:</strong> ${escape(new Intl.NumberFormat().format(star.luminosity))} × 10<sup class="svelte-j2o6xt" data-svelte-h="svelte-mq7xna">26</sup> W</p> <p class="svelte-j2o6xt"><strong class="svelte-j2o6xt" data-svelte-h="svelte-1hpdhuw">Temperature:</strong> ${escape(new Intl.NumberFormat().format(star.temperature))}K
        </p></div> </article>`;
  })} <h3 class="svelte-j2o6xt" data-svelte-h="svelte-145k1j3">Planets</h3> ${each(system.planets, (planet) => {
    return `<article class="media-banner svelte-j2o6xt"><div class="image-container svelte-j2o6xt"><!-- HTML_TAG_START -->${planetRenderer.render(planet)}<!-- HTML_TAG_END --></div> <div class="svelte-j2o6xt"><h5 class="svelte-j2o6xt">${escape(planet.name)}</h5> <p class="svelte-j2o6xt">${escape(planet.description)}</p> <p class="svelte-j2o6xt"><strong class="svelte-j2o6xt" data-svelte-h="svelte-1x3lack">Planet Type:</strong> ${escape(planet.classification.name)}</p> <p class="svelte-j2o6xt"><strong class="svelte-j2o6xt" data-svelte-h="svelte-vxfh5n">Population:</strong> ${escape(planet.populationFriendly)}</p> <p class="svelte-j2o6xt"><strong class="svelte-j2o6xt" data-svelte-h="svelte-ywc3a4">Culture:</strong> ${escape(planet.culture)}</p> <p class="svelte-j2o6xt"><strong class="svelte-j2o6xt" data-svelte-h="svelte-1per3yf">Government:</strong> ${escape(planet.government)}</p> <p class="svelte-j2o6xt"><strong class="svelte-j2o6xt" data-svelte-h="svelte-1hjtszb">Distance from Star:</strong> ${escape(new Intl.NumberFormat().format(planet.distance_from_sun))} AU</p> <p class="svelte-j2o6xt"><strong class="svelte-j2o6xt" data-svelte-h="svelte-1dyh534">Mass:</strong> ${escape(new Intl.NumberFormat().format(planet.mass))} × 10<sup class="svelte-j2o6xt" data-svelte-h="svelte-17ldsqy">24</sup> kg</p> <p class="svelte-j2o6xt"><strong class="svelte-j2o6xt" data-svelte-h="svelte-151n5sv">Diameter:</strong> ${escape(new Intl.NumberFormat().format(Math.floor(planet.diameter)))} km</p> <p class="svelte-j2o6xt"><strong class="svelte-j2o6xt" data-svelte-h="svelte-y44lrs">Gravity:</strong> ${escape(new Intl.NumberFormat().format(planet.gravity))} m/s<sup class="svelte-j2o6xt" data-svelte-h="svelte-1nsjm82">2</sup> (${escape(new Intl.NumberFormat().format(Math.floor(planet.gravity / 9.81 * 100)))}% Earth gravity)</p> <p class="svelte-j2o6xt"><strong class="svelte-j2o6xt" data-svelte-h="svelte-18c8r4q">Orbital Period:</strong> ${escape(new Intl.NumberFormat().format(Math.floor(planet.orbital_period)))} days
        </p></div> </article>`;
  })}</section>`;
});
export {
  Page as default
};
