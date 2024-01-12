import { c as create_ssr_component, f as each, e as escape } from './ssr-kRdx30EW.js';
import { c as convertCopper } from './currency2-qeFEp6oq.js';
import './sentry-release-injection-file-nUrLnAlE.js';

class EquipmentList {
  title;
  items;
  constructor(title, items) {
    this.title = title;
    this.items = items;
  }
}
class EquipmentItem {
  name;
  cost;
  constructor(name, cost) {
    this.name = name;
    this.cost = cost;
  }
}
class ClothingItem {
  name;
  materialType;
  materialAmount;
  constructor(name, materialType, materialAmount) {
    this.name = name;
    this.materialType = materialType;
    this.materialAmount = materialAmount;
  }
}
function all() {
  return [
    new EquipmentList("Books and Education", [
      new EquipmentItem("book", 1344),
      new EquipmentItem("fencing instruction (1 month)", 480),
      new EquipmentItem("monastery instruction (1 year)", 1920),
      new EquipmentItem("university instruction (1 year)", 2880)
    ]),
    new EquipmentList("Clothing", getClothingItems()),
    new EquipmentList("Drinks", [
      new EquipmentItem("ale, cheap (1 gallon)", 3),
      new EquipmentItem("ale, cheap (1 mug)", 1),
      new EquipmentItem("ale, good (1 gallon)", 6),
      new EquipmentItem("ale, good (1 mug)", 2),
      new EquipmentItem("beer, cheap (1 gallon)", 8),
      new EquipmentItem("beer, cheap (1 mug)", 2),
      new EquipmentItem("beer, good (1 gallon)", 24),
      new EquipmentItem("beer, good (1 mug)", 4),
      new EquipmentItem("mead, cheap (1 gallon)", 10),
      new EquipmentItem("mead, cheap (1 mug)", 3),
      new EquipmentItem("mead, good (1 gallon)", 28),
      new EquipmentItem("mead, good (1 mug)", 5),
      new EquipmentItem("wine, cheap (1 gallon)", 12),
      new EquipmentItem("wine, cheap (1 mug)", 2),
      new EquipmentItem("wine, good (1 gallon)", 32),
      new EquipmentItem("wine, good (1 mug)", 6)
    ]),
    new EquipmentList("Livestock", [
      new EquipmentItem("chicken", 2),
      new EquipmentItem("cow", 480),
      new EquipmentItem("goat", 57),
      new EquipmentItem("goose", 24),
      new EquipmentItem("ox", 584),
      new EquipmentItem("pig", 144),
      new EquipmentItem("sheep", 68)
    ]),
    new EquipmentList("Mounts", [
      new EquipmentItem("draught horse", 480),
      new EquipmentItem("riding horse", 2400),
      new EquipmentItem("war horse", 19200)
    ]),
    new EquipmentList("Property", [
      new EquipmentItem("castle", 5616e3),
      new EquipmentItem("church", 115200),
      new EquipmentItem("cottage", 1920),
      new EquipmentItem("craftsman's house", 9600),
      new EquipmentItem("merchant's house", 31680),
      new EquipmentItem("row house", 4800)
    ]),
    new EquipmentList("Tools", [
      new EquipmentItem("anvil", 240),
      new EquipmentItem("augur", 12),
      new EquipmentItem("axe", 20),
      new EquipmentItem("bellows", 360),
      new EquipmentItem("chisel", 16),
      new EquipmentItem("hammer", 32),
      new EquipmentItem("shovel", 8),
      new EquipmentItem("spade", 4),
      new EquipmentItem("spinning wheel", 40),
      new EquipmentItem("vice", 176),
      new EquipmentItem("yoke", 96)
    ])
  ];
}
function getClothingItems() {
  const items = [
    new ClothingItem("shirt", "cloth", 2),
    new ClothingItem("tunic", "cloth", 3),
    new ClothingItem("shoes", "cloth", 0.75),
    new ClothingItem("boots", "cloth", 1),
    new ClothingItem("tall boots", "leather", 1.2),
    new ClothingItem("dress", "cloth", 5),
    new ClothingItem("layered dress", "cloth", 12),
    new ClothingItem("leggings", "cloth", 2.2),
    new ClothingItem("trews", "cloth", 2),
    new ClothingItem("trousers", "cloth", 2.5),
    new ClothingItem("belt", "leather", 0.5),
    new ClothingItem("half-circle cloak", "cloth", 3),
    new ClothingItem("full-circle cloak", "cloth", 6),
    new ClothingItem("cape", "cloth", 2),
    new ClothingItem("cap", "cloth", 1),
    new ClothingItem("floppy hat", "cloth", 1.2),
    new ClothingItem("cavalier hat", "leather", 1.5),
    new ClothingItem("muffin hat", "cloth", 2),
    new ClothingItem("capitano hat", "cloth", 1.4)
  ];
  let equipmentItems = [];
  for (let i = 0; i < items.length; i++) {
    equipmentItems.push(
      new EquipmentItem(
        items[i].name + ", cheap",
        getClothingCost(items[i].materialType, items[i].materialAmount, "cheap")
      ),
      new EquipmentItem(
        items[i].name + ", fine",
        getClothingCost(items[i].materialType, items[i].materialAmount, "fine")
      ),
      new EquipmentItem(
        items[i].name + ", courtly",
        getClothingCost(items[i].materialType, items[i].materialAmount, "courtly")
      )
    );
  }
  return equipmentItems;
}
function getClothingCost(materialType, materialAmount, quality) {
  let result = materialAmount;
  if (materialType == "cloth") {
    result = result;
  } else {
    result = result * 2;
  }
  if (quality == "cheap") {
    result = result;
  } else if (quality == "fine") {
    result *= 2;
  } else {
    result *= 3;
  }
  result *= materialAmount * 24;
  return Math.floor(result + 8);
}
const css = {
  code: 'div.svelte-4q74qx.svelte-4q74qx,h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,p.svelte-4q74qx.svelte-4q74qx,ul.svelte-4q74qx.svelte-4q74qx,li.svelte-4q74qx.svelte-4q74qx,label.svelte-4q74qx.svelte-4q74qx,table.svelte-4q74qx.svelte-4q74qx,tbody.svelte-4q74qx.svelte-4q74qx,thead.svelte-4q74qx.svelte-4q74qx,tr.svelte-4q74qx.svelte-4q74qx,th.svelte-4q74qx.svelte-4q74qx,td.svelte-4q74qx.svelte-4q74qx,section.svelte-4q74qx.svelte-4q74qx{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-4q74qx.svelte-4q74qx{display:block}ul.svelte-4q74qx.svelte-4q74qx{list-style:none}table.svelte-4q74qx.svelte-4q74qx{border-collapse:collapse;border-spacing:0}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}p.svelte-4q74qx.svelte-4q74qx{margin:1rem 0}label.svelte-4q74qx.svelte-4q74qx{font-weight:700;margin-right:1rem}select.svelte-4q74qx.svelte-4q74qx{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-4q74qx.svelte-4q74qx{margin-bottom:1rem}ul.svelte-4q74qx li.svelte-4q74qx{list-style-type:disc;margin-left:2rem}table.svelte-4q74qx.svelte-4q74qx{width:100%}table.svelte-4q74qx thead tr.svelte-4q74qx{border-bottom:3px solid black}table.svelte-4q74qx thead tr th.svelte-4q74qx{font-weight:700;text-align:left}table.svelte-4q74qx th.svelte-4q74qx,table.svelte-4q74qx td.svelte-4q74qx{border:1px solid black;padding:0.25rem}section.main.svelte-4q74qx.svelte-4q74qx{padding:0.5rem}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let equipmentLists = all();
  function convertDNDCost(cost) {
    return convertCopper(cost, false, false);
  }
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-gt714g_START -->${$$result.title = `<title>Fantasy Equipment Lists | Iron Arachne</title>`, ""}<!-- HEAD_svelte-gt714g_END -->`, ""} <section class="fantasy main svelte-4q74qx"><h1 class="svelte-4q74qx" data-svelte-h="svelte-kzggkr">Fantasy Equipment Lists</h1> <p class="svelte-4q74qx" data-svelte-h="svelte-17k04rr">This page is meant to be a comprehensive list of equipment for fantasy
    games. It will be updated over time, so keep checking back for new
    entries.</p> <p class="svelte-4q74qx" data-svelte-h="svelte-cfiutn">Where possible, I&#39;ve based the prices off of historical data rather than
    fantasy sources. 1 copper coin is treated as equivalent to 1 farthing.</p> <div class="input-group svelte-4q74qx"><label for="currency" class="svelte-4q74qx" data-svelte-h="svelte-1eu2x3y">Currency Type</label> <select name="currency" class="svelte-4q74qx"><option value="D&D currency" data-svelte-h="svelte-k5a4x5">D&amp;D currency</option><option value="English currency" data-svelte-h="svelte-4cwnnn">English currency</option></select></div> ${`<div class="svelte-4q74qx" data-svelte-h="svelte-16gv19w"><ul class="svelte-4q74qx"><li class="svelte-4q74qx">cp: copper piece</li> <li class="svelte-4q74qx">sp: silver piece (worth 10 copper pieces)</li> <li class="svelte-4q74qx">ep: electrum piece (worth 50 copper pieces, rare)</li> <li class="svelte-4q74qx">gp: gold piece (worth 10 silver pieces)</li> <li class="svelte-4q74qx">pp: platinum piece (worth 10 gold pieces, rare)</li></ul></div>`} ${each(equipmentLists, (eList) => {
    return `<div class="equipment-list svelte-4q74qx"><h2 class="svelte-4q74qx">${escape(eList.title)}</h2> <table class="svelte-4q74qx"><thead class="svelte-4q74qx" data-svelte-h="svelte-yjjehb"><tr class="svelte-4q74qx"><th class="svelte-4q74qx">Name</th> <th class="svelte-4q74qx">Cost</th> </tr></thead> <tbody class="svelte-4q74qx">${each(eList.items, (equipment) => {
      return `<tr class="svelte-4q74qx"><td class="svelte-4q74qx">${escape(equipment.name)}</td> ${`<td class="svelte-4q74qx">${escape(convertDNDCost(equipment.cost))} </td>`} </tr>`;
    })} </tbody></table> </div>`;
  })}</section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-hqyBjdvO.js.map
