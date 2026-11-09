<script lang="ts">
  import { page } from '$app/state';
  import { exportWholeVault, type VaultExportResult } from '$lib/vault_file';
  import BaseButton from '$components/common/BaseButton.svelte';

  const hostname = $derived(page.url.hostname);
  const staging = $derived(
    hostname === 'staging.vastways.app' || hostname === 'staging.ironarachne.com',
  );
  const oldHost = $derived(staging ? 'staging.ironarachne.com' : 'app.ironarachne.com');
  const newHost = $derived(staging ? 'staging.vastways.app' : 'vastways.app');
  const onOldHost = $derived(hostname === oldHost);

  let busy = $state(false);
  let result = $state<VaultExportResult | null>(null);
  let couldNotReadSaves = $state(false);

  async function downloadBackup(): Promise<void> {
    busy = true;
    result = null;
    couldNotReadSaves = false;
    try {
      // Wait for the same legacy adoption as the application layout before reading the vault.
      const [{ adoptLegacySaves }, { ARTIFACT_KINDS }] = await Promise.all([
        import('$lib/legacy_adoption'),
        import('$lib/workshop'),
      ]);
      await adoptLegacySaves(ARTIFACT_KINDS);
      result = await exportWholeVault();
    } catch {
      couldNotReadSaves = true;
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head>
  <title>Recover saved work | Vastways</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="main">
  <h1>Recover saved work</h1>
  <p>Use the same device and browser profile where you originally saved your projects.</p>
  {#if onOldHost}
    <p>
      Export a backup here, then open Projects on the new site and choose <strong
        >Import from file…</strong
      >.
    </p>
    {#if !staging}
      <p>This old-site exporter is available through November 16, 2026.</p>
    {/if}
    <BaseButton variant="primary" onclick={downloadBackup} disabled={busy}
      >Export everything</BaseButton
    >
    {#if result?.status === 'saved'}
      <p role="status">
        Saved {result.fileName}. Keep this file until you have checked your imported projects.
      </p>
      {#each result.issues as issue}
        <p>{issue}</p>
      {/each}
    {:else if result?.status === 'blocked' && result.text}
      <p role="alert">
        Your browser blocked the download. Copy this backup into a file named {result.fileName}.
      </p>
      <textarea aria-label="Vault backup" rows="6" readonly value={result.text}></textarea>
    {:else if couldNotReadSaves || result?.status === 'failed' || result?.status === 'blocked'}
      <p role="alert">
        The backup could not be saved. Check that downloads are allowed in this browser profile,
        then try again.
      </p>
    {/if}
    <p><a href="https://{newHost}/projects/#storage">Open Projects on the new site</a></p>
  {:else}
    <p>
      <a href="https://{oldHost}/recover/">Open the exporter on the old site</a> to download your backup.
    </p>
    <p>
      Then <a href="https://{newHost}/projects/#storage">import it from Projects on the new site</a
      >.
    </p>
  {/if}
</section>
