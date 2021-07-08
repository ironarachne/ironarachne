<script lang="ts">
  import * as Heraldry from "../modules/heraldry/heraldry";
  import * as Charges from "../modules/heraldry/charges";
  import * as RND from "../modules/random";

  import random from "random";
  import seedrandom from "seedrandom";

  let blazon = "";
  let image = "";
  let seed = RND.randomString(13);
  let charges = Charges.all();

  function generate() {
    random.use(seedrandom(seed));
    let heraldry = Heraldry.generate(charges, 600, 660);
    blazon = heraldry.blazon;
    image = heraldry.svg;
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  function save() {
    const blob = new Blob([image], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "heraldry.svg";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  newSeed();
</script>

<section class="fantasy main">
  <h2>Heraldry Generator</h2>
  <p>
    Generate fantasy coats-of-arms. Note: if you change the seed, the page URL
    won't change, but your new seed will be used the next time you hit Generate.
  </p>
  <div class="input-group">
    <label for="seed">Random Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
  </div>
  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>
  <button on:click={save} disabled={image === ""}>Save</button>

  <p class="blazon">{blazon}</p>
  <div class="coat-of-arms">{@html image}</div>
</section>

<svelte:head>
  <title>Heraldry Generator | Iron Arachne</title>
</svelte:head>

<style type="scss">
  div.coat-of-arms {
    width: 600px;
    height: 660px;
    margin: 0 auto;
  }

  p.blazon {
    text-align: center;
  }
</style>
