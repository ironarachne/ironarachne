<script lang="ts">
  import BaseButton from '$components/common/BaseButton.svelte';
  import Notice from '$components/common/Notice.svelte';
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

<!-- Plain, and deliberately so. This is a statement of fact rather than a warning, and nothing has
     gone wrong — a tone here would be colour spent on the ordinary case, which is what makes a
     tone stop meaning anything. Plain is not quiet: the copy is unchanged and
     docs/storage-disclosure.md owns it. -->
<Notice class="storage-disclosure">
  <p>
    <strong>Your work is saved in this browser only.</strong> There is no account and no server, and nothing
    is copied anywhere else. Exporting a file is how your work leaves this browser — and it is what survives
    clearing site data, a new machine, or a browser that decides to reclaim the space.
  </p>

  {#snippet actions()}
    <!-- A fragment on the page the reader is already on, not a route: there is nothing for
         resolve() to add, and a base path would make it point off the page. -->
    <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
    <a href={backupHref}>Back up your work</a>
    <BaseButton onclick={onDismiss}>Got it</BaseButton>
  {/snippet}
</Notice>

<style>
  /* Layout only: where the notice sits. The look is the panel's. */
  :global(.storage-disclosure) {
    margin-bottom: var(--s6);
  }
</style>
