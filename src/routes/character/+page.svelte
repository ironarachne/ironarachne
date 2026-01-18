<script lang="ts">
    import * as RNG from '@ironarachne/rng';
    import * as Measurements from "$lib/measurements";
    import { generate, getDefaultCharacterGenerationConfig, type Character } from '$lib/characters';

    let seed = RNG.randomString(13);
    let rng = new RNG.RNG(seed);
    let character: null | Character = null;

    let lockSeed = false;
    $: if (!lockSeed) {
        rng.setSeed(seed);
    }

    function generateCharacter() {
        if (!lockSeed) {
            seed = RNG.randomString(13);
            rng.setSeed(seed);
        }
        const config = getDefaultCharacterGenerationConfig(seed + "-character");
        character = generate(seed + "-character", config);
    }

</script>

<svelte:head>
    <title>Character | Iron Arachne</title>
</svelte:head>

<section class="main">
    <h1>Character</h1>

    <p>This generator creates random characters.</p>

    <div class="input-group">
        <label for="seed">Seed</label>
        <input type="text" name="seed" bind:value={seed} id="seed" />
        <input type="checkbox" name="lockSeed" bind:checked={lockSeed} id="lockSeed" /> Lock Seed
    </div>

    <button onclick={generateCharacter}>Generate</button>

    {#if character}
    <h2>{character.name}</h2>
    <p>Species: {character.species.name}</p>
    {#if character.archetype}
    <p>Archetype: {character.archetype.name}</p>
    {/if}
    <p>Age: {character.age} years</p>
    <p>Height: {Measurements.inchesToFeetExpression(Measurements.cmToInches(character.height))}</p>
    <p>Weight: {Measurements.kgToPounds(character.weight)}</p>
    {/if}

</section>