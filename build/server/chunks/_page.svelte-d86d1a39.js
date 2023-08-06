import { c as create_ssr_component, f as each, e as escape } from './ssr-93f4de0f.js';
import { a as all } from './entries-623d0859.js';
import '@ironarachne/words';

const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let updates = all();
  return `${$$result.head += `<!-- HEAD_svelte-12i971l_START -->${$$result.title = `<title>Change Log | Iron Arachne</title>`, ""}<!-- HEAD_svelte-12i971l_END -->`, ""} <section class="changelog main"><h1 data-svelte-h="svelte-1vlksvq">Change Log</h1> ${each(updates, (update) => {
    return `<div><h2><!-- HTML_TAG_START -->${update.niceDate()}<!-- HTML_TAG_END --></h2> <ul>${each(update.updates, (text) => {
      return `<li>${escape(text)}</li>`;
    })}</ul> </div>`;
  })}</section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-d86d1a39.js.map
