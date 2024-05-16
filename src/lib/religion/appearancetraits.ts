import type AppearanceTrait from "$lib/appearance/trait.js";
import * as AppearanceTraits from "$lib/appearance/traits.js";
import type RealmConcept from "./realms/realmconcept.js";

export const allTraits = [
  { phrase: "six feathered wings", bodyPart: "wings", tags: ["sky"] },
  { phrase: "four feathered wings", bodyPart: "wings", tags: ["sky"] },
  { phrase: "two large feathered wings", bodyPart: "wings", tags: ["sky", "dreamlike"] },
  { phrase: "large leathery wings", bodyPart: "wings", tags: ["sky", "death"] },
  { phrase: "a lion's tail'", bodyPart: "tail", tags: ["earth", "forest"] },
  { phrase: "a whip-like tail", bodyPart: "tail", tags: ["earth", "death"] },
  { phrase: "two tails", bodyPart: "tail", tags: ["alien"] },
  { phrase: "the horns of a goat", bodyPart: "horns", tags: ["earth", "forest"] },
  { phrase: "the horns of a ram", bodyPart: "horns", tags: ["earth", "forest"] },
  { phrase: "the antlers of a stag", bodyPart: "horns", tags: ["forest"] },
  { phrase: "the antlers of a deer", bodyPart: "horns", tags: ["forest", "surreal"] },
  { phrase: "short, pointed horns", bodyPart: "horns", tags: ["earth", "death"] },
  { phrase: "tall, straight horns", bodyPart: "horns", tags: ["earth", "death"] },
  { phrase: "glowing blue eyes", bodyPart: "eyes", tags: ["water"] },
  { phrase: "glowing yellow eyes", bodyPart: "eyes", tags: ["sky", "water"] },
  { phrase: "glowing red eyes", bodyPart: "eyes", tags: ["earth", "death", "alien"] },
  { phrase: "glowing orange eyes", bodyPart: "eyes", tags: ["earth", "sky"] },
  { phrase: "glowing green eyes", bodyPart: "eyes", tags: ["earth", "forest"] },
  { phrase: "glowing purple eyes", bodyPart: "eyes", tags: ["death", "alien"] },
  { phrase: "eyes that burn with an inner fire", bodyPart: "eyes", tags: ["sky"] },
  { phrase: "four eyes", bodyPart: "eyes", tags: ["alien"] },
  { phrase: "six eyes", bodyPart: "eyes", tags: ["alien"] },
  { phrase: "eight eyes", bodyPart: "eyes", tags: ["alien"] },
  { phrase: "no eyes", bodyPart: "eyes", tags: ["death", "alien"] },
  { phrase: "reptilian eyes", bodyPart: "eyes", tags: ["forest", "earth"] },
  { phrase: "scales instead of skin", bodyPart: "skin", tags: ["earth", "forest"] },
  { phrase: "skin that glows faintly", bodyPart: "skin", tags: ["sky"] },
  { phrase: "skin made of living rock", bodyPart: "skin", tags: ["earth"] },
  { phrase: "blue skin", bodyPart: "skin", tags: ["water"] },
  { phrase: "green skin", bodyPart: "skin", tags: ["water"] },
  { phrase: "crystalline skin", bodyPart: "skin", tags: ["earth"] },
  { phrase: "translucent grey skin", bodyPart: "skin", tags: ["death"] },
  { phrase: "dull grey skin", bodyPart: "skin", tags: ["death"] },
  { phrase: "skin covered in leaves", bodyPart: "skin", tags: ["forest"] },
  { phrase: "skin made of star-lit blackness", bodyPart: "skin", tags: ["alien"] },
  { phrase: "iridescent skin", bodyPart: "skin", tags: ["alien", "surreal"] },
  { phrase: "eight tentacles", bodyPart: "tentacles", tags: ["alien"] },
  { phrase: "six tentacles", bodyPart: "tentacles", tags: ["alien"] },
  { phrase: "four tentacles", bodyPart: "tentacles", tags: ["alien"] },
  { phrase: "the head of a lion", bodyPart: "head", tags: ["forest"] },
  { phrase: "the head of a bear", bodyPart: "head", tags: ["forest"] },
  { phrase: "the head of a dragon", bodyPart: "head", tags: ["earth", "forest"] },
  { phrase: "the head of a swan", bodyPart: "head", tags: ["sky", "water"] },
  { phrase: "the head of a deer", bodyPart: "head", tags: ["forest"] },
  { phrase: "the head of a cat", bodyPart: "head", tags: ["earth", "desert"] },
  { phrase: "the head of a wolf", bodyPart: "head", tags: ["earth", "forest"] },
  { phrase: "twelve feathered wings", bodyPart: "wings", tags: ["sky", "dreamlike"] },
  { phrase: "bat-like wings", bodyPart: "wings", tags: ["night", "moon"] },
  { phrase: "insect-like wings", bodyPart: "wings", tags: ["earth", "forest"] },
  { phrase: "crystal-clear wings", bodyPart: "wings", tags: ["sky", "surreal"] },
  { phrase: "feathered wings that shimmer", bodyPart: "wings", tags: ["sky", "water"] },
  { phrase: "a serpent's tail", bodyPart: "tail", tags: ["earth", "water"] },
  { phrase: "a tail with a bioluminescent tip", bodyPart: "tail", tags: ["water", "surreal"] },
  { phrase: "three tails", bodyPart: "tail", tags: ["surreal"] },
  { phrase: "twisted horns with glowing runes", bodyPart: "horns", tags: ["magic", "surreal"] },
  { phrase: "curved horns with gemstone inlays", bodyPart: "horns", tags: ["earth", "wealth"] },
  { phrase: "feathery antlers with ethereal wisps", bodyPart: "horns", tags: ["forest", "dreamlike"] },
  { phrase: "horns that emit a haunting melody", bodyPart: "horns", tags: ["earth", "music"] },
  { phrase: "pearlescent eyes that change colors", bodyPart: "eyes", tags: ["sky", "water"] },
  { phrase: "eyes with galaxies swirling within", bodyPart: "eyes", tags: ["sky", "cosmic"] },
  { phrase: "eyes that see into other dimensions", bodyPart: "eyes", tags: ["surreal", "alien"] },
  { phrase: "eyes with a mesmerizing hypnotic gaze", bodyPart: "eyes", tags: ["magic", "surreal"] },
  { phrase: "eyes that mirror the emotions of others", bodyPart: "eyes", tags: ["empathy", "surreal"] },
  { phrase: "eyes that emit sparks of lightning", bodyPart: "eyes", tags: ["storm", "electricity"] },
  { phrase: "eyes on flexible stalks", bodyPart: "eyes", tags: ["alien", "surreal"] },
  { phrase: "molten lava-like skin", bodyPart: "skin", tags: ["volcano", "fire"] },
  { phrase: "shimmering opalescent skin", bodyPart: "skin", tags: ["sky", "water"] },
  { phrase: "butterfly wings with shifting patterns", bodyPart: "wings", tags: ["dream", "surreal"] },
  { phrase: "floating ethereal wings of light", bodyPart: "wings", tags: ["dream", "surreal"] },
  { phrase: "wings made of iridescent mist", bodyPart: "wings", tags: ["dream", "surreal"] },
  { phrase: "feathers that change color with emotions", bodyPart: "wings", tags: ["dream", "empathy"] },
  { phrase: "a tail of shimmering stardust", bodyPart: "tail", tags: ["dream", "cosmic"] },
  { phrase: "tail that trails rainbows as you move", bodyPart: "tail", tags: ["dream", "surreal"] },
  { phrase: "a tail with glowing constellations", bodyPart: "tail", tags: ["dream", "cosmic"] },
  { phrase: "horns that emit soft, soothing melodies", bodyPart: "horns", tags: ["dream", "music"] },
  { phrase: "horns adorned with floating gemstones", bodyPart: "horns", tags: ["dream", "surreal"] },
  { phrase: "horns that sparkle like starlight", bodyPart: "horns", tags: ["dream", "cosmic"] },
  { phrase: "eyes that reflect the landscapes of dreams", bodyPart: "eyes", tags: ["dream", "surreal"] },
  { phrase: "eyes with ever-changing patterns of light", bodyPart: "eyes", tags: ["dream", "surreal"] },
  { phrase: "eyes that shimmer like enchanted pools", bodyPart: "eyes", tags: ["dream", "water"] },
  { phrase: "skin that shifts like flowing watercolors", bodyPart: "skin", tags: ["dream", "surreal"] },
  { phrase: "skin that glows softly with inner thoughts", bodyPart: "skin", tags: ["dream", "empathy"] },
  { phrase: "skin covered in delicate, luminescent vines", bodyPart: "skin", tags: ["dream", "forest"] },
  { phrase: "skin that shimmers like a mirage", bodyPart: "skin", tags: ["dream", "desert"] },
  { phrase: "skin that resembles the surface of a nebula", bodyPart: "skin", tags: ["dream", "cosmic"] },
  { phrase: "skin that changes texture with emotions", bodyPart: "skin", tags: ["dream", "empathy"] },
  { phrase: "a head crowned with floating ethereal flames", bodyPart: "head", tags: ["dream", "fire"] },
  { phrase: "a head with a halo of radiant energy", bodyPart: "head", tags: ["dream", "surreal"] },
  { phrase: "fiery wings with ember-like feathers", bodyPart: "wings", tags: ["fire", "heat"] },
  { phrase: "wings that resemble molten lava flows", bodyPart: "wings", tags: ["fire", "earth"] },
  { phrase: "smoldering wings that leave trails of sparks", bodyPart: "wings", tags: ["fire", "surreal"] },
  { phrase: "earthen wings with intricate rock formations", bodyPart: "wings", tags: ["earth", "mountain"] },
  { phrase: "wings made of intertwined vines and roots", bodyPart: "wings", tags: ["earth", "forest"] },
  { phrase: "crystalline wings that shimmer like gemstones", bodyPart: "wings", tags: ["earth", "jewel"] },
  { phrase: "a tail with a fiery, flickering tip", bodyPart: "tail", tags: ["fire", "surreal"] },
  { phrase: "tail adorned with rugged, earthy textures", bodyPart: "tail", tags: ["earth", "mountain"] },
  { phrase: "tail with geode-like patterns and colors", bodyPart: "tail", tags: ["earth", "jewel"] },
  { phrase: "horns that resemble twisting flames", bodyPart: "horns", tags: ["fire", "heat"] },
  { phrase: "horns made of sturdy, petrified wood", bodyPart: "horns", tags: ["earth", "forest"] },
  { phrase: "horns with patterns reminiscent of ancient runes", bodyPart: "horns", tags: ["earth", "magic"] },
  { phrase: "eyes that flicker like burning embers", bodyPart: "eyes", tags: ["fire", "heat"] },
  { phrase: "eyes with deep, earthy hues like rich soil", bodyPart: "eyes", tags: ["earth", "nature"] },
  { phrase: "eyes that reflect the molten core of the earth", bodyPart: "eyes", tags: ["earth", "cosmic"] },
  { phrase: "skin that glows with inner fire", bodyPart: "skin", tags: ["fire", "surreal"] },
  { phrase: "skin with a texture resembling cracked earth", bodyPart: "skin", tags: ["earth", "desert"] },
  { phrase: "skin covered in intricate, glowing tribal patterns", bodyPart: "skin", tags: ["earth", "magic"] },
  { phrase: "a head crowned with blazing, fiery tendrils", bodyPart: "head", tags: ["fire", "surreal"] },
  { phrase: "a head with rugged, stone-like features", bodyPart: "head", tags: ["earth", "mountain"] },
  { phrase: "a head adorned with gemstone-encrusted horns", bodyPart: "head", tags: ["earth", "jewel"] },
];

export function byRealmConcept(concept: RealmConcept): AppearanceTrait[] {
  return AppearanceTraits.byAnyTag(allTraits, concept.appearanceTags);
}