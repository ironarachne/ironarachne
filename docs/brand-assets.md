# Brand assets

How artwork gets from `ironarachne/ironarachne_branding` into this repo, and how you tell whether
the copies here are current.

**Status:** implemented. Resolves issue #151. The web icons in `static/` are vendored from the brand
repo at the commit recorded in `brand-assets.json`, and `scripts/sync_brand_assets.sh` both performs
the copy and reports drift. Verified by round trip: the script produced the 27 files now in `static/`,
`--check` reports them in sync, and after deliberately corrupting and deleting files it named both
and restored them.

## The rule

Assets flow one way. `GUIDELINES.md` in the brand repo is explicit:

> `logo/web-icons/` is the source of truth for the site's `static/` directory. These drifted apart
> before — 24 of 26 files differed — because icons were generated once by an online tool and then
> edited in place on both sides. Copy from here to the site; never the other direction.

They drifted twice, and both times the same thing was missing: nothing recorded which brand-repo
commit the vendored copies came from, so "are these current?" could only be answered by comparing
bytes by hand. That is what `brand-assets.json` fixes. An edit to a vendored file is always wrong —
the change belongs in the brand repo, followed by a sync.

## The pin

`brand-assets.json` at the repo root records the source repository, the commit the vendored copies
were taken from, the date, and which directories map onto which:

```json
{
  "repository": "https://worktree.ca/ironarachne/ironarachne_branding",
  "commit": "e5f6040e9a31f4dd5346c6870fd83352aa1232f2",
  "synced": "2026-08-13",
  "assets": [{ "from": "logo/web-icons", "to": "static", "note": "…" }]
}
```

One pin covers every asset group. Anything else vendored from the brand repo — the landing page's
lockup and fonts (#72), the app's fonts (#149) — belongs in `assets` rather than in a second
mechanism of its own.

## Commands

```bash
scripts/sync_brand_assets.sh              # restore the pinned assets
scripts/sync_brand_assets.sh --check      # report drift, exit 1 if any
scripts/sync_brand_assets.sh --ref main   # take a newer version and move the pin
```

The brand repo is public, so the pinned tree is downloaded over HTTPS and no token is needed. Set
`BRAND_REPO_DIR=/path/to/ironarachne_branding` to read from a local clone instead — the ref is still
resolved through git, so it means the same thing either way, and it works offline.

Nothing is deleted: only files present in the brand repo are written, so anything else that lands in
`static/` later is left alone. Correspondingly, `--check` only reports on files the brand repo has —
it is not a claim that `static/` contains nothing else.

`--check` also reports when the brand repo has moved past the pin. That is information, not a
failure: the pin is deliberate, and taking an update is a reviewed change like any other.

## What is not here

**No CI check.** Issue #151 weighed one and recommended against it for now: it would couple every
run to a second repository for the sake of some SVGs and PNGs, and this host's Actions are
constrained enough already (see `docs/deployment.md`, "Actions on this host"). If drift recurs
despite the pin, `--check` is one line in a workflow and the decision can be revisited.

**No submodule.** Same reasoning, more strongly — it would couple every clone as well as every CI
run.

**Colour tokens are a different problem.** Tracked in #150; the fix there is aliasing the brand
repo's token values, not copying files.

## Prettier

`static/manifest.json` is in `.prettierignore`. Prettier happens to agree with the brand repo's
formatting today, but a formatter that rewrites a vendored file is an in-place edit — exactly the
thing that caused the drift — and it would make `--check` fail on a file nobody knowingly touched.
Any other vendored file that Prettier can parse needs the same entry.
