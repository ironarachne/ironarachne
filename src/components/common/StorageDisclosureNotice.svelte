<script lang="ts">
  import BaseButton from '$components/common/BaseButton.svelte';
  // Said once, at the moment the user first has something to lose, and never again — see
  // docs/storage-disclosure.md. Inline and dismissible rather than a modal: a dialog over the first
  // thing somebody ever made is a toll gate, and this is a sentence.
  //
  // The copy is deliberately unconditional. It does not read the persistence state and it never
  // says "protected", because persistence resists automatic eviction and does nothing about cleared
  // site data, a lost laptop, or a different browser. Export is the protection in every browser,
  // which is also why no user-agent check is needed for Safari's ITP.
  type Props = {
    /** Where the page's own backup controls are, so "export" is a link rather than an instruction. */
    backupHref: string;
    onDismiss: () => void;
  };

  const { backupHref, onDismiss }: Props = $props();
</script>

<div class="storage-disclosure" role="status">
  <p>
    <strong>Your work is saved in this browser only.</strong> There is no account and no server, and nothing
    is copied anywhere else. Exporting a file is how your work leaves this browser — and it is what survives
    clearing site data, a new machine, or a browser that decides to reclaim the space.
  </p>
  <div class="storage-disclosure__actions">
    <!-- A fragment on the page the reader is already on, not a route: there is nothing for
         resolve() to add, and a base path would make it point off the page. -->
    <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
    <a href={backupHref}>Back up your work</a>
    <BaseButton onclick={onDismiss}>Got it</BaseButton>
  </div>
</div>

<style>
  .storage-disclosure {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--tan);
    border-radius: 4px;
    background: var(--slate);
  }

  .storage-disclosure p {
    margin: 0;
    font-size: 0.9rem;
  }

  .storage-disclosure__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }
</style>
