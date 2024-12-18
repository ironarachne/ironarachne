export default [
  {
    date: "2024-12-02",
    summary: "Behind-the-scenes fixes and updates.",
    updates: [
      "Reworked the cyberpunk drug generator's structure.",
      "Updated to Svelte 5.",
      "Fixed the magic weapon generator not using the new lock seed pattern.",
    ]
  },
  {
    date: "2024-11-26",
    summary: "Big foundational change that will affect regions, dungeons, and others later on.",
    updates: [
      "Wrote a new system for environment generation, including biomes, climates, and ecosystems.",
      "Added 'Lock Seed' checkbox instead of a button.",
    ]
  },
  {
    date: "2024-09-22",
    summary: "",
    updates: ["Fixed a bug in the region generator related to organizations."],
  },
  {
    date: "2024-09-03",
    summary: "",
    updates: ["Fixed several bugs in the organization generator.", "Added more organization customization options."],
  },
  {
    date: "2024-01-23",
    summary: "",
    updates: ["Added Velgarth Gifts generator."],
  },
  {
    date: "2024-01-12",
    summary: "",
    updates: ["Upgraded SvelteKit to v2"],
  },
  {
    date: "2024-01-09",
    summary: "",
    updates: [
      "Added more detail to planet descriptions.",
      "Added day length to planets.",
    ],
  },
  {
    date: "2023-12-21",
    summary: "",
    updates: ["Revamped all the planet shaders.", "Added star shaders."],
  },
  {
    date: "2023-11-23",
    summary: "",
    updates: [
      "Restructured how heraldry is built.",
      "Render heraldry in most places as PNG instead of SVG.",
      "Updated to a new version of the made-up-names package.",
      "Fixed a massive performance problem with the planet generator.",
      "Swapped out the SVG generator for the new WebGL generator for planet images on the star system and star nation generators.",
    ],
  },
  {
    date: "2023-09-10",
    summary: "Huge rework to species, environment, and encounter generation.",
    updates: [
      "Changed how threat level is calculated for encounters.",
      "Added more depth to abilities.",
      "Reworked how creatures, characters, and species are handled.",
      "Refactored a lot of code to not use classes.",
      "Split age data and size data into separate concepts.",
      "Changed a few things about how environments are generated.",
    ],
  },
  {
    date: "2023-08-08",
    summary: "",
    updates: [
      "Fixed an obscure bug in the religion generator with domains.",
      "Added the ability specify species mix for the religion generator.",
      "Added the ability to specify the category of religion in the religion generator.",
      "Changed the default species and category for the religion generator.",
      "Added more species options for the fantasy family generator.",
      "Fixed a bug in the Stars Without Number starship generator's model numbers.",
    ],
  },
  {
    date: "2023-08-06",
    summary: "",
    updates: [
      "Added support for saving multiple cultures for later use.",
      "Rewrote the entire site to use SvelteKit instead of Svelte.",
    ],
  },
  {
    date: "2023-06-14",
    summary: "",
    updates: ["Removed Reddit link."],
  },
  {
    date: "2023-05-22",
    summary: "",
    updates: [
      "Added support for the saved culture feature to the religion generator.",
    ],
  },
  {
    date: "2023-05-18",
    summary: "",
    updates: [
      "Made it possible to save a culture from the culture generator for use in the region generator.",
      "Tweaked the heights of some of the fantasy species.",
      "Fixed a bug in the measurements converter for feet and inches.",
    ],
  },
  {
    date: "2023-04-14",
    summary: "",
    updates: [
      "Expanded the results for the religion generator.",
      "Expanded the results for the culture generator.",
      "Expanded the possibilities for settlements in the region generator.",
      "Expanded the diversity of results for the chop shop generator.",
    ],
  },
  {
    date: "2023-02-18",
    summary: "",
    updates: [
      "Fixed a bug with male height in species stats calculator.",
      "Added more descriptions to the biome generator.",
    ],
  },
  {
    date: "2023-02-02",
    summary: "",
    updates: ["Changed the format of Ingenium Second Edition heritage stats."],
  },
  {
    date: "2022-11-21",
    summary: "",
    updates: [
      "Moved navigation from a sidebar to its own page.",
      "Removed two custom fonts.",
      "Redesigned the logo.",
      "Made other design tweaks.",
      "Switched to Vite for build and development.",
    ],
  },
  {
    date: "2022-11-18",
    summary: "",
    updates: [
      "Made min rooms and max rooms for dungeon generator configurable.",
    ],
  },
  {
    date: "2022-11-17",
    summary: "",
    updates: ["Added first version of AD&D 2e character generator."],
  },
  {
    date: "2022-10-01",
    summary: "",
    updates: [
      "Fixed a bug in culture generation with Elvish culture names.",
      "Updated the build process to use Node.js 18.",
    ],
  },
  {
    date: "2022-07-29",
    summary: "",
    updates: ["Added more variety to the cyberpunk drug generator."],
  },
  {
    date: "2022-07-26",
    summary: "",
    updates: [
      "Improved display of language generator.",
      "Added more IPA phonemes to the language generator.",
      "Changed weighting of phonemes for the English-like phoneme set to reflect actual frequency of English phonemes.",
    ],
  },
  {
    date: "2022-07-24",
    summary: "",
    updates: [
      "Added support for random sets in the word generator.",
      "Added Japanese-like names to the region generator.",
      "Added Elvish-like names to the region generator.",
      "Made regions use their name set for their ruling figures.",
      "Made region name set configurable.",
      "Displayed region sovereignties seperately from vassal realms.",
      "Added very basic language generator, to be expanded and integrated into other generators later.",
    ],
  },
  {
    date: "2022-07-07",
    summary: "",
    updates: [
      "Changed how invented words are generated and added new tools to that system. This affects all generated names.",
      "Reworked the region generator to change how neighbors are constructed.",
      "Added a tool for testing invented word patterns.",
    ],
  },
  {
    date: "2022-07-03",
    summary: "",
    updates: [
      "Added a handful of magic weapons to dungeon generation.",
      "Added a system for generating magic items to the dungeon generator.",
    ],
  },
  {
    date: "2022-06-29",
    summary: "",
    updates: [
      "Added light sources to the dungeon generator.",
      "Reorganized dungeon generation code to be easier to read, and fixed a few bugs in the process.",
    ],
  },
  {
    date: "2022-06-24",
    summary: "",
    updates: [
      "Added aarakocra, aasimar, centaur, dark elf, deep gnome, duergar, firbolg, high elf, and hobgoblin to sentient species.",
      "Fixed several bugs in the selection of sentient species during encounter creation.",
    ],
  },
  {
    date: "2022-06-23",
    summary: "",
    updates: [
      "Added display of secret doors to dungeon map.",
      "Added GM text and player text to dungeon generator.",
      "Made secret doors in dungeon generator hidden on one side.",
      "Reworked dungeon generator room generation algorithm to include more loops.",
      "Added many more creatures and encounter types to the dungeon generator.",
      "Added threat levels as a generic challenge indicator to the dungeon generator.",
      "Expanded treasure hordes and made individual treasure carriable by characters.",
      "Added more variety to the types of rooms generated by the dungeon generator.",
      "Added equipment to character encounters in the dungeon generator.",
      "Added abilities to encounter display in the dungeon generator.",
    ],
  },
  {
    date: "2022-06-09",
    summary: "",
    updates: [
      "Added a star nation generator.",
      "Did a little behind-the-scenes cleanup of the star system generator.",
    ],
  },
  {
    date: "2022-06-05",
    summary: "",
    updates: [
      "Added the initial version of a dungeon generator.",
      "Added goblins, orcs, and trolls as sentient species.",
      "Added a creature system, only used by the dungeon generator right now.",
      "Added a treasure system, also only used for the dungeon generator so far.",
    ],
  },
  {
    date: "2022-04-22",
    summary: "",
    updates: [
      "Tweaked the SVG rendering of planets in the star system generator to properly size them.",
      "Added comparison to Earth for some planet statistics, for context.",
      "Reorganized the planet and star generation code a bit behind the scenes.",
      "Made the graphics on the Planet Generator much more realistic.",
    ],
  },
  {
    date: "2022-04-01",
    summary: "",
    updates: [
      "Added anchor and barrel heraldic charges.",
      "Added link to the source code in the footer.",
    ],
  },
  {
    date: "2022-02-04",
    summary: "",
    updates: [
      "Added ability to allow or disallow occupations by race for DCC character generator.",
      "Expanded how culture taboos are generated.",
      "Rewrote how character, town, region, and culture names are generated.",
      "Rewrote how towns are structured to make it easier to implement certain future features.",
      "Added an environment/climate/biome system to add diversity to towns and regions.",
      "Made cultures use the religion generator for religion information.",
      "Added country and town name lists to the culture generator.",
    ],
  },
  {
    date: "2022-01-27",
    summary: "",
    updates: ["Added tieflings."],
  },
  {
    date: "2022-01-23",
    summary: "",
    updates: [
      "Added about twenty new occupations to the DCC character generator.",
      "Fixed a bug in the DCC character generator where HP could be lower than 1.",
      "Made elf, dwarf, and halfling characters in the DCC character generator have names matching their cultures.",
    ],
  },
  {
    date: "2022-01-22",
    summary: "",
    updates: [
      "Reworked the biome and climate system underlying region generation.",
      "Added geographic features to town descriptions.",
      "Added Dungeon Crawl Classics character generator.",
    ],
  },
  {
    date: "2022-01-17",
    summary: "",
    updates: [
      "Added a fantasy family generator.",
      "Changed how personalities are generated to be faster and more rational.",
      "Reworked how species are structured to allow for a better physical trait system.",
      "Fixed a bug in age categories.",
      "Alphabetized the sidebar menu.",
      "Added a change log page for all the changes and modified the home page to only show the most recent.",
    ],
  },
  {
    date: "2022-01-14",
    summary: "",
    updates: [
      "Fixed a bug where non-humans would always be women.",
      "Added names, types, and rulers to regions.",
      "Added claimant list to regions, including their heraldry.",
      "Added proper kingdom and empire generation subsystems instead of just names.",
      "Added ruler heraldry.",
      "Made unique name generators for each fantasy race.",
      "Expanded the options available to the underlying made-up word generation algorithm. Better names!",
      "Added dragonborn.",
    ],
  },
  {
    date: "2021-11-19",
    summary: "",
    updates: [
      "Fixed a bug in the religion generator that was causing it to crash.",
    ],
  },
  {
    date: "2021-11-18",
    summary: "",
    updates: [
      "Rewrote the heraldry system to allow much greater flexibility.",
      "Added the ability to specify the number of charges and their tincture to the heraldry generator.",
      "Expanded the variety of personality descriptions for characters.",
    ],
  },
  {
    date: "2021-10-30",
    summary: "",
    updates: [
      "Expanded how gender is handled behind the scenes.",
      "Added male and female controls to Species Stats.",
      "Added a little more variety to character descriptions.",
    ],
  },
  {
    date: "2021-10-16",
    summary: "",
    updates: ["Added spooky ship generator."],
  },
  {
    date: "2021-9-26",
    summary: "",
    updates: ["Added ability to filter heraldry charges by tag."],
  },
  {
    date: "2021-8-13",
    summary: "",
    updates: [
      "Fixed bug in seed generator that right-padded it with zeroes.",
      "Added more variety to town names.",
      "Made the random seed field monospace.",
      "Expanded the list of clothing in the fantasy equipment lists.",
    ],
  },
  {
    date: "2021-7-13",
    summary: "",
    updates: [
      "Added more variety to biomes.",
      "Added an arms manufacturer generator.",
      "Fixed a bug in calculating ordinals for the changelog.",
    ],
  },
  {
    date: "2021-7-9",
    summary: "",
    updates: [
      "Changed how star and planet names are constructed.",
      "Added a chance for inhabited planets to have a notable starport.",
      "Changed how planetary cultures and governments are generated.",
    ],
  },
  {
    date: "2021-7-8",
    summary: "",
    updates: [
      "Rewrote the site from JavaScript + Vue + Webpack to TypeScript + Svelte + Rollup.",
      "Fixed several subtle bugs in the Stars Without Number generators.",
      "Made the heraldry generator faster.",
      "Changed how this change log is structured and displayed.",
    ],
  },
  {
    date: "2021-5-2",
    summary: "",
    updates: [
      "Expanded culture generator with music style.",
      "Added social organization to the culture generator.",
    ],
  },
  {
    date: "2021-4-21",
    summary: "",
    updates: ["Added a religion generator."],
  },
  {
    date: "2021-4-19",
    summary: "",
    updates: ["Made the magic weapon generator more flexible."],
  },
  {
    date: "2021-4-16",
    summary: "",
    updates: ["Added a magic weapon generator."],
  },
  {
    date: "2021-4-8",
    summary: "",
    updates: [
      "Added personality traits to character descriptions.",
      "Added notable members to organizations.",
    ],
  },
  {
    date: "2021-3-2",
    summary: "",
    updates: [
      "Made barren planets a little deformed in WebGL rendering.",
      "Tweaked cloud layers on some planet types in WebGL rendering.",
    ],
  },
  {
    date: "2021-3-1",
    summary: "",
    updates: [
      "Added model numbers to SWN starships.",
      "Added more detail to star generation.",
      "Added hazards to planet generation.",
    ],
  },
  {
    date: "2021-2-26",
    summary: "",
    updates: [
      "Made star system generator and planet generator use the same underlying library for planet generation",
      "Updated button styles for each of the sections",
    ],
  },
  {
    date: "2021-2-25",
    summary: "",
    updates: [
      "Added the planet generator",
      "Fixed missing hardpoints attribute to SWN starship generator",
    ],
  },
  {
    date: "2021-2-11",
    summary: "",
    updates: [
      "Added missing speed and armor attributes to SWN starship generator",
      "Fixed an index bug in several generators",
      "Added the ability to save Uncharted Worlds characters",
      "Added a new town name generation scheme",
      "Made several major site design changes",
    ],
  },
  {
    date: "2021-2-8",
    summary: "",
    updates: ["Added Stars Without Number starship generator"],
  },
  {
    date: "2021-2-5",
    summary: "",
    updates: [
      "Fixed the download of heraldry images",
      "Added ability to download SWN characters",
    ],
  },
  {
    date: "2021-2-4",
    summary: "",
    updates: ["Stars Without Number character generator added"],
  },
  {
    date: "2021-1-25",
    summary: "",
    updates: ["Fantasy equipment list page has been added"],
  },
  {
    date: "2021-1-19",
    summary: "",
    updates: [
      "Planets in the Star System generator now have notable features added to their descriptions",
    ],
  },
];
