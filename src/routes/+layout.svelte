<script lang="ts">
  import { onMount } from 'svelte';

  import '$lib/styles/main.css';
  import Footer from '$components/layout/Footer.svelte';
  import Header from '$components/layout/Header.svelte';
  import ModalHost from '$components/layout/ModalHost.svelte';

  interface Props {
    children?: import('svelte').Snippet;
  }

  const { children }: Props = $props();

  // Heraldry, cultures, and religions saved under the old per-generator scopes are adopted into a
  // project here, on the first page of this build a user opens rather than only if they find the
  // workshop. Local-only means there is no server-side copy and no migration anyone can run after
  // the fact, so it does not wait for a surface that shows it.
  //
  // This is also what opens the vault database on an ordinary page load, which is what runs the
  // one-time copy of the workshop's own `localStorage` keys into it (see $lib/vault_db).
  //
  // Imported dynamically so none of it is in the chunk that renders the page, and cheap to call
  // repeatedly: with nothing new to take it reads a handful of entries and writes nothing.
  // ProjectContextBar shows the note it leaves. See src/lib/legacy_adoption/README.md.
  onMount(async () => {
    try {
      const [{ adoptLegacySaves }, { ARTIFACT_KINDS }] = await Promise.all([
        import('$lib/legacy_adoption'),
        import('$lib/workshop'),
      ]);
      await adoptLegacySaves(ARTIFACT_KINDS);
    } catch (error: unknown) {
      // A refused write is the realistic failure, and it must not take the page down with it. The
      // legacy scopes are untouched either way, and the record of what was adopted is written per
      // item, so the next load resumes from where this one stopped.
      console.error(error);
    }
  });

  // Answer other tabs asking whether anyone else has the site open, for as long as this one is.
  // A restore in one tab under a workshop open in another is how two tabs undo each other's
  // writes, and this is what lets the import warn before it happens. Registered explicitly rather
  // than as an import side effect: a tab that only answers once some module happened to load is a
  // tab that is invisible exactly when a restore is about to run.
  onMount(() => {
    let stop: (() => void) | undefined;
    void import('$lib/vault_db').then(({ announceVaultTab }) => {
      stop = announceVaultTab();
    });
    return () => stop?.();
  });
</script>

<Header />
{@render children?.()}
<Footer />
<ModalHost />
