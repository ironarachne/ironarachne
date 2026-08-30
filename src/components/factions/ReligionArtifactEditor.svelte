<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    ALL_RELIGION_DIMENSION_IDS,
    deityTitleLine,
    listDomains,
    MAX_RANK_DEPTH,
    removeDeity,
    renameReligion,
    setDeityField,
    setDeityRelationshipDescription,
    setDivineRealmField,
    setNonTheisticField,
    setPantheonDescription,
    setReligionCosmologySummary,
    setReligionDescription,
    setReligionDimensionSummary,
    setSpiritEchelonField,
    setSpiritEchelonRankDepth,
    summaryTextForReligionDimension,
    validateReligionSnapshot,
    type NonTheisticField,
    type ReligionDimensionId,
    type ReligionSnapshot,
  } from '$lib/religion';

  /**
   * The editing view for a saved religion.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it,
   * so what is here is the religion's own shape and the calls that change it.
   *
   * This is the kind requirement 4.4 was written for. A religion is not a flat record: its pantheon
   * is a list of gods, each with a name, a holy item, and a description of their own, and the point
   * is that one of them can be renamed while the other six and the seed they all came from stay
   * exactly as they were. Every control writes a whole replacement snapshot through `onChange`, and
   * the framework compares that against what it read — so typing a character and deleting it again
   * leaves nothing to save.
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
   * through `validate` rather than a cast is what keeps a religion editor from rendering fields
   * over something that is not a religion.
   */
  const accepted = $derived(validateReligionSnapshot(snapshot));
  const religion = $derived<ReligionSnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  const DIMENSION_LABELS: Record<ReligionDimensionId, string> = {
    ritual: 'Ritual',
    experiential: 'Experiential',
    mythological: 'Mythological',
    doctrinal: 'Doctrinal',
    ethical: 'Ethical',
    institutional: 'Institutional',
    material: 'Material',
  };

  const TRADITION_FIELDS: { field: NonTheisticField; label: string }[] = [
    { field: 'mediationSummary', label: 'Mediation' },
    { field: 'pollutionOrPurityNotes', label: 'Purity and pollution' },
    { field: 'narrativeSummary', label: 'Tradition summary' },
  ];

  /** The dimensions this religion actually has, in the order the site presents them. */
  const dimensions = $derived(
    ALL_RELIGION_DIMENSION_IDS.filter((id) => religion?.religion.dimensions?.[id] !== undefined),
  );

  /** Applies one edit. Every handler goes through here so `onChange` is called in exactly one place. */
  function edit(change: (current: ReligionSnapshot) => ReligionSnapshot): void {
    if (religion === undefined) {
      return;
    }
    onChange(change(religion));
  }
</script>

