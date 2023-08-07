import { c as create_ssr_component, a as add_attribute, e as escape } from "../../../chunks/ssr.js";
import * as RND from "@ironarachne/rng";
import * as Words from "@ironarachne/words";
import "../../../chunks/sentry-release-injection-file.js";
import random from "random";
import seedrandom from "seedrandom";
function generate() {
  let description = `${Words.capitalize(randomIntro())} ${randomOrigin()} ${randomTwist()}`;
  return description;
}
function randomSize() {
  return RND.item(["gigantic", "immense", "large", "huge", "colossal", "vast"]);
}
function randomShip() {
  return RND.item([
    "derelict",
    "freighter",
    "hulk",
    "mining vessel",
    "warship",
    "passenger liner",
    "merchant ship"
  ]);
}
function randomIntro() {
  let size = randomSize();
  let part1 = RND.item([
    `${Words.article(size)} ${size} ${randomShip()} ${RND.item([
      "drifts",
      "floats"
    ])} in space ${RND.item(["in front of you", "here"])}, `,
    `a ${randomShip()} of ${size} proportions is adrift here, `
  ]);
  let part2 = RND.item([
    "its outer hull breached in several places.",
    "surrounded by strange, dancing lights.",
    "partially obscured by a thick, dark nebula.",
    "its hull shattered and fragmented.",
    "floating endlessly in the vast nothinginess of space.",
    "floating in a cloud of debris.",
    "inexorably being drawn towards a nearby star."
  ]);
  return part1 + part2;
}
function randomOrigin() {
  return RND.item([
    "It matches no known ship design you've ever seen.",
    "It appears to be of an ancient design.",
    "There is something distinctly alien about its features.",
    "The ship's contours make it seem familiar, but all identification is obscured or destroyed.",
    "While the ship's design is familiar, it appears to have been heavily modified.",
    "The ship's barely recognizable but it is definitely a model familiar to you."
  ]);
}
function randomTwist() {
  return RND.item([
    "Strangely, you are getting life readings from deep within it...",
    "There appears to be an active power source somewhere on the ship.",
    "A distress beacon from the ship beeps weakly.",
    "There is evidence of a fire fight, but the weapon marks match nothing in your experience.",
    "Gashes have been ripped in the hull in some places. They appear to be made by... claws?",
    "Thick layers of ice surround several rips in the hull.",
    "Faint filaments of light surround the vessel, reminiscent of string loosely tangled around something.",
    "Several holes have been burned into the hull. The burn marks are consistent with damage caused by acid.",
    "Fire has consumed several sections of the ship, but it appears that some compartments still hold atmosphere."
  ]);
}
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: 'div.svelte-fmhe6u.svelte-fmhe6u,h1.svelte-fmhe6u.svelte-fmhe6u,p.svelte-fmhe6u.svelte-fmhe6u,label.svelte-fmhe6u.svelte-fmhe6u,section.svelte-fmhe6u.svelte-fmhe6u{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-fmhe6u.svelte-fmhe6u{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-fmhe6u.svelte-fmhe6u{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-fmhe6u.svelte-fmhe6u{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}p.svelte-fmhe6u.svelte-fmhe6u{margin:1rem 0}label.svelte-fmhe6u.svelte-fmhe6u{font-weight:700;margin-right:1rem}input.svelte-fmhe6u.svelte-fmhe6u{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-fmhe6u.svelte-fmhe6u{margin-bottom:1rem}section.main.svelte-fmhe6u.svelte-fmhe6u{padding:0.5rem}#seed.svelte-fmhe6u.svelte-fmhe6u{font-family:monospace}.scifi.svelte-fmhe6u.svelte-fmhe6u{background:rgb(16, 17, 25);background:linear-gradient(90deg, rgb(16, 17, 25) 0%, rgb(38, 58, 96) 49%, rgb(16, 17, 25) 100%);color:white}.scifi.svelte-fmhe6u h1.svelte-fmhe6u{color:#a2d4ff;text-shadow:0 0 6px #0086ff;font-family:"alienleague", sans-serif}.scifi.svelte-fmhe6u button.svelte-fmhe6u{background:rgb(2, 37, 95);background:linear-gradient(165deg, rgb(2, 37, 95) 0%, rgb(10, 10, 10) 100%);border:3px solid rgb(108, 146, 255);border-radius:3px;color:#fff;font-family:"alienleague", sans-serif;font-size:1.15rem;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.scifi.svelte-fmhe6u button.svelte-fmhe6u:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:rgb(108, 146, 255);transform:translateY(2px)}.scifi.svelte-fmhe6u button.svelte-fmhe6u:disabled{background:#666;color:#777;border-color:#999}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let description = "";
  let seed = RND.randomString(13);
  function generateSpookyShip() {
    random.use(seedrandom(seed));
    description = generate();
  }
  function newSeed() {
    seed = RND.randomString(13);
    generateSpookyShip();
  }
  newSeed();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-15tnbzb_START -->${$$result.title = `<title>Spooky Ship Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-15tnbzb_END -->`, ""} <section class="scifi main svelte-fmhe6u"><h1 class="svelte-fmhe6u" data-svelte-h="svelte-kl72r6">Spooky Ship Generator</h1> <p class="svelte-fmhe6u" data-svelte-h="svelte-1jftell">This was done for the October 2021 Generator Challenge, from r/rpg_generators.</p> <div class="input-group svelte-fmhe6u"><label for="seed" class="svelte-fmhe6u" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-fmhe6u"${add_attribute("value", seed, 0)}></div> <button class="svelte-fmhe6u" data-svelte-h="svelte-143pab2">Generate From Seed</button> <button class="svelte-fmhe6u" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> <p class="svelte-fmhe6u">${escape(description)}</p></section>`;
});
export {
  Page as default
};
//# sourceMappingURL=_page.svelte.js.map
