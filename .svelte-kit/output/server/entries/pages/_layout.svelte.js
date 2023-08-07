import { c as create_ssr_component, e as escape, a as add_attribute, s as setContext, v as validate_component } from "../../chunks/ssr.js";
import { w as writable } from "../../chunks/index.js";
const Footer_svelte_svelte_type_style_lang = "";
const css$2 = {
  code: "footer.svelte-w31hxu{font-size:0.75rem;margin-top:1rem}",
  map: null
};
const Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let date = /* @__PURE__ */ new Date();
  let year = date.getFullYear();
  $$result.css.add(css$2);
  return `<footer class="svelte-w31hxu"><p>Copyright © ${escape(year)} Ben Overmyer. All rights reserved.</p> <p data-svelte-h="svelte-puo9y6">The source code for this site is available on <a href="https://github.com/ironarachne/ironarachne">GitHub</a>.</p> <p data-svelte-h="svelte-vx6t3u">Follow me on <a rel="me" href="https://fosstodon.org/@dungeonHack">Mastodon</a>.</p></footer>`;
});
const logo = "/_app/immutable/assets/logo.d4fc0042.png";
const Header_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: "header.svelte-1cmmfom.svelte-1cmmfom{background:rgb(0, 0, 0);background:linear-gradient(180deg, rgb(0, 0, 0) 0%, rgb(89, 89, 89) 100%);border-bottom:1px solid black;padding:0.5rem 0}header.svelte-1cmmfom img.svelte-1cmmfom{width:100%;max-width:512px}header.svelte-1cmmfom p.svelte-1cmmfom{display:inline-block;color:white;font-size:0.8rem;margin:0 0.5rem}nav.svelte-1cmmfom.svelte-1cmmfom{background:rgb(16, 17, 25);border-top:1px solid #fad037;border-bottom:1px solid #5c5031;padding:0}nav.svelte-1cmmfom ul.svelte-1cmmfom{margin:0;padding:0}nav.svelte-1cmmfom ul li.svelte-1cmmfom{display:inline-block;padding:0;margin:0}nav.svelte-1cmmfom ul li a.svelte-1cmmfom{display:inline-block;background:rgb(36, 14, 0);background:linear-gradient(0deg, rgb(36, 14, 0) 0%, rgb(48, 48, 48) 35%, rgb(106, 103, 92) 100%);border:1px solid #5c5031;color:#76e841;padding:0 0.25rem;margin:0.25rem 0 0.25rem 0.25rem;text-decoration:none}nav.svelte-1cmmfom ul li a.svelte-1cmmfom:hover{color:white}",
  map: null
};
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$1);
  return `<header class="svelte-1cmmfom" data-svelte-h="svelte-3kdd73"><img alt="Iron Arachne logo"${add_attribute("src", logo, 0)} class="svelte-1cmmfom"> <p class="svelte-1cmmfom">Tools for procedural generation of content for tabletop role-playing
    games</p></header> <nav class="svelte-1cmmfom" data-svelte-h="svelte-1moirq3"><ul class="svelte-1cmmfom"><li class="svelte-1cmmfom"><a href="/" class="svelte-1cmmfom">Home</a></li> <li class="svelte-1cmmfom"><a href="/navigation" class="svelte-1cmmfom">Navigation</a></li> <li class="svelte-1cmmfom"><a href="/changelog" class="svelte-1cmmfom">Change Log</a></li></ul></nav>`;
});
const _layout_svelte_svelte_type_style_lang = "";
const css = {
  code: '@import "$lib/styles/reset.scss";@import "$lib/styles/main.scss";',
  map: null
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  const user = writable();
  setContext("user", user);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  {
    user.set(data.user);
  }
  return `${validate_component(Header, "Header").$$render($$result, {}, {}, {})} ${slots.default ? slots.default({}) : ``} ${validate_component(Footer, "Footer").$$render($$result, {}, {}, {})}`;
});
export {
  Layout as default
};
//# sourceMappingURL=_layout.svelte.js.map
