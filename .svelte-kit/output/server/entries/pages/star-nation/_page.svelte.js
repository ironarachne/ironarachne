import { c as create_ssr_component, a as add_attribute } from "../../../chunks/ssr.js";
import * as RND from "@ironarachne/rng";
import "@ironarachne/words";
import "../../../chunks/sentry-release-injection-file.js";
import "seedrandom";
import "@ironarachne/made-up-names";
const css = {
  code: 'div.svelte-10k9tp6.svelte-10k9tp6,h1.svelte-10k9tp6.svelte-10k9tp6,h2.svelte-10k9tp6.svelte-10k9tp6,h3.svelte-10k9tp6.svelte-10k9tp6,p.svelte-10k9tp6.svelte-10k9tp6,img.svelte-10k9tp6.svelte-10k9tp6,strong.svelte-10k9tp6.svelte-10k9tp6,label.svelte-10k9tp6.svelte-10k9tp6,section.svelte-10k9tp6.svelte-10k9tp6{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-10k9tp6.svelte-10k9tp6{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-10k9tp6.svelte-10k9tp6,h2.svelte-10k9tp6.svelte-10k9tp6,h3.svelte-10k9tp6.svelte-10k9tp6{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-10k9tp6.svelte-10k9tp6{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-10k9tp6.svelte-10k9tp6{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-10k9tp6.svelte-10k9tp6{font-size:2rem;line-height:2rem}p.svelte-10k9tp6.svelte-10k9tp6{margin:1rem 0}label.svelte-10k9tp6.svelte-10k9tp6{font-weight:700;margin-right:1rem}input.svelte-10k9tp6.svelte-10k9tp6{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-10k9tp6.svelte-10k9tp6{margin-bottom:1rem}strong.svelte-10k9tp6.svelte-10k9tp6{font-weight:700}section.main.svelte-10k9tp6.svelte-10k9tp6{padding:0.5rem}#seed.svelte-10k9tp6.svelte-10k9tp6{font-family:monospace}.scifi.svelte-10k9tp6.svelte-10k9tp6{background:rgb(16, 17, 25);background:linear-gradient(90deg, rgb(16, 17, 25) 0%, rgb(38, 58, 96) 49%, rgb(16, 17, 25) 100%);color:white}.scifi.svelte-10k9tp6 h1.svelte-10k9tp6,.scifi.svelte-10k9tp6 h2.svelte-10k9tp6,.scifi.svelte-10k9tp6 h3.svelte-10k9tp6{color:#a2d4ff;text-shadow:0 0 6px #0086ff;font-family:"alienleague", sans-serif}.scifi.svelte-10k9tp6 button.svelte-10k9tp6{background:rgb(2, 37, 95);background:linear-gradient(165deg, rgb(2, 37, 95) 0%, rgb(10, 10, 10) 100%);border:3px solid rgb(108, 146, 255);border-radius:3px;color:#fff;font-family:"alienleague", sans-serif;font-size:1.15rem;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.scifi.svelte-10k9tp6 button.svelte-10k9tp6:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:rgb(108, 146, 255);transform:translateY(2px)}.scifi.svelte-10k9tp6 button.svelte-10k9tp6:disabled{background:#666;color:#777;border-color:#999}.star-system.svelte-10k9tp6.svelte-10k9tp6{display:flex;width:100%;flex-wrap:wrap}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let seed = RND.randomString(13);
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-1s6fia1_START -->${$$result.title = `<title>Star Nation Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-1s6fia1_END -->`, ""} <section class="scifi main svelte-10k9tp6"><h1 class="svelte-10k9tp6" data-svelte-h="svelte-1d0dl3g">Star Nation Generator</h1> <p class="svelte-10k9tp6" data-svelte-h="svelte-1x31don">Generate a star nation.</p> <div class="input-group svelte-10k9tp6"><label for="seed" class="svelte-10k9tp6" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-10k9tp6"${add_attribute("value", seed, 0)}></div> <button class="svelte-10k9tp6" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-10k9tp6" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> ${``}</section>`;
});
export {
  Page as default
};
//# sourceMappingURL=_page.svelte.js.map
