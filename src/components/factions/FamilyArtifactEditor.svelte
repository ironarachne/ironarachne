<script lang="ts">
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    familyChildrenOf,
    familyMateOf,
    familyMemberName,
    familyMemberSummary,
    familyParentsOf,
    removeFamilyMember,
    setFamilyMemberName,
    setFamilyName,
    validateFamilySnapshot,
    type FamilySnapshot,
  } from '$lib/families';

  /**
   * The editing view for a saved family.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it, so
   * what is here is the family's name, one section per member, and the calls that change them.
   *
   * A member's species, age and relations are shown beside the name fields and not edited: a
   * member is a whole character, and the graph's edges are what the tree is drawn from. Removing a
   * member takes their edges with them. The tree itself is not drawn here — it is drawn from a live
   * `Family`, and the editor holds the stored one — and the roster the export prints is the same
   * facts in the same order.
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
   * something that is not a family.
   */
  const accepted = $derived(validateFamilySnapshot(snapshot));
  const family = $derived<FamilySnapshot | undefined>(accepted.ok ? accepted.value : undefined);

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: FamilySnapshot) => FamilySnapshot): void {
    if (family === undefined) {
      return;
    }
    onChange(change(family));
  }

  function relationsOf(
    current: FamilySnapshot,
    member: FamilySnapshot['members'][number],
  ): string[] {
    const lines: string[] = [];
    const mate = familyMateOf(current, member);
    if (mate !== undefined) {
      lines.push(`Mate: ${familyMemberName(mate)}`);
    }
    const children = familyChildrenOf(current, member);
    if (children.length > 0) {
      lines.push(`Children: ${children.map(familyMemberName).join(', ')}`);
    }
    const parents = familyParentsOf(current, member);
    if (parents.length > 0) {
      lines.push(`Parents: ${parents.map(familyMemberName).join(', ')}`);
    }
    return lines;
  }
</script>

{#if family === undefined}
  <Notice tone="danger">
    These contents are stored as a family but do not read as one, so there is nothing safe to edit
    here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="family-editor">
    <!-- Qualified as "Family name" rather than "Name": the panel above already has a field
         labelled "Name" that renames the artifact, and two fields with the same accessible name in
         one region is the 6.2 failure. -->
    <div class="input-group input-group--inline">
      <label for="{uid}-name">Family name</label>
      <input
        id="{uid}-name"
        type="text"
        value={family.name}
        oninput={(event) => edit((current) => setFamilyName(current, event.currentTarget.value))}
        autocomplete="off"
      />
    </div>

    {#if family.members.length === 0}
      <!-- A family with nobody in it is an ordinary state, not a fault: a user may have removed
           everyone on the way to something else. -->
      <p class="family-editor__note">Nobody in this family.</p>
    {/if}

    <!-- Keyed by id: members are removed from the middle of the list, and a positional key would
         hand the next member the fields of the one that went. -->
    {#each family.members as member, index (member.id)}
      <fieldset>
        <legend>Member {index + 1}</legend>

        <p class="family-editor__summary">{familyMemberSummary(member)}</p>

        <div class="input-group input-group--inline">
          <label for="{uid}-member-{index}-first">Member {index + 1} first name</label>
          <input
            id="{uid}-member-{index}-first"
            type="text"
            value={member.firstName}
            oninput={(event) =>
              edit((current) =>
                setFamilyMemberName(current, index, 'firstName', event.currentTarget.value),
              )}
            autocomplete="off"
          />
        </div>

        <div class="input-group input-group--inline">
          <label for="{uid}-member-{index}-last">Member {index + 1} last name</label>
          <input
            id="{uid}-member-{index}-last"
            type="text"
            value={member.lastName}
            oninput={(event) =>
              edit((current) =>
                setFamilyMemberName(current, index, 'lastName', event.currentTarget.value),
              )}
            autocomplete="off"
          />
        </div>

        {#each relationsOf(family, member) as line (line)}
          <p class="family-editor__relation">{line}</p>
        {/each}

        <BaseButton
          aria-label="Remove member {index + 1}"
          onclick={() => edit((current) => removeFamilyMember(current, index))}
        >
          Remove member {index + 1}
        </BaseButton>
      </fieldset>
    {/each}
  </div>
{/if}

<style>
  .family-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .family-editor fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--s3);
    align-items: flex-start;
    margin: 0;
    /* No border and no radius, matching the character editors: a fieldset inside an editor panel
       was a box inside a box, and the legend and the spacing already group these. */
    padding: var(--s4) 0;
    min-width: 0;
  }

  .family-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .family-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .family-editor input[type='text'] {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .family-editor__summary,
  .family-editor__relation {
    font-size: var(--t-small-size);
    margin: 0;
  }

  .family-editor__note {
    font-size: var(--t-small-size);
    font-style: italic;
    margin: 0;
  }
</style>
