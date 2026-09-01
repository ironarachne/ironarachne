<script lang="ts">
  import { RNG } from '@ironarachne/rng';
  import Notice from '$components/common/Notice.svelte';
  import BaseButton from '$components/common/BaseButton.svelte';
  import {
    addOrganizationTrait,
    describeOrganizationEmblem,
    organizationPersonHeading,
    removeOrganizationNotable,
    removeOrganizationTrait,
    renderOrganizationEmblemSvg,
    setOrganizationColor,
    setOrganizationFacetLabel,
    setOrganizationHook,
    setOrganizationMotto,
    setOrganizationPersonField,
    setOrganizationText,
    setOrganizationTraitLabel,
    validateOrganizationSnapshot,
    type OrganizationColorSlot,
    type OrganizationFacetField,
    type OrganizationPerson,
    type OrganizationSnapshot,
  } from '$lib/organizations';

  /**
   * The editing view for a saved organization.
   *
   * It owns its fields and nothing else. Dirty state, saving, renaming the artifact, the warning
   * before edits are discarded, and the destructive re-roll all belong to the surface around it.
   *
   * Bespoke, as docs/readiness-factions.md says: a hierarchy is a tree of roles with people in
   * them, and a flat form would be a worse view of it than the generic snapshot view. What it
   * reaches is the name and description, the motto and palette, the profile's traits, goal,
   * weakness, standing and hook, and each person's names and line. The emblem is **drawn from its
   * stored parameters** — a redraw, not a re-roll, after every change — and described in words
   * beside it; the emblem itself is what a re-roll is for. The hierarchy's roles are listed by
   * standing so a reader can see the structure the people sit in.
   */
  type Props = {
    snapshot: unknown;
    onChange: (snapshot: unknown) => void;
  };

  const { snapshot, onChange }: Props = $props();

  const uid = $props.id();

  const accepted = $derived(validateOrganizationSnapshot(snapshot));
  const organization = $derived<OrganizationSnapshot | undefined>(
    accepted.ok ? accepted.value : undefined,
  );

  /** The emblem, drawn from parameters. A fixed RNG, so the same arms draw the same way twice. */
  const emblemSvg = $derived(
    organization === undefined
      ? null
      : renderOrganizationEmblemSvg(organization.visualIdentity.emblem, new RNG(organization.id)),
  );

  /** The roles by standing, highest first. */
  const roles = $derived(
    organization === undefined
      ? []
      : [...organization.hierarchy.roleById]
          .map(([id, info]) => ({
            id,
            name: info.roleName,
            order: organization.hierarchy.idToOrder.find(([roleId]) => roleId === id)?.[1] ?? 0,
          }))
          .sort((a, b) => b.order - a.order),
  );

  /** Applies one edit. Every handler goes through here so `onChange` is called in one place. */
  function edit(change: (current: OrganizationSnapshot) => OrganizationSnapshot): void {
    if (organization === undefined) {
      return;
    }
    onChange(change(organization));
  }

  const facets: { field: OrganizationFacetField; label: string }[] = [
    { field: 'goal', label: 'Goal' },
    { field: 'weakness', label: 'Weakness' },
    { field: 'publicStanding', label: 'Public standing' },
  ];
  const colorSlots: OrganizationColorSlot[] = ['primary', 'secondary', 'accent'];

  function personLabel(person: OrganizationPerson): string {
    return person === 'leader' ? 'Leader' : `Member ${person + 1}`;
  }
</script>

