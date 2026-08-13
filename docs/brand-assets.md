# Brand assets

How artwork gets from `ironarachne/ironarachne_branding` into this repo, and how you tell whether
the copies here are current.

**Status:** implemented. Resolves issues #151 and #150. The web icons in `static/` are vendored from the brand
repo at the commit recorded in `brand-assets.json`, and `scripts/sync_brand_assets.sh` both performs
the copy and reports drift. Verified by round trip: the script produced the 27 files now in `static/`,
`--check` reports them in sync, and after deliberately corrupting and deleting files it named both
and restored them.

The fonts in `src/lib/assets/fonts/` joined the pin in #149, which adopted Inclusive Sans as the
app's body face. That group is the reason `CinzelDecorative-Regular-webfont.woff` is now
`CinzelDecorative-Regular.woff`: a vendored file has to keep the brand repo's name, or the sync
writes a second copy beside it instead of over it.

The colour tokens in `src/lib/styles/brand/` joined in #150 — see "Colour tokens" below.

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
  "assets": [
    { "from": "logo/web-icons", "to": "static", "note": "…" },
    { "from": "fonts", "to": "src/lib/assets/fonts", "note": "…" },
    { "from": "tokens", "to": "src/lib/styles/brand", "note": "…" }
  ]
}
```

One pin covers every asset group. Anything else vendored from the brand repo — the landing page's
lockup and fonts (#72) — belongs in `assets` rather than in a second mechanism of its own.

`from` and `to` are directories, and the copy is name-for-name within them. So a vendored file is
named whatever the brand repo names it; renaming it on this side is the same mistake as editing it,
because the sync then has nothing to overwrite and adds a duplicate instead.

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

## Colour tokens

The palette is vendored like everything else, but it is the one group the app reads through a layer
of its own, so it is worth spelling out.

`tokens/colors.css` in the brand repo says of itself:

> Single source of truth. The site (ironarachne/src/lib/styles/tokens.css) should import or mirror
> this file rather than redeclaring the values; the two drifted apart once already.

It is copied to `src/lib/styles/brand/colors.css`, and `src/lib/styles/tokens.css` aliases it:

```css
:root {
  --gold: var(--ia-gold);
  --iron-arachne-green: var(--ia-green);
}
```

Two names, one value. The alternative considered in #150 was renaming the 74 call sites to `--ia-*`
and deleting the local names; it buys the same guarantee for a much larger diff, and a usage missed
in the rename becomes an undefined custom property, which CSS drops silently. The aliases are not
debt — `var(--gold)` reads better in a component than `var(--ia-gold)` — but the hexes now live in
exactly one file, which is what the brand repo actually asked for.

`src/lib/styles/tokens.test.ts` covers the failure this arrangement invites: the brand repo renames
a token, a sync brings the rename in, and every alias pointing at the old name quietly resolves to
nothing. It fails if any `--ia-*` a site stylesheet reads is not declared in the vendored file, and
if a hex value reappears in `tokens.css`.

`brand/colors.json` is copied too — `from` and `to` are directories, so the whole group comes across
— and nothing in the app reads it. Both files are in `.prettierignore`; both would otherwise be
reformatted, which is an in-place edit to a vendored file.

The vendored file also carries semantic tokens (`--ia-ink`, `--ia-surface`) and a
`prefers-color-scheme: dark` block that the site does not currently consume. They are inert: they
define custom properties nothing reads. The site does use the three status roles, via
`--modal-border-*`.

## What is not here

**No CI check.** Issue #151 weighed one and recommended against it for now: it would couple every
run to a second repository for the sake of some SVGs and PNGs, and this host's Actions are
constrained enough already (see `docs/deployment.md`, "Actions on this host"). If drift recurs
despite the pin, `--check` is one line in a workflow and the decision can be revisited.

**No submodule.** Same reasoning, more strongly — it would couple every clone as well as every CI
run.

**No check that the app's aliases cover the whole palette.** `tokens.test.ts` checks that every
alias resolves, not that every brand token has one. Three accents — amethyst, plasma blue and
magenta — are declared by the brand repo and used nowhere on the site. Whether the accent→domain
mapping in `BRAND.md` should be applied to the generators it names is a design question, and #150
deliberately left it alone.

## Prettier

`static/manifest.json` is in `.prettierignore`. Prettier happens to agree with the brand repo's
formatting today, but a formatter that rewrites a vendored file is an in-place edit — exactly the
thing that caused the drift — and it would make `--check` fail on a file nobody knowingly touched.
Any other vendored file that Prettier can parse needs the same entry.
