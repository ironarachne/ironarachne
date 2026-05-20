<script lang="ts">
  import { RNG } from '@ironarachne/rng';
  import * as DCC from '$lib/dcc';

  let rng = new RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  $effect(() => {
    rng.setSeed(seed);
  });
  let lockSeed = $state(false);

  let allowDwarves = $state(true);
  let allowElves = $state(true);
  let allowHalflings = $state(true);
  let allowHumans = $state(true);

  let genConfig = DCC.getDefaultDCCCharacterGeneratorConfig(rng.randomString(13));
  let character = $state(DCC.generateRandomDCCCharacter(rng.randomString(13), genConfig));
  let spellsKnown = $state(getSpellsKnown());

  function dMod(modifier: number): string {
    if (modifier > -1) {
      return `+${modifier}`;
    }

    return `${modifier}`;
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);

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

    genConfig.allowedOccupations = allowedOccupations;

    character = DCC.generateRandomDCCCharacter(rng.randomString(13), genConfig);
    spellsKnown = getSpellsKnown();
  }

  function getSpellsKnown(): string {
    if (character.spellsKnown === -9) {
      return 'No spellcasting possible';
    }

    if (character.spellsKnown > -1) {
      return `+${character.spellsKnown}`;
    }

    return `${character.spellsKnown}`;
  }

  function getCurrencyDescription(currency: Record<string, number>): string {
    const parts = [];
    for (const [key, value] of Object.entries(currency)) {
      if (value > 0) {
        parts.push(`${value} ${key}`);
      }
    }
    return parts.join(', ');
  }

  generate();
</script>

<svelte:head>
  <title>Dungeon Crawl Classics Character Generator | Iron Arachne</title>
</svelte:head>

<section class="fantasy main">
  <h1>Dungeon Crawl Classics Character Generator</h1>

  <p>This is a DCC 0-level character generator.</p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <div class="input-group">
    <label for="allowDwarves">Allow Dwarves</label>
    <input type="checkbox" name="allowDwarves" bind:checked={allowDwarves} id="allowDwarves" />
  </div>

  <div class="input-group">
    <label for="allowElves">Allow Elves</label>
    <input type="checkbox" name="allowElves" bind:checked={allowElves} id="allowElves" />
  </div>

  <div class="input-group">
    <label for="allowHalflings">Allow Halflings</label>
    <input
      type="checkbox"
      name="allowHalflings"
      bind:checked={allowHalflings}
      id="allowHalflings"
    />
  </div>

  <div class="input-group">
    <label for="allowHumans">Allow Humans</label>
    <input type="checkbox" name="allowHumans" bind:checked={allowHumans} id="allowHumans" />
  </div>

  <button onclick={generate}>Generate</button>

  <h2>{character.firstName} {character.lastName}</h2>

  <p>A level {character.level} {character.occupation.name}</p>

  <p><strong>XP:</strong> {character.xp}</p>
  <p><strong>HP:</strong> {character.hp}</p>
  <p><strong>AC:</strong> {character.armorClass}</p>
  <p><strong>Currency:</strong> {getCurrencyDescription(character.currency)}</p>
  <p><strong>Alignment:</strong> {character.alignment}</p>
  <p><strong>Gender:</strong> {character.gender}</p>
  <p><strong>Speed:</strong> {character.speed}'</p>

  <h3>Attributes</h3>

  <p><strong>Strength:</strong> {character.strength.value} ({dMod(character.strength.modifier)})</p>
  <p><strong>Agility:</strong> {character.agility.value} ({dMod(character.agility.modifier)})</p>
  <p><strong>Stamina:</strong> {character.stamina.value} ({dMod(character.stamina.modifier)})</p>
  <p>
    <strong>Personality:</strong>
    {character.personality.value} ({dMod(character.personality.modifier)})
  </p>
  <p>
    <strong>Intelligence:</strong>
    {character.intelligence.value} ({dMod(character.intelligence.modifier)})
  </p>
  <p><strong>Luck:</strong> {character.luck.value} ({dMod(character.luck.modifier)})</p>

  <h3>Other Stats</h3>

  <p>
    <strong>Lucky Roll:</strong>
    {character.luckyRoll.name}: {character.luckyRoll.description}: {dMod(
      character.luckyRoll.modifier,
    )}
  </p>

  <h3>Saving Throws</h3>

  <p><strong>Fortitude:</strong> {dMod(character.fortitudeSave)}</p>
  <p><strong>Reflex:</strong> {dMod(character.reflexSave)}</p>
  <p><strong>Willpower:</strong> {dMod(character.willpowerSave)}</p>

  <h3>Spellcasting</h3>

  <p><strong>Spells Known:</strong> {spellsKnown}</p>
  <p><strong>Wizard Max Spell Level:</strong> {character.wizardMaxSpellLevel}</p>
  <p><strong>Cleric Max Spell Level:</strong> {character.clericMaxSpellLevel}</p>

  <h3>Weapons</h3>

  <ul>
    {#each character.weapons as weapon}
      <li>{weapon.name}: {weapon.damage} dmg, {weapon.range} range</li>
    {/each}
  </ul>

  <h3>Languages</h3>

  <ul>
    {#each character.languages as language}
      <li>{language}</li>
    {/each}
  </ul>

  <h3>Equipment</h3>

  <ul>
    {#each character.equipment as item}
      <li>{item.name}</li>
    {/each}
  </ul>

  <h3>Special Rules</h3>

  <ul>
    {#each character.specialRules as rule}
      <li>{rule}</li>
    {/each}
  </ul>
</section>
