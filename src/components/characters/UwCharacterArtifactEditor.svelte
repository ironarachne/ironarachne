<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    addUwCharacterAsset,
    addUwCharacterRow,
    addUwCharacterUpgrade,
    isUnknownUwCareerName,
    isUnknownUwOriginName,
    isUnknownUwSkillName,
    removeUwCharacterAsset,
    removeUwCharacterRow,
    removeUwCharacterUpgrade,
    setUwCharacterAssetClass,
    setUwCharacterAssetText,
    setUwCharacterAssetTypeName,
    setUwCharacterRowListName,
    setUwCharacterRowName,
    setUwCharacterStat,
    setUwCharacterText,
    setUwCharacterUpgradeText,
    validateUwCharacterSnapshot,
    UW_STAT_FIELDS,
    UW_TEXT_FIELDS,
    type UwCharacterSnapshot,
    type UwCharacterTextField,
    type UwStatField,
  } from '$lib/unchartedworlds';

  /**
   * The editing view for a saved Uncharted Worlds character.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it, so
   * what is here is the character's own shape and the calls that change it.
   *
   * **No skill description is offered, and no career or origin prose either.** That text belongs to
   * the library: it is derived from this build's tables when a character is read, so a wording fix
   * reaches a character saved last month. What a user changes here is *which* row they took, and
   * the prose follows — decision 3 of docs/readiness-characters.md. An asset is the opposite case
   * and every part of one is editable, because it was assembled at generation time rather than
   * looked up.
   */
  type Props = {
    snapshot: unknown;
    onChange: (snapshot: unknown) => void;
  };

  const { snapshot, onChange }: Props = $props();

  const uid = $props.id();

  /**
   * The snapshot as this kind's own validator accepts it, or nothing.
   *
   * The prop is `unknown` because the framework holds payloads of every kind, and narrowing it
   * through `validate` rather than a cast is what keeps this editor from rendering fields over
   * something that is not an Uncharted Worlds character.
   */
  const accepted = $derived(validateUwCharacterSnapshot(snapshot));
  const character = $derived<UwCharacterSnapshot | undefined>(
    accepted.ok ? accepted.value : undefined,
  );

  const TEXT_LABELS: Record<UwCharacterTextField, string> = {
    firstName: 'First name',
    lastName: 'Last name',
    descriptors: 'Descriptors',
    advancement: 'Advancement',
  };

  const STAT_LABELS: Record<UwStatField, string> = {
    physique: 'Physique',
    mettle: 'Mettle',
    expertise: 'Expertise',
    influence: 'Influence',
    interface: 'Interface',
  };

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: UwCharacterSnapshot) => UwCharacterSnapshot): void {
    if (character === undefined) {
      return;
    }
    onChange(change(character));
  }
</script>

