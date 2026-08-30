<script lang="ts">
  import Stat from '$components/common/Stat.svelte';
  import StatBlock from '$components/common/StatBlock.svelte';
  import * as RNG from '@ironarachne/rng';
  import { Directions } from '$lib/geometry';
  import { Environments } from '$lib/environment';
  import * as Temperature from '$lib/temperature';
  import * as MathTranslation from '$lib/math_translation';
  import type { Environment } from '$lib/environment';
  import { onMount } from 'svelte';
  import GeneratorPage from '$components/layout/GeneratorPage.svelte';
  import SeedControls from '$components/common/SeedControls.svelte';
  import NumberField from '$components/common/NumberField.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  const rng = new RNG.RNG(Date.now().toString());
  let seed = $state(rng.randomString(13));
  $effect(() => {
    rng.setSeed(seed);
  });
  let lockSeed = $state(false);

  let environment: Environment | undefined = $state();
  let canvas: HTMLCanvasElement;
  const config = $state(Environments.getDefaultConfig());
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

<GeneratorPage toolPath="/environment" title="Environment Generator">
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

  <BaseButton onclick={generate}>Generate</BaseButton>
  <BaseButton
    onclick={() => {
      randomizeParameters(rng);
    }}>Randomize Parameters</BaseButton
  >

  {#if environment}
    <h2>Terrain</h2>

    <Stat label="Elevation Min">
      {environment.terrain.elevationMin} ({elevationToFeet(environment.terrain.elevationMin)} ft.)
    </Stat>
    <Stat label="Elevation Max">
      {environment.terrain.elevationMax} ({elevationToFeet(environment.terrain.elevationMax)} ft.)
    </Stat>
    <StatBlock>
      <Stat label="Relief Energy">{environment.terrain.reliefEnergy}</Stat>
    </StatBlock>
    <Stat label="Normal Vector">
      {environment.terrain.normalVector} ({describeSlope(environment.terrain.normalVector)})
    </Stat>

    <h2>Water System</h2>

    <Stat label="Water Level">
      {environment.waterSystem.surfaceLevel} ({elevationToFeet(
        environment.waterSystem.surfaceLevel,
      )} ft.)
    </Stat>
    <StatBlock>
      <Stat label="Water Type">{environment.waterSystem.waterType}</Stat>
    </StatBlock>
    <Stat label="Temperature">
      {Temperature.getComparativeString(environment.waterSystem.temperature, 'celsius')}
    </Stat>
    <StatBlock>
      <Stat label="Current">{environment.waterSystem.current}</Stat>
    </StatBlock>

    <h2>Climate</h2>

    <p>{environment.climate.description}</p>

    <StatBlock>
      <Stat label="Climate Type">{environment.climate.name}</Stat>
      <Stat label="Cloud Cover">{environment.climate.cloudCover}</Stat>
      <Stat label="Wind">{environment.climate.wind}</Stat>
    </StatBlock>

    <canvas id="windArrow" width="100" height="100"></canvas>

    <Stat label="Temperature Min">
      {Temperature.getComparativeString(environment.climate.temperatureMin, 'celsius')}
    </Stat>
    <Stat label="Temperature Max">
      {Temperature.getComparativeString(environment.climate.temperatureMax, 'celsius')}
    </Stat>
    <StatBlock>
      <Stat label="Precipitation Amount">{environment.climate.precipitationAmount}</Stat>
      <Stat label="Precipitation Frequency">{environment.climate.precipitationFrequency}</Stat>
      <Stat label="Humidity">{environment.climate.humidity}</Stat>
    </StatBlock>

    <h3>Seasons</h3>

    {#each environment.climate.seasons as season}
      <StatBlock>
        <Stat label="Season Name">{season.name}</Stat>
        <Stat label="Temperature Adjustment">{season.temperatureAdjustment}</Stat>
        <Stat label="Humidity Adjustment">{season.humidityAdjustment}</Stat>
      </StatBlock>
    {/each}

    <h2>Biome</h2>

    <StatBlock>
      <Stat label="Biome Name">{environment.biome.name}</Stat>
      <Stat label="Temperature">{environment.biome.temperature}</Stat>
    </StatBlock>
    <Stat label="Altitude">
      {environment.biome.altitude} ({elevationToFeet(environment.biome.altitude)} ft.)
    </Stat>
    <StatBlock>
      <Stat label="Humidity">{environment.biome.humidity}</Stat>
      <Stat label="Is Aquatic">{environment.biome.isAquatic}</Stat>
    </StatBlock>

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
