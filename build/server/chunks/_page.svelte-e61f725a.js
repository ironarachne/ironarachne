import { c as create_ssr_component, b as add_attribute, f as each, e as escape } from './ssr-93f4de0f.js';
import { g as getHumanVariant$1, a as getHumanVariant, j as convertMatrixToSummary } from './size_matrix-8d8a96c2.js';
import '@ironarachne/rng';
import './sentry-release-injection-file-50b0c374.js';
import './dice-02e4f861.js';
import 'random';

const css = {
  code: 'div.svelte-q6eyd7,h1.svelte-q6eyd7,h2.svelte-q6eyd7,h3.svelte-q6eyd7,h5.svelte-q6eyd7,p.svelte-q6eyd7,strong.svelte-q6eyd7,label.svelte-q6eyd7,section.svelte-q6eyd7{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-q6eyd7{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-q6eyd7,h2.svelte-q6eyd7,h3.svelte-q6eyd7,h5.svelte-q6eyd7{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}div.half-column.svelte-q6eyd7{font-size:0.7rem;margin-right:0.25rem}h1.svelte-q6eyd7{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-q6eyd7{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}h3.svelte-q6eyd7{font-size:2rem;line-height:2rem}h5.svelte-q6eyd7{font-size:1.25rem;border-bottom:1px solid #333}p.svelte-q6eyd7{margin:1rem 0}label.svelte-q6eyd7{font-weight:700;margin-right:1rem}input.svelte-q6eyd7{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-q6eyd7{margin-bottom:1rem}strong.svelte-q6eyd7{font-weight:700}section.main.svelte-q6eyd7{padding:0.5rem}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let maximumAge = 100;
  let femaleHeightModifier = 100;
  let femaleWeightModifier = 100;
  let maleHeightModifier = 100;
  let maleWeightModifier = 100;
  let femaleAgeCategories = [];
  let maleAgeCategories = [];
  let femaleSizeMatrix;
  let maleSizeMatrix;
  let femaleData = [];
  let maleData = [];
  let ingenium = {
    adultAge: 0,
    femaleHeight: "",
    maleHeight: "",
    femaleWeight: "",
    maleWeight: ""
  };
  function calculate() {
    console.debug("we calculate");
    let ageScale = maximumAge / 100;
    femaleAgeCategories = getHumanVariant$1(ageScale);
    maleAgeCategories = getHumanVariant$1(ageScale);
    femaleSizeMatrix = getHumanVariant(femaleWeightModifier / 100, femaleHeightModifier / 100);
    maleSizeMatrix = getHumanVariant(maleWeightModifier / 100, maleHeightModifier / 100);
    femaleData = convertMatrixToSummary(femaleSizeMatrix, femaleAgeCategories, "female");
    maleData = convertMatrixToSummary(maleSizeMatrix, maleAgeCategories, "male");
    getIngenium();
  }
  function getIngenium() {
    for (let i = 0; i < femaleData.length; i++) {
      if (femaleData[i].ageCategoryName == "adult") {
        ingenium.femaleHeight = femaleData[i].heightRange;
        ingenium.femaleWeight = femaleData[i].weightRange;
        ingenium.adultAge = femaleData[i].minAge;
      }
    }
    for (let i = 0; i < maleData.length; i++) {
      if (maleData[i].ageCategoryName == "adult") {
        ingenium.maleHeight = maleData[i].heightRange;
        ingenium.maleWeight = maleData[i].weightRange;
      }
    }
  }
  calculate();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-17hlivk_START -->${$$result.title = `<title>Species Stats Tool | Iron Arachne</title>`, ""}<!-- HEAD_svelte-17hlivk_END -->`, ""} <section class="main default svelte-q6eyd7"><h1 class="svelte-q6eyd7" data-svelte-h="svelte-awbm4l">Species Stats Tool</h1> <p class="svelte-q6eyd7" data-svelte-h="svelte-1g8jkan">This tool helps in the construction of non-human species. I built it to help me input standard
    fantasy species. To use it, just enter the percentage of human size you want to use for height and weight.</p> <p class="svelte-q6eyd7" data-svelte-h="svelte-ygrzoq">All numbers use modern human as a base.</p> <h2 class="svelte-q6eyd7" data-svelte-h="svelte-15f2bar">Settings</h2> <div class="input-group svelte-q6eyd7"><label for="maxAge" class="svelte-q6eyd7" data-svelte-h="svelte-1qi5z1f">Maximum Age (Years)</label> <input type="number" name="maxAge" id="maxAge" class="svelte-q6eyd7"${add_attribute("value", maximumAge, 0)}></div> <h3 class="svelte-q6eyd7" data-svelte-h="svelte-1a0j5cs">Female</h3> <div class="input-group svelte-q6eyd7"><label for="female-height" class="svelte-q6eyd7" data-svelte-h="svelte-arofo6">% of Base Height</label> <input type="number" name="female-height" id="height" class="svelte-q6eyd7"${add_attribute("value", femaleHeightModifier, 0)}></div> <div class="input-group svelte-q6eyd7"><label for="female-weight" class="svelte-q6eyd7" data-svelte-h="svelte-1axhoeq">% of Base Weight</label> <input type="number" name="female-weight" id="weight" class="svelte-q6eyd7"${add_attribute("value", femaleWeightModifier, 0)}></div> <h3 class="svelte-q6eyd7" data-svelte-h="svelte-1a2by6l">Male</h3> <div class="input-group svelte-q6eyd7"><label for="male-height" class="svelte-q6eyd7" data-svelte-h="svelte-dteqfb">% of Base Height</label> <input type="number" name="male-height" id="height" class="svelte-q6eyd7"${add_attribute("value", maleHeightModifier, 0)}></div> <div class="input-group svelte-q6eyd7"><label for="male-weight" class="svelte-q6eyd7" data-svelte-h="svelte-1yqm33n">% of Base Weight</label> <input type="number" name="male-weight" id="weight" class="svelte-q6eyd7"${add_attribute("value", maleWeightModifier, 0)}></div> <h2 class="svelte-q6eyd7" data-svelte-h="svelte-1fy5oi1">Calculated Stats</h2> <div style="display:flex" class="svelte-q6eyd7"><div class="half-column svelte-q6eyd7"><h3 class="svelte-q6eyd7" data-svelte-h="svelte-1a0j5cs">Female</h3> ${each(femaleData, (entry) => {
    return `<div class="svelte-q6eyd7"><h5 class="svelte-q6eyd7">${escape(entry.ageCategoryName)}</h5> <p class="svelte-q6eyd7"><strong class="svelte-q6eyd7" data-svelte-h="svelte-6np5e4">Age Range:</strong> ${escape(entry.minAge)} to ${escape(entry.maxAge)} years</p> <p class="svelte-q6eyd7"><strong class="svelte-q6eyd7" data-svelte-h="svelte-23ha4r">Female Height:</strong> ${escape(entry.heightRange)}</p> <p class="svelte-q6eyd7"><strong class="svelte-q6eyd7" data-svelte-h="svelte-1e84o02">Female Weight:</strong> ${escape(entry.weightRange)}</p> </div>`;
  })}</div> <div class="half-column svelte-q6eyd7"><h3 class="svelte-q6eyd7" data-svelte-h="svelte-1a2by6l">Male</h3> ${each(maleData, (entry) => {
    return `<div class="svelte-q6eyd7"><h5 class="svelte-q6eyd7">${escape(entry.ageCategoryName)}</h5> <p class="svelte-q6eyd7"><strong class="svelte-q6eyd7" data-svelte-h="svelte-6np5e4">Age Range:</strong> ${escape(entry.minAge)} to ${escape(entry.maxAge)} years</p> <p class="svelte-q6eyd7"><strong class="svelte-q6eyd7" data-svelte-h="svelte-23ha4r">Female Height:</strong> ${escape(entry.heightRange)}</p> <p class="svelte-q6eyd7"><strong class="svelte-q6eyd7" data-svelte-h="svelte-1e84o02">Female Weight:</strong> ${escape(entry.weightRange)}</p> </div>`;
  })}</div></div> <h2 class="svelte-q6eyd7" data-svelte-h="svelte-1jfhzxx">For Ingenium Second Edition</h2> <p class="svelte-q6eyd7" data-svelte-h="svelte-15bjd9x">This is for Ingenium Second Edition heritages.</p> <p class="svelte-q6eyd7"><strong class="svelte-q6eyd7" data-svelte-h="svelte-23ha4r">Female Height:</strong> ${escape(ingenium.femaleHeight)}</p> <p class="svelte-q6eyd7"><strong class="svelte-q6eyd7" data-svelte-h="svelte-ygiwwu">Male Height:</strong> ${escape(ingenium.maleHeight)}</p> <p class="svelte-q6eyd7"><strong class="svelte-q6eyd7" data-svelte-h="svelte-1e84o02">Female Weight:</strong> ${escape(ingenium.femaleWeight)}</p> <p class="svelte-q6eyd7"><strong class="svelte-q6eyd7" data-svelte-h="svelte-khhvoj">Male Weight:</strong> ${escape(ingenium.maleWeight)}</p> <p class="svelte-q6eyd7"><strong class="svelte-q6eyd7" data-svelte-h="svelte-1ffshkn">Adult Age:</strong> ${escape(ingenium.adultAge)}</p> <p class="svelte-q6eyd7"><strong class="svelte-q6eyd7" data-svelte-h="svelte-1owaoo4">Maximum Lifespan:</strong> ${escape(maximumAge)}</p></section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-e61f725a.js.map
