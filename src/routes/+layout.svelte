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
  // Imported dynamically so none of it is in the chunk that renders the page, and cheap to call
  // repeatedly: with nothing new to take it reads four storage entries and writes nothing.
  // ProjectContextBar shows the note it leaves. See src/lib/legacy_adoption/README.md.
  onMount(async () => {
    try {
      const [{ adoptLegacySaves }, { ARTIFACT_KINDS }] = await Promise.all([
        import('$lib/legacy_adoption'),
        import('$lib/workshop'),
      ]);
      adoptLegacySaves(ARTIFACT_KINDS);
    } catch (error: unknown) {
      // A refused write is the realistic failure, and it must not take the page down with it. The
      // legacy scopes are untouched either way, and the record of what was adopted is written per
      // item, so the next load resumes from where this one stopped.
      console.error(error);
    }
  });
</script>

<Header />
{@render children?.()}
<Footer />
<ModalHost />
