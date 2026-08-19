---
description: Promote a released version to staging or prod by opening the version-file PR. Usage: /promote <staging|prod> <version, e.g. 2.3.2>
---

Promote version **$2** to the **$1** environment by changing `deploy/$1.version` and opening a pull
request. Merging that PR is what deploys; opening it does not.

If either argument is missing, stop and ask. Do not guess an environment, and do not assume "the
latest" version.

## Check the release exists first

A version is only promotable if it has a release with an artifact attached. Verify before opening
anything:

```bash
gh release view "v$2" --json tagName,isDraft,assets \
  --jq '{tag: .tagName, draft: .isDraft, assets: [.assets[].name]}'
```

Run it **authenticated** — which `gh` is by default — and check the `draft` field rather than
assuming. A draft release is invisible to unauthenticated callers, so a version that looks released
in a browser tab can still fail the deploy; this has happened. Confirm the release exists, is not a
draft, and has both `ironarachne-$2.tar.gz` and its `.sha256` attached.

If there is no release, say so and stop. The fix is to cut one by bumping `package.json` (`/release`),
not to invent a version.

## The change

`deploy/$1.version` holds bare digits and nothing else — `2.3.2`, no leading `v`, no comment. The
workflow rejects anything else before it goes near a bucket.

Branch off `main`, make the one-line change, commit, push, and open the PR with `gh pr create`.
Nothing else belongs in this PR.

## What the PR description must say

- Which environment, which version, and **that merging deploys it**. For prod, say that plainly and
  near the top — it is a real deployment to `app.ironarachne.com`.
- What the environment is running now, so the change is legible. Read the current contents of
  `deploy/$1.version` before changing it.
- That rolling back is the same operation with an older version.

## After merging, if asked to see it through

Watch the `Promote $1` run — the `/ci` command's notes on reading status apply — and then verify the
site rather than trusting the check. Every publish step in that workflow is conditional on the
version file having actually changed, so confirm from the job log that they ran rather than skipped,
and check the environment serves:

| Environment | URL                             |
| ----------- | ------------------------------- |
| staging     | https://staging.ironarachne.com |
| prod        | https://app.ironarachne.com     |

Worth checking a deep link (`/heraldry/`) and an unknown route, not only `/`.
