<script lang="ts">
  import { onMount } from 'svelte';

  import ArtifactPanel from '$components/common/ArtifactPanel.svelte';
  import ProjectContextBar from '$components/common/ProjectContextBar.svelte';
  import ProjectView from '$components/common/ProjectView.svelte';
  import ToolBrowser from '$components/common/ToolBrowser.svelte';
  import ToolPanel from '$components/common/ToolPanel.svelte';
  import VaultTransferControls from '$components/common/VaultTransferControls.svelte';
  import WorkshopPanel from '$components/common/WorkshopPanel.svelte';
  import { getArtifactSummary, hydrateArtifacts, onArtifactsChanged } from '$lib/artifacts';
  import type { Project } from '$lib/projects';
  import { allTools, findToolByPath, type Tool } from '$lib/tools';
  import { showConfirmModal } from '$lib/ui';
  import { hasToolPanel, hasUnsavedEdits } from '$lib/workshop';
  import {
    emptyWorkspace,
    panelKey,
    readProjectWorkspace,
    withPanelClosed,
    withPanelMoved,
    withPanelOpened,
    withUnresolvablePanelsDropped,
    writeProjectWorkspace,
    type PanelState,
    type PanelTarget,
    type ProjectWorkspace,
  } from '$lib/workspaces';

  // The browser offers what the workshop can actually mount, which is also what keeps the
  // workshop's own catalog entry from listing itself inside itself.
  const mountableTools = allTools().filter((tool) => hasToolPanel(tool.path));

  let project = $state<Project | undefined>(undefined);
  let bench: ProjectWorkspace = $state(emptyWorkspace(''));
  /**
   * Bumped whenever an artifact changes, so anything reading the artifact index during render —
   * a panel's title, for one — recomputes. The index is a plain cache rather than reactive state,
   * and this is the seam between the two.
   */
  let artifactRevision = $state(0);

  const openToolPaths = $derived(
    bench.panels
      .map((panel) => panel.toolPath)
      .filter((path): path is string => path !== undefined),
  );
  const openArtifactIds = $derived(
    bench.panels.map((panel) => panel.artifactId).filter((id): id is string => id !== undefined),
  );

  /** The catalog tool for a path, and only when it is one the workshop can mount. */
  function toolFor(path: string): Tool | undefined {
    const tool = findToolByPath(path);
    return tool !== undefined && hasToolPanel(tool.path) ? tool : undefined;
  }

  function isResolvable(panel: PanelState): boolean {
    if (panel.toolPath !== undefined) {
      return toolFor(panel.toolPath) !== undefined;
    }
    return project !== undefined && getArtifactSummary(project.id, panel.artifactId) !== undefined;
  }

  /**
   * Follow the project context bar into whichever project is open.
   *
   * A rename comes through here too, so the bench is only re-read when the project itself changes;
   * rereading it on every edit would throw away an arrangement mid-use.
   */
  async function openProject(next: Project | undefined) {
    const changed = next?.id !== project?.id;
    project = next;
    if (!changed) {
      return;
    }
    if (next === undefined) {
      bench = emptyWorkspace('');
      return;
    }
    // The bench names artifacts, so the artifact index has to be in memory before a panel bound to
    // one that has since been deleted can be recognised as such.
    await hydrateArtifacts();
    const stored = withUnresolvablePanelsDropped(await readProjectWorkspace(next.id), isResolvable);
    if (stored.panels.length === 0 && bench.panels.length > 0) {
      // A project with no bench of its own adopts whatever is on the one in front of the user.
      // This is the path a generator takes when it saves its first artifact and creates the
      // project to hold it: closing the panel it was saved from would be a strange thanks.
      updateBench({ ...bench, projectId: next.id });
      return;
    }
    bench = stored;
  }

  /**
   * Move the bench, and remember it.
   *
   * The write is deliberately not awaited and its result deliberately not shown: a bench is not
   * work, and blocking a panel from opening on a database round trip would make the workshop feel
   * broken over something whose worst failure costs a click.
   */
  function updateBench(next: ProjectWorkspace) {
    if (next === bench) {
      return;
    }
    bench = next;
    if (project !== undefined) {
      void writeProjectWorkspace({ ...next, projectId: project.id });
    }
  }

  onMount(() =>
    onArtifactsChanged((change) => {
      artifactRevision += 1;
      if (change.change === 'deleted') {
        // A panel showing an artifact another panel has just deleted is dropped rather than left
        // pointing at nothing — the one thing a bench is allowed to lose silently.
        updateBench(withUnresolvablePanelsDropped(bench, isResolvable));
      }
    }),
  );

  function openTool(tool: Tool) {
    updateBench(withPanelOpened(bench, { toolPath: tool.path }));
  }

  function openArtifact(artifactId: string) {
    updateBench(withPanelOpened(bench, { artifactId }));
  }

  function targetOf(panel: PanelState): PanelTarget {
    return panel.toolPath === undefined
      ? { artifactId: panel.artifactId }
      : { toolPath: panel.toolPath };
  }

  /**
   * Close a panel, asking first when it is holding edits nobody has written.
   *
   * The question belongs here rather than inside the panel because the control that closes it is
   * the bench's, and closing is the likeliest way to lose an edit on a single-route workshop —
   * `beforeNavigate` never fires for it. What the panel contributes is the answer, through the
   * shared guard it registered.
   */
  async function closePanel(panel: PanelState) {
    if (panel.toolPath === undefined && hasUnsavedEdits(panel.artifactId)) {
      const confirmed = await showConfirmModal({
        title: 'Close panel',
        message: `“${panelTitle(panel)}” has changes you have not saved. Close it and leave them behind?`,
        okLabel: 'Close',
        dangerous: true,
      });
      if (!confirmed) {
        return;
      }
    }
    updateBench(withPanelClosed(bench, targetOf(panel)));
  }

  function panelTitle(panel: PanelState): string {
    if (panel.toolPath !== undefined) {
      return toolFor(panel.toolPath)?.label ?? panel.toolPath;
    }
    void artifactRevision;
    const summary =
      project === undefined ? undefined : getArtifactSummary(project.id, panel.artifactId);
    return summary?.name ?? 'Artifact';
  }
