<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import { resolve } from '$app/paths';
  import * as Dice from '$lib/dice';
  import AdndCharacterSheet from '$components/characters/AdndCharacterSheet.svelte';
  import {
    createAdndCharacter,
    type ADNDCharacter,
    assignExceptionalStrength,
    getClassOptionsForRace,
    getRaceOptions,
    applyAdndPriestFundsCapIfNeeded,
    finalizeAdndCharacterDerivedStats,
    getAdndLevel1HpBounds,
    recalculateAdndArmorClass,
    rollAdndLevel1Hp,
    rollAdndStartingCopper,
    Equipment,
    applyHalflingWithOptions,
    type HalflingSubrace,
    applyThiefSkillAllocation,
    ADND_THIEF_SKILL_BONUS_CAP,
    getThiefSkillBuildKindForClass,
    getThiefSkillPointPool,
    prepareThiefSkillRowsForCharacter,
    sumThiefSkillBonuses,
    thiefSkillBonusesAreValid,
    getStartingSpellChoiceGroups,
    starterSpellSelectionIsComplete,
    startingSpellsFromPicks,
    downloadAdndCharacterPdf,
    classes,
    races,
  } from '$lib/adnd';
  import type { ADNDClass, ADNDRace } from '$lib/adnd';
  import { Currency } from '$lib/currency';
  import { showsMaturityBadge, toolMaturityForPath } from '$lib/tools';
  import { showAlertModal } from '$lib/ui';
  import {
    buildCharacterNameSource,
    loadCulturesForNaming,
    rollCharacterNameForSource,
  } from '$lib/characters';
  import type { Culture } from '$lib/culture';
  import { onMount } from 'svelte';
  import CharacterNameSection from '$components/characters/CharacterNameSection.svelte';
  import DownloadPdfButton from '$components/common/DownloadPdfButton.svelte';
  import ToolMaturityBadge from '$components/common/ToolMaturityBadge.svelte';

  // The builder keeps its own header — the h1 shares a row with Reset — rather than mounting
  // `GeneratorPage`, so it states its maturity itself. The value still comes from the catalog.
  const maturity = toolMaturityForPath('/fantasy/adnd/character/build');

  let rollRng = new RNG.RNG(Date.now().toString());

  let str = $state(0);
  let dex = $state(0);
  let con = $state(0);
  let int = $state(0);
  let wis = $state(0);
  let cha = $state(0);

  let raceName = $state('');
  let className = $state('');
  let alignment = $state('');

  let halflingSubrace = $state<HalflingSubrace>('Hairfeet');
  let halflingInfravision = $state(false);

  let hpValue = $state(1);
  let startingGp = $state(0);
  let startingSp = $state(0);
  let startingCp = $state(0);

  let classFeaturesSeed = $state(rollRng.randomString(13));
  let selectedWeaponNames = $state<string[]>([]);
  let selectedArmorNames = $state<string[]>([]);
  let starterSpellPicks = $state<string[][]>([]);
  let thiefSkillBonuses = $state<Record<string, number>>({});
  let wasEquipmentOverBudget = $state(false);
  let downloadingPdf = $state(false);

  let savedCultures = $state<Culture[]>([]);
  let nameSourceKind = $state<'default' | 'preset' | 'saved_culture'>('default');
  let presetSetName = $state('human');
  let savedCultureName = $state('');
  let firstName = $state('');
  let lastName = $state('');
  let lockName = $state(false);
  let namingGender = $state<'male' | 'female' | 'random'>('random');

  function wealthCpFromCoinFields(gp: unknown, sp: unknown, cp: unknown): number {
    const g = Math.max(0, Math.floor(Number(gp) || 0));
    const s = Math.max(0, Math.floor(Number(sp) || 0));
    const c = Math.max(0, Math.floor(Number(cp) || 0));
    return g * 100 + s * 10 + c;
  }

  const startingWealthCp = $derived(wealthCpFromCoinFields(startingGp, startingSp, startingCp));

  function setStartingWealthFromTotalCp(totalCp: number) {
    const n = Math.max(0, Math.floor(totalCp));
    startingGp = Math.floor(n / 100);
    startingSp = Math.floor((n % 100) / 10);
    startingCp = n % 10;
  }

  const allRaces = races.getAll();
  const allClasses = classes.getAll();

  function makeBaseCharacter(): ADNDCharacter {
    const c = createAdndCharacter();
    c.strength = str;
    c.dexterity = dex;
    c.constitution = con;
    c.intelligence = int;
    c.wisdom = wis;
    c.charisma = cha;
    c.exceptionalStrength = -1;
    c.abilities = [];
    c.spells = [];
    c.weapons = [];
    c.armor = [];
    return c;
  }

  const eligibleRaces = $derived.by(() => {
    if (str < 1) return [] as ADNDRace[];
    return getRaceOptions(makeBaseCharacter(), allRaces);
  });

  const selectedRace = $derived(allRaces.find((r) => r.name === raceName) ?? null);

  const characterAfterRace = $derived.by(() => {
    if (!selectedRace || str < 1) return null;
    const c = makeBaseCharacter();
    c.race = selectedRace;
    if (selectedRace.name === 'halfling') {
      applyHalflingWithOptions(c, {
        subrace: halflingSubrace,
        hasInfravision: halflingInfravision,
      });
    } else {
      const r = new RNG.RNG(`race-${selectedRace.name}`);
      selectedRace.apply(c, r);
    }
    return c;
  });

  const eligibleClasses = $derived.by(() => {
    if (!characterAfterRace || !selectedRace) return [] as ADNDClass[];
    return getClassOptionsForRace(characterAfterRace, selectedRace, allClasses);
  });

  function applyClassFeaturesWithSeed(c: ADNDCharacter, cls: ADNDClass, seed: string): void {
    const r = new RNG.RNG(seed);
    cls.apply(c, r, { spells: 'user', thiefSkills: 'user' });
    assignExceptionalStrength(c, cls, r);
  }

  function copyAfterRaceBody(src: ADNDCharacter): ADNDCharacter {
    const c = createAdndCharacter();
    c.strength = src.strength;
    c.dexterity = src.dexterity;
    c.constitution = src.constitution;
    c.intelligence = src.intelligence;
    c.wisdom = src.wisdom;
    c.charisma = src.charisma;
    c.exceptionalStrength = src.exceptionalStrength;
    c.abilities = [...src.abilities];
    c.race = src.race;
    c.spells = [];
    c.weapons = [];
    c.armor = [];
    return c;
  }

  const selectedClass = $derived(allClasses.find((cl) => cl.name === className) ?? null);

  const thiefSkillKind = $derived(getThiefSkillBuildKindForClass(selectedClass?.name ?? ''));

  const thiefSkillRowsForBuilder = $derived.by(() => {
    if (!thiefSkillKind || !characterAfterRace) return [];
    return prepareThiefSkillRowsForCharacter(thiefSkillKind, characterAfterRace);
  });

  const thiefSkillBonusResetKey = $derived.by(() => {
    if (!thiefSkillKind || !characterAfterRace) return '';
    const rows = prepareThiefSkillRowsForCharacter(thiefSkillKind, characterAfterRace);
    const baseKey = `${className}-${raceName}-${dex}-${halflingSubrace}-${halflingInfravision}`;
    const skillsSig = rows.map((r) => `${r.name}:${r.value}`).join('|');
    return `${baseKey}|${skillsSig}`;
  });

  const startingSpellGroups = $derived(
    selectedClass?.hasSpells ? getStartingSpellChoiceGroups(selectedClass) : [],
  );

  const builderSteps = $derived.by(() => {
    let n = 6;
    const spells = selectedClass?.hasSpells ? n++ : null;
    const thiefSkills = thiefSkillKind ? n++ : null;
    return {
      spells,
      thiefSkills,
      hitPoints: n++,
      funds: n++,
      equipment: n,
    };
  });

  const thiefSkillAllocationComplete = $derived.by(() => {
    if (!thiefSkillKind || !characterAfterRace) return true;
    const names = prepareThiefSkillRowsForCharacter(thiefSkillKind, characterAfterRace).map(
      (r) => r.name,
    );
    return thiefSkillBonusesAreValid(thiefSkillKind, thiefSkillBonuses, names);
  });

  const thiefSkillsPreviewIncomplete = $derived(
    !!(thiefSkillKind && alignment && characterAfterRace && !thiefSkillAllocationComplete),
  );

  const spellPreviewIncomplete = $derived(
    !!(
      selectedClass?.hasSpells &&
      alignment &&
      !starterSpellSelectionIsComplete(selectedClass, starterSpellPicks)
    ),
  );

  const characterForHpBounds = $derived.by(() => {
    if (!characterAfterRace || !selectedClass) return null;
    const c = copyAfterRaceBody(characterAfterRace);
    c.class = selectedClass;
    applyClassFeaturesWithSeed(c, selectedClass, classFeaturesSeed);
    return c;
  });

  const hpBounds = $derived(
    characterForHpBounds ? getAdndLevel1HpBounds(characterForHpBounds) : { min: 1, max: 1 },
  );

  $effect(() => {
    if (hpValue < hpBounds.min) hpValue = hpBounds.min;
    if (hpValue > hpBounds.max) hpValue = hpBounds.max;
  });

  function startingFundsDiceLine(cls: ADNDClass | null): string {
    if (!cls) return '';
    if (cls.group === 'warrior') return '(5d4)×10 gp';
    if (cls.group === 'wizard') return '(1d4+1)×10 gp';
    if (cls.group === 'rogue') return '(2d6)×10 gp';
    return '(3d6)×10 gp';
  }

  function formatWealthCp(cp: number): string {
    return Currency.valueToGpSpCpString(cp);
  }

  $effect(() => {
    const n = wealthCpFromCoinFields(startingGp, startingSp, startingCp);
    const g = Math.floor(n / 100);
    const s = Math.floor((n % 100) / 10);
    const c = n % 10;
    if (g !== startingGp || s !== startingSp || c !== startingCp) {
      startingGp = g;
      startingSp = s;
      startingCp = c;
    }
  });

  $effect(() => {
    if (selectedClass && !eligibleClasses.some((c) => c.name === selectedClass.name)) {
      className = '';
    }
  });

  $effect(() => {
    if (selectedClass && alignment && !selectedClass.allowedAlignments.includes(alignment)) {
      alignment = selectedClass.allowedAlignments[0] ?? '';
    }
  });

  $effect(() => {
    const cls = selectedClass;
    if (!cls?.hasSpells) {
      starterSpellPicks = [];
      return;
    }
    const groups = getStartingSpellChoiceGroups(cls);
    starterSpellPicks = groups.map((g) => Array.from({ length: g.count }, () => ''));
  });

  $effect(() => {
    const key = thiefSkillBonusResetKey;
    if (!thiefSkillKind || !characterAfterRace) {
      thiefSkillBonuses = {};
      return;
    }
    if (!key) {
      thiefSkillBonuses = {};
      return;
    }
    const rows = prepareThiefSkillRowsForCharacter(thiefSkillKind, characterAfterRace);
    thiefSkillBonuses = Object.fromEntries(rows.map((r) => [r.name, 0]));
  });

  function rollAttributes() {
    str = Dice.roll('3d6', rollRng);
    dex = Dice.roll('3d6', rollRng);
    con = Dice.roll('3d6', rollRng);
    int = Dice.roll('3d6', rollRng);
    wis = Dice.roll('3d6', rollRng);
    cha = Dice.roll('3d6', rollRng);
    raceName = '';
    className = '';
    alignment = '';
    selectedWeaponNames = [];
    selectedArmorNames = [];
    starterSpellPicks = [];
    thiefSkillBonuses = {};
    hpValue = 1;
    setStartingWealthFromTotalCp(0);
  }

  function resetBuilderForm() {
    rollRng = new RNG.RNG(Date.now().toString());
    str = 0;
    dex = 0;
    con = 0;
    int = 0;
    wis = 0;
    cha = 0;
    raceName = '';
    className = '';
    alignment = '';
    halflingSubrace = 'Hairfeet';
    halflingInfravision = false;
    hpValue = 1;
    startingGp = 0;
    startingSp = 0;
    startingCp = 0;
    classFeaturesSeed = rollRng.randomString(13);
    selectedWeaponNames = [];
    selectedArmorNames = [];
    starterSpellPicks = [];
    thiefSkillBonuses = {};
  }

  function rollHitPoints() {
    if (!characterForHpBounds) return;
    hpValue = rollAdndLevel1Hp(characterForHpBounds, rollRng);
  }

  function rollStartingFunds() {
    if (!selectedClass) return;
    setStartingWealthFromTotalCp(rollAdndStartingCopper(selectedClass, rollRng));
    selectedWeaponNames = [];
    selectedArmorNames = [];
  }

  function setStarterSpellPick(groupIdx: number, slotIdx: number, name: string): void {
    const next = starterSpellPicks.map((row, i) =>
      i === groupIdx ? row.map((v, j) => (j === slotIdx ? name : v)) : [...row],
    );
    starterSpellPicks = next;
  }

  function setThiefSkillBonus(skillName: string, raw: unknown): void {
    const n = Math.max(0, Math.min(ADND_THIEF_SKILL_BONUS_CAP, Math.floor(Number(raw) || 0)));
    thiefSkillBonuses = { ...thiefSkillBonuses, [skillName]: n };
  }

  function newClassFeaturesSeed() {
    classFeaturesSeed = rollRng.randomString(13);
  }

  const equipmentSpend = $derived.by(() => {
    const weapons = Equipment.getWeapons();
    const armor = Equipment.getArmor();
    let spent = 0;
    for (const n of selectedWeaponNames) {
      const w = weapons.find((x) => x.name === n);
      if (w) spent += w.cost;
    }
    for (const n of selectedArmorNames) {
      const a = armor.find((x) => x.name === n);
      if (a) spent += a.cost;
    }
    return spent;
  });

  const equipmentRemainingCp = $derived(Math.max(0, startingWealthCp - equipmentSpend));

  $effect(() => {
    const overBudget = equipmentSpend > startingWealthCp;
    if (!overBudget) {
      wasEquipmentOverBudget = false;
      return;
    }
    if (wasEquipmentOverBudget) {
      return;
    }
    wasEquipmentOverBudget = true;
    const clearedSpend = equipmentSpend;
    selectedWeaponNames = [];
    selectedArmorNames = [];
    void showAlertModal({
      message: `Starting funds (${formatWealthCp(startingWealthCp)}) no longer cover that gear (${formatWealthCp(clearedSpend)}). Equipment selections were cleared—choose again within budget.`,
      style: 'error',
    });
  });

  function syncWeaponCheckboxSelection(weaponName: string, nextChecked: boolean): void {
    if (nextChecked) {
      if (selectedWeaponNames.includes(weaponName)) return;
      const w = Equipment.getWeapons().find((x) => x.name === weaponName);
      if (!w) return;
      const nextSpend = equipmentSpend + w.cost;
      if (nextSpend > startingWealthCp) {
        void showAlertModal({
          message: `Cannot add ${weaponName} (${formatWealthCp(w.cost)}): only ${formatWealthCp(equipmentRemainingCp)} left of your ${formatWealthCp(startingWealthCp)} starting funds.`,
          style: 'error',
        });
        return;
      }
      selectedWeaponNames = [...selectedWeaponNames, weaponName];
      return;
    }
    if (!selectedWeaponNames.includes(weaponName)) return;
    selectedWeaponNames = selectedWeaponNames.filter((n) => n !== weaponName);
  }

  function syncArmorCheckboxSelection(armorName: string, nextChecked: boolean): void {
    if (nextChecked) {
      if (selectedArmorNames.includes(armorName)) return;
      const piece = Equipment.getArmor().find((x) => x.name === armorName);
      if (!piece) return;
      const nextSpend = equipmentSpend + piece.cost;
      if (nextSpend > startingWealthCp) {
        void showAlertModal({
          message: `Cannot add ${armorName} (${formatWealthCp(piece.cost)}): only ${formatWealthCp(equipmentRemainingCp)} left of your ${formatWealthCp(startingWealthCp)} starting funds.`,
          style: 'error',
        });
        return;
      }
      selectedArmorNames = [...selectedArmorNames, armorName];
      return;
    }
    if (!selectedArmorNames.includes(armorName)) return;
    selectedArmorNames = selectedArmorNames.filter((n) => n !== armorName);
  }

  function classAllowsWeapon(cls: ADNDClass, weaponName: string, damageType: string): boolean {
    return (
      cls.allowedWeapons.includes('any') ||
      cls.allowedWeapons.includes(weaponName) ||
      (cls.allowedWeapons.includes('bludgeoning') && damageType.includes('bludgeoning'))
    );
  }

  function classAllowsArmor(cls: ADNDClass, armorName: string): boolean {
    return cls.allowedArmor.includes('any') || cls.allowedArmor.includes(armorName);
  }

  const equipmentWeaponChoices = $derived.by(() => {
    if (!selectedClass) return [];
    return Equipment.getWeapons().filter(
      (w) => classAllowsWeapon(selectedClass, w.name, w.damageType) && w.cost <= startingWealthCp,
    );
  });

  const equipmentArmorChoices = $derived.by(() => {
    if (!selectedClass) return [];
    return Equipment.getArmor().filter(
      (a) => classAllowsArmor(selectedClass, a.name) && a.cost <= startingWealthCp,
    );
  });

  const previewCharacter = $derived.by(() => {
    if (!characterAfterRace || !selectedClass || !alignment || str < 1) return undefined;
    if (
      selectedClass.hasSpells &&
      !starterSpellSelectionIsComplete(selectedClass, starterSpellPicks)
    ) {
      return undefined;
    }
    if (thiefSkillKind && !thiefSkillAllocationComplete) {
      return undefined;
    }

    const c = copyAfterRaceBody(characterAfterRace);
    c.class = selectedClass;
    applyClassFeaturesWithSeed(c, selectedClass, classFeaturesSeed);
    c.alignment = alignment;

    if (selectedClass.hasSpells) {
      c.spells = startingSpellsFromPicks(selectedClass, starterSpellPicks);
    }

    if (thiefSkillKind) {
      applyThiefSkillAllocation(c, thiefSkillKind, thiefSkillBonuses);
    }

    const hp = Math.min(Math.max(hpValue, hpBounds.min), hpBounds.max);
    c.hp = hp;

    c.weapons = [];
    c.armor = [];
    for (const n of selectedWeaponNames) {
      const w = Equipment.getWeapons().find((x) => x.name === n);
      if (w) c.weapons.push(w);
    }
    for (const n of selectedArmorNames) {
      const ar = Equipment.getArmor().find((x) => x.name === n);
      if (ar) c.armor.push(ar);
    }

    const spent = equipmentSpend;
    const purse = Math.max(0, startingWealthCp - spent);
    c.currency = purse;
    const purseRng = new RNG.RNG(
      `priest-purse-${classFeaturesSeed}-${startingWealthCp}-${spent}-${purse}`,
    );
    applyAdndPriestFundsCapIfNeeded(c, purseRng);

    finalizeAdndCharacterDerivedStats(c);
    recalculateAdndArmorClass(c);
    c.firstName = firstName;
    c.lastName = lastName;
    return c;
  });

  function rollNamesForCurrentSource(defaultHint: string) {
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
    );
    const nameRng = new RNG.RNG(`${Date.now()}-adnd-build-name`);
    return rollCharacterNameForSource(nameRng, source, defaultHint, namingGender);
  }

  function generateNameOnly() {
    if (lockName) {
      return;
    }

    const defaultHint = (selectedRace?.name ?? raceName) || 'human';
    const generated = rollNamesForCurrentSource(defaultHint);
    firstName = generated.firstName;
    lastName = generated.lastName;
  }

  onMount(() => {
    // Not awaited: the cultures come from the vault database, and nothing on the sheet waits on
    // the naming dropdown having filled in.
    void loadCulturesForNaming().then((cultures) => {
      savedCultures = cultures;
      if (savedCultures.length > 0) {
        savedCultureName = savedCultures[0]!.name;
      }
    });
  });

  async function downloadPdf() {
    if (downloadingPdf || !previewCharacter) {
      return;
    }

    downloadingPdf = true;
    try {
      await downloadAdndCharacterPdf(previewCharacter);
    } finally {
      downloadingPdf = false;
    }
  }
