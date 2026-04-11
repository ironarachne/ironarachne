<script lang="ts">
  import * as Charges from '$lib/heraldry/charges';
  import * as Fields from '$lib/heraldry/fields';
  import * as RNG from '@ironarachne/rng';
  import * as Tinctures from '$lib/heraldry/tinctures';
  import * as Variations from '$lib/heraldry/variations';
  import Download from '$lib/download';
  import SaveSVGToPNG from '$lib/renderers/svg-to-png';
  import { renderSVGAsPNG } from '$lib/images/svg';

  import { generateHeraldry } from '$lib/heraldry/generator';
  import HeraldrySVGRenderer from '$lib/heraldry/renderers/svg';
  import {
    mergeHeraldryGeneratorConfig,
    type HeraldryGeneratorConfig,
  } from '$lib/heraldry/generatorconfig';

  let rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  $effect(() => {
    rng.setSeed(seed);
  });
  let lockSeed = $state(false);

  let blazon = $state('');
  let image = $state('');
  let charges = Charges.all();
  let allCharges = Charges.all();
  let heraldryTag = $state('any');
  let chargeTinctureName = $state('any');
  let chargeTincture = Tinctures.randomChargeTincture(rng);
  let numberOfChargesOption = $state('any');
  let chargePosition = $state('normal');
  let fieldTinctures1 = Tinctures.all();
  let fieldTinctures2 = Tinctures.all();
  let fields = Fields.all();
  let furCount = 0;
  let variations = Variations.all();
  let availableTags = Charges.allChargeTags();
  const heraldryWidth = 600;
  const heraldryHeight = 660;

  function changeCharges() {
    if (heraldryTag === 'any') {
      charges = allCharges;
    } else {
      charges = Charges.matchingTag(heraldryTag, allCharges);
    }
  }

  function setChargeTincture(rng: RNG.RNG) {
    // TODO: if the field tinctures are 'any', automatically contrast them with the charge tincture here
    if (chargeTinctureName === 'any') {
      chargeTincture = Tinctures.randomChargeTincture(rng);
    } else {
      let tincture = Tinctures.byName(chargeTinctureName);
      if (tincture !== undefined) {
        chargeTincture = tincture;
      }
    }
    setFieldTinctures(rng);
  }

  function setFieldTinctures(rng: RNG.RNG) {
    let types1 = [];
    let types2 = [];
    // TODO: when choosing field tinctures is an option, this will need redoing
    if (chargeTincture.type === 'color' || chargeTincture.type === 'stain') {
      types1 = ['metal'];
      types2 = ['metal'];
    } else {
      types1 = ['color'];
      types2 = ['color'];

      if (rng.int(1, 100) > 70) {
        types1.push('stain');
      }
      if (rng.int(1, 100) > 80) {
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
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    let numberOfCharges = randomNumberOfCharges(rng);
    if (numberOfChargesOption === 'one') {
      numberOfCharges = 1;
    } else if (numberOfChargesOption === 'two') {
      numberOfCharges = 2;
    } else if (numberOfChargesOption === 'three') {
      numberOfCharges = 3;
    } else if (numberOfChargesOption === 'four') {
      numberOfCharges = 4;
    } else if (numberOfChargesOption === 'none') {
      numberOfCharges = 0;
    }
    setChargeTincture(rng);

    const config: HeraldryGeneratorConfig = mergeHeraldryGeneratorConfig({
      chargeCount: numberOfCharges,
      chargeOptions: charges,
      chargeTinctures: [chargeTincture],
      chargePosition: chargePosition === 'normal' ? undefined : chargePosition,
      fieldOptions: fields,
      variationOptions: variations,
      fieldTinctures1,
      fieldTinctures2,
      width: heraldryWidth,
      height: heraldryHeight,
      rng: rng,
    });

    const heraldry = generateHeraldry(config);
    blazon = heraldry.blazon;

    const renderer = new HeraldrySVGRenderer();

    image = renderer.render(heraldry.device, config.width, config.height);
    renderSVGAsPNG(image, config.width, config.height, 'output');
  }

  function randomNumberOfCharges(rng: RNG.RNG) {
    const weights = [
      { value: 0, commonality: 20 },
      { value: 1, commonality: 55 },
      { value: 2, commonality: 5 },
      { value: 3, commonality: 3 },
      { value: 4, commonality: 2 },
    ];

    const result = rng.weighted(weights);

    return result;
  }

  function save() {
    const blob = new Blob([image], { type: 'image/svg+xml' });
    Download(window.URL.createObjectURL(blob), `heraldry-${seed}.svg`);
  }

  function saveAsPNG() {
    SaveSVGToPNG(image, heraldryWidth, heraldryHeight, `heraldry-${seed}.png`);
  }

  generate();
</script>

<section class="fantasy main">
  <h1>Heraldry Generator</h1>
  <p>
    Generate fantasy coats-of-arms. Note: if you change the seed, the page URL won't change, but
    your new seed will be used the next time you hit Generate.
  </p>

  <div class="input-group">
    <label for="seed">Seed</label>
    <input type="text" name="seed" bind:value={seed} id="seed" />
    <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
  </div>

  <div class="input-group">
    <label for="tag">Charge Tag</label>
    <select name="tag" bind:value={heraldryTag} onchange={changeCharges}>
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
      <option>four</option>
    </select>
  </div>
  <div class="input-group">
    <label for="charge-position">Charge Position</label>
    <select name="charge-position" bind:value={chargePosition}>
      <option value="normal">normal</option>
      <option value="in chief">in chief</option>
    </select>
  </div>
  <div class="input-group">
    <label for="charge-tincture">Charge Tincture</label>
    <select
      name="charge-tincture"
      bind:value={chargeTinctureName}
      onchange={() => setChargeTincture(rng)}
    >
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
  <button onclick={generate}>Generate</button>
  <button onclick={save} disabled={image === ''}>Save</button>
  <button onclick={saveAsPNG} disabled={image === ''}>Save as PNG</button>

  <p class="blazon">{blazon}</p>
  <div class="coat-of-arms"><img alt="" id="output" /></div>
</section>

<svelte:head>
  <title>Heraldry Generator | Iron Arachne</title>
</svelte:head>

<style>
  div.coat-of-arms {
    width: 600px;
    height: 660px;
    margin: 0 auto;
  }

  p.blazon {
    text-align: center;
  }
</style>
