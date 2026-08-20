<script lang="ts">
  import { onMount } from 'svelte';

  import ArtifactPanel from '$components/common/ArtifactPanel.svelte';
  import ProjectContextBar from '$components/common/ProjectContextBar.svelte';
  import ProjectView from '$components/common/ProjectView.svelte';
  import ToolBrowser from '$components/common/ToolBrowser.svelte';
  import ToolMaturityBadge from '$components/common/ToolMaturityBadge.svelte';
  import ToolPanel from '$components/common/ToolPanel.svelte';
  import WorkshopPanel from '$components/common/WorkshopPanel.svelte';
  import { getArtifactSummary, hydrateArtifacts, onArtifactsChanged } from '$lib/artifacts';
  import type { Project } from '$lib/projects';
  import { allTools, findToolByPath, toolMaturityForPath, type Tool } from '$lib/tools';
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

  /**
   * Mount a tool, taking the one that was there off the bench.
   *
   * One instrument at a time. The swap is silent when the outgoing tool has nothing to lose, and
   * asks when it is holding generated content nobody kept — the same guard closing a panel uses,
   * because swapping a tool out *is* closing its panel, just without a close button being the
   * thing that did it.
   */
  async function openTool(tool: Tool) {
    const current = bench.panels.find((panel) => panel.toolPath !== undefined);
    if (
      current?.toolPath !== undefined &&
      current.toolPath !== tool.path &&
      hasUnsavedEdits(current.toolPath)
    ) {
      const outgoing = toolFor(current.toolPath)?.label ?? current.toolPath;
      const confirmed = await showConfirmModal({
        title: 'Switch tools',
        message: `“${outgoing}” has made something you have not saved. Open ${tool.label} and leave it behind?`,
        okLabel: 'Switch',
        dangerous: true,
      });
      if (!confirmed) {
        return;
      }
    }
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

<section class="workshop">
  <h1>Workshop</h1>

  <!-- The workshop is a catalog tool like any other and says where it stands like any other, but
       the level alone: Experimental's sentence warns that a tool's output may not be savable, which
       is true of a generator and false here — the workshop is what does the saving. What a user
       needs to know about the durability of their work is the Backup section, which says it
       accurately; that now lives on /projects, one click away in the sidebar. -->
  <p class="workshop__maturity">
    <ToolMaturityBadge maturity={toolMaturityForPath('/workshop')} />
  </p>

  <ProjectContextBar onProjectChange={(next) => void openProject(next)} />

  <!-- Backup moved to /projects with the shell (docs/app-shell.md, step 4). It is still reachable
       with no project open — the projects page is a sidebar destination, so the user restoring
       into a fresh browser gets there in one click — and the bench keeps the room the controls
       were taking.

       Nothing was ever wired back from it: an import announces what it changed through the
       ordinary project and artifact change events, which the bar and the project view are already
       listening to, including the restore that closes the open project and empties this bench. -->

  <div class="workshop__layout">
    <div class="workshop__rail">
      <ToolBrowser
        tools={mountableTools}
        {openToolPaths}
        onToolChange={(tool) => void openTool(tool)}
      />
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
    /* Not `section.main`, and that is the whole of how a page opts out of the measure: the shell's
       page region is already the width the bench needs, so there is nothing to break out of.

       This used to take `100vw` and pull itself back with a negative inline margin, to escape the
       70ch cap `html` put on every page. The cap moved to `section.main` with the shell
       (docs/app-shell.md), so the hack and the horizontal-scroll risk that came with it are both
       gone. */
    padding: 0.5rem;
  }

  .workshop h1 {
    margin: 0 0 0.5rem;
  }

  .workshop__maturity {
    margin: 0 0 0.75rem;
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