</script>

<section class="fantasy main">
  <header class="builder-header">
    <h1>AD&D 2e Character Builder</h1>
    <button type="button" onclick={resetBuilderForm}>Reset</button>
  </header>

  {#if showsMaturityBadge(maturity)}
    <p class="builder-maturity">
      <ToolMaturityBadge {maturity} detailed />
    </p>
  {/if}

  <p>
    Roll attributes, then choose race, class, and alignment. Caster level 1 spells, thief
    discretionary points, hit points, funds, and equipment are yours to set; attribute dice, HP
    rolls, and starting money rolls share one RNG stream. The random generator still rolls spells
    and thief points from the class features seed.
    <a href={resolve('/fantasy/adnd/character')}>Random full generator</a>
  </p>

  <CharacterNameSection
    bind:nameSourceKind
    bind:presetSetName
    bind:savedCultureName
    bind:firstName
    bind:lastName
    bind:lockName
    bind:namingGender
    showGenderPicker={true}
    seed="adnd-build-name-sets"
    onGenerateName={generateNameOnly}
  />

  <h2>1. Attributes</h2>
  <p>
    STR {str || '—'} · DEX {dex || '—'} · CON {con || '—'} · INT {int || '—'} · WIS {wis || '—'} · CHA
    {cha || '—'}
  </p>
  <button type="button" onclick={rollAttributes}>Roll 6 × 3d6</button>

  {#if str > 0}
    <h2>2. Race</h2>
    {#if eligibleRaces.length === 0}
      <p>No race matches these rolls (check demihuman minimum/maximum ranges).</p>
    {:else}
      <label>
        Race
        <select bind:value={raceName}>
          <option value="">— choose —</option>
          {#each eligibleRaces as r}
            <option value={r.name}>{r.name}</option>
          {/each}
        </select>
      </label>

      {#if selectedRace?.name === 'halfling'}
        <div class="input-group">
          <label>
            Subrace
            <select bind:value={halflingSubrace}>
              <option value="Hairfeet">Hairfeet</option>
              <option value="Tallfellow">Tallfellow</option>
              <option value="Stout">Stout</option>
            </select>
          </label>
          <label>
            <input type="checkbox" bind:checked={halflingInfravision} />
            Infravision (per book odds; toggle if your DM assigned it)
          </label>
        </div>
      {/if}
    {/if}

    {#if selectedRace && characterAfterRace}
      <h2>3. Class</h2>
      {#if eligibleClasses.length === 0}
        <p>No class matches this race and these stats.</p>
      {:else}
        <label>
          Class
          <select bind:value={className}>
            <option value="">— choose —</option>
            {#each eligibleClasses as cl}
              <option value={cl.name}>{cl.name}</option>
            {/each}
          </select>
        </label>
      {/if}
    {/if}

    {#if selectedClass}
      <h2>4. Alignment</h2>
      <label>
        Alignment
        <select bind:value={alignment}>
          <option value="">— choose —</option>
          {#each selectedClass.allowedAlignments as a}
            <option value={a}>{a}</option>
          {/each}
        </select>
      </label>

      <h2>5. Class features (RNG seed)</h2>
      <p>
        Used by the random generator for rolled class features. In this builder, level 1 spells and
        thief / bard skill points are chosen explicitly below.
        <button type="button" onclick={newClassFeaturesSeed}>New seed</button>
      </p>
      <input type="text" readonly value={classFeaturesSeed} />

      {#if selectedClass.hasSpells && startingSpellGroups.length > 0}
        <h2>{builderSteps.spells}. Starting spells (level 1)</h2>
        <p>
          Same spell pools as the random generator (class and specialist restrictions). One pick per
          required slot in each group.
        </p>
        {#each startingSpellGroups as group, groupIdx (groupIdx)}
          <div class="spell-pick-group">
            <h3>
              {#if startingSpellGroups.length > 1}
                Spell group {groupIdx + 1}
              {:else}
                Spell
              {/if}
              — {group.count} required
            </h3>
            <div class="spell-pick-slots">
              {#each Array.from({ length: group.count }) as _, slotIdx (slotIdx)}
                <label>
                  {#if group.count > 1}
                    Spell {slotIdx + 1}
                  {:else}
                    Choice
                  {/if}
                  <select
                    value={starterSpellPicks[groupIdx]?.[slotIdx] ?? ''}
                    onchange={(e) => setStarterSpellPick(groupIdx, slotIdx, e.currentTarget.value)}
                  >
                    <option value="">— choose —</option>
                    {#each group.candidates as sp (sp.name)}
                      <option value={sp.name}>{sp.name}</option>
                    {/each}
                  </select>
                </label>
              {/each}
            </div>
          </div>
        {/each}
      {/if}

      {#if thiefSkillKind && thiefSkillRowsForBuilder.length > 0}
        <h2>{builderSteps.thiefSkills}. Thief skills (discretionary points)</h2>
        <p>
          Allocate exactly {getThiefSkillPointPool(thiefSkillKind)} points (max {ADND_THIEF_SKILL_BONUS_CAP}
          per skill). Base scores include Dexterity and racial modifiers.
        </p>
        <p>
          <strong>Allocated:</strong>
          {sumThiefSkillBonuses(thiefSkillBonuses)} /
          {getThiefSkillPointPool(
            thiefSkillKind,
          )}{#if thiefSkillKind && sumThiefSkillBonuses(thiefSkillBonuses) !== getThiefSkillPointPool(thiefSkillKind)}
            — must match total{/if}
        </p>
        <div class="thief-skill-grid">
          {#each thiefSkillRowsForBuilder as row (row.name)}
            <label>
              {row.name} (base {row.value}%)
              <input
                type="number"
                min={0}
                max={ADND_THIEF_SKILL_BONUS_CAP}
                step={1}
                value={thiefSkillBonuses[row.name] ?? 0}
                oninput={(e) => setThiefSkillBonus(row.name, e.currentTarget.value)}
              />
              <span class="thief-skill-final"
                >→ {row.value + (thiefSkillBonuses[row.name] ?? 0)}%</span
              >
            </label>
          {/each}
        </div>
      {/if}

      <h2>{builderSteps.hitPoints}. Hit points (level 1)</h2>
      <p>
        Allowed range: {hpBounds.min}–{hpBounds.max} ({selectedClass.hitDice} + Con adjustment).
      </p>
      <p>
        <button type="button" onclick={rollHitPoints}>Roll {selectedClass.hitDice} + Con</button>
      </p>
      <label>
        HP
        <input type="number" bind:value={hpValue} min={hpBounds.min} max={hpBounds.max} />
      </label>

      <h2>{builderSteps.funds}. Starting funds</h2>
      <p>
        Typical random roll for this class: {startingFundsDiceLine(selectedClass)}. Values below use
        gp, sp, and cp (the rules reference copper totals internally).
      </p>
      <p><strong>Total:</strong> {formatWealthCp(startingWealthCp)}</p>
      <p>
        <button type="button" onclick={rollStartingFunds}
          >Roll starting funds ({startingFundsDiceLine(selectedClass)})</button
        >
      </p>
      <div class="wealth-inputs">
        <label>
          Gold (gp)
          <input type="number" bind:value={startingGp} min={0} step={1} />
        </label>
        <label>
          Silver (sp)
          <input type="number" bind:value={startingSp} min={0} step={1} />
        </label>
        <label>
          Copper (cp)
          <input type="number" bind:value={startingCp} min={0} step={1} />
        </label>
      </div>

      <h2>{builderSteps.equipment}. Equipment</h2>
      <p>
        Selected gear costs {formatWealthCp(equipmentSpend)}; you have {formatWealthCp(
          equipmentRemainingCp,
        )} left from your {formatWealthCp(startingWealthCp)} starting funds.
      </p>

      <h3>Weapons</h3>
      <ul class="equipment-list">
        {#each equipmentWeaponChoices as w (w.name)}
          {@const weaponBlocked =
            !selectedWeaponNames.includes(w.name) && equipmentSpend + w.cost > startingWealthCp}
          <li>
            <label
              class:equipment-option-blocked={weaponBlocked}
              title={weaponBlocked
                ? `${w.name} costs ${formatWealthCp(w.cost)}; you have ${formatWealthCp(equipmentRemainingCp)} unspent from ${formatWealthCp(startingWealthCp)}.`
                : ''}
            >
              <input
                type="checkbox"
                checked={selectedWeaponNames.includes(w.name)}
                disabled={weaponBlocked}
                onchange={(e) => syncWeaponCheckboxSelection(w.name, e.currentTarget.checked)}
              />
              {w.name} — {formatWealthCp(w.cost)}
            </label>
          </li>
        {/each}
      </ul>

      <h3>Armor</h3>
      <ul class="equipment-list">
        {#each equipmentArmorChoices as a (a.name)}
          {@const armorBlocked =
            !selectedArmorNames.includes(a.name) && equipmentSpend + a.cost > startingWealthCp}
          <li>
            <label
              class:equipment-option-blocked={armorBlocked}
              title={armorBlocked
                ? `${a.name} costs ${formatWealthCp(a.cost)}; you have ${formatWealthCp(equipmentRemainingCp)} unspent from ${formatWealthCp(startingWealthCp)}.`
                : ''}
            >
              <input
                type="checkbox"
                checked={selectedArmorNames.includes(a.name)}
                disabled={armorBlocked}
                onchange={(e) => syncArmorCheckboxSelection(a.name, e.currentTarget.checked)}
              />
              {a.name} — {formatWealthCp(a.cost)} (AC mod {a.ac})
            </label>
          </li>
        {/each}
      </ul>
    {/if}

    {#if previewCharacter}
      <div class="builder-result">
        <h2>Character</h2>
        <DownloadPdfButton onclick={downloadPdf} downloading={downloadingPdf} />
        <AdndCharacterSheet character={previewCharacter} />
      </div>
    {:else if spellPreviewIncomplete}
      <div class="builder-result">
        <p>Finish choosing your starting spells to preview the character sheet.</p>
      </div>
    {:else if thiefSkillsPreviewIncomplete}
      <div class="builder-result">
        <p>
          Allocate thief skill points so the total matches the required pool to preview the
          character sheet.
        </p>
      </div>
    {/if}
  {/if}
</section>

<style>
  label.equipment-option-blocked {
    opacity: 0.65;
  }

  .builder-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .builder-header h1 {
    margin: 0;
  }

  .builder-maturity {
    margin: 0.5rem 0 0.75rem;
  }

  .spell-pick-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-end;
    margin-bottom: 1rem;
  }

  .spell-pick-slots label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .thief-skill-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-end;
    margin-bottom: 1rem;
  }

  .thief-skill-grid label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 12rem;
  }

  .thief-skill-final {
    font-weight: 600;
  }

  .wealth-inputs {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-end;
  }

  .wealth-inputs label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .equipment-list {
    list-style: none;
    padding-left: 0;
  }

  .builder-result {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--tan);
  }
</style>
