# Deployment

How a build reaches a bucket. The infrastructure it targets is described in `docs/infrastructure.md`;
the version scheme in `docs/versioning.md`.

**Status:** implemented. A merge to `main` tags the version, builds a versioned artifact, publishes it
as a release asset with a checksum, and deploys it to dev — all confirmed on real runs. Promotion by
committed version file replaces an earlier `workflow_dispatch` design that could not work here; the
publish half of it is proven, since staging was promoted to 2.3.2 by running the same two commands
by hand.

Some of the shape below was worked out against a previous host whose Actions implementation was
missing several things GitHub provides. Where a choice looks defensive, [Actions
notes](#actions-notes) says whether it was forced or chosen — worth reading before you change a
workflow on the assumption that it is arbitrary.

## The shape

```mermaid
graph TD
    merge([merge to main]) --> build

    subgraph buildwf["build.yaml — automatic, one job"]
        build["tag if new · npm run build<br/>ironarachne-&lt;version&gt;.tar.gz"]
        unpack["unpack the artifact"]
        build --> unpack
    end

    build -->|"release asset + .sha256<br/>(released versions only)"| release[("release v&lt;version&gt;")]
    unpack --> dev[["dev.ironarachne.com"]]

    subgraph promotewf["promote-*.yaml — on a version file changing"]
        stagingfile["deploy/staging.version"]
        prodfile["deploy/prod.version"]
    end

    release --> stagingfile
    release --> prodfile
    stagingfile --> staging[["staging.ironarachne.com"]]
    prodfile --> prod[["app.ironarachne.com"]]
```

|         | Trigger                          | Deploys                                  |
| ------- | -------------------------------- | ---------------------------------------- |
| dev     | every merge to `main`            | the artifact built in that run, unpacked |
| staging | `deploy/staging.version` changes | the release asset for that version       |
| prod    | `deploy/prod.version` changes    | the release asset for that version       |
| landing | `landing/` changes on `main`     | the directory as it stands in the commit |

Promotion fetches a published artifact rather than rebuilding, so the bytes reaching prod are the
bytes that were built and tested — not a rebuild that happens to start from the same commit.

**The landing page is not part of any of that**, and the last row is in the table only so nobody looks
for it elsewhere. It is the one-page site at `www.ironarachne.com`, checked in under `landing/` rather
than built, published straight from `main` by `publish-landing.yaml` with no version, no release and no
promotion. A single static page that links to the app does not earn that machinery, and tying it to
`package.json`'s version would mean an app release forcing a landing-page deploy. See
`docs/landing-page.md`.

Build and deploy are **not** separate jobs. That began as a platform constraint — the previous host
implemented no workflow artifacts, so nothing could be handed between jobs — and it is kept because
the separation lives in the scripts and in the promotion workflows instead, where splitting the job
would add a boundary without adding a guarantee. See [Actions notes](#actions-notes). To keep it honest, the dev
deploy publishes the **unpacked artifact** rather than `build/` directly, so dev serves exactly what
the release contains and a packaging bug surfaces there rather than first appearing in prod.

## Publishing

`scripts/publish_site.sh <dev|staging|prod> [build-dir]` does the actual work, and CI is a thin
wrapper around it. It can be run by hand with `SCW_ACCESS_KEY`, `SCW_SECRET_KEY` and
`BUNNYNET_API_KEY` set:

```bash
npm run build
scripts/publish_site.sh dev
```

### Why the upload is two passes

Cache lifetimes differ by an order of ten million between the two kinds of file, and Object Storage
sends no `Cache-Control` of its own — whatever is set at upload time is what the CDN and browsers
obey.

| Files               | Header                                | Reason                                                                                    |
| ------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `_app/immutable/**` | `public, max-age=31536000, immutable` | Vite content-hashes these, so a given URL's bytes never change                            |
| everything else     | `public, max-age=0, must-revalidate`  | HTML shells at stable URLs; serving these stale would pin visitors to the previous deploy |

The passes are also ordered, and the order matters:

1. **`rclone copy` the hashed assets.** `copy`, not `sync`, so nothing is deleted yet. New HTML must
   never reach a visitor before the assets it references exist.
2. **`rclone sync` everything else**, excluding the hashed assets. `sync` prunes files deleted from
   the build, so removed routes stop being served. The exclusion means this pass cannot delete an
   asset that a page still held at the edge might ask for.

Old hashed assets therefore accumulate. That is deliberate — they are small, and deleting them is how
you break the pages still referencing them. Prune with a bucket lifecycle rule if it ever matters.

`--checksum` is not incidental: CI checks out fresh every run, so every file looks newly modified.
Comparing MD5 instead of timestamps means only genuinely changed files upload.

### The cache purge

The edge holds the previous HTML until told otherwise, so the script finishes by purging the pull
zone. Without it a deploy is invisible for as long as the edge copy lives. Hashed assets are
unaffected — their URLs changed, so nothing stale is reachable.

## Promoting to staging or prod

**Promotion is a commit.** Each environment has a file naming the version it should be running:

```
deploy/staging.version
deploy/prod.version
```

Change the file, open a PR, merge it. `promote-staging.yaml` and `promote-prod.yaml` watch their
respective file and, when it changes on `main`, fetch that version's release asset and publish it.

```bash
echo 2.3.3 > deploy/prod.version   # then PR and merge
```

**Rolling back is the same operation**: put the older version in the file and merge. Nothing special,
nothing to remember under pressure.

A version must have been released to be promotable — bump `package.json` to cut one — and the file
holds bare digits, `2.3.2`, with no leading `v`.

Doing it by hand is still supported and is exactly what the workflows run:

```bash
scripts/fetch_release_artifact.sh 2.3.2 build
scripts/publish_site.sh prod build
```

### Why a commit rather than a button

Originally because a button did not work: the previous host collected `workflow_dispatch` inputs in
its web UI and never delivered them to the runner, and three failed promotion attempts were all that,
wearing different masks. See [the history note](#history-what-the-previous-host-could-not-do).

`workflow_dispatch` inputs work on GitHub, so this is now a choice rather than a workaround — and it
is the better design regardless: the repository states what each environment is meant to be running,
promotion is reviewable before it happens, and rollback needs no new mechanism.

## Required setup

Three repository secrets are needed: `SCW_ACCESS_KEY`, `SCW_SECRET_KEY` and `BUNNYNET_API_KEY`,
named to match the local environment variables. Every workflow that touches a bucket reads all three.

There is no fourth. Pushing the version tag and cutting the release used to need a personal access
token; on GitHub the workflow's built-in `GITHUB_TOKEN` does both, given `permissions: contents:
write` on the job. Nothing needs minting for that.

Two things still need doing:

**Set the three secrets on the GitHub repository.** They did not come across with the code —
`gh secret set SCW_ACCESS_KEY`, and so on for the other two. Until they exist, `build.yaml` will
tag and release correctly and then fail at the publish step.

**Point the Scaleway secrets at the deploy identity.** They currently hold a user-scoped API key,
which can do anything the account can. `infra/shared` exists to provide a narrower one: an IAM
application whose policy allows only object-storage reads and writes within the site project. Mint a
key against it and replace the secret values — the names do not change, so nothing here needs
editing. `infra/README.md` has the command.

## Why bucket names live in the publish script

`scripts/publish_site.sh` maps environment to bucket and pull zone in a `case` statement, duplicating
what `tofu output` knows. That is on purpose: reading it from OpenTofu state would mean giving the
deploy job credentials for the state bucket, and the whole point of the scoped deploy identity is
that it can touch objects and nothing else. The values are stable; the comment in the script points
at the source of truth.

## Actions notes

The publish path is verified: `scripts/publish_site.sh` has published a real build to dev, and the
result was checked end to end — correct `Cache-Control` at the origin, the year-long header surviving
through the CDN, a cache `HIT` on a second asset request, deep links resolving, an unknown route
returning the error document, and pages rendering in a browser with no failed requests.

**Tag pushing works, and needs no personal token.** A protected branch does not block a tag, so
`build.yaml` cuts `v<version>` on a merge to `main` and pushes it as the workflow's own
`GITHUB_TOKEN`. That token gets write access from `permissions: contents: write`, declared on the
job rather than granted repository-wide.

**Releases are cut with `gh release create`, not with an action.** `gh` is preinstalled on
GitHub-hosted runners and authenticates from `GH_TOKEN`, so there is no third-party action in the
release path and nothing to keep pinned. The step creates the release when it does not exist and
uploads into it when it does, which is what makes it self-healing — see below. It attaches the build
artifact and a `.sha256` computed in the packaging step, and `scripts/fetch_release_artifact.sh`
verifies that checksum before unpacking, so promotion moves bytes that are checked rather than
merely assumed.

### History: what the previous host could not do

This repository ran on Worktree.ca, a hard fork of Gitea, before moving back to GitHub. Several
things in these workflows look defensive because they were written against that host's limits — none
of which apply here:

- **Workflow artifacts did not exist there at all**; the runner never set `ACTIONS_RUNTIME_TOKEN`.
  That is why `build.yaml` is a single job and why `goldens.yaml` pushes a branch instead of
  uploading files. Both keep their shape on their own merits, argued in the workflow files, rather
  than because the constraint still binds.
- **`workflow_dispatch` inputs were never delivered to the runner** by any route — the form
  collected them and the job saw an empty map. That cost three failed prod deploys and is the origin
  of promotion-by-committed-file, which was then kept deliberately; see
  [Why a commit rather than a button](#why-a-commit-rather-than-a-button).
- **`timeout-minutes:` on a job made the runner reject that job outright**, and a job that stopped
  producing output was reaped after about fifteen minutes with nothing inside it able to pre-empt
  that. Four such stalls in twenty-four hours are why the browser suite stopped gating pull
  requests. `e2e.yaml` now carries `timeout-minutes: 45`, which behaves normally here.
- **Most of the `GITHUB_*` context was empty**, `GITHUB_REF` excepted. Workflows here read
  `github.event_name`, `GITHUB_BASE_REF` and the rest as documented.

This is recorded because the shapes it produced are still visible in the files, and someone reading
them deserves to know which choices were forced and which were made. It constrains nothing new.

### The self-healing release step, and its limit

The release step fires whenever HEAD is exactly at the version tag, rather than only when the tag was
just created. So a build that cuts a tag but dies before attaching the artifact is repaired by the
next run **on that same commit**.

Its limit is worth understanding, because the first attempt ran into it. Once `main` moves past the
tag, the version no longer matches and the step is skipped — correctly, since a later commit is not
that release. A version whose build failed _and_ whose commit has been built over is therefore
stranded: it has a tag and no artifact, and nothing will ever give it one.

That is what happened to `v2.3.0`, which is why it is a tag with no release. The fix is not to
resurrect it but to cut the next version, which is why `2.3.1` exists. If it happens again, bump the
version rather than deleting and re-pushing a published tag.

One earlier unknown is now closed. Scaleway **does** implement the S3 directory redirect: a request
for `/heraldry` returns `302` to `/heraldry/`, so the trailing-slash fallback described in
`docs/static-hosting.md` is not needed in practice.
