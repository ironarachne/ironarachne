import { c as create_ssr_component, f as each, e as escape } from "../../../chunks/ssr.js";
import { g as getNiceDate, e as entries } from "../../../chunks/dates.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `<!-- HEAD_svelte-12i971l_START -->${$$result.title = `<title>Change Log | Iron Arachne</title>`, ""}<!-- HEAD_svelte-12i971l_END -->`, ""} <section class="changelog main"><h1 data-svelte-h="svelte-1vlksvq">Change Log</h1> ${each(entries, (entry) => {
    return `<div><h2><!-- HTML_TAG_START -->${getNiceDate(entry.date)}<!-- HTML_TAG_END --></h2> ${entry.summary != "" ? `<p>${escape(entry.summary)}</p>` : ``} <ul>${each(entry.updates, (text) => {
      return `<li>${escape(text)}</li>`;
    })}</ul> </div>`;
  })}</section>`;
});
export {
  Page as default
};
//# sourceMappingURL=_page.svelte.js.map
