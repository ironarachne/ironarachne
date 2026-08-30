<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    addSettlementProblem,
    removeSettlementNotable,
    removeSettlementProblem,
    setSettlementCategoryName,
    setSettlementCount,
    setSettlementEconomicRole,
    setSettlementEnvironmentDescription,
    setSettlementFacet,
    setSettlementNotableField,
    setSettlementNotableName,
    setSettlementOrganizationField,
    setSettlementProblem,
    setSettlementTags,
    setSettlementText,
    setSettlementTradeList,
    validateSettlementSnapshot,
    SETTLEMENT_ECONOMIC_ROLES,
    type SettlementCountField,
    type SettlementFacetField,
    type SettlementProblemList,
    type SettlementSnapshot,
    type SettlementTradeList,
  } from '$lib/settlements';

  /**
   * The editing view for a saved settlement.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it, so
   * what is here is the settlement's own shape and the calls that change it.
   *
   * The shape is the interesting part. Enrichment is opt-in four times over, so this component has
   * to render sixteen combinations of the same kind without any of them looking broken: a
   * settlement with no notables is not a settlement missing its notables, and a fieldset of empty
   * inputs would say otherwise. Each optional layer is therefore absent when the settlement has no
   * such layer, with one exception — the problem lists, which can be started by hand, because a
   * problem is prose and an empty one is a field waiting to be filled.
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
   * through `validate` rather than a cast is what keeps a settlement editor from rendering fields
   * over something that is not a settlement.
   */
  const accepted = $derived(validateSettlementSnapshot(snapshot));
  const settlement = $derived<SettlementSnapshot | undefined>(
    accepted.ok ? accepted.value : undefined,
  );

  const FACET_FIELDS: { field: SettlementFacetField; label: string }[] = [
    { field: 'lawAndOrder', label: 'Law and order' },
    { field: 'commerce', label: 'Commerce' },
    { field: 'foodSecurity', label: 'Food security' },
    { field: 'publicHealth', label: 'Public health' },
  ];

  const COUNT_FIELDS: { field: SettlementCountField; label: string }[] = [
    { field: 'population', label: 'Population' },
    { field: 'prosperity', label: 'Prosperity' },
  ];

  const TRADE_LISTS: { field: SettlementTradeList; label: string }[] = [
    { field: 'primaryExports', label: 'Exports' },
    { field: 'primaryImports', label: 'Imports' },
  ];

  const PROBLEM_LISTS: { field: SettlementProblemList; label: string; singular: string }[] = [
    { field: 'acuteProblems', label: 'Acute problems', singular: 'Acute problem' },
    { field: 'creepingProblems', label: 'Creeping problems', singular: 'Creeping problem' },
  ];

  /** Applies one edit. Every handler goes through here so `onChange` is called in exactly one place. */
  function edit(change: (current: SettlementSnapshot) => SettlementSnapshot): void {
    if (settlement === undefined) {
      return;
    }
    onChange(change(settlement));
  }

  function notableName(index: number): string {
    const character = settlement?.importantPeople?.[index]?.character;
    return character === undefined ? '' : `${character.firstName} ${character.lastName}`.trim();
  }
</script>

