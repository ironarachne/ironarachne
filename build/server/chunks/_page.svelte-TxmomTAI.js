import { c as create_ssr_component, b as add_attribute, f as each, e as escape } from './ssr-kRdx30EW.js';
import { allElements } from '@ironarachne/word-generator';

const css = {
  code: 'div.svelte-q6eyd7.svelte-q6eyd7,h1.svelte-q6eyd7.svelte-q6eyd7,h2.svelte-q6eyd7.svelte-q6eyd7,p.svelte-q6eyd7.svelte-q6eyd7,ul.svelte-q6eyd7.svelte-q6eyd7,li.svelte-q6eyd7.svelte-q6eyd7,label.svelte-q6eyd7.svelte-q6eyd7,section.svelte-q6eyd7.svelte-q6eyd7{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-q6eyd7.svelte-q6eyd7{display:block}ul.svelte-q6eyd7.svelte-q6eyd7{list-style:none}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-q6eyd7.svelte-q6eyd7,h2.svelte-q6eyd7.svelte-q6eyd7{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-q6eyd7.svelte-q6eyd7{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-q6eyd7.svelte-q6eyd7{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}p.svelte-q6eyd7.svelte-q6eyd7{margin:1rem 0}label.svelte-q6eyd7.svelte-q6eyd7{font-weight:700;margin-right:1rem}input.svelte-q6eyd7.svelte-q6eyd7{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-q6eyd7.svelte-q6eyd7{margin-bottom:1rem}ul.svelte-q6eyd7 li.svelte-q6eyd7{list-style-type:disc;margin-left:2rem}section.default.svelte-q6eyd7 button.svelte-q6eyd7{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;font-size:1rem;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}section.default.svelte-q6eyd7 button.svelte-q6eyd7:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}section.default.svelte-q6eyd7 button.svelte-q6eyd7:disabled{background:#666;color:#777;border-color:#999}section.main.svelte-q6eyd7.svelte-q6eyd7{padding:0.5rem}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let elements = allElements;
  let html = "<table><thead><tr><th>Name</th><th>Symbol</th><th>Elements</th></tr></thead><tbody>";
  for (let i = 0; i < elements.length; i++) {
    html += "<tr><td>" + elements[i].name + "</td><td>" + elements[i].symbol + "</td><td>" + elements[i].elements.join(", ") + "</td></tr>";
  }
  html += "</tbody></table>";
  let pattern = "";
  let numberOfWords = 10;
  let words = [];
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-1yaayew_START -->${$$result.title = `<title>Word Generator Cheat Sheet | Iron Arachne</title>`, ""}<!-- HEAD_svelte-1yaayew_END -->`, ""} <section class="main default svelte-q6eyd7"><h1 class="svelte-q6eyd7" data-svelte-h="svelte-xhveyt">Word Generator Cheat Sheet</h1> <p class="svelte-q6eyd7" data-svelte-h="svelte-a085ni">This is meant only for development reference.</p> <p class="svelte-q6eyd7" data-svelte-h="svelte-1d9o932">Enclosing several comma-separated patterns in parentheses will make the parser choose one of those to add to the word.</p> <p class="svelte-q6eyd7" data-svelte-h="svelte-fr84t2">Outside of the above, adding a + will duplicate the previous character after its processing.</p> <div class="input-group svelte-q6eyd7"><label for="pattern" class="svelte-q6eyd7" data-svelte-h="svelte-1ylbqhu">Pattern</label> <input type="text" name="pattern" id="pattern" class="svelte-q6eyd7"${add_attribute("value", pattern, 0)}></div> <div class="input-group svelte-q6eyd7"><label for="number-of-words" class="svelte-q6eyd7" data-svelte-h="svelte-1itmhla">Number of Words</label> <input type="number" name="number-of-words" id="number-of-words" class="svelte-q6eyd7"${add_attribute("value", numberOfWords, 0)}></div> <button class="svelte-q6eyd7" data-svelte-h="svelte-41x9ys">Generate</button> <ul class="svelte-q6eyd7">${each(words, (word) => {
    return `<li class="svelte-q6eyd7">${escape(word)}</li>`;
  })}</ul> <h2 class="svelte-q6eyd7" data-svelte-h="svelte-2ps45h">Element Reference</h2> <!-- HTML_TAG_START -->${html}<!-- HTML_TAG_END --></section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-TxmomTAI.js.map
