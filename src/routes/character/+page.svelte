<script lang="ts">
    import * as RNG from '@ironarachne/rng';
    import * as Measurements from "$lib/measurements";
    import { generate, getDefaultCharacterGenerationConfig, type Character, type Title } from '$lib/characters';
    import { renderDeviceBlazon } from '$lib/heraldry/device';
    import { onMount } from 'svelte';
    import { sentientSpeciesList } from '$lib/species/sentient';
    import { getAllFantasyArchetypes } from '$lib/archetypes';
    import { getCategoryList } from '$lib/age/age_categories';
    import { getFantasyNameGeneratorSet } from '$lib/names';
    import * as MUN from '@ironarachne/made-up-names'; // Need to import this to check supported sets properly, or catch error

    let seed = RNG.randomString(13);
    let rng = new RNG.RNG(seed);
    let character: null | Character = null;

    let speciesList = sentientSpeciesList;
    let archetypeOptions = getAllFantasyArchetypes().sort((a, b) => a.name.localeCompare(b.name));
    let ageCategories = getCategoryList();
    let genderOptions = ['Random', 'Male', 'Female'];

    let selectedSpeciesName = 'human';
    let selectedArchetypeName = 'Random';
    let selectedGenderName = 'Random';
    let selectedAgeCategoryName = 'Random';

    let lockSeed = false;
    $: if (!lockSeed) {
        rng.setSeed(seed);
    }

    function generateCharacter() {
        if (!lockSeed) {
            seed = RNG.randomString(13);
            rng.setSeed(seed);
        }
        
        let config = getDefaultCharacterGenerationConfig(seed + "-character");

        // Species
        const species = sentientSpeciesList.find(s => s.name === selectedSpeciesName) || sentientSpeciesList[0];
        config.species = species;

        // Name Generators
        // Simple mapping attempt: lower case species name. If failure, default to human.
        // Some species like "wild elf" might map to "elf".
        // For now, we try exact match on name or fallback.
        try {
             // We can check supported sets if we want, but try-catch is easier here without importing MUN internals
             // Common mapping: 
             let nameSetToUse = species.name.toLowerCase();
             if (nameSetToUse.includes('elf')) nameSetToUse = 'elf';
             if (nameSetToUse.includes('dwarf')) nameSetToUse = 'dwarf';
             if (nameSetToUse.includes('gnome')) nameSetToUse = 'gnome';
             if (nameSetToUse.includes('halfling')) nameSetToUse = 'halfling';
             if (nameSetToUse.includes('human')) nameSetToUse = 'human';
             if (nameSetToUse.includes('orc')) nameSetToUse = 'orc';
             if (nameSetToUse.includes('goblin')) nameSetToUse = 'goblin';
             
             const nameSet = getFantasyNameGeneratorSet(nameSetToUse, rng);
             config.maleFirstNameGenerator = nameSet.male;
             config.femaleFirstNameGenerator = nameSet.female;
             config.familyNameGenerator = nameSet.family;
        } catch (e) {
             console.log(`Name set not found for ${species.name}, falling back to human.`);
             // Default config is already human logic
        }

        // Archetype
        if (selectedArchetypeName !== 'Random') {
             const arch = archetypeOptions.find(a => a.name === selectedArchetypeName);
             if (arch) {
                 config.archetypeOptions = [arch];
             }
        }
        
        // Gender
        if (selectedGenderName !== 'Random') {
            config.allowedGenderNames = [selectedGenderName.toLowerCase()];
        } else {
             config.allowedGenderNames = undefined;
        }

        // Age Category
        if (selectedAgeCategoryName !== 'Random') {
            config.allowedAgeCategoryNames = [selectedAgeCategoryName];
        } else {
            config.allowedAgeCategoryNames = undefined;
        }

        character = generate(seed + "-character", config);
    }

    function getDisplayTitle(title: Title, genderName: string): string {
        const titleName = genderName.toLowerCase() === 'female' ? title.femaleTitle : title.maleTitle;
        if (title.hasLands && title.landName) {
            return `${titleName} of ${title.landName}`;
        }
        return titleName;
    }

    onMount(() => {
        generateCharacter();
    });
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

    <div class="input-group">
        <label for="species">Species</label>
        <select bind:value={selectedSpeciesName} id="species">
            {#each speciesList as species}
                <option value={species.name}>{species.name}</option>
            {/each}
        </select>
    </div>

    <div class="input-group">
        <label for="archetype">Archetype</label>
        <select bind:value={selectedArchetypeName} id="archetype">
            <option value="Random">Random</option>
            {#each archetypeOptions as archetype}
                <option value={archetype.name}>{archetype.name}</option>
            {/each}
        </select>
    </div>

    <div class="input-group">
        <label for="gender">Gender</label>
        <select bind:value={selectedGenderName} id="gender">
             {#each genderOptions as gender}
                <option value={gender}>{gender}</option>
            {/each}
        </select>
    </div>

    <div class="input-group">
        <label for="age">Age</label>
        <select bind:value={selectedAgeCategoryName} id="age">
            <option value="Random">Random</option>
            {#each ageCategories as age}
                <option value={age}>{age}</option>
            {/each}
        </select>
    </div>

    <button onclick={generateCharacter}>Generate</button>

    {#if character}
    <h2>{character.name}</h2>
    {#if character.titles && character.titles.length > 0}
        <h3>Titles</h3>
        <ul>
            {#each character.titles as title}
                <li>{getDisplayTitle(title, character.gender.name)}</li>
            {/each}
        </ul>
    {/if}
    <p><strong>Description:</strong> {character.description}</p>
    <p><strong>Gender:</strong> {character.gender.name}</p>
    <p><strong>Species:</strong> {character.species.name}</p>
    {#if character.creatureTypes.length > 0}
         <p><strong>Type:</strong> {character.creatureTypes.join(', ')}</p>
    {/if}
    {#if character.archetype}
    <p><strong>Archetype:</strong> {character.archetype.name}</p>
    {/if}
    <p><strong>Age:</strong> {character.age} years ({character.ageCategory.name})</p>
    <p><strong>Height:</strong> {Measurements.inchesToFeetExpression(Measurements.cmToInches(character.height))}</p>
    {#if character.length > 0}
    <p><strong>Length:</strong> {Measurements.inchesToFeetExpression(Measurements.cmToInches(character.length))}</p>
    {/if}
    <p><strong>Weight:</strong> {Measurements.kgToPounds(character.weight)} lbs.</p>
    
    {#if character.physicalTraits.length > 0}
        <h3>Physical Traits</h3>
        <ul>
            {#each character.physicalTraits as trait}
                <li><strong>{trait.name}:</strong> {trait.description}</li>
            {/each}
        </ul>
    {/if}

    {#if character.personalityTraits.length > 0}
        <h3>Personality</h3>
        <p>{character.personalityTraits.join(', ')}</p>
    {/if}
    
    {#if character.heraldry}
         <h3>Heraldry</h3>
         <p>{renderDeviceBlazon(character.heraldry)}</p>
    {/if}

    {#if character.abilities.length > 0}
        <h3>Abilities</h3>
        <ul>
            {#each character.abilities as ability}
                <li><strong>{ability.name}:</strong> {ability.description}</li>
            {/each}
        </ul>
    {/if}

     {#if character.carried.length > 0}
        <h3>Equipment</h3>
        <ul>
            {#each character.carried as item}
                <li>{item.name}</li>
            {/each}
        </ul>
    {/if}
    {/if}

</section>