{#if religion === undefined}
  <Notice tone="danger">
    These contents are stored as a religion but do not read as one, so there is nothing safe to edit
    here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="religion-editor">
    <div class="input-group input-group--inline">
      <label for="{uid}-religion-name">Religion name</label>
      <input
        id="{uid}-religion-name"
        type="text"
        value={religion.religion.name}
        oninput={(event) => edit((current) => renameReligion(current, event.currentTarget.value))}
        autocomplete="off"
      />
    </div>

    <div class="input-group religion-editor__stacked">
      <label for="{uid}-religion-description">Description</label>
      <textarea
        id="{uid}-religion-description"
        rows="4"
        value={religion.religion.description}
        oninput={(event) =>
          edit((current) => setReligionDescription(current, event.currentTarget.value))}
      ></textarea>
    </div>

    {#if religion.religion.nonTheisticDetail}
      <fieldset>
        <legend>Tradition</legend>

        {#each TRADITION_FIELDS as entry (entry.field)}
          <div class="input-group religion-editor__stacked">
            <label for="{uid}-tradition-{entry.field}">{entry.label}</label>
            <textarea
              id="{uid}-tradition-{entry.field}"
              rows="3"
              value={religion.religion.nonTheisticDetail[entry.field]}
              oninput={(event) =>
                edit((current) =>
                  setNonTheisticField(current, entry.field, event.currentTarget.value),
                )}
            ></textarea>
          </div>
        {/each}
      </fieldset>
    {/if}

    {#if dimensions.length > 0}
      <fieldset>
        <legend>Comparative dimensions</legend>

        {#each dimensions as id (id)}
          <div class="input-group religion-editor__stacked">
            <label for="{uid}-dimension-{id}">{DIMENSION_LABELS[id]}</label>
            <textarea
              id="{uid}-dimension-{id}"
              rows="3"
              value={summaryTextForReligionDimension(id, religion.religion.dimensions?.[id])}
              oninput={(event) =>
                edit((current) =>
                  setReligionDimensionSummary(current, id, event.currentTarget.value),
                )}
            ></textarea>
          </div>
        {/each}
      </fieldset>
    {/if}

    {#if religion.religion.cosmology}
      <fieldset>
        <legend>Spirit cosmology</legend>

        <div class="input-group religion-editor__stacked">
          <label for="{uid}-cosmology-summary">Cosmology summary</label>
          <textarea
            id="{uid}-cosmology-summary"
            rows="3"
            value={religion.religion.cosmology.summary}
            oninput={(event) =>
              edit((current) => setReligionCosmologySummary(current, event.currentTarget.value))}
          ></textarea>
        </div>

        <!-- Keyed by position rather than by value: two orders may read the same, and a key that
             changed as the user typed would lose focus on every keystroke. -->
        {#each religion.religion.cosmology.echelons as echelon, index (index)}
          <div class="input-group input-group--inline">
            <label for="{uid}-echelon-{index}">Spirit order {index + 1}</label>
            <input
              id="{uid}-echelon-{index}"
              type="text"
              value={echelon.label}
              oninput={(event) =>
                edit((current) =>
                  setSpiritEchelonField(current, index, 'label', event.currentTarget.value),
                )}
              autocomplete="off"
            />
          </div>
          <div class="input-group input-group--inline">
            <label for="{uid}-echelon-{index}-depth">Spirit order {index + 1} rank depth</label>
            <input
              id="{uid}-echelon-{index}-depth"
              type="number"
              min="1"
              max={MAX_RANK_DEPTH}
              step="1"
              value={echelon.rankDepth}
              oninput={(event) =>
                edit((current) =>
                  setSpiritEchelonRankDepth(current, index, event.currentTarget.valueAsNumber),
                )}
            />
          </div>
          <div class="input-group religion-editor__stacked">
            <label for="{uid}-echelon-{index}-summary">Spirit order {index + 1} summary</label>
            <textarea
              id="{uid}-echelon-{index}-summary"
              rows="2"
              value={echelon.summary}
              oninput={(event) =>
                edit((current) =>
                  setSpiritEchelonField(current, index, 'summary', event.currentTarget.value),
                )}
            ></textarea>
          </div>
        {/each}
      </fieldset>
    {/if}

    <fieldset>
      <legend>Realms</legend>

      {#each religion.religion.realms as realm, index (index)}
        <div class="input-group input-group--inline">
          <label for="{uid}-realm-{index}">Realm {index + 1}</label>
          <input
            id="{uid}-realm-{index}"
            type="text"
            value={realm.name}
            oninput={(event) =>
              edit((current) =>
                setDivineRealmField(current, index, 'name', event.currentTarget.value),
              )}
            autocomplete="off"
          />
        </div>
        <div class="input-group religion-editor__stacked">
          <label for="{uid}-realm-{index}-description">Realm {index + 1} description</label>
          <textarea
            id="{uid}-realm-{index}-description"
            rows="2"
            value={realm.description}
            oninput={(event) =>
              edit((current) =>
                setDivineRealmField(current, index, 'description', event.currentTarget.value),
              )}
          ></textarea>
        </div>
      {/each}
    </fieldset>

    {#if religion.religion.pantheon !== null}
      <fieldset>
        <legend>Pantheon</legend>

        <div class="input-group religion-editor__stacked">
          <label for="{uid}-pantheon-description">Pantheon description</label>
          <textarea
            id="{uid}-pantheon-description"
            rows="2"
            value={religion.religion.pantheon.description}
            oninput={(event) =>
              edit((current) => setPantheonDescription(current, event.currentTarget.value))}
          ></textarea>
        </div>

        {#each religion.religion.pantheon.members as deity, index (index)}
          <div class="religion-editor__deity">
            <div class="input-group input-group--inline">
              <label for="{uid}-deity-{index}">Deity {index + 1} name</label>
              <input
                id="{uid}-deity-{index}"
                type="text"
                value={deity.name}
                oninput={(event) =>
                  edit((current) =>
                    setDeityField(current, index, 'name', event.currentTarget.value),
                  )}
                autocomplete="off"
              />
              <BaseButton
                aria-label="Remove deity {index + 1}"
                onclick={() => edit((current) => removeDeity(current, index))}
              >
                Remove
              </BaseButton>
            </div>

            <!-- Read-only, and named rather than hidden. A deity's domains are a set drawn from the
                 domain table, each carrying holy items and the mutators that shaped this god; a
                 text box over them would be editing a lookup by hand. The title is the pantheon's
                 own doing — a leader is crowned during generation — and it is shown so renaming the
                 god beside it is not done blind. -->
            <p class="religion-editor__note">
              {#if deityTitleLine(deity) !== ''}{deityTitleLine(deity)} —
              {/if}Domains: {listDomains(deity.domains)}
            </p>

            <div class="input-group input-group--inline">
              <label for="{uid}-deity-{index}-item">Deity {index + 1} holy item</label>
              <input
                id="{uid}-deity-{index}-item"
                type="text"
                value={deity.holyItem ?? ''}
                oninput={(event) =>
                  edit((current) =>
                    setDeityField(current, index, 'holyItem', event.currentTarget.value),
                  )}
                autocomplete="off"
              />
            </div>

            <div class="input-group input-group--inline">
              <label for="{uid}-deity-{index}-symbol">Deity {index + 1} holy symbol</label>
              <input
                id="{uid}-deity-{index}-symbol"
                type="text"
                value={deity.holySymbol ?? ''}
                oninput={(event) =>
                  edit((current) =>
                    setDeityField(current, index, 'holySymbol', event.currentTarget.value),
                  )}
                autocomplete="off"
              />
            </div>

            <div class="input-group religion-editor__stacked">
              <label for="{uid}-deity-{index}-description">Deity {index + 1} description</label>
              <textarea
                id="{uid}-deity-{index}-description"
                rows="3"
                value={deity.description}
                oninput={(event) =>
                  edit((current) =>
                    setDeityField(current, index, 'description', event.currentTarget.value),
                  )}
              ></textarea>
            </div>

            {#each deity.relationships as relationship, position (relationship.id)}
              <div class="input-group religion-editor__stacked">
                <label for="{uid}-deity-{index}-relationship-{position}">
                  Deity {index + 1} relationship {position + 1}
                </label>
                <textarea
                  id="{uid}-deity-{index}-relationship-{position}"
                  rows="2"
                  value={relationship.description}
                  oninput={(event) =>
                    edit((current) =>
                      setDeityRelationshipDescription(
                        current,
                        index,
                        position,
                        event.currentTarget.value,
                      ),
                    )}
                ></textarea>
              </div>
            {/each}
          </div>
        {/each}
      </fieldset>
    {/if}
  </div>
{/if}

<style>
  .religion-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .religion-editor fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    align-items: flex-start;
    margin: 0;
    /* No border and no radius. A fieldset inside an editor panel was a box inside a box, which
       is what "the problem is nineteen copies of a box" is about: when everything is a box,
       being one emphasises nothing. The legend and the spacing group these fields; the panel
       around them is the only keyline in sight. */
    padding: var(--s4) 0;
    min-width: 0;
  }

  .religion-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* The row layout is `.input-group--inline`'s now — this file used to hand-roll it, as eight
     others did. What is left is local: the reset, the room to shrink and the full width. */
  .religion-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  /* Prose wants the width; a label sitting beside a three-row textarea on a 320px screen leaves
     neither enough room to be useful. */
  .religion-editor .religion-editor__stacked {
    flex-direction: column;
    align-items: stretch;
  }

  .religion-editor input[type='text'],
  .religion-editor textarea {
    min-width: 0;
    flex: 1 1 6rem;
    width: 100%;
  }

  /* One god's fields, held together: a pantheon of seven is otherwise an undifferentiated column
     of text boxes, and which name goes with which holy symbol stops being obvious. */
  .religion-editor__deity {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    width: 100%;
    min-width: 0;
    padding: var(--s3) 0;
    /* A divider between rows, not a keyline around a box: `--border` rather than
       `--border-strong`, which is the plate's edge and says more than a separator has
       to. */
    border-top: 1px solid var(--border);
  }

  .religion-editor__note {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>
