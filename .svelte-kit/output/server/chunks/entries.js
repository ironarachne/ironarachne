import * as Words from "@ironarachne/words";
import "./sentry-release-injection-file.js";
function getMonthAbbr(month) {
  const months = [
    "Jan.",
    "Feb.",
    "Mar.",
    "Apr.",
    "May",
    "Jun.",
    "Jul.",
    "Aug.",
    "Sep.",
    "Oct.",
    "Nov.",
    "Dec."
  ];
  return months[month];
}
class ChangeLog {
  date;
  updates;
  constructor(date, updates) {
    this.date = date;
    this.updates = updates;
  }
  niceDate() {
    const components = this.date.split("-");
    const year = Number(components[0]);
    const month = Number(components[1]) - 1;
    const day = Number(components[2]);
    const fullDate = new Date(year, month, day);
    let ordinal = Words.getOrdinal(fullDate.getDate());
    let monthAbbr = getMonthAbbr(fullDate.getMonth());
    return `${monthAbbr} ${fullDate.getDate()}<sup>${ordinal}</sup>, ${fullDate.getFullYear()}`;
  }
}
function mostRecent(numberOfEntries) {
  const allEntries = all();
  let entries = [];
  for (let i = 0; i < numberOfEntries; i++) {
    entries.push(allEntries[i]);
  }
  return entries;
}
function all() {
  return [
    new ChangeLog("2023-08-08", [
      "Fixed an obscure bug in the religion generator with domains.",
      "Added the ability specify species mix for the religion generator.",
      "Added the ability to specify the category of religion in the religion generator.",
      "Changed the default species and category for the religion generator.",
      "Added more species options for the fantasy family generator.",
      "Fixed a bug in the Stars Without Number starship generator's model numbers."
    ]),
    new ChangeLog("2023-08-06", [
      "Added support for saving multiple cultures for later use.",
      "Rewrote the entire site to use SvelteKit instead of Svelte."
    ]),
    new ChangeLog("2023-06-14", ["Removed Reddit link."]),
    new ChangeLog("2023-05-22", [
      "Added support for the saved culture feature to the religion generator."
    ]),
    new ChangeLog("2023-05-18", [
      "Made it possible to save a culture from the culture generator for use in the region generator.",
      "Tweaked the heights of some of the fantasy species.",
      "Fixed a bug in the measurements converter for feet and inches."
    ]),
    new ChangeLog("2023-04-14", [
      "Expanded the results for the religion generator.",
      "Expanded the results for the culture generator.",
      "Expanded the possibilities for settlements in the region generator.",
      "Expanded the diversity of results for the chop shop generator."
    ]),
    new ChangeLog("2023-02-18", [
      "Fixed a bug with male height in species stats calculator.",
      "Added more descriptions to the biome generator."
    ]),
    new ChangeLog("2023-02-02", ["Changed the format of Ingenium Second Edition heritage stats."]),
    new ChangeLog("2022-11-21", [
      "Moved navigation from a sidebar to its own page.",
      "Removed two custom fonts.",
      "Redesigned the logo.",
      "Made other design tweaks.",
      "Switched to Vite for build and development."
    ]),
    new ChangeLog("2022-11-18", [
      "Made min rooms and max rooms for dungeon generator configurable."
    ]),
    new ChangeLog("2022-11-17", ["Added first version of AD&D 2e character generator."]),
    new ChangeLog("2022-10-01", [
      "Fixed a bug in culture generation with Elvish culture names.",
      "Updated the build process to use Node.js 18."
    ]),
    new ChangeLog("2022-07-29", ["Added more variety to the cyberpunk drug generator."]),
    new ChangeLog("2022-07-26", [
      "Improved display of language generator.",
      "Added more IPA phonemes to the language generator.",
      "Changed weighting of phonemes for the English-like phoneme set to reflect actual frequency of English phonemes."
    ]),
    new ChangeLog("2022-07-24", [
      "Added support for random sets in the word generator.",
      "Added Japanese-like names to the region generator.",
      "Added Elvish-like names to the region generator.",
      "Made regions use their name set for their ruling figures.",
      "Made region name set configurable.",
      "Displayed region sovereignties seperately from vassal realms.",
      "Added very basic language generator, to be expanded and integrated into other generators later."
    ]),
    new ChangeLog("2022-07-07", [
      "Changed how invented words are generated and added new tools to that system. This affects all generated names.",
      "Reworked the region generator to change how neighbors are constructed.",
      "Added a tool for testing invented word patterns."
    ]),
    new ChangeLog("2022-07-03", [
      "Added a handful of magic weapons to dungeon generation.",
      "Added a system for generating magic items to the dungeon generator."
    ]),
    new ChangeLog("2022-06-29", [
      "Added light sources to the dungeon generator.",
      "Reorganized dungeon generation code to be easier to read, and fixed a few bugs in the process."
    ]),
    new ChangeLog("2022-06-24", [
      "Added aarakocra, aasimar, centaur, dark elf, deep gnome, duergar, firbolg, high elf, and hobgoblin to sentient species.",
      "Fixed several bugs in the selection of sentient species during encounter creation."
    ]),
    new ChangeLog("2022-06-23", [
      "Added display of secret doors to dungeon map.",
      "Added GM text and player text to dungeon generator.",
      "Made secret doors in dungeon generator hidden on one side.",
      "Reworked dungeon generator room generation algorithm to include more loops.",
      "Added many more creatures and encounter types to the dungeon generator.",
      "Added threat levels as a generic challenge indicator to the dungeon generator.",
      "Expanded treasure hordes and made individual treasure carriable by characters.",
      "Added more variety to the types of rooms generated by the dungeon generator.",
      "Added equipment to character encounters in the dungeon generator.",
      "Added abilities to encounter display in the dungeon generator."
    ]),
    new ChangeLog("2022-06-09", [
      "Added a star nation generator.",
      "Did a little behind-the-scenes cleanup of the star system generator."
    ]),
    new ChangeLog("2022-06-05", [
      "Added the initial version of a dungeon generator.",
      "Added goblins, orcs, and trolls as sentient species.",
      "Added a creature system, only used by the dungeon generator right now.",
      "Added a treasure system, also only used for the dungeon generator so far."
    ]),
    new ChangeLog("2022-04-22", [
      "Tweaked the SVG rendering of planets in the star system generator to properly size them.",
      "Added comparison to Earth for some planet statistics, for context.",
      "Reorganized the planet and star generation code a bit behind the scenes.",
      "Made the graphics on the Planet Generator much more realistic."
    ]),
    new ChangeLog("2022-04-01", [
      "Added anchor and barrel heraldic charges.",
      "Added link to the source code in the footer."
    ]),
    new ChangeLog("2022-02-04", [
      "Added ability to allow or disallow occupations by race for DCC character generator.",
      "Expanded how culture taboos are generated.",
      "Rewrote how character, town, region, and culture names are generated.",
      "Rewrote how towns are structured to make it easier to implement certain future features.",
      "Added an environment/climate/biome system to add diversity to towns and regions.",
      "Made cultures use the religion generator for religion information.",
      "Added country and town name lists to the culture generator."
    ]),
    new ChangeLog("2022-01-27", ["Added tieflings."]),
    new ChangeLog("2022-01-23", [
      "Added about twenty new occupations to the DCC character generator.",
      "Fixed a bug in the DCC character generator where HP could be lower than 1.",
      "Made elf, dwarf, and halfling characters in the DCC character generator have names matching their cultures."
    ]),
    new ChangeLog("2022-01-22", [
      "Reworked the biome and climate system underlying region generation.",
      "Added geographic features to town descriptions.",
      "Added Dungeon Crawl Classics character generator."
    ]),
    new ChangeLog("2022-01-17", [
      "Added a fantasy family generator.",
      "Changed how personalities are generated to be faster and more rational.",
      "Reworked how species are structured to allow for a better physical trait system.",
      "Fixed a bug in age categories.",
      "Alphabetized the sidebar menu.",
      "Added a change log page for all the changes and modified the home page to only show the most recent."
    ]),
    new ChangeLog("2022-01-14", [
      "Fixed a bug where non-humans would always be women.",
      "Added names, types, and rulers to regions.",
      "Added claimant list to regions, including their heraldry.",
      "Added proper kingdom and empire generation subsystems instead of just names.",
      "Added ruler heraldry.",
      "Made unique name generators for each fantasy race.",
      "Expanded the options available to the underlying made-up word generation algorithm. Better names!",
      "Added dragonborn."
    ]),
    new ChangeLog("2021-11-19", [
      "Fixed a bug in the religion generator that was causing it to crash."
    ]),
    new ChangeLog("2021-11-18", [
      "Rewrote the heraldry system to allow much greater flexibility.",
      "Added the ability to specify the number of charges and their tincture to the heraldry generator.",
      "Expanded the variety of personality descriptions for characters."
    ]),
    new ChangeLog("2021-10-30", [
      "Expanded how gender is handled behind the scenes.",
      "Added male and female controls to Species Stats.",
      "Added a little more variety to character descriptions."
    ]),
    new ChangeLog("2021-10-16", ["Added spooky ship generator."]),
    new ChangeLog("2021-9-26", ["Added ability to filter heraldry charges by tag."]),
    new ChangeLog("2021-8-13", [
      "Fixed bug in seed generator that right-padded it with zeroes.",
      "Added more variety to town names.",
      "Made the random seed field monospace.",
      "Expanded the list of clothing in the fantasy equipment lists."
    ]),
    new ChangeLog("2021-7-13", [
      "Added more variety to biomes.",
      "Added an arms manufacturer generator.",
      "Fixed a bug in calculating ordinals for the changelog."
    ]),
    new ChangeLog("2021-7-9", [
      "Changed how star and planet names are constructed.",
      "Added a chance for inhabited planets to have a notable starport.",
      "Changed how planetary cultures and governments are generated."
    ]),
    new ChangeLog("2021-7-8", [
      "Rewrote the site from JavaScript + Vue + Webpack to TypeScript + Svelte + Rollup.",
      "Fixed several subtle bugs in the Stars Without Number generators.",
      "Made the heraldry generator faster.",
      "Changed how this change log is structured and displayed."
    ]),
    new ChangeLog("2021-5-2", [
      "Expanded culture generator with music style.",
      "Added social organization to the culture generator."
    ]),
    new ChangeLog("2021-4-21", ["Added a religion generator."]),
    new ChangeLog("2021-4-19", ["Made the magic weapon generator more flexible."]),
    new ChangeLog("2021-4-16", ["Added a magic weapon generator."]),
    new ChangeLog("2021-4-8", [
      "Added personality traits to character descriptions.",
      "Added notable members to organizations."
    ]),
    new ChangeLog("2021-3-2", [
      "Made barren planets a little deformed in WebGL rendering.",
      "Tweaked cloud layers on some planet types in WebGL rendering."
    ]),
    new ChangeLog("2021-3-1", [
      "Added model numbers to SWN starships.",
      "Added more detail to star generation.",
      "Added hazards to planet generation."
    ]),
    new ChangeLog("2021-2-26", [
      "Made star system generator and planet generator use the same underlying library for planet generation",
      "Updated button styles for each of the sections"
    ]),
    new ChangeLog("2021-2-25", [
      "Added the planet generator",
      "Fixed missing hardpoints attribute to SWN starship generator"
    ]),
    new ChangeLog("2021-2-11", [
      "Added missing speed and armor attributes to SWN starship generator",
      "Fixed an index bug in several generators",
      "Added the ability to save Uncharted Worlds characters",
      "Added a new town name generation scheme",
      "Made several major site design changes"
    ]),
    new ChangeLog("2021-2-8", ["Added Stars Without Number starship generator"]),
    new ChangeLog("2021-2-5", [
      "Fixed the download of heraldry images",
      "Added ability to download SWN characters"
    ]),
    new ChangeLog("2021-2-4", ["Stars Without Number character generator added"]),
    new ChangeLog("2021-1-25", ["Fantasy equipment list page has been added"]),
    new ChangeLog("2021-1-19", [
      "Planets in the Star System generator now have notable features added to their descriptions"
    ])
  ];
}
export {
  all as a,
  mostRecent as m
};
//# sourceMappingURL=entries.js.map
