import { c as create_ssr_component, e as escape, f as each } from "../../chunks/ssr.js";
import { e as entries, g as getNiceDate } from "../../chunks/dates.js";
import "../../chunks/sentry-release-injection-file.js";
function mostRecent(numberOfEntries2, entries2) {
  let result = [];
  for (let i = 0; i < numberOfEntries2; i++) {
    result.push(entries2[i]);
  }
  return result;
}
let numberOfEntries = 5;
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let updates = mostRecent(numberOfEntries, entries);
  return `${$$result.head += `<!-- HEAD_svelte-82n2nj_START -->${$$result.title = `<title>Iron Arachne</title>`, ""}<!-- HEAD_svelte-82n2nj_END -->`, ""} <section class="home main default"><p data-svelte-h="svelte-3zhbjo">Welcome to Iron Arachne!</p> <p data-svelte-h="svelte-1men4ef">This site lets you randomly generate content for tabletop role-playing games
    and other fictional works. I&#39;m always tinkering with it, so come back every
    so often to see if something new&#39;s been added.</p> <p data-svelte-h="svelte-1gdjixg">My name is Ben, and I&#39;m the author of this site and all of the tools on it.
    You can find my personal website and blog at
    <a href="https://benovermyer.com">benovermyer.com</a>. Sometimes I&#39;ll write
    about what I&#39;m working on for Iron Arachne over there.</p> <p data-svelte-h="svelte-ma0zzg">If you find this site useful, please consider buying me a coffee.</p> <div class="center" data-svelte-h="svelte-1uoc47l"><a href="https://www.buymeacoffee.com/benovermyer" target="_blank" rel="noreferrer"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-green.png" alt="Buy Me A Coffee" style="height: 60px !important; width: 217px !important"></a></div> <h2 data-svelte-h="svelte-1ilflpg">Recent Changes</h2> <p>Showing the ${escape(numberOfEntries)} most recent change log entries.</p> ${each(updates, (update) => {
    return `<div><h3><!-- HTML_TAG_START -->${getNiceDate(update.date)}<!-- HTML_TAG_END --></h3> ${update.summary != "" ? `<p>${escape(update.summary)}</p>` : ``} <ul>${each(update.updates, (text) => {
      return `<li>${escape(text)}</li>`;
    })}</ul> </div>`;
  })}</section>`;
});
export {
  Page as default
};
//# sourceMappingURL=_page.svelte.js.map
