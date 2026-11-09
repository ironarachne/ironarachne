# Brand assets

**Status:** implemented. The app and studio use separate distributions from the same brand
repository. Each distribution is pinned to an immutable commit.

## Ownership and pins

| Identity     | Source in the brand repository | Pin in this repo    | Destinations                                                                                            |
| ------------ | ------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------- |
| Vastways app | `vastways/`                    | `brand-assets.json` | Browser assets in `static/`, lockups and fonts in `src/lib/assets/`, palette in `src/lib/styles/brand/` |

The manifest records the repository, exact commit, sync date, and source-to-destination
directory mappings. The studio site tracks its assets in the
[Studio Website repository](https://github.com/ironarachne/studio-website).
Make artwork, palette, and metadata changes in the source repository.
Sync copies the named directories as-is. Keep their filenames and bytes intact here.
See the [branding repository](https://github.com/ironarachne/ironarachne_branding).

The Vastways distribution has the production logo variants, browser icons, social card, font
notices, and usage guidance. The app imports the reversed horizontal and stacked lockups and
uses the simplified mark in its narrowest header. The visual rules and rollout live in the
[Vastways rebrand design](vastways-rebrand.md).

## Sync and check

```bash
scripts/sync_brand_assets.sh                          # restore the pinned app distribution
scripts/sync_brand_assets.sh --check                  # compare app files to the app pin
scripts/sync_brand_assets.sh --ref <commit-or-ref>    # update the app pin and copies
```

The app is the default selection. `--brand app` makes the selection explicit. Set
`BRAND_REPO_DIR` to a local clone for offline use. The script resolves the ref to a commit
and reads the committed tree in either mode. Each check exits with an error for missing or
different files. A newer upstream commit is reported for information. Review the asset diff
before committing a changed pin.

Sync writes files found in the source directory. When retiring an asset, remove its obsolete
vendored copy explicitly and check for app references.

## CSS and formatting

The app's `tokens.css` maps the pinned `--vw-*` swatches to roles that components use.
`tokens.test.ts` checks that those references resolve and that `tokens.css` does not restate
colour values. The browser contrast tests check the rendered roles on app surfaces.

Keep parseable vendored files in `.prettierignore`, including the web manifest.
Formatting would change the pinned bytes.
