<script lang="ts">
  import * as RND from "../modules/random";

  import random from "random";
  import seedrandom from "seedrandom";
  import DCCCharacterGenerator from "../modules/dcc/generator";
  import DCCCharacterGeneratorConfig from "../modules/dcc/generatorconfig";

  let allowDwarves = true;
  let allowElves = true;
  let allowHalflings = true;
  let allowHumans = true;
  let seed = RND.randomString(13);
  let genConfig = new DCCCharacterGeneratorConfig();
  let charGen = new DCCCharacterGenerator(genConfig);
  let character = charGen.generate();
  let spellsKnown = getSpellsKnown();

  function dMod(modifier: number): string {
    if (modifier > -1) {
      return `+${modifier}`;
    }

    return `${modifier}`;
  }

  function generate() {
    random.use(seedrandom(seed));

    let allowedOccupations = [];

    if (allowDwarves) {
      allowedOccupations.push('dwarf');
    }

    if (allowElves) {
      allowedOccupations.push('elf');
    }

    if (allowHalflings) {
      allowedOccupations.push('halfling');
    }

    if (allowHumans) {
      allowedOccupations.push('human');
    }

    charGen.config.allowedOccupations = allowedOccupations;

    character = charGen.generate();
    spellsKnown = getSpellsKnown();
  }

  function getSpellsKnown(): string {
    if (character.spellsKnown == -9) {
      return "No spellcasting possible";
    }

    if (character.spellsKnown > -1) {
      return `+${character.spellsKnown}`;
    }

    return `${character.spellsKnown}`;
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  newSeed();
</script>

<svelte:head>
  <title>Dungeon Crawl Classics Character Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h2>Dungeon Crawl Classics Character Generator</h2>

  <p>This is a DCC 0-level character generator.</p>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed"/>
  </div>

  <div class="input-group">
    <label for="allowDwarves">Allow Dwarves</label>
    <input type="checkbox" name="allowDwarves" bind:checked={allowDwarves} id="allowDwarves"/>
  </div>

  <div class="input-group">
    <label for="allowElves">Allow Elves</label>
    <input type="checkbox" name="allowElves" bind:checked={allowElves} id="allowElves"/>
  </div>

  <div class="input-group">
    <label for="allowHalflings">Allow Halflings</label>
    <input type="checkbox" name="allowHalflings" bind:checked={allowHalflings} id="allowHalflings"/>
  </div>

  <div class="input-group">
    <label for="allowHumans">Allow Humans</label>
    <input type="checkbox" name="allowHumans" bind:checked={allowHumans} id="allowHumans"/>
  </div>

  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>

  <h3>{ character.firstName } { character.lastName }</h3>

  <p>A level { character.level } { character.occupation.name }</p>

  <p><strong>XP:</strong> { character.xp }</p>
  <p><strong>HP:</strong> { character.hp }</p>
  <p><strong>AC:</strong> { character.armorClass }</p>
  <p><strong>Currency:</strong> { character.currency }</p>
  <p><strong>Alignment:</strong> { character.alignment }</p>
  <p><strong>Gender:</strong> { character.gender }</p>
  <p><strong>Speed:</strong> { character.speed }'</p>

  <h4>Attributes</h4>

  <p><strong>Strength:</strong> { character.strength.value } ({ dMod(character.strength.modifier) })</p>
  <p><strong>Agility:</strong> { character.agility.value } ({ dMod(character.agility.modifier) })</p>
  <p><strong>Stamina:</strong> { character.stamina.value } ({ dMod(character.stamina.modifier) })</p>
  <p><strong>Personality:</strong> { character.personality.value } ({ dMod(character.personality.modifier) })</p>
  <p><strong>Intelligence:</strong> { character.intelligence.value } ({ dMod(character.intelligence.modifier) })</p>
  <p><strong>Luck:</strong> { character.luck.value } ({ dMod(character.luck.modifier) })</p>

  <h4>Other Stats</h4>

  <p><strong>Lucky Roll:</strong> { character.luckyRoll.name }: { character.luckyRoll.description }: { dMod(character.luckyRoll.modifier) }</p>

  <h4>Saving Throws</h4>

  <p><strong>Fortitude:</strong> { dMod(character.fortitudeSave) }</p>
  <p><strong>Reflex:</strong> { dMod(character.reflexSave) }</p>
  <p><strong>Willpower:</strong> { dMod(character.willpowerSave) }</p>

  <h4>Spellcasting</h4>

  <p><strong>Spells Known:</strong> { spellsKnown }</p>
  <p><strong>Wizard Max Spell Level:</strong> { character.wizardMaxSpellLevel }</p>
  <p><strong>Cleric Max Spell Level:</strong> { character.clericMaxSpellLevel }</p>

  <h4>Weapons</h4>

  <ul>
    {#each character.weapons as weapon}
    <li>{ weapon.name }: { weapon.damage } dmg, { weapon.range } range</li>
    {/each}
  </ul>

  <h4>Languages</h4>

  <ul>
    {#each character.languages as language }
    <li>{ language }</li>
    {/each}
  </ul>

  <h4>Equipment</h4>

  <ul>
    {#each character.equipment as item }
    <li>{ item.name }</li>
    {/each}
  </ul>

  <h4>Special Rules</h4>

  <ul>
  {#each character.specialRules as rule}
  <li>{ rule }</li>
  {/each}
  </ul>
</section>
