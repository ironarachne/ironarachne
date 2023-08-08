import { c as create_ssr_component, b as add_attribute, f as each, e as escape } from './ssr-93f4de0f.js';
import { r as randomChargeTincture, d as allChargeTags, b as HeraldryGeneratorConfig, H as HeraldryGenerator, c as all$4, e as all$2, f as all$3, g as all$1, o as ofTypes, a as HeraldrySVGRenderer } from './svg-4b303aff.js';
import * as RND from '@ironarachne/rng';
import './sentry-release-injection-file-f1f7df64.js';
import random from 'random';
import seedrandom from 'seedrandom';
import '@ironarachne/words';
import 'xmlbuilder2';

const css = {
  code: 'div.svelte-1flz3eh.svelte-1flz3eh,h1.svelte-1flz3eh.svelte-1flz3eh,p.svelte-1flz3eh.svelte-1flz3eh,label.svelte-1flz3eh.svelte-1flz3eh,section.svelte-1flz3eh.svelte-1flz3eh{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-1flz3eh.svelte-1flz3eh{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-1flz3eh.svelte-1flz3eh{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-1flz3eh.svelte-1flz3eh{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}p.svelte-1flz3eh.svelte-1flz3eh{margin:1rem 0}label.svelte-1flz3eh.svelte-1flz3eh{font-weight:700;margin-right:1rem}input.svelte-1flz3eh.svelte-1flz3eh,select.svelte-1flz3eh.svelte-1flz3eh{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-1flz3eh.svelte-1flz3eh{margin-bottom:1rem}section.main.svelte-1flz3eh.svelte-1flz3eh{padding:0.5rem}#seed.svelte-1flz3eh.svelte-1flz3eh{font-family:monospace}.fantasy.svelte-1flz3eh button.svelte-1flz3eh{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-1flz3eh button.svelte-1flz3eh:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-1flz3eh button.svelte-1flz3eh:disabled{background:#666;color:#777;border-color:#999}div.coat-of-arms.svelte-1flz3eh.svelte-1flz3eh{width:600px;height:660px;margin:0 auto}p.blazon.svelte-1flz3eh.svelte-1flz3eh{text-align:center}',
  map: null
};
const heraldryWidth = 600;
const heraldryHeight = 660;
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let blazon = "";
  let image = "";
  let seed = RND.randomString(13);
  let charges = all$4();
  let chargeTincture = randomChargeTincture();
  let fieldTinctures1 = all$2();
  let fieldTinctures2 = all$2();
  let fields = all$3();
  let variations = all$1();
  let availableTags = allChargeTags();
  function setChargeTincture() {
    {
      chargeTincture = randomChargeTincture();
    }
    setFieldTinctures();
  }
  function setFieldTinctures() {
    let types1 = [];
    let types2 = [];
    if (chargeTincture.type == "color" || chargeTincture.type == "stain") {
      types1 = ["metal"];
      types2 = ["metal"];
    } else {
      types1 = ["color"];
      types2 = ["color"];
      if (RND.simple(100) > 70) {
        types1.push("stain");
      }
      if (RND.simple(100) > 80) {
        types2.push("stain");
      }
    }
    {
      types1.push("furs");
    }
    fieldTinctures1 = ofTypes(types1);
    fieldTinctures2 = ofTypes(types2);
  }
  function generate() {
    random.use(seedrandom(seed));
    let numberOfCharges = randomNumberOfCharges();
    setChargeTincture();
    let config = new HeraldryGeneratorConfig();
    config.chargeCount = numberOfCharges;
    config.chargeOptions = charges;
    config.chargeTinctures = [chargeTincture];
    config.fieldOptions = fields;
    config.variationOptions = variations;
    config.fieldTinctures1 = fieldTinctures1;
    config.fieldTinctures2 = fieldTinctures2;
    config.width = heraldryWidth;
    config.height = heraldryHeight;
    let heraldryGen = new HeraldryGenerator();
    heraldryGen.config = config;
    let heraldry = heraldryGen.generate();
    blazon = heraldry.blazon;
    let renderer = new HeraldrySVGRenderer();
    image = renderer.render(heraldry.device, config.width, config.height);
  }
  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }
  function randomNumberOfCharges() {
    const weights = [
      { item: 0, commonality: 20 },
      { item: 1, commonality: 55 },
      { item: 2, commonality: 5 },
      { item: 3, commonality: 3 }
    ];
    const result = RND.weighted(weights);
    return result.item;
  }
  newSeed();
  $$result.css.add(css);
  return `<section class="fantasy main svelte-1flz3eh"><h1 class="svelte-1flz3eh" data-svelte-h="svelte-97q6xu">Heraldry Generator</h1> <p class="svelte-1flz3eh" data-svelte-h="svelte-8poblq">Generate fantasy coats-of-arms. Note: if you change the seed, the page URL
    won&#39;t change, but your new seed will be used the next time you hit Generate.</p> <div class="input-group svelte-1flz3eh"><label for="seed" class="svelte-1flz3eh" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-1flz3eh"${add_attribute("value", seed, 0)}></div> <div class="input-group svelte-1flz3eh"><label for="tag" class="svelte-1flz3eh" data-svelte-h="svelte-8cme56">Charge Tag</label> <select name="tag" class="svelte-1flz3eh"><option value="any" data-svelte-h="svelte-1j2tppc">any</option>${each(availableTags, (tag) => {
    return `<option${add_attribute("value", tag, 0)}>${escape(tag)}</option>`;
  })}</select></div> <div class="input-group svelte-1flz3eh"><label for="num-charges" class="svelte-1flz3eh" data-svelte-h="svelte-cxjxxh">Number of Charges</label> <select name="num-charges" class="svelte-1flz3eh"><option value="any" data-svelte-h="svelte-1j2tppc">any</option><option value="none" data-svelte-h="svelte-1wr4gle">none</option><option value="one" data-svelte-h="svelte-2bbcs2">one</option><option value="two" data-svelte-h="svelte-71pkr4">two</option><option value="three" data-svelte-h="svelte-1c1t7ry">three</option></select></div> <div class="input-group svelte-1flz3eh"><label for="charge-tincture" class="svelte-1flz3eh" data-svelte-h="svelte-1n51gdb">Charge Tincture</label> <select name="charge-tincture" class="svelte-1flz3eh"><option value="any" data-svelte-h="svelte-1j2tppc">any</option><option value="gules" data-svelte-h="svelte-1ln4tsg">gules (red)</option><option value="argent" data-svelte-h="svelte-1eumzkm">argent (white)</option><option value="vert" data-svelte-h="svelte-1ebhcjg">vert (green)</option><option value="purpure" data-svelte-h="svelte-1ce377v">purpure (purple)</option><option value="sable" data-svelte-h="svelte-jz8toi">sable (black)</option><option value="Or" data-svelte-h="svelte-uep6jt">Or (gold)</option><option value="azure" data-svelte-h="svelte-1f0cli9">azure (blue)</option><option value="murrey" data-svelte-h="svelte-3iq1h9">murrey (mulberry)</option><option value="sanguine" data-svelte-h="svelte-1v3kxbs">sanguine (blood red)</option><option value="tenné" data-svelte-h="svelte-1dflx6b">tenné (brown)</option></select></div> <button class="svelte-1flz3eh" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-1flz3eh" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <button ${image === "" ? "disabled" : ""} class="svelte-1flz3eh">Save</button> <button ${image === "" ? "disabled" : ""} class="svelte-1flz3eh">Save as PNG</button> <p class="blazon svelte-1flz3eh">${escape(blazon)}</p> <div class="coat-of-arms svelte-1flz3eh"><!-- HTML_TAG_START -->${image}<!-- HTML_TAG_END --></div></section> ${$$result.head += `<!-- HEAD_svelte-1uc9z7x_START -->${$$result.title = `<title>Heraldry Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-1uc9z7x_END -->`, ""}`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-5999cd15.js.map