{#if settlement === undefined}
  <Notice tone="danger">
    These contents are stored as a settlement but do not read as one, so there is nothing safe to
    edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="settlement-editor">
    <div class="input-group input-group--inline">
      <label for="{uid}-settlement-name">Settlement name</label>
      <input
        id="{uid}-settlement-name"
        type="text"
        value={settlement.name}
        oninput={(event) =>
          edit((current) => setSettlementText(current, 'name', event.currentTarget.value))}
        autocomplete="off"
      />
    </div>

    <div class="input-group input-group--inline">
      <label for="{uid}-category">Kind of place</label>
      <input
        id="{uid}-category"
        type="text"
        value={settlement.category.name}
        oninput={(event) =>
          edit((current) => setSettlementCategoryName(current, event.currentTarget.value))}
        autocomplete="off"
      />
    </div>

    {#each COUNT_FIELDS as entry (entry.field)}
      <div class="input-group input-group--inline">
        <label for="{uid}-{entry.field}">{entry.label}</label>
        <input
          id="{uid}-{entry.field}"
          type="number"
          min="0"
          value={settlement[entry.field]}
          oninput={(event) =>
            edit((current) =>
              setSettlementCount(current, entry.field, event.currentTarget.valueAsNumber),
            )}
        />
      </div>
    {/each}

    <div class="input-group input-group--inline">
      <label for="{uid}-economic-role">Economic role</label>
      <select
        id="{uid}-economic-role"
        value={settlement.economicRole}
        onchange={(event) =>
          edit((current) => setSettlementEconomicRole(current, event.currentTarget.value))}
      >
        {#each SETTLEMENT_ECONOMIC_ROLES as role (role)}
          <option value={role}>{role}</option>
        {/each}
      </select>
    </div>

    <div class="input-group settlement-editor__stacked">
      <label for="{uid}-description">Description</label>
      <textarea
        id="{uid}-description"
        rows="4"
        value={settlement.description}
        oninput={(event) =>
          edit((current) => setSettlementText(current, 'description', event.currentTarget.value))}
      ></textarea>
    </div>

    <fieldset>
      <legend>Facets</legend>
      <p class="settlement-editor__note">Each runs from 0 to 10.</p>

      {#each FACET_FIELDS as entry (entry.field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-{entry.field}">{entry.label}</label>
          <input
            id="{uid}-{entry.field}"
            type="number"
            min="0"
            max="10"
            value={settlement[entry.field]}
            oninput={(event) =>
              edit((current) =>
                setSettlementFacet(current, entry.field, event.currentTarget.valueAsNumber),
              )}
          />
        </div>
      {/each}
    </fieldset>

    <fieldset>
      <legend>Environment</legend>

      <div class="input-group settlement-editor__stacked">
        <label for="{uid}-environment">Surroundings</label>
        <textarea
          id="{uid}-environment"
          rows="3"
          value={settlement.environment.description}
          oninput={(event) =>
            edit((current) =>
              setSettlementEnvironmentDescription(current, event.currentTarget.value),
            )}
        ></textarea>
      </div>

      <div class="input-group settlement-editor__stacked">
        <label for="{uid}-tags">Hook tags</label>
        <input
          id="{uid}-tags"
          type="text"
          value={settlement.settlementTags.join(', ')}
          oninput={(event) =>
            edit((current) => setSettlementTags(current, event.currentTarget.value))}
          autocomplete="off"
        />
      </div>
    </fieldset>

    <!-- Trade is one of the four opt-in layers. A settlement rolled without it has no trade to
         rewrite, and a fieldset of empty boxes would suggest it lost something. -->
    {#if settlement.primaryExports !== undefined || settlement.primaryImports !== undefined}
      <fieldset>
        <legend>Trade</legend>

        {#each TRADE_LISTS as entry (entry.field)}
          {#if settlement[entry.field] !== undefined}
            <div class="input-group settlement-editor__stacked">
              <label for="{uid}-{entry.field}">{entry.label}</label>
              <input
                id="{uid}-{entry.field}"
                type="text"
                value={(settlement[entry.field] ?? []).join(', ')}
                oninput={(event) =>
                  edit((current) =>
                    setSettlementTradeList(current, entry.field, event.currentTarget.value),
                  )}
                autocomplete="off"
              />
            </div>
          {/if}
        {/each}

        {#if settlement.tradeBlurb !== undefined}
          <div class="input-group settlement-editor__stacked">
            <label for="{uid}-trade-blurb">Trade notes</label>
            <textarea
              id="{uid}-trade-blurb"
              rows="3"
              value={settlement.tradeBlurb}
              oninput={(event) =>
                edit((current) =>
                  setSettlementText(current, 'tradeBlurb', event.currentTarget.value),
                )}
            ></textarea>
          </div>
        {/if}
      </fieldset>
    {/if}

    {#each PROBLEM_LISTS as list (list.field)}
      <fieldset>
        <legend>{list.label}</legend>

        <!-- Keyed by position rather than by value: two problems may read the same, and a key that
             changed as the user typed would lose focus on every keystroke. -->
        {#each settlement[list.field] ?? [] as problem, index (index)}
          <div class="settlement-editor__row">
            <div class="input-group settlement-editor__stacked">
              <label for="{uid}-{list.field}-{index}">{list.singular} {index + 1}</label>
              <input
                id="{uid}-{list.field}-{index}"
                type="text"
                value={problem.summary}
                oninput={(event) =>
                  edit((current) =>
                    setSettlementProblem(
                      current,
                      list.field,
                      index,
                      'summary',
                      event.currentTarget.value,
                    ),
                  )}
                autocomplete="off"
              />
            </div>
            <div class="input-group settlement-editor__stacked">
              <label for="{uid}-{list.field}-{index}-detail">
                {list.singular}
                {index + 1} detail
              </label>
              <textarea
                id="{uid}-{list.field}-{index}-detail"
                rows="2"
                value={problem.detail ?? ''}
                oninput={(event) =>
                  edit((current) =>
                    setSettlementProblem(
                      current,
                      list.field,
                      index,
                      'detail',
                      event.currentTarget.value,
                    ),
                  )}
              ></textarea>
            </div>
            <BaseButton
              aria-label="Remove {list.singular.toLowerCase()} {index + 1}"
              onclick={() => edit((current) => removeSettlementProblem(current, list.field, index))}
            >
              Remove
            </BaseButton>
          </div>
        {/each}

        <BaseButton onclick={() => edit((current) => addSettlementProblem(current, list.field))}>
          Add {list.singular.toLowerCase()}
        </BaseButton>
      </fieldset>
    {/each}

    {#if settlement.organizations !== undefined && settlement.organizations.length > 0}
      <fieldset>
        <legend>Organizations</legend>

        {#each settlement.organizations as organization, index (index)}
          <div class="settlement-editor__row">
            <div class="input-group input-group--inline">
              <label for="{uid}-org-{index}">Organization {index + 1}</label>
              <input
                id="{uid}-org-{index}"
                type="text"
                value={organization.name}
                oninput={(event) =>
                  edit((current) =>
                    setSettlementOrganizationField(
                      current,
                      index,
                      'name',
                      event.currentTarget.value,
                    ),
                  )}
                autocomplete="off"
              />
            </div>
            <div class="input-group settlement-editor__stacked">
              <label for="{uid}-org-{index}-hook">Organization {index + 1} hook</label>
              <textarea
                id="{uid}-org-{index}-hook"
                rows="2"
                value={organization.profile.hook}
                oninput={(event) =>
                  edit((current) =>
                    setSettlementOrganizationField(
                      current,
                      index,
                      'hook',
                      event.currentTarget.value,
                    ),
                  )}
              ></textarea>
            </div>
          </div>
        {/each}
      </fieldset>
    {/if}

    {#if settlement.importantPeople !== undefined && settlement.importantPeople.length > 0}
      <fieldset>
        <legend>Important people</legend>

        {#each settlement.importantPeople as person, index (index)}
          <div class="settlement-editor__row">
            <div class="input-group input-group--inline">
              <label for="{uid}-notable-{index}-role">Notable {index + 1} title</label>
              <input
                id="{uid}-notable-{index}-role"
                type="text"
                value={person.roleDisplay}
                oninput={(event) =>
                  edit((current) =>
                    setSettlementNotableField(
                      current,
                      index,
                      'roleDisplay',
                      event.currentTarget.value,
                    ),
                  )}
                autocomplete="off"
              />
            </div>
            <div class="input-group input-group--inline">
              <label for="{uid}-notable-{index}-first">Notable {index + 1} first name</label>
              <input
                id="{uid}-notable-{index}-first"
                type="text"
                value={person.character.firstName}
                oninput={(event) =>
                  edit((current) =>
                    setSettlementNotableName(
                      current,
                      index,
                      'firstName',
                      event.currentTarget.value,
                    ),
                  )}
                autocomplete="off"
              />
            </div>
            <div class="input-group input-group--inline">
              <label for="{uid}-notable-{index}-last">Notable {index + 1} family name</label>
              <input
                id="{uid}-notable-{index}-last"
                type="text"
                value={person.character.lastName}
                oninput={(event) =>
                  edit((current) =>
                    setSettlementNotableName(current, index, 'lastName', event.currentTarget.value),
                  )}
                autocomplete="off"
              />
            </div>
            <div class="input-group settlement-editor__stacked">
              <label for="{uid}-notable-{index}-importance">
                Notable {index + 1} importance
              </label>
              <textarea
                id="{uid}-notable-{index}-importance"
                rows="2"
                value={person.importance}
                oninput={(event) =>
                  edit((current) =>
                    setSettlementNotableField(
                      current,
                      index,
                      'importance',
                      event.currentTarget.value,
                    ),
                  )}
              ></textarea>
            </div>
            <!-- No way to add one, deliberately: a notable is a generated character with a
                 species, an age, and an archetype, so an empty one would be a broken record
                 rather than a blank field. -->
            <BaseButton
              aria-label="Remove {notableName(index) || `notable ${index + 1}`}"
              onclick={() => edit((current) => removeSettlementNotable(current, index))}
            >
              Remove
            </BaseButton>
          </div>
        {/each}
      </fieldset>
    {/if}
  </div>
{/if}

<style>
  .settlement-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .settlement-editor fieldset {
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

  .settlement-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* One sub-object per block, so a settlement's problems and its notables read as lists of things
     rather than one long run of fields. */
  .settlement-editor__row {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    width: 100%;
    min-width: 0;
    padding-bottom: var(--s4);
    /* A divider between rows, not a keyline around a box: `--border` rather than
       `--border-strong`, which is the plate's edge and says more than a separator has
       to. */
    border-bottom: 1px solid var(--border);
  }

  /* The row layout is `.input-group--inline`'s now — this file used to hand-roll it, as eight
     others did. What is left is local: the reset, the room to shrink and the full width. */
  .settlement-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  /* Prose wants the width; a label sitting beside a three-row textarea on a 320px screen leaves
     neither enough room to be useful. */
  .settlement-editor .settlement-editor__stacked {
    flex-direction: column;
    align-items: stretch;
  }

  .settlement-editor input[type='text'],
  .settlement-editor input[type='number'],
  .settlement-editor select,
  .settlement-editor textarea {
    min-width: 0;
    flex: 1 1 6rem;
    width: 100%;
  }

  .settlement-editor__note {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>
