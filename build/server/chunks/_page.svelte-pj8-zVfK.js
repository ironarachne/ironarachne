import { c as create_ssr_component, b as add_attribute, f as each, e as escape } from './ssr-kRdx30EW.js';
import random from 'random';
import * as RND from '@ironarachne/rng';
import './sentry-release-injection-file-ZosiLFNS.js';
import seedrandom from 'seedrandom';

function generate(config) {
  const numberOfGifts = random.int(config.min_gifts, config.max_gifts);
  const gifts = [];
  let possibilities = config.possibilities;
  for (let i = 0; i < numberOfGifts; i++) {
    const gift = generateGift(possibilities);
    gifts.push(gift);
    possibilities = removePossibility(possibilities, gift);
  }
  return gifts;
}
function generateGift(possibilities) {
  const possibility = RND.weighted(possibilities);
  const strength = RND.weighted(possibility.strength_levels);
  return {
    name: possibility.name,
    description: `${possibility.description} ${strength.description}`,
    strength: strength.strength
  };
}
function removePossibility(possibilities, gift) {
  return possibilities.filter((p) => p.name !== gift.name);
}
function all() {
  return [
    {
      name: "Bardic",
      description: "You have the ability to draw your audience into your music and make them experience images and emotions tied to it.",
      commonality: 5,
      strength_levels: [
        {
          description: "Your Bardic gift is weak, and you can only affect a few people at a time. The effect is subtle.",
          strength: 1,
          commonality: 5
        },
        {
          description: "Your Bardic gift is average, and you can affect a small group of people at a time. The effect is subtle.",
          strength: 2,
          commonality: 6
        },
        {
          description: "Your Bardic gift is stronger, and you can affect a large group of people at a time. However, the effect is subtle.",
          strength: 3,
          commonality: 3
        },
        {
          description: "Your Bardic gift is potent, and while you can only affect a handful of people, the effect is intense.",
          strength: 4,
          commonality: 2
        },
        {
          description: "Your Bardic gift is powerful, and you can affect a large group of people at a time. The effect is intense.",
          strength: 5,
          commonality: 1
        }
      ]
    },
    {
      name: "Earth-sense",
      description: "You can sense the health and status of the earth around you.",
      commonality: 5,
      strength_levels: [
        {
          description: "Your Earth-sense is weak, and you can only sense the earth around you.",
          strength: 1,
          commonality: 5
        },
        {
          description: "Your Earth-sense is average. You can sense the earth around you and a little beyond.",
          strength: 2,
          commonality: 6
        },
        {
          description: "Your Earth-sense is average. You can only sense the earth for a few miles around you, but it is very clear.",
          strength: 3,
          commonality: 3
        },
        {
          description: "Your Earth-sense is potent. You can sense the earth for several miles around you.",
          strength: 4,
          commonality: 2
        },
        {
          description: "Your Earth-sense is powerful. You can sense the earth for many miles around you. The feeling is deep and clear.",
          strength: 5,
          commonality: 1
        }
      ]
    },
    {
      name: "Empathy",
      description: "You can sense the emotions of others, and can sometimes influence them.",
      commonality: 5,
      strength_levels: [
        {
          description: "Your Empathy is weak, and you can only sense the emotions of a handful of people close at hand.",
          strength: 1,
          commonality: 5
        },
        {
          description: "Your Empathy is weak, and you can only sense the emotions of a handful of animals close at hand.",
          strength: 1,
          commonality: 5
        },
        {
          description: "Your Empathy is average, and you can sense the emotions of a handful of people or animals close at hand.",
          strength: 2,
          commonality: 6
        },
        {
          description: "Your Empathy is average, and you can sense the emotions of nearby people well.",
          strength: 2,
          commonality: 6
        },
        {
          description: "Your Empathy is average, and you can sense the emotions of nearby animals well.",
          strength: 2,
          commonality: 6
        },
        {
          description: "Your Empathy is strong, and you can sense the emotions of people for quite a distance. You have some subtle influence over them also.",
          strength: 3,
          commonality: 3
        },
        {
          description: "Your Empathy is strong, and you can sense the emotions of animals for quite a distance. You have some subtle influence over them also.",
          strength: 3,
          commonality: 3
        },
        {
          description: "Your Empathy is potent, and you can sense the emotions of people for a great distance. You have some influence over them.",
          strength: 4,
          commonality: 2
        },
        {
          description: "Your Empathy is potent, and you can sense the emotions of animals for a great distance. You have some influence over them.",
          strength: 4,
          commonality: 2
        },
        {
          description: "Your Empathy is powerful, and you can sense the emotions of people for a great distance. You have strong influence over them.",
          strength: 5,
          commonality: 1
        },
        {
          description: "Your Empathy is powerful, and you can sense the emotions of animals for a great distance. You have strong influence over them.",
          strength: 5,
          commonality: 1
        }
      ]
    },
    {
      name: "Fetching",
      description: "You can teleport things from place to place.",
      commonality: 5,
      strength_levels: [
        {
          description: "Your Fetching is weak, and you can only Fetch small objects that you're familiar with a short distance.",
          strength: 1,
          commonality: 5
        },
        {
          description: "Your Fetching is weak, and you can only Fetch small objects over a moderate distance.",
          strength: 2,
          commonality: 6
        },
        {
          description: "Your Fetching is average, and you can Fetch up to dog-sized objects over a moderate distance.",
          strength: 3,
          commonality: 3
        },
        {
          description: "Your Fetching is potent, and you can Fetch up to cow-sized objects over a great distance.",
          strength: 4,
          commonality: 2
        },
        {
          description: "Your Fetching is powerful, and you can Fetch up to horse-sized objects or even living things over a great distance.",
          strength: 5,
          commonality: 1
        }
      ]
    },
    {
      name: "Firestarting",
      description: "You can start fires with your mind.",
      commonality: 1,
      strength_levels: [
        {
          description: "You can conjure sparks and candleflames.",
          strength: 1,
          commonality: 10
        },
        {
          description: "You can summon torch-sized flames near at hand.",
          strength: 2,
          commonality: 15
        },
        {
          description: "You can conjure bonfires and campfires nearby.",
          strength: 3,
          commonality: 3
        },
        {
          description: "You can create torch-sized flames at a distance.",
          strength: 3,
          commonality: 3
        },
        {
          description: "You can summon bonfires up to a mile away.",
          strength: 4,
          commonality: 2
        },
        {
          description: "You can create house-sized conflagrations nearby.",
          strength: 5,
          commonality: 1
        },
        {
          description: "You can summon infernos the size of a village up to a mile away.",
          strength: 6,
          commonality: 1
        },
        {
          description: "You can cause entire valleys to erupt in flames.",
          strength: 7,
          commonality: 1
        }
      ]
    },
    {
      name: "Farsight",
      description: "You can send your senses to a distant place.",
      commonality: 5,
      strength_levels: [
        {
          description: "You have a vague sense of what's happening in the next room.",
          strength: 1,
          commonality: 5
        },
        {
          description: "You can see what's happening in the next room.",
          strength: 2,
          commonality: 6
        },
        {
          description: "You have a vague sense of what's happening up to a mile away.",
          strength: 2,
          commonality: 6
        },
        {
          description: "You can see what's happening in a particular area up to a mile away.",
          strength: 3,
          commonality: 3
        },
        {
          description: "You can see what's happening in a particular area many miles away.",
          strength: 4,
          commonality: 2
        },
        {
          description: "You can see what's happening in a particular area up to a hundred miles away.",
          strength: 5,
          commonality: 1
        }
      ]
    },
    {
      name: "Foresight",
      description: "You can see the future.",
      commonality: 5,
      strength_levels: [
        {
          description: "You get vague hunches about what's about to happen.",
          strength: 1,
          commonality: 8
        },
        {
          description: "You get accurate hunches about general events in the near future.",
          strength: 2,
          commonality: 10
        },
        {
          description: "You get accurate hunches about specific events in the near future.",
          strength: 3,
          commonality: 3
        },
        {
          description: "You can clearly envision specific events in the near future.",
          strength: 4,
          commonality: 2
        },
        {
          description: "You get accurate hunches about specific events in the distant future.",
          strength: 5,
          commonality: 1
        },
        {
          description: "You can clearly envision specific events in the distant future.",
          strength: 6,
          commonality: 1
        }
      ]
    },
    {
      name: "Healing",
      description: "You can heal the wounds of others with your mind.",
      commonality: 5,
      strength_levels: [
        {
          description: "You can Heal minor wounds, though the effort is taxing.",
          strength: 1,
          commonality: 5
        },
        {
          description: "You can Heal moderate wounds, or several minor wounds, before needing to rest.",
          strength: 2,
          commonality: 6
        },
        {
          description: "You can ease the pain of severe wounds and Heal moderate wounds.",
          strength: 3,
          commonality: 3
        },
        {
          description: "You can Heal severe wounds and Heal for hours without rest.",
          strength: 4,
          commonality: 2
        },
        {
          description: "You can Heal otherwise mortal wounds, though the effort costs you greatly.",
          strength: 5,
          commonality: 1
        }
      ]
    },
    {
      name: "Mage-Gift",
      description: "You can use true magic.",
      commonality: 1,
      strength_levels: [
        {
          description: "You have little more than hedge-wizard potential.",
          strength: 1,
          commonality: 10
        },
        {
          description: "You have Journeyman potential.",
          strength: 2,
          commonality: 15
        },
        {
          description: "You have Master potential.",
          strength: 3,
          commonality: 6
        },
        {
          description: "You have Adept potential.",
          strength: 4,
          commonality: 1
        }
      ]
    },
    {
      name: "Mindspeech",
      description: "You can speak mind-to-mind.",
      commonality: 5,
      strength_levels: [
        {
          description: "You can sense the surface thoughts of others close by and speak to a specific person.",
          strength: 1,
          commonality: 5
        },
        {
          description: "You can speak to multiple people close by.",
          strength: 2,
          commonality: 6
        },
        {
          description: "You can speak to multiple people or animals close by.",
          strength: 3,
          commonality: 3
        },
        {
          description: "You can speak to multiple people several miles away.",
          strength: 4,
          commonality: 2
        },
        {
          description: "You can speak to multiple people several miles away, and you can intrude on their deeper thoughts, if you are so inclined.",
          strength: 5,
          commonality: 1
        }
      ]
    }
  ];
}
const css = {
  code: 'div.svelte-4q74qx.svelte-4q74qx,h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx,p.svelte-4q74qx.svelte-4q74qx,label.svelte-4q74qx.svelte-4q74qx,section.svelte-4q74qx.svelte-4q74qx{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}section.svelte-4q74qx.svelte-4q74qx{display:block}@font-face{font-family:"alienleague";src:url("$lib/assets/fonts/alienleagueregular-9d3z-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}@font-face{font-family:"azonix";src:url("$lib/assets/fonts/azonix-webfont.woff2") format("woff2");font-weight:normal;font-style:normal}h1.svelte-4q74qx.svelte-4q74qx,h2.svelte-4q74qx.svelte-4q74qx{font-family:system-ui, Helvetica, sans-serif;margin:0.5rem 0}h1.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:700;font-size:2.5rem;line-height:2.5rem;padding:3px}h2.svelte-4q74qx.svelte-4q74qx{color:#000;font-weight:500;font-size:2.25rem;line-height:2.25rem;padding:3px}p.svelte-4q74qx.svelte-4q74qx{margin:1rem 0}label.svelte-4q74qx.svelte-4q74qx{font-weight:700;margin-right:1rem}input.svelte-4q74qx.svelte-4q74qx{font-size:1rem;line-height:1rem;padding:0.25rem}div.input-group.svelte-4q74qx.svelte-4q74qx{margin-bottom:1rem}section.main.svelte-4q74qx.svelte-4q74qx{padding:0.5rem}#seed.svelte-4q74qx.svelte-4q74qx{font-family:monospace}.fantasy.svelte-4q74qx button.svelte-4q74qx{background:rgb(92, 86, 73);background:linear-gradient(165deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);border:3px solid #5c5031;border-radius:3px;color:#fff;line-height:1rem;margin:0.1rem;padding:0.5rem 1rem}.fantasy.svelte-4q74qx button.svelte-4q74qx:active{background:rgb(92, 86, 73);background:linear-gradient(339deg, rgb(92, 86, 73) 0%, rgb(10, 10, 10) 100%);color:#76e841;transform:translateY(2px)}.fantasy.svelte-4q74qx button.svelte-4q74qx:disabled{background:#666;color:#777;border-color:#999}',
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let seed = RND.randomString(13);
  let gifts = [];
  function generate$1() {
    random.use(seedrandom(seed));
    const config = {
      possibilities: all(),
      max_gifts: 3,
      min_gifts: 1
    };
    gifts = generate(config);
  }
  function newSeed() {
    seed = RND.randomString(13);
    generate$1();
  }
  newSeed();
  $$result.css.add(css);
  return `${$$result.head += `<!-- HEAD_svelte-1hzkkss_START -->${$$result.title = `<title>Velgarth Gifts Generator | Iron Arachne</title>`, ""}<!-- HEAD_svelte-1hzkkss_END -->`, ""} <section class="fantasy main svelte-4q74qx"><h1 class="svelte-4q74qx" data-svelte-h="svelte-b7tjcl">Velgarth Gifts Generator</h1> <p class="svelte-4q74qx" data-svelte-h="svelte-1bpusl">This gives you a set of Gifts for a character from Mercedes Lackey&#39;s Velgarth setting.</p> <div class="input-group svelte-4q74qx"><label for="seed" class="svelte-4q74qx" data-svelte-h="svelte-1akft3f">Random Seed</label> <input type="text" name="seed" id="seed" class="svelte-4q74qx"${add_attribute("value", seed, 0)}></div> <button class="svelte-4q74qx" data-svelte-h="svelte-1u7zbd5">Generate From Seed</button> <button class="svelte-4q74qx" data-svelte-h="svelte-192mxrq">Random Seed (and Generate)</button> ${each(gifts, (gift) => {
    return `<div class="gift svelte-4q74qx"><h2 class="svelte-4q74qx">${escape(gift.name)}</h2> <p class="svelte-4q74qx">${escape(gift.description)}</p> </div>`;
  })}</section>`;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-pj8-zVfK.js.map
