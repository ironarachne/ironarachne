---
name: promote
description: Promote a released Iron Arachne version to staging or production by opening its version-file PR. Use when the user asks to deploy or promote a release or invokes $promote.
---

# Promote

Require an environment (`staging` or `prod`) and an exact version. Ask if either is missing; never guess an environment or assume the latest version.

First verify the authenticated GitHub release exists, is not a draft, and contains both `ironarachne-<version>.tar.gz` and its `.sha256`:

```bash
gh release view "v<version>" --json tagName,isDraft,assets \
  --jq '{tag: .tagName, draft: .isDraft, assets: [.assets[].name]}'
```

If it is not promotable, stop. Otherwise branch from `main`, change only `deploy/<environment>.version` to the bare version digits, commit, push, and open a PR. The PR must state the environment and version, that merging deploys it, the environment's current version, and that rollback uses the same operation with an older version.

If asked to see the promotion through after merge, inspect the matching workflow and confirm publish steps ran rather than skipped. Then verify the deployed site, a deep link, and an unknown route:

- staging: `https://staging.ironarachne.com`
- prod: `https://app.ironarachne.com`
