<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import * as Directions from '$lib/geometry/directions';
  import * as Environments from '$lib/environment/environments';
  import * as Temperature from '$lib/temperature';
  import * as MathTranslation from '$lib/math_translation';
  import type Environment from '$lib/environment/environment';
  import { onMount } from 'svelte';
  import GeneratorPage from '$components/GeneratorPage.svelte';
  import SeedControls from '$components/SeedControls.svelte';
  import NumberField from '$components/NumberField.svelte';

  let rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  $effect(() => {
    rng.setSeed(seed);
  });
  let lockSeed = $state(false);

  let environment: Environment | undefined = $state();
  let canvas: HTMLCanvasElement;
  let config = $state(Environments.getDefaultConfig());
  config.rng = rng;

  function elevationToFeet(elevation: number): number {
    const max = 30000;
    const min = -30000;

    const result = MathTranslation.linearMap(elevation, -1, 1, min, max);

    return Math.floor(result);
  }

  function generate() {
    if (!lockSeed) {
      seed = rng.randomString(13);
    }
    rng.setSeed(seed);
    environment = Environments.generate(config);
    if (canvas !== null && typeof canvas === 'object') {
      drawWindArrow(canvas, environment.climate.wind);
    }
  }

  function describeSlope(vector: number[]): string {
    if (vector[0] === 0 && vector[1] === 0) {
      return 'flat';
    }

    return `sloping ${Directions.getWordForVector(vector)}`;
  }

  function randomizeParameters(rng: RNG.RNG) {
    config.latitude = rng.float(-70, 70);
    config.elevation = rng.float(0.1, 0.8);
    config.waterDirection = [rng.float(-20, 20), rng.float(-20, 20), 0];
    config.current = [rng.float(-1, 1), rng.float(-1, 1), 0];
    config.terrainVector = [rng.float(-0.5, 0.5), rng.float(-0.5, 0.5), 0];
  }

  onMount(() => {
    canvas = document.getElementById('windArrow') as HTMLCanvasElement;
    generate();
  });

  function drawWindArrow(canvas: HTMLCanvasElement, wind: number[]) {
    const ctx = canvas.getContext('2d');

    if (ctx === null) {
      console.debug('no context');
      return;
    }

    ctx.reset();

    const width = 100;
    const height = 100;
    const centerX = width / 2;
    const centerY = height / 2;
    const wedgeLength = 3;
    const arrowLength = ((width / 2) * (wind[0] + wind[1])) / 2;
    const windDirection = wind;
    const r = Math.atan2(windDirection[1], windDirection[0]);

    ctx.clearRect(0, 0, width, height);

    ctx.save();

    ctx.translate(centerX, centerY);
    ctx.rotate(r);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(arrowLength, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(arrowLength - wedgeLength, -wedgeLength);
    ctx.lineTo(arrowLength, 0);
    ctx.lineTo(arrowLength - wedgeLength, wedgeLength);
    ctx.stroke();

    ctx.restore();
  }
</script>

<GeneratorPage theme="default" title="Environment Generator">
  {#snippet description()}
    <p>This generates fictional environments. This is mostly useful for debugging.</p>
  {/snippet}

  <NumberField id="latitude" label="Latitude" bind:value={config.latitude} />
  <NumberField id="elevation" label="Elevation" bind:value={config.elevation} />
  <NumberField
    id="erosionIterations"
    label="Erosion Iterations"
    bind:value={config.erosionIterations}
  />
  <NumberField id="erosionStrength" label="Erosion Strength" bind:value={config.erosionStrength} />
  <NumberField id="reliefEnergy" label="Relief Energy" bind:value={config.reliefEnergy} />
  <NumberField id="terrainVector0" label="Terrain Vector X" bind:value={config.terrainVector[0]} />
  <NumberField id="terrainVector1" label="Terrain Vector Y" bind:value={config.terrainVector[1]} />
  <NumberField id="current0" label="Current X" bind:value={config.current[0]} />
  <NumberField id="current1" label="Current Y" bind:value={config.current[1]} />
  <NumberField
    id="waterDirection0"
    label="Water Direction X"
    bind:value={config.waterDirection[0]}
  />
  <NumberField
    id="waterDirection1"
    label="Water Direction Y"
    bind:value={config.waterDirection[1]}
  />

  <SeedControls bind:seed bind:lockSeed />

  <button onclick={generate}>Generate</button>
  <button
    onclick={() => {
      randomizeParameters(rng);
    }}>Randomize Parameters</button
  >

  {#if environment}
    <h2>Terrain</h2>

    <p>
      <strong>Elevation Min:</strong>
      {environment.terrain.elevationMin} ({elevationToFeet(environment.terrain.elevationMin)} ft.)
    </p>
    <p>
      <strong>Elevation Max:</strong>
      {environment.terrain.elevationMax} ({elevationToFeet(environment.terrain.elevationMax)} ft.)
    </p>
    <p><strong>Relief Energy:</strong> {environment.terrain.reliefEnergy}</p>
    <p>
      <strong>Normal Vector:</strong>
      {environment.terrain.normalVector} ({describeSlope(environment.terrain.normalVector)})
    </p>

    <h2>Water System</h2>

    <p>
      <strong>Water Level:</strong>
      {environment.waterSystem.surfaceLevel} ({elevationToFeet(
        environment.waterSystem.surfaceLevel,
      )} ft.)
    </p>
    <p><strong>Water Type:</strong> {environment.waterSystem.waterType}</p>
    <p>
      <strong>Temperature:</strong>
      {Temperature.getComparativeString(environment.waterSystem.temperature, 'celsius')}
    </p>
    <p><strong>Current:</strong> {environment.waterSystem.current}</p>

    <h2>Climate</h2>

    <p>{environment.climate.description}</p>

    <p><strong>Climate Type:</strong> {environment.climate.name}</p>
    <p><strong>Cloud Cover:</strong> {environment.climate.cloudCover}</p>
    <p><strong>Wind:</strong> {environment.climate.wind}</p>

    <canvas id="windArrow" width="100" height="100"></canvas>

    <p>
      <strong>Temperature Min:</strong>
      {Temperature.getComparativeString(environment.climate.temperatureMin, 'celsius')}
    </p>
    <p>
      <strong>Temperature Max:</strong>
      {Temperature.getComparativeString(environment.climate.temperatureMax, 'celsius')}
    </p>
    <p><strong>Precipitation Amount:</strong> {environment.climate.precipitationAmount}</p>
    <p><strong>Precipitation Frequency:</strong> {environment.climate.precipitationFrequency}</p>
    <p><strong>Humidity:</strong> {environment.climate.humidity}</p>

    <h3>Seasons</h3>

    {#each environment.climate.seasons as season}
      <p><strong>Season Name:</strong> {season.name}</p>
      <p><strong>Temperature Adjustment:</strong> {season.temperatureAdjustment}</p>
      <p><strong>Humidity Adjustment:</strong> {season.humidityAdjustment}</p>
    {/each}

    <h2>Biome</h2>

    <p><strong>Biome Name:</strong> {environment.biome.name}</p>
    <p><strong>Temperature:</strong> {environment.biome.temperature}</p>
    <p>
      <strong>Altitude:</strong>
      {environment.biome.altitude} ({elevationToFeet(environment.biome.altitude)} ft.)
    </p>
    <p><strong>Humidity:</strong> {environment.biome.humidity}</p>
    <p><strong>Is Aquatic:</strong> {environment.biome.isAquatic}</p>

    <h3>Descriptions</h3>

    {#each environment.biome.descriptions as description}
      <p>{description}</p>
    {/each}

    <h3>Features</h3>

    {#each environment.biome.features as feature}
      <p>{feature}</p>
    {/each}
  {/if}
</GeneratorPage>
