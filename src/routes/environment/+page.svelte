<script lang="ts">
    import * as RND from "@ironarachne/rng";
    import * as Directions from "$lib/geometry/directions";
    import * as Environments from "$lib/environment/environments";
    import * as Temperature from "$lib/temperature";
    import * as MathTranslation from "$lib/math_translation";
    import random from "random";
    import seedrandom from "seedrandom";
    import type Environment from "$lib/environment/environment";
    import { onMount } from 'svelte';

    let environment: Environment;
    let canvas: HTMLCanvasElement;
    let config = Environments.getDefaultConfig();
    let seed = RND.randomString(13);

    function elevationToFeet(elevation: number): number {
        const max = 30000;
        const min = -30000;

        const result = MathTranslation.linearMap(elevation, -1, 1, min, max);

        return Math.floor(result);
    }
    
    function generate() {
        random.use(seedrandom(seed));
        environment = Environments.generate(config);
        if (canvas !== null && typeof canvas === "object") {
            drawWindArrow(canvas, environment.climate.wind);
        }
    }

    function describeSlope(vector: number[]): string {
        if (vector[0] === 0 && vector[1] === 0) {
            return "flat";
        }

        return `sloping ${Directions.getWordForVector(vector)}`;
    }

    function newSeed() {
        seed = RND.randomString(13);
        random.use(seedrandom(seed));
        
        generate();
    }

    function randomizeParameters() {
        config.latitude = random.float(-70, 70);
        config.elevation = random.float(0.1, 0.8);
        config.waterDirection = [random.float(-20, 20), random.float(-20, 20), 0];
        config.current = [random.float(-1, 1), random.float(-1, 1), 0];
        config.terrainVector = [random.float(-0.5, 0.5), random.float(-0.5, 0.5), 0];
    }

    generate();

    onMount(() => {
        canvas = document.getElementById("windArrow") as HTMLCanvasElement;
        generate();
    });

    function drawWindArrow(canvas: HTMLCanvasElement, wind: number[]) {      
        const ctx = canvas.getContext("2d");

        if (ctx === null) {
            console.debug("no context");
            return;
        }

        ctx.reset();

        const width = 100;
        const height = 100;
        const centerX = width / 2;
        const centerY = height / 2;
        const wedgeLength = 3;
        const arrowLength = (width/2) * (wind[0] + wind[1]) / 2;
        const windDirection = wind;
        const r = Math.atan2(windDirection[1], windDirection[0]); // angle of the wind vector in radians

        ctx.clearRect(0, 0, width, height);

        ctx.save();

        ctx.translate(centerX, centerY);
        ctx.rotate(r);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(arrowLength, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(arrowLength - wedgeLength, - wedgeLength);
        ctx.lineTo(arrowLength, 0);
        ctx.lineTo(arrowLength - wedgeLength, wedgeLength);
        ctx.stroke();
        
        ctx.restore();
    }
</script>

<style lang="scss">
    @import "$lib/styles/reset.scss";
    @import "$lib/styles/main.scss";
    @import '$lib/styles/global.scss';
    @import '$lib/styles/fantasy.scss';
</style>

<svelte:head>
    <title>Environment Generator | Iron Arachne</title>
</svelte:head>

<section class="main default">
    <h1>Environment Generator</h1>
    <p>This generates fictional environments. This is mostly useful for debugging.</p>

    <div class="input-group">
        <label for="latitude">Latitude</label>
        <input type="number" name="latitude" bind:value={config.latitude} id="latitude"/>
    </div>

    <div class="input-group">
        <label for="elevation">Elevation</label>
        <input type="number" name="elevation" bind:value={config.elevation} id="elevation"/>
    </div>

    <div class="input-group">
        <label for="erosionIterations">Erosion Iterations</label>
        <input type="number" name="erosionIterations" bind:value={config.erosionIterations} id="erosionIterations"/>
    </div>

    <div class="input-group">
        <label for="erosionStrength">Erosion Strength</label>
        <input type="number" name="erosionStrength" bind:value={config.erosionStrength} id="erosionStrength"/>
    </div>

    <div class="input-group">
        <label for="reliefEnergy">Relief Energy</label>
        <input type="number" name="reliefEnergy" bind:value={config.reliefEnergy} id="reliefEnergy"/>
    </div>

    <div class="input-group">
        <label for="terrainVector0">Terrain Vector X</label>
        <input type="number" name="terrainVector0" bind:value={config.terrainVector[0]} id="terrainVector0"/>
    </div>

    <div class="input-group">
        <label for="terrainVector1">Terrain Vector Y</label>
        <input type="number" name="terrainVector1" bind:value={config.terrainVector[1]} id="terrainVector1"/>
    </div>

    <div class="input-group">
        <label for="current0">Current X</label>
        <input type="number" name="current0" bind:value={config.current[0]} id="current0"/>
    </div>

    <div class="input-group">
        <label for="current1">Current Y</label>
        <input type="number" name="current1" bind:value={config.current[1]} id="current1"/>
    </div>

    <div class="input-group">
        <label for="waterDirection0">Water Direction X</label>
        <input type="number" name="waterDirection0" bind:value={config.waterDirection[0]} id="waterDirection0"/>
    </div>

    <div class="input-group">
        <label for="waterDirection1">Water Direction Y</label>
        <input type="number" name="waterDirection1" bind:value={config.waterDirection[1]} id="waterDirection1"/>
    </div>

    <div class="input-group">
        <label for="seed">Random Seed</label>
        <input type="text" name="seed" bind:value={seed} id="seed"/>
    </div>

    <button on:click={generate}>Generate From Seed</button>
    <button on:click={newSeed}>Random Seed (and Generate)</button>
    <button on:click={randomizeParameters}>Randomize Parameters</button>

    <h2>Terrain</h2>

    <p><strong>Elevation Min:</strong> {environment.terrain.elevationMin} ({elevationToFeet(environment.terrain.elevationMin)} ft.)</p>
    <p><strong>Elevation Max:</strong> {environment.terrain.elevationMax} ({elevationToFeet(environment.terrain.elevationMax)} ft.)</p>
    <p><strong>Relief Energy:</strong> {environment.terrain.reliefEnergy}</p>
    <p><strong>Normal Vector:</strong> {environment.terrain.normalVector} ({describeSlope(environment.terrain.normalVector)})</p>

    <h2>Water System</h2>

    <p><strong>Water Level:</strong> {environment.waterSystem.surfaceLevel} ({elevationToFeet(environment.waterSystem.surfaceLevel)} ft.)</p>
    <p><strong>Water Type:</strong> {environment.waterSystem.waterType}</p>
    <p><strong>Temperature:</strong> {Temperature.getComparativeString(environment.waterSystem.temperature, "celsius")}</p>
    <p><strong>Current:</strong> {environment.waterSystem.current}</p>

    <h2>Climate</h2>

    <p>{environment.climate.description}</p>

    <p><strong>Climate Type:</strong> {environment.climate.name}</p>
    <p><strong>Cloud Cover:</strong> {environment.climate.cloudCover}</p>
    <p><strong>Wind:</strong> {environment.climate.wind}</p>

    <canvas id="windArrow" width="100" height="100"></canvas>

    <p><strong>Temperature Min:</strong> {Temperature.getComparativeString(environment.climate.temperatureMin, "celsius")}</p>
    <p><strong>Temperature Max:</strong> {Temperature.getComparativeString(environment.climate.temperatureMax, "celsius")}</p>
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
    <p><strong>Altitude:</strong> {environment.biome.altitude}  ({elevationToFeet(environment.biome.altitude)} ft.)</p>
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
</section>
