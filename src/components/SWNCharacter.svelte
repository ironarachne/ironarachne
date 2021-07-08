<script>
  import * as RND from "../modules/random";
  import * as CharGen from "../modules/swn/character";

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

<svelte:head>
  <title>Stars Without Number Character Generator | Iron Arachne</title>
</svelte:head>

<section class="main scifi">
  <h2>Stars Without Number Character Generator</h2>

  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>
  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>
  <button on:click={save}>Save</button>

  <h3>Character</h3>

  <p><strong>Background:</strong> {character.background.name}</p>
  <p><strong>Class:</strong> {character.characterClass.name}</p>
  <p><strong>Hit Points:</strong> {character.hitPoints}</p>
  {#if character.effort > 0}
    <p><strong>Effort:</strong> {character.effort}</p>
  {/if}
  <p><strong>Base Attack Bonus:</strong> +{character.attackBonus}</p>
  <p><strong>Armor Class:</strong> {character.armorClassEquipped}</p>
  <p><strong>Credits:</strong> {character.credits}</p>

  <h4>Saving Throws</h4>

  <p><strong>Evasion:</strong> {character.savingThrowEvasion}</p>
  <p><strong>Mental:</strong> {character.savingThrowMental}</p>
  <p><strong>Physical:</strong> {character.savingThrowPhysical}</p>

  <h4>Focuses</h4>

  {#each character.focuses as focus}
    <div>
      <strong>{focus.name}</strong>, Level {focus.currentLevel}
    </div>
  {/each}

  <h4>Stats</h4>

  <div class="stats">
    {#each character.stats as stat}
      <div>
        <strong>{stat.abbreviation}:</strong>
        <span>{stat.score} ({stat.modifier})</span>
      </div>
    {/each}
  </div>

  <h4>Skills</h4>

  <div class="skills">
    {#each character.skills as skill}
      <div>
        {skill.name}-{skill.level}
      </div>
    {/each}
  </div>

  <h4>Abilities</h4>

  <div class="abilities">
    {#each character.abilities as ability}
      <div>
        {ability.description}
      </div>
    {/each}
  </div>

  <h4>Weapons</h4>

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

  <h4>Armor</h4>

  {#each character.armor as item}
    <div>
      <strong>{item.name}:</strong> <span>{item.ac} AC</span>
    </div>
  {/each}

  <h4>Equipment</h4>

  {#each character.equipment as item}
    <div>
      {item.name}
    </div>
  {/each}
</section>

<style>
  div.abilities > div {
    border-left: 1px solid #aaa;
    margin-bottom: 1rem;
    padding-left: 1rem;
  }
</style>
