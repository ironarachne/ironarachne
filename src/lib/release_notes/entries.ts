import type ReleaseNote from './release_note';

/**
 * Every release note, newest first.
 *
 * Written for players and GMs rather than for the git history: an entry covers what a visitor would
 * notice, in their words. `mostRecent` slices this list rather than sorting it, so the order here
 * is load-bearing.
 */
const entries: ReleaseNote[] = [
  {
    date: '2026-08-17',
    version: '2.5.0',
    summary:
      'Projects, a workshop that keeps what you make, editing for saved work, and backup files you can take with you',
    features: [
      'Added projects: what you save now lives in a named project instead of one flat list, and a project can be renamed, deleted, or worked in one at a time',
      'Rebuilt the workshop so you can open several tools side by side, save what they make into the open project, and open a saved item again in a panel of its own',
      'Saved cultures and religions can now be edited after the fact — every field you can see, plus renaming, with an explicit re-roll for when you want to start that one over',
      'Added composition: a religion can be built from a culture you saved, what uses what is shown both ways, and a link to something you deleted is shown as broken rather than quietly disappearing',
      'Heraldry you have saved can now be seen as drawn arms in the workshop and downloaded as an SVG or a PNG from there',
      'Added export and import: back up everything you have as one file, or share a single project or a single item, and bring any of them back on another machine or in another browser',
      'Added a storage summary: how much room the site is using, how it is split between projects, and how long it has been since you last exported',
    ],
    improvements: [
      'Moved saved work out of browser local storage and into a database, which lifts the roughly five megabyte ceiling that region maps and coats of arms were running into',
      'Anything you saved before projects existed is moved into a project for you the first time you open the site, and your originals are left exactly where they were',
      'Restoring from a backup downloads a copy of what you have now first, so there is always a way back, and it says what it is about to replace before it does it',
      'An item this version cannot read is kept as it arrived rather than dropped, stays visible, and travels in your exports, so a later version can still open it',
      'Backups made by the old save-and-export buttons still import, and the old saved data page is still there',
    ],
    fixes: [
      'Fixed Stars Without Number starships not charging for the weapons they fit, so a fitted ship costs what it should',
    ],
    housekeeping: [
      'Retired the old container hosting, moved the site onto its new front door, and put every library behind its own entry point',
    ],
  },
  {
    date: '2026-08-13',
    version: '2.4.0',
    summary:
      'Merchant and potion generators, printable character sheets, a new typeface, and a long list of generator fixes',
    features: [
      'Added a fantasy merchant generator, and expanded the fantasy equipment list it draws from',
      'Added a potion generator',
      'Added PDF download to the character generators, so a finished character can be printed as a sheet',
      'Added a tool catalog that tags every generator by genre and game system, and a tool browser for searching it',
      'Added an early prototype of the workshop, a workspace that opens several generators side by side',
    ],
    improvements: [
      'Character generators now name the characters they roll up',
      'Switched body text from Georgia to Inclusive Sans, a face drawn to keep invented names legible, and refreshed the site icons and colours to match the current brand',
      'Rebuilt the star, planet, and moon previews on a shared renderer that detects what your device can do and picks a quality tier to match, with a Canvas2D fallback where WebGL is unavailable',
      'Improved mountain and tree placement on region maps, and how they are drawn',
    ],
    fixes: [
      'Fixed a leak where every preview image claimed its own WebGL context, which eventually made the browser give up on rendering them',
      'Fixed SWN starships fitting more weapons, drives, and gear than their hull could carry, and a crash when a hull had no budget left for any weapon',
      'Fixed the DCC spells-known table being shifted by one, so casters knew the wrong number of spells',
      'Fixed noble heraldry, moons, star systems, and art object values not being reproducible from their seed',
      'Fixed container variations ignoring their own size, so a small glass bottle no longer holds more than a glass bottle',
      'Fixed conlang translation losing verbs whose past tense ends in "-e", which broke translating a sentence back into English',
      'Fixed several species bugs, some awkward gendered nouns, and a stray blank line in generated lists',
      'Fixed a range of mobile layout problems, and added tests at five phone widths so they stay fixed',
      'Fixed deep links breaking on the new static hosting, and gave ironarachne.com a proper landing page',
    ],
    housekeeping: [
      'Rewrote the codebase from classes to plain functions, broke up its longest functions, documented every library, and put automatic testing, coverage, and deployment gates in front of every change',
    ],
  },
  {
    date: '2026-05-21',
    summary:
      'Settlement generator, persistence and saving, heraldry overhaul, AD&D 2E character builder, and dragons',
    features: [
      'Added a settlement generator with richer detail: notables, organizations, trade, problems, and narrative facets',
      'Added dragons as a species group with many chromatic, metallic, and exotic variants, plus life stages and sizes',
      'Added a new persistence system for saving cultures, religions, and heraldry, with export, import, and a saved data management page',
      'Added heraldry saving and swapping on the character, region, and heraldry generators',
      'Added heraldry previews for tinctures, divisions, and variations',
      'Added a brand new AD&D 2E character creator with a step-by-step builder, kits, and proficiencies',
    ],
    improvements: [
      'Expanded heraldry generation controls, added a reset button, and added a confirmation modal after saving',
      'Added the pall division and vair tincture to heraldry',
      'Added species and archetype badges for clearer visual identification in generated content',
      'Switched encounters to a dark color scheme and made destructive action buttons stand out more clearly',
    ],
    fixes: [
      'Fixed a bug where settlement organizations could leak in from unrelated regions',
      'Fixed heraldry rendering bugs: black charge borders, pean showing as black, bendy misalignment with per bend, and gaps in divisions',
    ],
    housekeeping: ['Added a site-wide modal system'],
  },
  {
    date: '2026-04-24',
    summary: 'New libraries, better organizations, better religions, way more species, and tooling',
    features: ['Expanded the language generator to build a language with translation functions'],
    improvements: [
      'Added optional Canvas2D renderers for stellar bodies',
      'Rewrote the organizations library with many more org types, and improved org descriptions and traits',
      'Refined religion output with more variety and detail',
    ],
    fixes: [
      'Fixed a high-severity dependency vulnerability, many Svelte and CSS issues, and WebGL context leakage',
      'Fixed bugs in the heraldry library and a heraldry border color issue',
      'Fixed a bug where regions could include science-fiction organizations inappropriately',
    ],
    housekeeping: [
      'Switched the site to static output instead of server-side rendering',
      'Upgraded to Vite 8, replaced Sass with modern CSS, and removed unused dependencies (including d3)',
      'Added weather, measurements, and simulation time libraries, and updated the calendar library',
      'Added early versions of the architecture and hierarchy libraries',
      'Added a visual identity library with disc emblem and pattern lattice systems, plus merchant marks; moved charges into their own library',
      'Restructured base-level libraries into subdirectories, fixed RNG instantiation bugs, deduplicated and expanded species data with new resources, and updated the made-up-names dependency',
    ],
  },
  {
    date: '2026-04-05',
    summary: 'Visual overhauls for star systems, planetary generators, and genre styles',
    features: [
      'Added star type configuration to star system generator',
      'Made planet count configurable for star nation and star system generators',
      'Added composite star system images',
    ],
    improvements: [
      'Gave more character to the various genre styles (Sci-Fi, Cyberpunk, Fantasy)',
      'Improved star shader realism',
      'Added rings to planets',
      'Made swamp, jungle, and garden planets more realistic',
      'Updated how clouds are rendered',
      'Added more variety to gas giants and volcanic, barren, toxic, ocean, ice, and arid planets',
      'Added more craters to barren planets',
    ],
    fixes: ['Fixed shader bug in out-of-bounds numbers'],
  },
  {
    date: '2026-04-04',
    summary: 'Massive refactor to many systems',
    features: [
      'Updated the heraldry generator to allow for charges "in chief"',
      'Added a treasure hoard generator',
    ],
    improvements: [
      'Rewrote the treasure system',
      'Rewrote the dungeon generator',
      'Rewrote the encounter generator',
      'Rewrote the character generator',
      'Rewrote the religion generator',
      'Updated the heraldry generator with many more charges',
      'Rewrote the fantasy family generator',
    ],
    housekeeping: [
      'Switched everything to use a custom random number generation system',
      'Added a new system for mutating generated content',
      'Added a new system for applying tags to generated content and filtering by those tags',
    ],
  },
  {
    date: '2025-10-27',
    summary: 'Refactored the heraldry generator code.',
    fixes: ['Tweaked the visual design of some headers to fix overlapping text.'],
    housekeeping: [
      'Reorganized the heraldry generator code for better maintainability.',
      'Added a ton of unit tests for the heraldry generator.',
    ],
  },
  {
    date: '2025-09-14',
    summary: 'Revamped the visual design of the site.',
    improvements: [
      'Swapped out the old logo for a new one.',
      'Made all headers use the new logo font.',
      'Updated the color scheme to be more in line with the new logo.',
      'Reorganized the navigation so be more intuitive.',
    ],
  },
  {
    date: '2025-07-15',
    summary: 'Small updates and fixes.',
    improvements: ['Added more detail to music styles.'],
    housekeeping: ['Added more unit tests to ensure accuracy.'],
  },
  {
    date: '2025-05-28',
    summary: 'Added a new generator for generating moons.',
    features: ['Added a system for generating moons orbiting planets.'],
  },
  {
    date: '2025-05-12',
    summary: 'Completely reworked how astronomical bodies are generated.',
    features: ['Added a new system for generating civilizations.'],
    improvements: [
      'Added a new system for generating astronomical bodies.',
      'Made the planet, star system, and star nation generators use the new system.',
      'Made the planet and star nation generators use the new civilization system.',
    ],
  },
  {
    date: '2024-12-02',
    summary: 'Behind-the-scenes fixes and updates.',
    fixes: ['Fixed the magic weapon generator not using the new lock seed pattern.'],
    housekeeping: ["Reworked the cyberpunk drug generator's structure.", 'Updated to Svelte 5.'],
  },
  {
    date: '2024-11-26',
    summary: 'Big foundational change that will affect regions, dungeons, and others later on.',
    improvements: ["Added 'Lock Seed' checkbox instead of a button."],
    housekeeping: [
      'Wrote a new system for environment generation, including biomes, climates, and ecosystems.',
    ],
  },
  {
    date: '2024-09-22',
    summary: 'A region generator fix for how organizations are chosen',
    fixes: ['Fixed a bug in the region generator related to organizations.'],
  },
  {
    date: '2024-09-03',
    summary: 'Organization generator fixes, and more ways to shape what it makes',
    features: ['Added more organization customization options.'],
    fixes: ['Fixed several bugs in the organization generator.'],
  },
  {
    date: '2024-01-23',
    summary: 'A generator for Velgarth Gifts',
    features: ['Added Velgarth Gifts generator.'],
  },
  {
    date: '2024-01-12',
    summary: 'A SvelteKit upgrade behind the scenes',
    housekeeping: ['Upgraded SvelteKit to v2'],
  },
  {
    date: '2024-01-09',
    summary: 'Richer planet descriptions, now including day length',
    improvements: ['Added more detail to planet descriptions.', 'Added day length to planets.'],
  },
  {
    date: '2023-12-21',
    summary: 'New shaders for every planet type, and stars that render like stars',
    features: ['Added star shaders.'],
    improvements: ['Revamped all the planet shaders.'],
  },
  {
    date: '2023-11-23',
    summary:
      'Heraldry rebuilt, planets made fast again, and WebGL planet images across the star generators',
    improvements: [
      'Render heraldry in most places as PNG instead of SVG.',
      'Swapped out the SVG generator for the new WebGL generator for planet images on the star system and star nation generators.',
    ],
    fixes: ['Fixed a massive performance problem with the planet generator.'],
    housekeeping: [
      'Restructured how heraldry is built.',
      'Updated to a new version of the made-up-names package.',
    ],
  },
  {
    date: '2023-09-10',
    summary: 'Huge rework to species, environment, and encounter generation.',
    improvements: [
      'Changed how threat level is calculated for encounters.',
      'Added more depth to abilities.',
      'Reworked how creatures, characters, and species are handled.',
      'Changed a few things about how environments are generated.',
    ],
    housekeeping: [
      'Refactored a lot of code to not use classes.',
      'Split age data and size data into separate concepts.',
    ],
  },
  {
    date: '2023-08-08',
    summary:
      'Species and category controls for the religion generator, plus starship and domain fixes',
    features: [
      'Added the ability specify species mix for the religion generator.',
      'Added the ability to specify the category of religion in the religion generator.',
    ],
    improvements: [
      'Changed the default species and category for the religion generator.',
      'Added more species options for the fantasy family generator.',
    ],
    fixes: [
      'Fixed an obscure bug in the religion generator with domains.',
      "Fixed a bug in the Stars Without Number starship generator's model numbers.",
    ],
  },
  {
    date: '2023-08-06',
    summary: 'Saving more than one culture, and a move to SvelteKit',
    features: ['Added support for saving multiple cultures for later use.'],
    housekeeping: ['Rewrote the entire site to use SvelteKit instead of Svelte.'],
  },
  {
    date: '2023-06-14',
    summary: "Tidying up the site's outbound links",
    housekeeping: ['Removed Reddit link.'],
  },
  {
    date: '2023-05-22',
    summary: 'Saved cultures now feed the religion generator',
    features: ['Added support for the saved culture feature to the religion generator.'],
  },
  {
    date: '2023-05-18',
    summary:
      'Saving a culture for use in the region generator, plus species heights and a converter fix',
    features: [
      'Made it possible to save a culture from the culture generator for use in the region generator.',
    ],
    improvements: ['Tweaked the heights of some of the fantasy species.'],
    fixes: ['Fixed a bug in the measurements converter for feet and inches.'],
  },
  {
    date: '2023-04-14',
    summary: 'More varied results from the religion, culture, region, and chop shop generators',
    improvements: [
      'Expanded the results for the religion generator.',
      'Expanded the results for the culture generator.',
      'Expanded the possibilities for settlements in the region generator.',
      'Expanded the diversity of results for the chop shop generator.',
    ],
  },
  {
    date: '2023-02-18',
    summary: 'More biome descriptions, and a species stats fix',
    improvements: ['Added more descriptions to the biome generator.'],
    fixes: ['Fixed a bug with male height in species stats calculator.'],
  },
  {
    date: '2023-02-02',
    summary: 'A new format for Ingenium Second Edition heritage stats',
    improvements: ['Changed the format of Ingenium Second Edition heritage stats.'],
  },
  {
    date: '2022-11-21',
    summary: 'A redesigned logo, navigation on its own page, and a move to Vite',
    improvements: [
      'Moved navigation from a sidebar to its own page.',
      'Removed two custom fonts.',
      'Redesigned the logo.',
      'Made other design tweaks.',
    ],
    housekeeping: ['Switched to Vite for build and development.'],
  },
  {
    date: '2022-11-18',
    summary: 'Configurable room counts for the dungeon generator',
    features: ['Made min rooms and max rooms for dungeon generator configurable.'],
  },
  {
    date: '2022-11-17',
    summary: 'A first AD&D 2e character generator',
    features: ['Added first version of AD&D 2e character generator.'],
  },
  {
    date: '2022-10-01',
    summary: 'An Elvish culture name fix, and a newer Node.js',
    fixes: ['Fixed a bug in culture generation with Elvish culture names.'],
    housekeeping: ['Updated the build process to use Node.js 18.'],
  },
  {
    date: '2022-07-29',
    summary: 'More variety in the cyberpunk drug generator',
    improvements: ['Added more variety to the cyberpunk drug generator.'],
  },
  {
    date: '2022-07-26',
    summary: 'A clearer language generator, with more phonemes and truer English weighting',
    improvements: [
      'Improved display of language generator.',
      'Added more IPA phonemes to the language generator.',
      'Changed weighting of phonemes for the English-like phoneme set to reflect actual frequency of English phonemes.',
    ],
  },
  {
    date: '2022-07-24',
    summary: 'A first language generator, and regions with configurable name sets',
    features: [
      'Added support for random sets in the word generator.',
      'Made region name set configurable.',
      'Added very basic language generator, to be expanded and integrated into other generators later.',
    ],
    improvements: [
      'Added Japanese-like names to the region generator.',
      'Added Elvish-like names to the region generator.',
      'Made regions use their name set for their ruling figures.',
      'Displayed region sovereignties seperately from vassal realms.',
    ],
  },
  {
    date: '2022-07-07',
    summary: 'New invented words everywhere, and a tool for testing the patterns behind them',
    features: ['Added a tool for testing invented word patterns.'],
    improvements: [
      'Changed how invented words are generated and added new tools to that system. This affects all generated names.',
      'Reworked the region generator to change how neighbors are constructed.',
    ],
  },
  {
    date: '2022-07-03',
    summary: 'Magic weapons and magic items in the dungeon generator',
    features: ['Added a system for generating magic items to the dungeon generator.'],
    improvements: ['Added a handful of magic weapons to dungeon generation.'],
  },
  {
    date: '2022-06-29',
    summary: 'Light sources for dungeons, and a tidier generator behind them',
    improvements: ['Added light sources to the dungeon generator.'],
    housekeeping: [
      'Reorganized dungeon generation code to be easier to read, and fixed a few bugs in the process.',
    ],
  },
  {
    date: '2022-06-24',
    summary: 'Nine more sentient species, and fixes to how encounters pick them',
    improvements: [
      'Added aarakocra, aasimar, centaur, dark elf, deep gnome, duergar, firbolg, high elf, and hobgoblin to sentient species.',
    ],
    fixes: ['Fixed several bugs in the selection of sentient species during encounter creation.'],
  },
  {
    date: '2022-06-23',
    summary:
      'A much deeper dungeon generator: secret doors, GM and player text, threat levels, and far more to find',
    features: [
      'Added display of secret doors to dungeon map.',
      'Added GM text and player text to dungeon generator.',
      'Added threat levels as a generic challenge indicator to the dungeon generator.',
    ],
    improvements: [
      'Made secret doors in dungeon generator hidden on one side.',
      'Reworked dungeon generator room generation algorithm to include more loops.',
      'Added many more creatures and encounter types to the dungeon generator.',
      'Expanded treasure hordes and made individual treasure carriable by characters.',
      'Added more variety to the types of rooms generated by the dungeon generator.',
      'Added equipment to character encounters in the dungeon generator.',
      'Added abilities to encounter display in the dungeon generator.',
    ],
  },
  {
    date: '2022-06-09',
    summary: 'A star nation generator',
    features: ['Added a star nation generator.'],
    housekeeping: ['Did a little behind-the-scenes cleanup of the star system generator.'],
  },
  {
    date: '2022-06-05',
    summary: 'A dungeon generator, with creatures and treasure to fill it',
    features: ['Added the initial version of a dungeon generator.'],
    improvements: ['Added goblins, orcs, and trolls as sentient species.'],
    housekeeping: [
      'Added a creature system, only used by the dungeon generator right now.',
      'Added a treasure system, also only used for the dungeon generator so far.',
    ],
  },
  {
    date: '2022-04-22',
    summary: 'More realistic planet graphics, and Earth comparisons for planet statistics',
    improvements: [
      'Added comparison to Earth for some planet statistics, for context.',
      'Made the graphics on the Planet Generator much more realistic.',
    ],
    fixes: [
      'Tweaked the SVG rendering of planets in the star system generator to properly size them.',
    ],
    housekeeping: ['Reorganized the planet and star generation code a bit behind the scenes.'],
  },
  {
    date: '2022-04-01',
    summary: 'Two new heraldic charges, and a source code link in the footer',
    improvements: [
      'Added anchor and barrel heraldic charges.',
      'Added link to the source code in the footer.',
    ],
  },
  {
    date: '2022-02-04',
    summary: 'Reworked names, restructured towns, and an environment system for towns and regions',
    features: [
      'Added ability to allow or disallow occupations by race for DCC character generator.',
    ],
    improvements: [
      'Expanded how culture taboos are generated.',
      'Rewrote how character, town, region, and culture names are generated.',
      'Added an environment/climate/biome system to add diversity to towns and regions.',
      'Made cultures use the religion generator for religion information.',
      'Added country and town name lists to the culture generator.',
    ],
    housekeeping: [
      'Rewrote how towns are structured to make it easier to implement certain future features.',
    ],
  },
  {
    date: '2022-01-27',
    summary: 'Tieflings',
    improvements: ['Added tieflings.'],
  },
  {
    date: '2022-01-23',
    summary:
      'Twenty more DCC occupations, and culture-matched names for elves, dwarves, and halflings',
    improvements: [
      'Added about twenty new occupations to the DCC character generator.',
      'Made elf, dwarf, and halfling characters in the DCC character generator have names matching their cultures.',
    ],
    fixes: ['Fixed a bug in the DCC character generator where HP could be lower than 1.'],
  },
  {
    date: '2022-01-22',
    summary: 'A Dungeon Crawl Classics character generator, and reworked biomes for regions',
    features: ['Added Dungeon Crawl Classics character generator.'],
    improvements: [
      'Reworked the biome and climate system underlying region generation.',
      'Added geographic features to town descriptions.',
    ],
  },
  {
    date: '2022-01-17',
    summary: 'A fantasy family generator, and this page',
    features: [
      'Added a fantasy family generator.',
      'Added a change log page for all the changes and modified the home page to only show the most recent.',
    ],
    improvements: [
      'Changed how personalities are generated to be faster and more rational.',
      'Alphabetized the sidebar menu.',
    ],
    fixes: ['Fixed a bug in age categories.'],
    housekeeping: [
      'Reworked how species are structured to allow for a better physical trait system.',
    ],
  },
  {
    date: '2022-01-14',
    summary: 'Regions with rulers, claimants, and heraldry, plus better names for everyone',
    improvements: [
      'Added names, types, and rulers to regions.',
      'Added claimant list to regions, including their heraldry.',
      'Added proper kingdom and empire generation subsystems instead of just names.',
      'Added ruler heraldry.',
      'Made unique name generators for each fantasy race.',
      'Expanded the options available to the underlying made-up word generation algorithm. Better names!',
      'Added dragonborn.',
    ],
    fixes: ['Fixed a bug where non-humans would always be women.'],
  },
  {
    date: '2021-11-19',
    summary: 'A fix for the religion generator crashing',
    fixes: ['Fixed a bug in the religion generator that was causing it to crash.'],
  },
  {
    date: '2021-11-18',
    summary: 'A rebuilt heraldry system, with control over charges and their tinctures',
    features: [
      'Added the ability to specify the number of charges and their tincture to the heraldry generator.',
    ],
    improvements: [
      'Rewrote the heraldry system to allow much greater flexibility.',
      'Expanded the variety of personality descriptions for characters.',
    ],
  },
  {
    date: '2021-10-30',
    summary: 'Male and female controls for Species Stats, and more varied character descriptions',
    features: ['Added male and female controls to Species Stats.'],
    improvements: ['Added a little more variety to character descriptions.'],
    housekeeping: ['Expanded how gender is handled behind the scenes.'],
  },
  {
    date: '2021-10-16',
    summary: 'A spooky ship generator',
    features: ['Added spooky ship generator.'],
  },
  {
    date: '2021-9-26',
    summary: 'Filtering heraldry charges by tag',
    features: ['Added ability to filter heraldry charges by tag.'],
  },
  {
    date: '2021-8-13',
    summary: 'A seed generator fix, more town names, and more clothing',
    improvements: [
      'Added more variety to town names.',
      'Made the random seed field monospace.',
      'Expanded the list of clothing in the fantasy equipment lists.',
    ],
    fixes: ['Fixed bug in seed generator that right-padded it with zeroes.'],
  },
  {
    date: '2021-7-13',
    summary: 'An arms manufacturer generator, and more varied biomes',
    features: ['Added an arms manufacturer generator.'],
    improvements: ['Added more variety to biomes.'],
    fixes: ['Fixed a bug in calculating ordinals for the changelog.'],
  },
  {
    date: '2021-7-9',
    summary: 'Better star and planet names, notable starports, and planetary cultures',
    improvements: [
      'Changed how star and planet names are constructed.',
      'Added a chance for inhabited planets to have a notable starport.',
      'Changed how planetary cultures and governments are generated.',
    ],
  },
  {
    date: '2021-7-8',
    summary: 'The site rebuilt in TypeScript and Svelte, with a faster heraldry generator',
    improvements: [
      'Made the heraldry generator faster.',
      'Changed how this change log is structured and displayed.',
    ],
    fixes: ['Fixed several subtle bugs in the Stars Without Number generators.'],
    housekeeping: [
      'Rewrote the site from JavaScript + Vue + Webpack to TypeScript + Svelte + Rollup.',
    ],
  },
  {
    date: '2021-5-2',
    summary: 'Music styles and social organization in the culture generator',
    improvements: [
      'Expanded culture generator with music style.',
      'Added social organization to the culture generator.',
    ],
  },
  {
    date: '2021-4-21',
    summary: 'A religion generator',
    features: ['Added a religion generator.'],
  },
  {
    date: '2021-4-19',
    summary: 'A more flexible magic weapon generator',
    improvements: ['Made the magic weapon generator more flexible.'],
  },
  {
    date: '2021-4-16',
    summary: 'A magic weapon generator',
    features: ['Added a magic weapon generator.'],
  },
  {
    date: '2021-4-8',
    summary: 'Personality traits for characters, and notable members for organizations',
    improvements: [
      'Added personality traits to character descriptions.',
      'Added notable members to organizations.',
    ],
  },
  {
    date: '2021-3-2',
    summary: 'More convincing barren planets and cloud layers',
    improvements: [
      'Made barren planets a little deformed in WebGL rendering.',
      'Tweaked cloud layers on some planet types in WebGL rendering.',
    ],
  },
  {
    date: '2021-3-1',
    summary: 'Model numbers for starships, richer stars, and hazards on planets',
    improvements: [
      'Added model numbers to SWN starships.',
      'Added more detail to star generation.',
      'Added hazards to planet generation.',
    ],
  },
  {
    date: '2021-2-26',
    summary: 'Shared planet generation between the star system and planet generators',
    improvements: ['Updated button styles for each of the sections'],
    housekeeping: [
      'Made star system generator and planet generator use the same underlying library for planet generation',
    ],
  },
  {
    date: '2021-2-25',
    summary: 'A planet generator, and a starship hardpoints fix',
    features: ['Added the planet generator'],
    fixes: ['Fixed missing hardpoints attribute to SWN starship generator'],
  },
  {
    date: '2021-2-11',
    summary: 'Saving Uncharted Worlds characters, new town names, and a redesigned site',
    features: ['Added the ability to save Uncharted Worlds characters'],
    improvements: [
      'Added a new town name generation scheme',
      'Made several major site design changes',
    ],
    fixes: [
      'Added missing speed and armor attributes to SWN starship generator',
      'Fixed an index bug in several generators',
    ],
  },
  {
    date: '2021-2-8',
    summary: 'A Stars Without Number starship generator',
    features: ['Added Stars Without Number starship generator'],
  },
  {
    date: '2021-2-5',
    summary: 'Downloadable Stars Without Number characters, and a heraldry download fix',
    features: ['Added ability to download SWN characters'],
    fixes: ['Fixed the download of heraldry images'],
  },
  {
    date: '2021-2-4',
    summary: 'A Stars Without Number character generator',
    features: ['Stars Without Number character generator added'],
  },
  {
    date: '2021-1-25',
    summary: 'A fantasy equipment list',
    features: ['Fantasy equipment list page has been added'],
  },
  {
    date: '2021-1-19',
    summary: 'Notable features in planet descriptions',
    improvements: [
      'Planets in the Star System generator now have notable features added to their descriptions',
    ],
  },
];

export default entries;
