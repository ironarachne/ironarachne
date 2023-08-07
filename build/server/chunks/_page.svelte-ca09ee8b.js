import { c as create_ssr_component, b as add_attribute, e as escape, f as each } from './ssr-93f4de0f.js';
import { g as generate } from './fantasy2-e8cb9c44.js';
import * as RND from '@ironarachne/rng';
import 'seedrandom';
import { H as HeraldryGenerator, a as HeraldrySVGRenderer } from './svg-7410a8cf.js';
import 'random';
import './fantasy-e08cb8d7.js';
import '@ironarachne/made-up-names';
import './agecategories-133ac8fa.js';
import './dice-8036e166.js';
import './sentry-release-injection-file-2a0756c4.js';
import '@ironarachne/words';
import 'lodash';
import './premadeconfigs-d2ecb40b.js';
import 'xmlbuilder2';

const css = {
  code: 'div.svelte-o5hv1b.svelte-o5hv1b,h1.svelte-o5hv1b.svelte-o5hv1b,h2.svelte-o5hv1b.svelte-o5hv1b,h3.svelte-o5hv1b.svelte-o5hv1b,p.svelte-o5hv1b.svelte-o5hv1b,strong.svelte-o5hv1b.svelte-o5hv1b,label.svelte-o5hv1b.svelte-o5hv1b,section.svelte-o5hv1b.svelte-o5hv1b{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-o5hv1b.svelte-o5hv1b{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-o5hv1b.svelte-o5hv1b,h2.svelte-o5hv1b.svelte-o5hv1b,h3.svelte-o5hv1b.svelte-o5hv1b{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-o5hv1b.svelte-o5hv1b{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-o5hv1b.svelte-o5hv1b{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-o5hv1b.svelte-o5hv1b{font-size:2rem;line-height:2rem}p.svelte-o5hv1b.svelte-o5hv1b{margin:1rem 0}label.svelte-o5hv1b.svelte-o5hv1b{font-weight:700;margin-right:1rem}input.svelte-o5hv1b.svelte-o5hv1b{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-o5hv1b.svelte-o5hv1b{margin-bottom:1rem}strong.svelte-o5hv1b.svelte-o5hv1b{font-weight:700}section.main.svelte-o5hv1b.svelte-o5hv1b{padding:0.5rem}#seed.svelte-o5hv1b.svelte-o5hv1b{font-family:monospace}.fantasy.svelte-o5hv1b button.svelte-o5hv1b{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-o5hv1b button.svelte-o5hv1b:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-o5hv1b button.svelte-o5hv1b:disabled{background:#666;color:#777;border-color:#999}div.org-arms.svelte-o5hv1b.svelte-o5hv1b{width:200px;height:220px;margin:0 auto}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let seed = RND.randomString(13);
  let org = generate();
  let name = org.name;
  let description = org.description;
  let leadership = org.leadership.description;
  let notableMembers = org.notableMembers;
  let heraldryConfig = org.organizationType.heraldryConfig;
  heraldryConfig.width = 200;
  heraldryConfig.height = 200;
  let hGen = new HeraldryGenerator();
  hGen.config = heraldryConfig;
  let heraldry = hGen.generate();
  let svgRenderer = new HeraldrySVGRenderer();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-1sctd6v_START -->${$$result.title = `<title>Fantasy Organization Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-1sctd6v_END -->`, ""} <section class="fantasy main svelte-o5hv1b"><h1 class="svelte-o5hv1b" data-svelte-h="svelte-1fsv82e">Organization Generator</h1> <p class="svelte-o5hv1b" data-svelte-h="svelte-1u0l4eg">This generates fantasy organizations.</p> <div class="input-group svelte-o5hv1b"><label for="seed" class="svelte-o5hv1b" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-o5hv1b"${add_attribute("value", seed, 0)}></div> <button class="svelte-o5hv1b" data-svelte-h="svelte-mdbmj4">Generate From Seed</button> <button class="svelte-o5hv1b" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <h2 class="svelte-o5hv1b">${escape(name)}</h2> <div class="org-arms svelte-o5hv1b"><!-- HTML_TAG_START -->${svgRenderer.render(heraldry.device, 200, 220)}<!-- HTML_TAG_END --></div> <p class="svelte-o5hv1b">${escape(description)}</p> <p class="svelte-o5hv1b">${escape(leadership)}</p> <h3 class="svelte-o5hv1b" data-svelte-h="svelte-1v0ad64">Notable Members</h3> ${each(notableMembers, (member) => {
    return `<p class="svelte-o5hv1b"><strong class="svelte-o5hv1b">${escape(member.getHonorific())} ${escape(member.firstName)} ${escape(member.lastName)}:</strong> ${escape(member.description)} </p>`;
  })}</section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-ca09ee8b.js.map
