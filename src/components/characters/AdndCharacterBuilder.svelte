<script lang="ts">
  import * as RNG from '@ironarachne/rng';
  import { resolve } from '$app/paths';
  import * as Dice from '$lib/dice';
  import AdndCharacterSheet from '$components/characters/AdndCharacterSheet.svelte';
  import {
    ADND_CHARACTER_ARTIFACT_KIND,
    ADND_THIEF_SKILL_BONUS_CAP,
    adndBuildFromSnapshot,
    adndCharacterAfterRace,
    createAdndCharacterBuild,
    adndCharacterFromSnapshot,
    adndClassOptionsForBuild,
    adndBuildWouldRederive,
    adndRaceOptionsForBuild,
    buildAdndCharacter,
    downloadAdndCharacterPdf,
    Equipment,
    finalizeAdndCharacterDerivedStats,
    getAdndLevel1HpBounds,
    getStartingSpellChoiceGroups,
    getThiefSkillBuildKindForClass,
    getThiefSkillPointPool,
    prepareThiefSkillRowsForCharacter,
    recalculateAdndArmorClass,
    rollAdndLevel1Hp,
    rollAdndStartingCopper,
    starterSpellSelectionIsComplete,
    sumThiefSkillBonuses,
    thiefSkillBonusesAreValid,
    toAdndCharacterBuildRecord,
    toAdndCharacterSnapshot,
    classes,
    races,
    type AdndCharacterBuild,
    type AdndCharacterSnapshot,
  } from '$lib/adnd';

  /**
   * Optional props, present only when the builder is mounted as an artifact editor.
   *
   * Absent on its own route and in a workshop panel, where the builder composes a new character
   * and saves it itself. Requirement 2.1 wants one component in both places, so the difference is
   * two optional props rather than two components.
   */
  type Props = {
    /** A saved character to open, seeding every control from it. */
    editing?: AdndCharacterSnapshot;
    /** Announces a replacement snapshot. Present only when `editing` is. */
    onChange?: (snapshot: unknown) => void;
  };

  const { editing, onChange }: Props = $props();

  const TOOL_PATH = '/fantasy/adnd/character/build';

  /** The derived numbers the Details section lets a user correct. */
  type AdndDerivedNumberField =
    | 'level'
    | 'xp'
    | 'thaco'
    | 'poisonSavingThrow'
    | 'rodSavingThrow'
    | 'petrificationSavingThrow'
    | 'breathSavingThrow'
    | 'spellSavingThrow'
    | 'weightAllowance'
    | 'maxPress'
    | 'systemShock'
    | 'resurrectionSurvival'
    | 'maximumNumberOfHenchmen'
    | 'numberOfLanguages';
  import type { ADNDClass } from '$lib/adnd';
  import { Currency } from '$lib/currency';
  import { showsMaturityBadge, toolMaturityForPath } from '$lib/tools';
  import { showAlertModal } from '$lib/ui';
  import {
    buildCharacterNameSource,
    loadCulturesForNaming,
    rollCharacterNameForSource,
  } from '$lib/characters';
  import type { ArtifactReference } from '$lib/artifacts';
  import type { Culture } from '$lib/culture';
  import { onMount, untrack } from 'svelte';
  import CharacterNameSection from '$components/characters/CharacterNameSection.svelte';
  import DownloadPdfButton from '$components/common/DownloadPdfButton.svelte';
  import ToolMaturityBadge from '$components/common/ToolMaturityBadge.svelte';
  import SaveArtifactButton from '$components/common/SaveArtifactButton.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';

  // The builder keeps its own header — the h1 shares a row with Reset — rather than mounting
  // `GeneratorPage`, so it states its maturity itself. The value still comes from the catalog.
  const maturity = toolMaturityForPath('/fantasy/adnd/character/build');

  /**
   * The derived block, as rows, so the markup is a loop rather than forty near-identical inputs.
   *
   * Not every derived field is here. The ones a table actually gets consulted about are — saving
   * throws, THAC0, encumbrance, system shock — while the spell-progression numbers are omitted
   * because they are read off the class and a level-1 character has nothing to correct in them.
   */
  const DERIVED_NUMBER_FIELDS: { field: AdndDerivedNumberField; label: string }[] = [
    { field: 'thaco', label: 'THAC0' },
    { field: 'poisonSavingThrow', label: 'Save: paralyzation / poison / death' },
    { field: 'rodSavingThrow', label: 'Save: rod / staff / wand' },
    { field: 'petrificationSavingThrow', label: 'Save: petrification / polymorph' },
    { field: 'breathSavingThrow', label: 'Save: breath weapon' },
    { field: 'spellSavingThrow', label: 'Save: spell' },
    { field: 'weightAllowance', label: 'Weight allowance' },
    { field: 'maxPress', label: 'Maximum press' },
    { field: 'systemShock', label: 'System shock %' },
    { field: 'resurrectionSurvival', label: 'Resurrection survival %' },
    { field: 'maximumNumberOfHenchmen', label: 'Maximum henchmen' },
    { field: 'numberOfLanguages', label: 'Number of languages' },
  ];

  let rollRng = new RNG.RNG(Date.now().toString());

  /**
   * The form, seeded from the artifact when there is one.
   *
   * `adndBuildFromSnapshot` is exact for everything the builder models, so opening a saved
   * character and changing nothing produces the character that was stored — which is what stops an
   * artifact being marked dirty the moment it is opened. The class-features seed it is handed is
   * fresh, because the payload does not carry one and nothing is re-derived while the structure
   * holds; it matters only if the user forces a re-derivation, and then fresh is right.
   */
  const initial = untrack(() => {
    const seed = new RNG.RNG(Date.now().toString()).randomString(13);
    return editing ? adndBuildFromSnapshot(editing, seed) : createAdndCharacterBuild(seed);
  });

  let str = $state(initial.attributes.strength);
  let dex = $state(initial.attributes.dexterity);
  let con = $state(initial.attributes.constitution);
  let int = $state(initial.attributes.intelligence);
  let wis = $state(initial.attributes.wisdom);
  let cha = $state(initial.attributes.charisma);

  let raceName = $state(initial.raceName);
  let className = $state(initial.className);
  let alignment = $state(initial.alignment);

  let subraceName = $state(initial.subraceName);

  let hpValue = $state(initial.hp);
  // Seeded from the artifact, not zeroed. Left at zero, a reopened character's gear costs more
  // than its funds the instant the form mounts, so the over-budget guard fired: it cleared the
  // equipment and put an error dialog over the page. The purse and the gear are one decision and
  // have to arrive together.
  let startingGp = $state(Math.floor(initial.startingWealthCp / 100));
  let startingSp = $state(Math.floor((initial.startingWealthCp % 100) / 10));
  let startingCp = $state(initial.startingWealthCp % 10);

  let classFeaturesSeed = $state(initial.classFeaturesSeed);
  let selectedWeaponNames = $state<string[]>(initial.selectedWeaponNames);
  let selectedArmorNames = $state<string[]>(initial.selectedArmorNames);
  let starterSpellPicks = $state<string[][]>(initial.starterSpellPicks);
  let thiefSkillBonuses = $state<Record<string, number>>(initial.thiefSkillPoints);
  let wasEquipmentOverBudget = $state(false);
  let downloadingPdf = $state(false);

  let savedCultures = $state<Culture[]>([]);
  let nameSourceKind = $state<'default' | 'preset' | 'saved_culture' | 'referenced_culture'>(
    'default',
  );
  let presetSetName = $state('human');
  let savedCultureName = $state('');
  let firstName = $state(initial.firstName);
  let lastName = $state(initial.lastName);
  let lockName = $state(false);
  let namingGender = $state<'male' | 'female' | 'random'>('random');
  let referencedCulture = $state<Culture | undefined>();
  let cultureReference = $state<ArtifactReference | undefined>();

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

  /**
   * The saved character being edited, or `null` when composing from nothing.
   *
   * `$state.raw` because it is a stored payload: it is replaced whole, never mutated in place, and
   * a deep-reactive Proxy is what `structuredClone` refuses when the write reaches IndexedDB.
   */
  let base = $state.raw<AdndCharacterSnapshot | null>(initial.base);

  /**
   * The form as the library's own type, assembled in one place.
   *
   * Every derivation below goes through `$lib/adnd` rather than being rebuilt here. That is what
   * lets the same rules produce a character on this page, in a workshop panel, and in the artifact
   * editor, and it is what made the fields testable without a browser.
   */
  const currentBuild = $derived<AdndCharacterBuild>({
    base,
    attributes: {
      strength: str,
      dexterity: dex,
      constitution: con,
      intelligence: int,
      wisdom: wis,
      charisma: cha,
    },
    raceName,
    className,
    alignment,
    subraceName,
    hp: hpValue,
    startingWealthCp,
    selectedWeaponNames,
    selectedArmorNames,
    starterSpellPicks,
    thiefSkillPoints: thiefSkillBonuses,
    classFeaturesSeed,
    firstName,
    lastName,
  });

  const eligibleRaces = $derived(adndRaceOptionsForBuild(currentBuild));

  const selectedRace = $derived(allRaces.find((r) => r.name === raceName) ?? null);

  const characterAfterRace = $derived(adndCharacterAfterRace(currentBuild));

  /** The varieties the chosen race offers, empty for a race with none. */
  const availableSubraces = $derived(selectedRace?.subraces ?? []);

  /**
   * Keep the chosen variety one the race actually has.
   *
   * Changing race has to clear a variety that belonged to the previous one, and a race that has
   * varieties needs one chosen rather than an empty select — a character with a blank subrace
   * would be applied as though the race had no varieties at all.
   */
  $effect(() => {
    const names = availableSubraces.map((subrace) => subrace.name);
    if (names.length === 0) {
      if (subraceName !== '') subraceName = '';
      return;
    }
    if (!names.includes(subraceName)) {
      subraceName = names[0];
    }
  });

  const eligibleClasses = $derived(adndClassOptionsForBuild(currentBuild));

  /** True when applying the form to the saved character would throw work away (4.3). */
  const wouldRederive = $derived(adndBuildWouldRederive(currentBuild));

  const selectedClass = $derived(allClasses.find((cl) => cl.name === className) ?? null);

  const thiefSkillKind = $derived(getThiefSkillBuildKindForClass(selectedClass?.name ?? ''));

  const thiefSkillRowsForBuilder = $derived.by(() => {
    if (!thiefSkillKind || !characterAfterRace) return [];
    return prepareThiefSkillRowsForCharacter(thiefSkillKind, characterAfterRace);
  });

  const thiefSkillBonusResetKey = $derived.by(() => {
    if (!thiefSkillKind || !characterAfterRace) return '';
    const rows = prepareThiefSkillRowsForCharacter(thiefSkillKind, characterAfterRace);
    const baseKey = `${className}-${raceName}-${dex}-${subraceName}`;
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

  /**
   * The character the hit-point range is read off.
   *
   * Built with the alignment forced, because hit dice do not depend on alignment and the form may
   * not have one yet — the range has to be offerable before the last dropdown is answered.
   */
  const characterForHpBounds = $derived(
    buildAdndCharacter({ ...currentBuild, alignment: alignment || 'true neutral' }),
  );

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

  /**
   * What these two reset effects were keyed on when they last ran.
   *
   * `null` means "has not run yet", and the first run is the one that must do nothing. Both
   * effects exist to clear a choice that belongs to a class the user has moved away from, and both
   * used to fire on mount as well — which silently wiped the spell picks and the thief allocation
   * that `adndBuildFromSnapshot` had just restored. A saved caster then read as an unfinished form
   * and showed no character at all.
   */
  let lastSpellClass: string | null = null;
  let lastThiefKey: string | null = null;

  $effect(() => {
    const cls = selectedClass;
    const key = cls?.name ?? '';
    if (lastSpellClass === null || lastSpellClass === key) {
      lastSpellClass = key;
      return;
    }
    lastSpellClass = key;
    if (!cls?.hasSpells) {
      starterSpellPicks = [];
      return;
    }
    const groups = getStartingSpellChoiceGroups(cls);
    starterSpellPicks = groups.map((g) => Array.from({ length: g.count }, () => ''));
  });

  $effect(() => {
    const key = thiefSkillBonusResetKey;
    if (lastThiefKey === null || lastThiefKey === key) {
      lastThiefKey = key;
      return;
    }
    lastThiefKey = key;
    if (!thiefSkillKind || !characterAfterRace || !key) {
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
    subraceName = '';
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

  /**
   * The character the form describes, or nothing while a required choice is still outstanding.
   *
   * The derivation itself lives in `$lib/adnd`; what stays here is only the question of whether
   * the form is finished enough to show a character at all. `buildAdndCharacter` decides whether
   * that means deriving from scratch or writing these fields over a saved character — see
   * `adnd_character_build.ts`, where the difference is the whole design.
   */
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
    return buildAdndCharacter(currentBuild) ?? undefined;
  });

  const previewSnapshot = $derived(
    previewCharacter === undefined ? null : toAdndCharacterSnapshot(previewCharacter),
  );

  /**
   * The decisions that made this character, as provenance.
   *
   * What makes a hand-built character reproducible. A generated one records a seed and the
   * generator's settings; this one records the choices, and the kind's roller tells the two apart
   * by the tool path. `toAdndCharacterBuildRecord` copies every array and object out, because
   * IndexedDB serialises with `structuredClone` and that refuses the Proxy a deep-reactive value
   * would hand it.
   */
  const buildRecord = $derived(
    toAdndCharacterBuildRecord(currentBuild) as unknown as Record<string, unknown>,
  );

  /**
   * What was last announced to the surrounding surface, as a value rather than a reference.
   *
   * `toAdndCharacterSnapshot` builds a fresh object every time it runs, so announcing on every
   * render meant announcing a *different object* describing an *identical character*. The surface
   * stored it, re-rendered, and the effect ran again — a loop that never settled. The panel stayed
   * visibly alive and its Save button could not be clicked, because nothing was ever stable long
   * enough. Comparing by value is what stops it.
   */
  let lastAnnounced: string | null = null;

  /**
   * Tell the surrounding artifact surface what the form now describes.
   *
   * Only when mounted as an editor; on its own route there is nobody to tell, and the builder
   * saves for itself.
   */
  $effect(() => {
    const snapshot = previewSnapshot;
    if (onChange === undefined || snapshot === null) {
      return;
    }
    const announced = JSON.stringify(snapshot);
    if (announced === lastAnnounced) {
      return;
    }
    lastAnnounced = announced;
    onChange(snapshot);
  });

  /**
   * Apply one edit to a field the form does not otherwise own — a derived stat, a proficiency, the
   * kit.
   *
   * It works by making the character on screen the new `base` and changing it there, which has a
   * consequence worth stating: the first Details edit turns a composed character into an edited
   * payload. From then on the payload is authoritative and the rules stop being recomputed
   * underneath it, which is requirement 4.2 and is what the user asked for by typing a number into
   * a derived field.
   */
  function editDetail(mutate: (snapshot: AdndCharacterSnapshot) => AdndCharacterSnapshot): void {
    if (previewSnapshot === null) return;
    base = mutate(previewSnapshot);
  }

  function setDerivedNumber(field: AdndDerivedNumberField, raw: unknown): void {
    const value = Math.trunc(Number(raw));
    if (!Number.isFinite(value)) return;
    editDetail((snapshot) => ({ ...snapshot, [field]: value }));
  }

  function setStringList(field: 'weaponProficiencyGroups' | 'nonweaponProficiencies', raw: string) {
    const entries = raw
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry !== '');
    editDetail((snapshot) => ({ ...snapshot, [field]: entries }));
  }

  function setAbilities(raw: string) {
    const lines = raw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');
    editDetail((snapshot) => ({ ...snapshot, abilities: lines }));
  }

  function setKitName(raw: string) {
    const name = raw.trim();
    editDetail((snapshot) => ({
      ...snapshot,
      kit: name === '' ? null : { name, features: snapshot.kit?.features ?? [] },
    }));
  }

  function setKitFeatures(raw: string) {
    const features = raw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '');
    editDetail((snapshot) =>
      snapshot.kit === null ? snapshot : { ...snapshot, kit: { ...snapshot.kit, features } },
    );
  }

  /**
   * Recompute the derived block from race, class, and attributes — the command that used to be
   * automatic.
   *
   * Demoting it to a button is the point. While a character is only ever composed, recomputing on
   * every keystroke is right; once it can be saved and corrected, the same behaviour would undo
   * the correction the moment anything else changed. So it stays available and becomes explicit,
   * and it says plainly that it overwrites.
   */
  function recalculateDerivedStats(): void {
    const cls = selectedClass;
    if (previewSnapshot === null || cls === null) return;
    const recomputed = adndCharacterFromSnapshot(previewSnapshot);
    finalizeAdndCharacterDerivedStats(recomputed);
    recalculateAdndArmorClass(recomputed);
    base = toAdndCharacterSnapshot(recomputed);
  }

  function rollNamesForCurrentSource(defaultHint: string) {
    const source = buildCharacterNameSource(
      nameSourceKind,
      presetSetName,
      savedCultureName,
      savedCultures,
      referencedCulture,
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

<section class="main">
  <header class="builder-header">
    <h1>AD&D 2e Character Builder</h1>
    <BaseButton onclick={resetBuilderForm}>Reset</BaseButton>
  </header>

  {#if wouldRederive}
    <p class="builder-rederive-warning" role="status">
      <strong>This will re-roll the character.</strong> Changing race, class, or an attribute means everything
      that follows from them — proficiencies, the kit, exceptional strength, and the derived numbers —
      is worked out afresh. Edits to those will be lost.
    </p>
  {/if}

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
    offerReferencedCulture
    bind:referencedCulture
    bind:cultureReference
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
  <BaseButton onclick={rollAttributes}>Roll 6 × 3d6</BaseButton>

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

      {#if availableSubraces.length > 0}
        <div class="input-group">
          <label>
            Subrace
            <select bind:value={subraceName}>
              {#each availableSubraces as subrace}
                <option value={subrace.name}>{subrace.name}</option>
              {/each}
            </select>
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
        <BaseButton onclick={newClassFeaturesSeed}>New seed</BaseButton>
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
        <BaseButton onclick={rollHitPoints}>Roll {selectedClass.hitDice} + Con</BaseButton>
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
        <BaseButton onclick={rollStartingFunds}
          >Roll starting funds ({startingFundsDiceLine(selectedClass)})</BaseButton
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

        <SaveArtifactButton
          kind={ADND_CHARACTER_ARTIFACT_KIND}
          toolPath={TOOL_PATH}
          snapshot={previewSnapshot}
          seed={classFeaturesSeed}
          config={buildRecord}
          defaultName={`${firstName} ${lastName}`.trim()}
          references={cultureReference === undefined || nameSourceKind !== 'referenced_culture'
            ? []
            : [cultureReference]}
        />

        <!--
          `aria-label` because a `<details>` maps to an unnamed `group`: the `<summary>` names the
          disclosure visually but does not name the group in the accessibility tree, so a screen
          reader announces "group" with nothing after it. Native `<details>` keeps the keyboard
          behaviour that a custom disclosure would have to reimplement (6.2).
        -->
        <details class="builder-details" aria-label="Details">
          <summary>Details</summary>

          <p class="builder-details-note">
            Everything below is stored exactly as you leave it. Changing a value here makes this
            character's own numbers authoritative, so the rules stop being recalculated underneath
            them.
          </p>

          <h3>Experience</h3>
          <div class="builder-detail-grid">
            {#each [{ field: 'level', label: 'Level' }, { field: 'xp', label: 'XP' }] as row}
              <label>
                {row.label}
                <input
                  type="number"
                  value={previewCharacter[row.field as 'level' | 'xp']}
                  onchange={(e) =>
                    setDerivedNumber(row.field as AdndDerivedNumberField, e.currentTarget.value)}
                />
              </label>
            {/each}
          </div>

          <h3>Proficiencies</h3>
          <label>
            Weapon proficiency groups (comma separated)
            <input
              type="text"
              value={previewCharacter.weaponProficiencyGroups.join(', ')}
              onchange={(e) => setStringList('weaponProficiencyGroups', e.currentTarget.value)}
            />
          </label>
          <label>
            Nonweapon proficiencies (comma separated)
            <input
              type="text"
              value={previewCharacter.nonweaponProficiencies.join(', ')}
              onchange={(e) => setStringList('nonweaponProficiencies', e.currentTarget.value)}
            />
          </label>

          <h3>Kit</h3>
          <label>
            Kit name (blank for none)
            <input
              type="text"
              value={previewCharacter.kit?.name ?? ''}
              onchange={(e) => setKitName(e.currentTarget.value)}
            />
          </label>
          {#if previewCharacter.kit}
            <label>
              Kit features, one per line
              <textarea
                rows="4"
                value={previewCharacter.kit.features.join('\n')}
                onchange={(e) => setKitFeatures(e.currentTarget.value)}
              ></textarea>
            </label>
          {/if}

          <h3>Abilities</h3>
          <label>
            One per line
            <textarea
              rows="6"
              value={previewCharacter.abilities.join('\n')}
              onchange={(e) => setAbilities(e.currentTarget.value)}
            ></textarea>
          </label>

          <h3>Derived stats</h3>
          <p>
            <BaseButton onclick={recalculateDerivedStats}>
              Recalculate from race, class, and attributes
            </BaseButton>
            <span class="builder-details-note">This overwrites every value below.</span>
          </p>
          <div class="builder-detail-grid">
            {#each DERIVED_NUMBER_FIELDS as row}
              <label>
                {row.label}
                <input
                  type="number"
                  value={previewCharacter[row.field]}
                  onchange={(e) => setDerivedNumber(row.field, e.currentTarget.value)}
                />
              </label>
            {/each}
          </div>
        </details>

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
    gap: var(--s6);
  }

  .builder-header h1 {
    margin: 0;
  }

  .builder-maturity {
    margin: var(--s4) 0 var(--s5);
  }

  .spell-pick-slots {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s6);
    align-items: flex-end;
    margin-bottom: var(--s6);
  }

  .spell-pick-slots label {
    display: flex;
    flex-direction: column;
    gap: var(--s2);
  }

  .thief-skill-grid {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s6);
    align-items: flex-end;
    margin-bottom: var(--s6);
  }

  .thief-skill-grid label {
    display: flex;
    flex-direction: column;
    gap: var(--s2);
    min-width: 12rem;
  }

  .thief-skill-final {
    font-weight: 600;
  }

  .wealth-inputs {
    display: flex;
    flex-wrap: wrap;
    gap: var(--s6);
    align-items: flex-end;
  }

  .wealth-inputs label {
    display: flex;
    flex-direction: column;
    gap: var(--s2);
  }

  .equipment-list {
    list-style: none;
    padding-left: 0;
  }

  .builder-result {
    margin-top: var(--s8);
    padding-top: var(--s7);
    border-top: 1px solid var(--border-strong);
  }
</style>
