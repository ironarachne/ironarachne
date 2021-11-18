<script lang="ts">
  import * as Heraldry from "../modules/heraldry/heraldry";
  import * as Charges from "../modules/heraldry/charges";
  import * as Fields from "../modules/heraldry/fields";
  import * as RND from "../modules/random";
  import * as Tinctures from "../modules/heraldry/tinctures";
  import * as Variations from "../modules/heraldry/variations";
  import Download from "../modules/download";
  import SaveSVGToPNG from "../modules/renderers/svg-to-png";

  import random from "random";
  import seedrandom from "seedrandom";
import GeneratorConfig from "../modules/heraldry/generatorconfig";


  let blazon = "";
  let image = "";
  let seed = RND.randomString(13);
  let charges = Charges.all();
  let allCharges = Charges.all();
  let heraldryTag = 'any';
  let chargeTinctureName = 'any';
  let chargeTincture = Tinctures.randomChargeTincture();
  let numberOfChargesOption = 'any';
  let fieldTinctures1 = Tinctures.all();
  let fieldTinctures2 = Tinctures.all();
  let fields = Fields.all();
  let furCount = 0;
  let variations = Variations.all();
  let availableTags = Charges.allChargeTags();
  const heraldryWidth = 600;
  const heraldryHeight = 660;

  function changeCharges() {
    if (heraldryTag == 'any') {
      charges = allCharges;
    } else {
      charges = Charges.matchingTag(heraldryTag, allCharges);
    }
  }

  function setChargeTincture() { // TODO: if the field tinctures are 'any', automatically contrast them with the charge tincture here
    if (chargeTinctureName == 'any') {
      chargeTincture = Tinctures.randomChargeTincture();
    } else {
      chargeTincture = Tinctures.byName(chargeTinctureName);
    }
    setFieldTinctures();
  }

  function setFieldTinctures() {
    let types1 = [];
    let types2 = [];
    // TODO: when choosing field tinctures is an option, this will need redoing
    if (chargeTincture.type == 'color' || chargeTincture.type == 'stain') {
      types1 = ['metal'];
      types2 = ['metal'];
    } else {
      types1 = ['color'];
      types2 = ['color'];

      if (RND.chance(100) > 70) {
        types1.push('stain');
      }
      if (RND.chance(100) > 80) {
        types2.push('stain');
      }
    }
    if (furCount === 0) {
      types1.push('furs');
    }
    fieldTinctures1 = Tinctures.ofTypes(types1);
    fieldTinctures2 = Tinctures.ofTypes(types2);
  }

  function generate() {
    random.use(seedrandom(seed));
    let numberOfCharges = Heraldry.randomNumberOfCharges();
    if (numberOfChargesOption == 'one') {
      numberOfCharges = 1;
    } else if (numberOfChargesOption == 'two') {
      numberOfCharges = 2;
    } else if (numberOfChargesOption == 'three') {
      numberOfCharges = 3;
    } else if (numberOfChargesOption == 'none') {
      numberOfCharges = 0;
    }
    setChargeTincture();

    let config = new GeneratorConfig();

    config.chargeCount = numberOfCharges;
    config.chargeOptions = charges;
    config.chargeTinctures = [chargeTincture];
    config.fieldOptions = fields;
    config.variationOptions = variations;
    config.fieldTinctures1 = fieldTinctures1;
    config.fieldTinctures2 = fieldTinctures2;
    config.width = heraldryWidth;
    config.height = heraldryHeight;

    let heraldry = Heraldry.generate(config);
    blazon = heraldry.blazon;
    image = heraldry.svg;
  }

  function newSeed() {
    seed = RND.randomString(13);
    generate();
  }

  function save() {
    const blob = new Blob([image], { type: "image/svg+xml" });
    Download(window.URL.createObjectURL(blob), `heraldry-${seed}.svg`);
  }

  function saveAsPNG() {
    SaveSVGToPNG(image, heraldryWidth, heraldryHeight, `heraldry-${seed}.png`);
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
  <div class="input-group">
    <label for="tag">Charge Tag</label>
    <select name="tag" bind:value={heraldryTag} on:change={changeCharges}>
      <option>any</option>
      {#each availableTags as tag}
      <option>{tag}</option>
      {/each}
    </select>
  </div>
  <div class="input-group">
    <label for="num-charges">Number of Charges</label>
    <select name="num-charges" bind:value={numberOfChargesOption}>
      <option>any</option>
      <option>none</option>
      <option>one</option>
      <option>two</option>
      <option>three</option>
    </select>
  </div>
  <div class="input-group">
    <label for="charge-tincture">Charge Tincture</label>
    <select name="charge-tincture" bind:value={chargeTinctureName} on:change={setChargeTincture}>
      <option>any</option>
      <option value="gules">gules (red)</option>
      <option value="argent">argent (white)</option>
      <option value="vert">vert (green)</option>
      <option value="purpure">purpure (purple)</option>
      <option value="sable">sable (black)</option>
      <option value="Or">Or (gold)</option>
      <option value="azure">azure (blue)</option>
      <option value="murrey">murrey (mulberry)</option>
      <option value="sanguine">sanguine (blood red)</option>
      <option value="tenné">tenné (brown)</option>
    </select>
  </div>
  <button on:click={generate}>Generate From Seed</button>
  <button on:click={newSeed}>Random Seed (and Generate)</button>
  <button on:click={save} disabled={image === ""}>Save</button>
  <button on:click={saveAsPNG} disabled={image === ""}>Save as PNG</button>

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