</script>

<section class="main workshop">
  <h1>Workshop</h1>

  <ProjectContextBar onProjectChange={(next) => void openProject(next)} />

  <!-- One step from the workshop, and available with no project open: a user restoring into a
       fresh browser has no project to start from, so a backup control that needed one would be
       unreachable in exactly the case it exists for.

       Nothing is wired back from it. An import announces what it changed through the ordinary
       project and artifact change events, which the bar and the project view are already
       listening to — including the restore that closes the open project and empties this bench. -->
  <VaultTransferControls projectId={project?.id} />

  <div class="workshop__layout">
    <div class="workshop__rail">
      <ToolBrowser tools={mountableTools} {openToolPaths} onToolChange={openTool} />
      <ProjectView projectId={project?.id} {openArtifactIds} onOpenArtifact={openArtifact} />
    </div>

    <div class="workshop__bench">
      {#each bench.panels as panel (panelKey(panel))}
        <WorkshopPanel
          title={panelTitle(panel)}
          subtitle={panel.toolPath === undefined ? 'Artifact' : 'Tool'}
          position={panel.order + 1}
          total={bench.panels.length}
          onClose={() => void closePanel(panel)}
          onMoveLeft={() => updateBench(withPanelMoved(bench, targetOf(panel), -1))}
          onMoveRight={() => updateBench(withPanelMoved(bench, targetOf(panel), 1))}
        >
          {#if panel.toolPath !== undefined}
            {@const tool = toolFor(panel.toolPath)}
            {#if tool}
              <ToolPanel {tool} />
            {/if}
          {:else if project !== undefined}
            <ArtifactPanel projectId={project.id} artifactId={panel.artifactId} />
          {/if}
        </WorkshopPanel>
      {:else}
        <p class="workshop__empty">
          Nothing on the bench. Pick a tool to start, or open something you have saved.
        </p>
      {/each}
    </div>
  </div>
</section>

<style>
  .workshop {
    /* Every other page is a single reading column, which `html` caps at 70ch. Several panels side
       by side do not fit in that, so the workshop breaks out of it: it takes the viewport width
       (less a gutter, so a scrollbar cannot push the page sideways) and recentres itself on the
       viewport rather than on the column it sits in. Kept local to this page so the column
       everything else relies on is untouched. */
    --workshop-width: min(96rem, 100vw - 2rem);
    width: var(--workshop-width);
    margin-inline: calc(50% - var(--workshop-width) / 2);
  }

  .workshop h1 {
    margin: 0 0 0.5rem;
  }

  .workshop__layout {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-start;
  }

  .workshop__rail {
    /* The rail holds the two lists you work *from*. It takes a column of its own where there is
       room and sits above the bench where there is not, which is the mobile-first arrangement:
       both its lists scroll internally so the bench is never more than a screen away. */
    flex: 1 1 18rem;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .workshop__bench {
    flex: 3 1 26rem;
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-start;
  }

  @media (max-width: 48rem) {
    .workshop__rail {
      /* On a phone the rail is stacked above the bench, so its lists are what stands between the
         user and the tool they just opened. Shorter here, taller where they sit beside it. */
      --tool-browser-max-height: 14rem;
      --project-view-max-height: 12rem;
    }
  }

  .workshop__empty {
    margin: 0;
    font-style: italic;
    opacity: 0.8;
  }
</style>
