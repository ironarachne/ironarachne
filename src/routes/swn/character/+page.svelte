<script>
  import * as CharGen from "$lib/swn/character";
  import * as RND from "@ironarachne/rng";
  import random from "random";
  import seedrandom from "seedrandom";

  let seed = RND.randomString(13);
  random.use(seedrandom(seed));
  let character = CharGen.generate();

  function generate() {
    random.use(seedrandom(seed));
    character = CharGen.generate();
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  function save() {
    let saveData = CharGen.formatAsText(character);

    const blob = new Blob([saveData], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "swn-character.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }
</script>

<style lang="scss">
  @import "$lib/styles/reset.scss";
  @import "$lib/styles/main.scss";
  @import '$lib/styles/global.scss';
  @import '$lib/styles/scifi.scss';

  div.abilities > div {
    border-left: 1px solid #aaa;
    margin-bottom: 1rem;
    padding-left: 1rem;
  }
</style>

<svelte:head>
  <title>Stars Without Number Character Generator | Iron Arachne</title>
</svelte:head>

<section class="main scifi">
  <h1>Stars Without Number Character Generator</h1>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>
  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>
  <button on:click={save}>Save</button>

  <h2>Character</h2>

  <p><strong>Background:</strong> {character.background.name}</p>
  <p><strong>Class:</strong> {character.characterClass.name}</p>
  <p><strong>Hit Points:</strong> {character.hitPoints}</p>
  {#if character.effort > 0}
    <p><strong>Effort:</strong> {character.effort}</p>
  {/if}
  <p><strong>Base Attack Bonus:</strong> +{character.attackBonus}</p>
  <p><strong>Armor Class:</strong> {character.armorClassEquipped}</p>
  <p><strong>Credits:</strong> {character.credits}</p>

  <h3>Saving Throws</h3>

  <p><strong>Evasion:</strong> {character.savingThrowEvasion}</p>
  <p><strong>Mental:</strong> {character.savingThrowMental}</p>
  <p><strong>Physical:</strong> {character.savingThrowPhysical}</p>

  <h3>Focuses</h3>

  {#each character.focuses as focus}
    <div>
      <strong>{focus.name}</strong>, Level {focus.currentLevel}
    </div>
  {/each}

  <h3>Stats</h3>

  <div class="stats">
    {#each character.stats as stat}
      <div>
        <strong>{stat.abbreviation}:</strong>
        <span>{stat.score} ({stat.modifier})</span>
      </div>
    {/each}
  </div>

  <h3>Skills</h3>

  <div class="skills">
    {#each character.skills as skill}
      <div>
        {skill.name}-{skill.level}
      </div>
    {/each}
  </div>

  <h3>Abilities</h3>

  <div class="abilities">
    {#each character.abilities as ability}
      <div>
        {ability.description}
      </div>
    {/each}
  </div>

  <h3>Weapons</h3>

  {#each character.rangedWeapons as weapon}
    <div>
      <strong>{weapon.name}:</strong>
      <span
        >{weapon.damage} damage, {character.rangedAttackBonus} attack bonus</span
      >
    </div>
  {/each}

  {#each character.meleeWeapons as weapon}
    <div>
      <strong>{weapon.name}:</strong>
      <span
        >{weapon.damage} damage, {character.meleeAttackBonus} attack bonus</span
      >
    </div>
  {/each}

  <h3>Armor</h3>

  {#each character.armor as item}
    <div>
      <strong>{item.name}:</strong> <span>{item.ac} AC</span>
    </div>
  {/each}

  <h3>Equipment</h3>

  {#each character.equipment as item}
    <div>
      {item.name}
    </div>
  {/each}
</section>