{#if organization === undefined}
  <Notice tone="danger">
    These contents are stored as an organization but do not read as one, so there is nothing safe to
    edit here. {accepted.ok ? '' : accepted.message}
  </Notice>
{:else}
  <div class="organization-editor">
    <!-- Qualified as "Organization name" rather than "Name": the panel above already has a field
         labelled "Name" that renames the artifact, and two fields with the same accessible name in
         one region is the 6.2 failure. -->
    <div class="input-group input-group--inline">
      <label for="{uid}-name">Organization name</label>
      <input
        id="{uid}-name"
        type="text"
        value={organization.name}
        oninput={(event) =>
          edit((current) => setOrganizationText(current, 'name', event.currentTarget.value))}
        autocomplete="off"
      />
    </div>

    <div class="input-group input-group--inline">
      <label for="{uid}-description">Organization description</label>
      <textarea
        id="{uid}-description"
        rows="5"
        value={organization.description}
        oninput={(event) =>
          edit((current) => setOrganizationText(current, 'description', event.currentTarget.value))}
      ></textarea>
    </div>

    <fieldset>
      <legend>Identity</legend>

      <div class="organization-editor__emblem">
        {#if emblemSvg !== null}
          <!-- Drawn from the stored parameters, never from a stored picture. -->
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html emblemSvg}
        {/if}
        <p class="organization-editor__note">
          {describeOrganizationEmblem(organization.visualIdentity.emblem) ||
            'No emblem. A re-roll draws one.'}
        </p>
      </div>

      <div class="input-group input-group--inline">
        <label for="{uid}-motto">Motto</label>
        <input
          id="{uid}-motto"
          type="text"
          value={organization.visualIdentity.motto ?? ''}
          oninput={(event) =>
            edit((current) => setOrganizationMotto(current, event.currentTarget.value))}
          autocomplete="off"
        />
      </div>

      {#each colorSlots as slot (slot)}
        <div class="input-group input-group--inline">
          <label for="{uid}-color-{slot}"
            >{slot.charAt(0).toUpperCase() + slot.slice(1)} colour</label
          >
          <input
            id="{uid}-color-{slot}"
            type="text"
            value={organization.visualIdentity.colors?.[slot] ?? ''}
            oninput={(event) =>
              edit((current) => setOrganizationColor(current, slot, event.currentTarget.value))}
            autocomplete="off"
          />
        </div>
      {/each}
    </fieldset>

    <fieldset>
      <legend>Profile</legend>

      {#each organization.profile.personalityTraits as trait, index (index)}
        <div class="organization-editor__row">
          <div class="input-group input-group--inline">
            <label for="{uid}-trait-{index}">Trait {index + 1}</label>
            <input
              id="{uid}-trait-{index}"
              type="text"
              value={trait.label}
              oninput={(event) =>
                edit((current) =>
                  setOrganizationTraitLabel(current, index, event.currentTarget.value),
                )}
              autocomplete="off"
            />
          </div>
          <BaseButton
            aria-label="Remove trait {index + 1}"
            onclick={() => edit((current) => removeOrganizationTrait(current, index))}
          >
            Remove
          </BaseButton>
        </div>
      {/each}
      <BaseButton onclick={() => edit(addOrganizationTrait)}>Add a trait</BaseButton>

      {#each facets as facet (facet.field)}
        <div class="input-group input-group--inline">
          <label for="{uid}-facet-{facet.field}">{facet.label}</label>
          <input
            id="{uid}-facet-{facet.field}"
            type="text"
            value={organization.profile[facet.field].label}
            oninput={(event) =>
              edit((current) =>
                setOrganizationFacetLabel(current, facet.field, event.currentTarget.value),
              )}
            autocomplete="off"
          />
        </div>
      {/each}

      <div class="input-group input-group--inline">
        <label for="{uid}-hook">Hook</label>
        <textarea
          id="{uid}-hook"
          rows="3"
          value={organization.profile.hook}
          oninput={(event) =>
            edit((current) => setOrganizationHook(current, event.currentTarget.value))}
        ></textarea>
      </div>
    </fieldset>

    <fieldset>
      <legend>Structure</legend>
      <ol class="organization-editor__roles">
        {#each roles as role (role.id)}
          <li>{role.name}</li>
        {/each}
      </ol>
    </fieldset>

    {#each [{ person: 'leader' as const, character: organization.leader }, ...organization.notableMembers.map( (character, index) => ({ person: index, character }), )] as entry (entry.person)}
      <fieldset>
        <legend>{personLabel(entry.person)}</legend>
        <p class="organization-editor__note">{organizationPersonHeading(entry.character)}</p>

        <div class="input-group input-group--inline">
          <label for="{uid}-person-{entry.person}-first"
            >{personLabel(entry.person)} first name</label
          >
          <input
            id="{uid}-person-{entry.person}-first"
            type="text"
            value={entry.character.firstName}
            oninput={(event) =>
              edit((current) =>
                setOrganizationPersonField(
                  current,
                  entry.person,
                  'firstName',
                  event.currentTarget.value,
                ),
              )}
            autocomplete="off"
          />
        </div>

        <div class="input-group input-group--inline">
          <label for="{uid}-person-{entry.person}-last">{personLabel(entry.person)} last name</label
          >
          <input
            id="{uid}-person-{entry.person}-last"
            type="text"
            value={entry.character.lastName}
            oninput={(event) =>
              edit((current) =>
                setOrganizationPersonField(
                  current,
                  entry.person,
                  'lastName',
                  event.currentTarget.value,
                ),
              )}
            autocomplete="off"
          />
        </div>

        <div class="input-group input-group--inline">
          <label for="{uid}-person-{entry.person}-description">
            {personLabel(entry.person)} description
          </label>
          <textarea
            id="{uid}-person-{entry.person}-description"
            rows="3"
            value={entry.character.description}
            oninput={(event) =>
              edit((current) =>
                setOrganizationPersonField(
                  current,
                  entry.person,
                  'description',
                  event.currentTarget.value,
                ),
              )}
          ></textarea>
        </div>

        {#if entry.person !== 'leader'}
          {@const index = entry.person}
          <BaseButton
            aria-label="Remove member {index + 1}"
            onclick={() => edit((current) => removeOrganizationNotable(current, index))}
          >
            Remove member {index + 1}
          </BaseButton>
        {/if}
      </fieldset>
    {/each}
  </div>
{/if}

<style>
  .organization-editor {
    display: flex;
    flex-direction: column;
    gap: var(--s4);
    min-width: 0;
  }

  .organization-editor fieldset {
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

  .organization-editor legend {
    padding: 0 var(--s3);
    color: var(--gold);
    font-size: var(--t-micro-size);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .organization-editor .input-group {
    margin: 0;
    min-width: 0;
    width: 100%;
  }

  .organization-editor input[type='text'],
  .organization-editor textarea {
    min-width: 0;
    flex: 1 1 4rem;
    width: 100%;
  }

  .organization-editor__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--s3);
    width: 100%;
    min-width: 0;
  }

  .organization-editor__emblem {
    max-width: 200px;
  }

  .organization-editor__emblem :global(svg) {
    max-width: 100%;
    height: auto;
  }

  .organization-editor__roles {
    margin: 0;
    padding-left: var(--s5);
  }

  .organization-editor__note {
    font-size: var(--t-small-size);
    margin: 0;
  }
</style>
