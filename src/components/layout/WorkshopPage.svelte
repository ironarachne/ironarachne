<script lang="ts">
  import { onMount, tick } from 'svelte';

  import ArtifactPanel from '$components/common/ArtifactPanel.svelte';
  import ProjectContextBar from '$components/common/ProjectContextBar.svelte';
  import ProjectView from '$components/common/ProjectView.svelte';
  import SessionLogPanel from '$components/common/SessionLogPanel.svelte';
  import ToolBrowser from '$components/common/ToolBrowser.svelte';
  import StorageWarningBanner from '$components/common/StorageWarningBanner.svelte';
  import ToolPanel from '$components/common/ToolPanel.svelte';
  import WorkshopPanel from '$components/common/WorkshopPanel.svelte';
  import { getArtifactSummary, hydrateArtifacts, onArtifactsChanged } from '$lib/artifacts';
  import type { Project } from '$lib/projects';
  import {
    newSessionLogEntryId,
    onSessionLogChanged,
    sessionLogSize,
    type SessionLogEntry,
  } from '$lib/session_log';
  import { allTools, findToolByPath, type Tool } from '$lib/tools';
  import { showConfirmModal } from '$lib/ui';
  import { hasToolPanel, hasUnsavedEdits, type ToolCue } from '$lib/workshop';
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

  // The browser offers what the workshop can actually mount. Every tool in the catalog has a
  // panel, so this filters nothing today; it stays because a bench should offer what it can mount
  // rather than what a list says exists, and the parity test — not this line — is what keeps the
  // two the same.
  const mountableTools = allTools().filter((tool) => hasToolPanel(tool.path));

  let project = $state<Project | undefined>(undefined);
  let bench: ProjectWorkspace = $state(emptyWorkspace(''));
  /**
   * Bumped whenever an artifact changes, so anything reading the artifact index during render —
   * a panel's title, for one — recomputes. The index is a plain cache rather than reactive state,
   * and this is the seam between the two.
   */
  let artifactRevision = $state(0);

  /**
   * Bound for `placeFocusAfterClose`, which has to find what is on the bench after a close.
   * `$state` because the empty-bench message comes and goes with the panels, so its binding is
   * reassigned rather than set once.
   */
  let benchElement = $state<HTMLDivElement | undefined>(undefined);
  let emptyBenchMessage = $state<HTMLParagraphElement | undefined>(undefined);

  /**
   * How many runs the log is holding, so the column can be absent until the first one.
   *
   * A fresh session gets the full-width bench it has always had, and the column arrives at the
   * first roll — which is both the moment it becomes useful and the moment it teaches the user it
   * exists. An always-present empty column would cost 14rem of bench to say nothing, and offer a
   * Clear button with nothing to clear.
   */
  let sessionRunCount = $state(0);

  /**
   * The tool the bench has been asked to roll again, and with what.
   *
   * Transient state on the page, **never on `PanelState`** (decision 6 in docs/session-log.md).
   * `PanelState` is persisted per project, so a cue stored there would replay whenever the project
   * was reopened: a bench restored a week later would re-roll a settlement over whatever was in
   * it. A bench is an arrangement, not work, and this is not even the arrangement.
   */
  let pendingCue = $state<ToolCue | undefined>(undefined);

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

  onMount(() => {
    const refreshRunCount = () => {
      sessionRunCount = sessionLogSize();
    };
    refreshRunCount();
    return onSessionLogChanged(refreshRunCount);
  });

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
  async function openTool(tool: Tool): Promise<boolean> {
    // Any deliberate change of tool retires whatever the log last asked for. The cue lives only
    // as long as the panel it was aimed at: without this, swapping a tool away and back would
    // remount it and hand it a request the user made two tools ago.
    pendingCue = undefined;

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
        return false;
      }
    }
    updateBench(withPanelOpened(bench, { toolPath: tool.path }));
    return true;
  }

  /**
   * Put a run from the log back on the bench.
   *
   * It goes through the **existing** `openTool`, so the confirmation that protects a tool holding
   * something unsaved protects it here too: replay must not become a second, quieter way to throw
   * away work. The thing being protected is the outgoing tool, not the entry — an entry has never
   * been saved and has no stored copy to overwrite, which is why replaying one destroys nothing.
   *
   * The cue's id is minted here rather than taken from the entry. Pressing the same entry twice is
   * two distinct requests, and a tool watching the seed would swallow the second.
   */
  async function replayRun(entry: SessionLogEntry) {
    const tool = toolFor(entry.toolPath);
    if (tool === undefined) {
      return;
    }
    if (!(await openTool(tool))) {
      return;
    }
    pendingCue = { id: newSessionLogEntryId(), seed: entry.seed, config: entry.config };
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
    if (panel.toolPath !== undefined) {
      pendingCue = undefined;
    }
    updateBench(withPanelClosed(bench, targetOf(panel)));
    await placeFocusAfterClose(panel.order);
  }

  /**
   * Closing a panel unmounts the button that closed it, and a browser with nowhere to put the
   * focus ring puts it on the document — which on this page means tabbing back through a whole
   * generator to reach the bench again. Losing your place is how a keyboard user experiences a
   * broken control, so focus is placed deliberately: on the panel that took the closed one's
   * position, or on the message that replaces the bench when the last panel goes.
   *
   * Read from the DOM rather than from `bench`, because what has to be focused is whichever
   * control is actually enabled — a lone panel can move nowhere, so its only live control is its
   * own Close.
   */
  async function placeFocusAfterClose(closedOrder: number): Promise<void> {
    await tick();

    const remaining = benchElement?.querySelectorAll('section.workshop-panel') ?? [];
    const next = remaining[Math.min(closedOrder, remaining.length - 1)];
    const control = next?.querySelector('.workshop-panel__controls button:not([disabled])');

    if (control instanceof HTMLElement) {
      control.focus();
      return;
    }

    emptyBenchMessage?.focus();
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

  <!-- No maturity badge, because the workshop is not a tool and the ladder measures what becomes
       of the work a tool produces (decision 9 in docs/workshop.md). It borrowed Experimental once,
       whose sentence warns that output may not be savable — true of a generator, false of the
       surface that does the saving. What a user needs to know about the durability of their work
       is the Backup section on /projects, one click away in the sidebar, which says it accurately. -->

  <!-- The one thing on this surface allowed to raise its voice, and only when the browser really
       is nearly full. It is here rather than in the shell because this is where a user with a
       nearly-full browser is about to write more; a storage warning over the release notes would
       be shouting at someone who cannot act on it. -->
  <StorageWarningBanner />

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
      <!-- The open project's setting narrows the list, and a tool already mounted for a genre the
           project does not have stays on the bench: taking a tool out of a list is not a reason to
           close someone's work (docs/workshop.md, "Genre and system"). -->
      <ToolBrowser
        tools={mountableTools}
        genre={project?.genre}
        system={project?.system}
        {openToolPaths}
        onToolChange={(tool) => void openTool(tool)}
      />
      <ProjectView projectId={project?.id} {openArtifactIds} onOpenArtifact={openArtifact} />
    </div>

    <div class="workshop__bench" bind:this={benchElement}>
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
              <ToolPanel {tool} cue={pendingCue} />
            {/if}
          {:else if project !== undefined}
            <ArtifactPanel projectId={project.id} artifactId={panel.artifactId} />
          {/if}
        </WorkshopPanel>
      {:else}
        <!-- `tabindex="-1"` so closing the last panel has somewhere to put focus: not a tab stop,
             but a focusable target, which also reads this sentence out to a screen reader at the
             moment the bench empties. -->
        <p class="workshop__empty" tabindex="-1" bind:this={emptyBenchMessage}>
          Nothing on the bench. Pick a tool to start, or open something you have saved.
        </p>
      {/each}
    </div>

    <!-- Left to right the surface reads: what you can work with, what you are working on, what you
         have made. Absent until the first roll — see `sessionRunCount`. -->
    {#if sessionRunCount > 0}
      <div class="workshop__log">
        <SessionLogPanel onReplay={(entry) => void replayRun(entry)} />
      </div>
    {/if}
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

  .workshop__layout {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-start;
    /* This row is a container, so the log below can ask about *it* rather than about the viewport.
       That is not a preference. The width the columns wrap in is the page region — the viewport
       less a sidebar whose width is decided by its own content — and the columns are sized in
       `rem` against a root font size that itself scales with the viewport (`main.css` clamps it
       between 1em and 1.25em). A media query can see neither, and a threshold guessed from the
       viewport is wrong by several hundred pixels: measured, the three columns stopped fitting
       somewhere between 1280px and 1400px depending on the window's *height*.

       `inline-size` containment is safe here: this row's width already comes from its parent
       rather than from its contents, and nothing inside a panel is positioned against the
       viewport — the sidebar is the only fixed element on the site and it is not in here. */
    container-type: inline-size;
    container-name: workshop-layout;
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

  .workshop__log {
    /* `flex-grow: 0` is the whole point: the bench takes the surplus and the log stays at its
       basis, narrower than either neighbour however wide the window gets. The panel inside sets
       the same flex on itself; this wrapper is what the breakpoint below can address. */
    flex: 0 1 14rem;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  /* Below the wrap the log goes full width instead of sitting on its own row as a 14rem stub
     beside empty space.

     60rem is the three columns' own arithmetic — 18 + 26 + 14 plus two 1rem gaps — asked of the
     row they are in, so the log stops being a column at exactly the width it stops fitting beside
     one. It resolves in the same `rem` the columns are sized in, which is what keeps the two in
     step as the root font size scales.

     Nothing in the e2e suite looks at this band: the mobile projects are all 430px and below,
     where everything is stacked and full width already. It is checked by hand. */
  @container workshop-layout (max-width: 60rem) {
    .workshop__log {
      flex-basis: 100%;
      --session-log-max-height: 12rem;
    }
  }

  @media (max-width: 48rem) {
    .workshop__rail {
      /* On a phone the rail is stacked above the bench, so its lists are what stands between the
         user and the tool they just opened. Shorter here, taller where they sit beside it. */
      --tool-browser-max-height: 14rem;
      --project-view-max-height: 12rem;
    }

    .workshop__log {
      /* Stacked under the bench on a phone, where a long list is what stands between the user and
         the rest of the page. */
      --session-log-max-height: 10rem;
    }
  }

  .workshop__empty {
    margin: 0;
    font-style: italic;
    opacity: 0.8;
  }
</style>