{#if character === undefined}
  <Notice tone="danger">
    These contents are stored as an Uncharted Worlds character but do not read as one, so there is
    nothing safe to edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="uw-editor">
    <fieldset>
      <legend>Who they are</legend>

      {#each UW_TEXT_FIELDS as field (field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-{field}">{TEXT_LABELS[field]}</label>
          <input
            id="{uid}-{field}"
            type="text"
            value={character[field]}
            oninput={(event) =>
              edit((current) => setUwCharacterText(current, field, event.currentTarget.value))}
            autocomplete="off"
          />
        </div>
      {/each}
    </fieldset>

    <fieldset>
      <legend>Statistics</legend>

      {#each UW_STAT_FIELDS as field (field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-stat-{field}">{STAT_LABELS[field]}</label>
          <input
            id="{uid}-stat-{field}"
            type="number"
            value={character.stats[field]}
            oninput={(event) =>
              edit((current) =>
                setUwCharacterStat(current, field, event.currentTarget.valueAsNumber),
              )}
          />
        </div>
      {/each}
    </fieldset>

    <fieldset>
      <legend>Careers</legend>

      <!-- Keyed by position rather than by value: two entries may read the same, and a key that
           changed as the user typed would lose focus on every keystroke. -->
      {#each character.careers as career, index (index)}
        <div class="input-group input-group--inline">
          <label for="{uid}-career-{index}">Career {index + 1}</label>
          <input
            id="{uid}-career-{index}"
            type="text"
            value={career.name}
            oninput={(event) =>
              edit((current) =>
                setUwCharacterRowListName(current, 'careers', index, event.currentTarget.value),
              )}
            autocomplete="off"
          />
          <BaseButton
            aria-label="Remove career {index + 1}"
            onclick={() => edit((current) => removeUwCharacterRow(current, 'careers', index))}
          >
            Remove
          </BaseButton>
        </div>
      {/each}

      <!-- Said rather than hidden. A career this build no longer has is still the career the
           user's notes say they took, and everything it granted is already on the character. -->
      {#if character.careers.some((career) => isUnknownUwCareerName(career.name))}
        <p class="uw-editor__note">
          One of those careers is not in this build's table, so nothing further will be drawn from
          it. What it already gave this character is on the sheet regardless.
        </p>
      {/if}

      <BaseButton onclick={() => edit((current) => addUwCharacterRow(current, 'careers'))}>
        Add a career
      </BaseButton>
    </fieldset>

    <fieldset>
      <legend>Origin and workspace</legend>

      <div class="input-group input-group--inline">
        <label for="{uid}-origin">Origin</label>
        <input
          id="{uid}-origin"
          type="text"
          value={character.origin.name}
          oninput={(event) =>
            edit((current) => setUwCharacterRowName(current, 'origin', event.currentTarget.value))}
          autocomplete="off"
        />
      </div>

      {#if isUnknownUwOriginName(character.origin.name)}
        <p class="uw-editor__note">
          That origin is not in this build's table. The character keeps it; nothing further will be
          drawn from it.
        </p>
      {/if}

      <div class="input-group input-group--inline">
        <label for="{uid}-workspace">Workspace</label>
        <input
          id="{uid}-workspace"
          type="text"
          value={character.workspace.name}
          oninput={(event) =>
            edit((current) =>
              setUwCharacterRowName(current, 'workspace', event.currentTarget.value),
            )}
          autocomplete="off"
        />
      </div>
    </fieldset>

    <fieldset>
      <legend>Skills</legend>

      <!-- The name only. What each skill does is this build's text, derived when the character is
           read, so a corrected description reaches a character saved long before the fix. -->
      {#each character.skills as skill, index (index)}
        <div class="input-group input-group--inline">
          <label for="{uid}-skill-{index}">Skill {index + 1}</label>
          <input
            id="{uid}-skill-{index}"
            type="text"
            value={skill.name}
            oninput={(event) =>
              edit((current) =>
                setUwCharacterRowListName(current, 'skills', index, event.currentTarget.value),
              )}
            autocomplete="off"
          />
          <BaseButton
            aria-label="Remove skill {index + 1}"
            onclick={() => edit((current) => removeUwCharacterRow(current, 'skills', index))}
          >
            Remove
          </BaseButton>
        </div>
      {/each}

      {#if character.skills.some((skill) => isUnknownUwSkillName(skill.name))}
        <p class="uw-editor__note">
          One of those skills has no description in this build, so the sheet will print its name
          alone.
        </p>
      {/if}

      <BaseButton onclick={() => edit((current) => addUwCharacterRow(current, 'skills'))}>
        Add a skill
      </BaseButton>
    </fieldset>

    <fieldset>
      <legend>Assets</legend>

      {#each character.assets as asset, assetIndex (assetIndex)}
        <div class="uw-editor__row">
          <div class="input-group input-group--inline">
            <label for="{uid}-asset-{assetIndex}-name">Asset {assetIndex + 1} name</label>
            <input
              id="{uid}-asset-{assetIndex}-name"
              type="text"
              value={asset.name}
              oninput={(event) =>
                edit((current) =>
                  setUwCharacterAssetText(current, assetIndex, 'name', event.currentTarget.value),
                )}
              autocomplete="off"
            />
          </div>

          <div class="input-group input-group--inline">
            <label for="{uid}-asset-{assetIndex}-type">Asset {assetIndex + 1} type</label>
            <input
              id="{uid}-asset-{assetIndex}-type"
              type="text"
              value={asset.type.name}
              oninput={(event) =>
                edit((current) =>
                  setUwCharacterAssetTypeName(current, assetIndex, event.currentTarget.value),
                )}
              autocomplete="off"
            />
            <label for="{uid}-asset-{assetIndex}-class">Asset {assetIndex + 1} class</label>
            <input
              id="{uid}-asset-{assetIndex}-class"
              type="number"
              value={asset.assetClass}
              oninput={(event) =>
                edit((current) =>
                  setUwCharacterAssetClass(current, assetIndex, event.currentTarget.valueAsNumber),
                )}
            />
          </div>

          <div class="input-group input-group--inline">
            <label for="{uid}-asset-{assetIndex}-description">
              Asset {assetIndex + 1} description
            </label>
            <textarea
              id="{uid}-asset-{assetIndex}-description"
              rows="2"
              value={asset.description}
              oninput={(event) =>
                edit((current) =>
                  setUwCharacterAssetText(
                    current,
                    assetIndex,
                    'description',
                    event.currentTarget.value,
                  ),
                )}
            ></textarea>
          </div>

          {#each asset.upgrades as upgrade, upgradeIndex (upgradeIndex)}
            <div class="input-group input-group--inline">
              <label for="{uid}-asset-{assetIndex}-upgrade-{upgradeIndex}-name">
                Asset {assetIndex + 1} upgrade {upgradeIndex + 1} name
              </label>
              <input
                id="{uid}-asset-{assetIndex}-upgrade-{upgradeIndex}-name"
                type="text"
                value={upgrade.name}
                oninput={(event) =>
                  edit((current) =>
                    setUwCharacterUpgradeText(
                      current,
                      assetIndex,
                      upgradeIndex,
                      'name',
                      event.currentTarget.value,
                    ),
                  )}
                autocomplete="off"
              />
              <label for="{uid}-asset-{assetIndex}-upgrade-{upgradeIndex}-description">
                Asset {assetIndex + 1} upgrade {upgradeIndex + 1} description
              </label>
              <input
                id="{uid}-asset-{assetIndex}-upgrade-{upgradeIndex}-description"
                type="text"
                value={upgrade.description}
                oninput={(event) =>
                  edit((current) =>
                    setUwCharacterUpgradeText(
                      current,
                      assetIndex,
                      upgradeIndex,
                      'description',
                      event.currentTarget.value,
                    ),
                  )}
                autocomplete="off"
              />
              <BaseButton
                aria-label="Remove asset {assetIndex + 1} upgrade {upgradeIndex + 1}"
                onclick={() =>
                  edit((current) => removeUwCharacterUpgrade(current, assetIndex, upgradeIndex))}
              >
                Remove
              </BaseButton>
            </div>
          {/each}

          <BaseButton onclick={() => edit((current) => addUwCharacterUpgrade(current, assetIndex))}>
            Add an upgrade to asset {assetIndex + 1}
          </BaseButton>

          <BaseButton
            aria-label="Remove asset {assetIndex + 1}"
            onclick={() => edit((current) => removeUwCharacterAsset(current, assetIndex))}
          >
            Remove asset {assetIndex + 1}
          </BaseButton>
        </div>
      {/each}

      <BaseButton onclick={() => edit(addUwCharacterAsset)}>Add an asset</BaseButton>
    </fieldset>
  </div>
{/if}

<style>
  .uw-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .uw-editor fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    align-items: flex-start;
    margin: 0;
    /* No border and no radius, matching the culture, character, DCC and SWN editors: a fieldset
       inside an editor panel was a box inside a box, and the legend and the spacing already group
       these. */
    padding: var(--s4) 0;
    min-width: 0;
  }

  .uw-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .uw-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .uw-editor input[type='text'],
  .uw-editor input[type='number'],
  .uw-editor textarea {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .uw-editor__row {
    display: flex;
    flex-direction: column;
    gap: var(--s2);
    width: 100%;
    min-width: 0;
  }

  .uw-editor__note {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>
