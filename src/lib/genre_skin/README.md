# Genre skin

Which genre the page is currently wearing, if any. One function, no state.

The app ships a skin per genre — `fantasy.css`, `scifi.css`, `cyberpunk.css` and `horror.css` — and
each is keyed off a `data-genre` attribute. This library answers what that attribute's
value should be; `src/routes/+layout.svelte` is the only place that writes it.

See [the visual design system](../../../docs/visual-design.md), "Applying a skin", for the design.

## The rule

**A skin dresses the user's work, never the app's own voice.** Three surfaces are genre-neutral —
the top bar, the sidebar, and a dialog — because those are the three places the app speaks for
itself. A warning that dresses up as fantasy is a warning that reads as decoration.

They do not opt out. They are never in a position to ask: the bar and the sidebar are _siblings_ of
the page region in the shell grid rather than descendants of it, and a dialog opened with
`showModal()` is in the top layer entirely. Neutrality is structural, so there is no opt-out list
for anyone to maintain or forget.

## Resolution order

```
the open project's genre
  ?? the route's own genre, when the catalog gives exactly one
  ?? nothing
```

**The project wins**, because it is the user's own answer to what they are working on and it is the
more specific of the two. A fantasy tool opened inside a science-fiction project is being used
_for_ that science-fiction project.

**A tool with more than one genre gets no route skin.** `/spooky-ship` is `scifi` and `horror`, and
picking the first entry is a coin toss dressed as a rule. Only reachable with no project genre.

**Nothing is the base appearance**, not a fallback nobody looked at. The tokens, controls, panels
and message family are all specified without reference to any genre; a skin is a permitted
variation on top. A project with no genre is ordinary — `docs/workshop.md` is explicit that a
project may be "a box of tools" that is neither a genre nor a system.

## Why it is derived and never stored

[Decision 7](../../../docs/workshop.md) promises that changing a project's genre invalidates
nothing: no artifact records the genre it was saved under, and no payload changes shape. A skin
that were persisted or cached would turn that promise into a lie in the one place nobody would
look. Recomputed on every read, there is nothing to invalidate — and `onProjectsChanged` is what
makes the page follow a change live rather than at the next load.

## Why it is here and not in `$lib/projects`

It reads a project _and_ the tool catalog. `project_types.ts` documents the dependency direction —
`$lib/projects` knows about `$lib/tools`' vocabularies, and `$lib/tools` must never learn about
projects — and a resolver living inside `$lib/projects` would drag the catalog in behind it.
