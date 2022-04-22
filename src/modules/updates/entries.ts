'use strict';

import ChangeLog from './changelog';

export function mostRecent(numberOfEntries: number): ChangeLog[] {
  const allEntries = all();

  let entries = [];

  for (let i = 0; i < numberOfEntries; i++) {
    entries.push(allEntries[i]);
  }

  return entries;
}

export function all(): ChangeLog[] {
  return [
    new ChangeLog('2022-04-22', [
      'Tweaked the SVG rendering of planets in the star system generator to properly size them.',
      'Added comparison to Earth for some planet statistics, for context.',
      'Reorganized the planet and star generation code a bit behind the scenes.',
    ]),
    new ChangeLog('2022-04-01', [
      'Added anchor and barrel heraldic charges.',
      'Added link to the source code in the footer.',
    ]),
    new ChangeLog('2022-02-04', [
      'Added ability to allow or disallow occupations by race for DCC character generator.',
      'Expanded how culture taboos are generated.',
      'Rewrote how character, town, region, and culture names are generated.',
      'Rewrote how towns are structured to make it easier to implement certain future features.',
      'Added an environment/climate/biome system to add diversity to towns and regions.',
      'Made cultures use the religion generator for religion information.',
      'Added country and town name lists to the culture generator.',
    ]),
    new ChangeLog('2022-01-27', ['Added tieflings.']),
    new ChangeLog('2022-01-23', [
      'Added about twenty new occupations to the DCC character generator.',
      'Fixed a bug in the DCC character generator where HP could be lower than 1.',
      'Made elf, dwarf, and halfling characters in the DCC character generator have names matching their cultures.',
    ]),
    new ChangeLog('2022-01-22', [
      'Reworked the biome and climate system underlying region generation.',
      'Added geographic features to town descriptions.',
      'Added Dungeon Crawl Classics character generator.',
    ]),
    new ChangeLog('2022-01-17', [
      'Added a fantasy family generator.',
      'Changed how personalities are generated to be faster and more rational.',
      'Reworked how species are structured to allow for a better physical trait system.',
      'Fixed a bug in age categories.',
      'Alphabetized the sidebar menu.',
      'Added a change log page for all the changes and modified the home page to only show the most recent.',
    ]),
    new ChangeLog('2022-01-14', [
      'Fixed a bug where non-humans would always be women.',
      'Added names, types, and rulers to regions.',
      'Added claimant list to regions, including their heraldry.',
      'Added proper kingdom and empire generation subsystems instead of just names.',
      'Added ruler heraldry.',
      'Made unique name generators for each fantasy race.',
      'Expanded the options available to the underlying made-up word generation algorithm. Better names!',
      'Added dragonborn.',
    ]),
    new ChangeLog('2021-11-19', [
      'Fixed a bug in the religion generator that was causing it to crash.',
    ]),
    new ChangeLog('2021-11-18', [
      'Rewrote the heraldry system to allow much greater flexibility.',
      'Added the ability to specify the number of charges and their tincture to the heraldry generator.',
      'Expanded the variety of personality descriptions for characters.',
    ]),
    new ChangeLog('2021-10-30', [
      'Expanded how gender is handled behind the scenes.',
      'Added male and female controls to Species Stats.',
      'Added a little more variety to character descriptions.',
    ]),
    new ChangeLog('2021-10-16', ['Added spooky ship generator.']),
    new ChangeLog('2021-9-26', ['Added ability to filter heraldry charges by tag.']),
    new ChangeLog('2021-8-13', [
      'Fixed bug in seed generator that right-padded it with zeroes.',
      'Added more variety to town names.',
      'Made the random seed field monospace.',
      'Expanded the list of clothing in the fantasy equipment lists.',
    ]),
    new ChangeLog('2021-7-13', [
      'Added more variety to biomes.',
      'Added an arms manufacturer generator.',
      'Fixed a bug in calculating ordinals for the changelog.',
    ]),
    new ChangeLog('2021-7-9', [
      'Changed how star and planet names are constructed.',
      'Added a chance for inhabited planets to have a notable starport.',
      'Changed how planetary cultures and governments are generated.',
    ]),
    new ChangeLog('2021-7-8', [
      'Rewrote the site from JavaScript + Vue + Webpack to TypeScript + Svelte + Rollup.',
      'Fixed several subtle bugs in the Stars Without Number generators.',
      'Made the heraldry generator faster.',
      'Changed how this change log is structured and displayed.',
    ]),
    new ChangeLog('2021-5-2', [
      'Expanded culture generator with music style.',
      'Added social organization to the culture generator.',
    ]),
    new ChangeLog('2021-4-21', ['Added a religion generator.']),
    new ChangeLog('2021-4-19', ['Made the magic weapon generator more flexible.']),
    new ChangeLog('2021-4-16', ['Added a magic weapon generator.']),
    new ChangeLog('2021-4-8', [
      'Added personality traits to character descriptions.',
      'Added notable members to organizations.',
    ]),
    new ChangeLog('2021-3-2', [
      'Made barren planets a little deformed in WebGL rendering.',
      'Tweaked cloud layers on some planet types in WebGL rendering.',
    ]),
    new ChangeLog('2021-3-1', [
      'Added model numbers to SWN starships.',
      'Added more detail to star generation.',
      'Added hazards to planet generation.',
    ]),
    new ChangeLog('2021-2-26', [
      'Made star system generator and planet generator use the same underlying library for planet generation',
      'Updated button styles for each of the sections',
    ]),
    new ChangeLog('2021-2-25', [
      'Added the planet generator',
      'Fixed missing hardpoints attribute to SWN starship generator',
    ]),
    new ChangeLog('2021-2-11', [
      'Added missing speed and armor attributes to SWN starship generator',
      'Fixed an index bug in several generators',
      'Added the ability to save Uncharted Worlds characters',
      'Added a new town name generation scheme',
      'Made several major site design changes',
    ]),
    new ChangeLog('2021-2-8', ['Added Stars Without Number starship generator']),
    new ChangeLog('2021-2-5', [
      'Fixed the download of heraldry images',
      'Added ability to download SWN characters',
    ]),
    new ChangeLog('2021-2-4', ['Stars Without Number character generator added']),
    new ChangeLog('2021-1-25', ['Fantasy equipment list page has been added']),
    new ChangeLog('2021-1-19', [
      'Planets in the Star System generator now have notable features added to their descriptions',
    ]),
  ];
}
