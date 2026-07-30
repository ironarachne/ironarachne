#!/usr/bin/env bash
#
# Creates a release for a tag and attaches a build artifact to it.
#
#   scripts/publish_release.sh <tag> <artifact-path>
#
# Reads WORKTREE_TOKEN (a personal access token with write access to the
# repository) and, when running under Actions, GITHUB_SERVER_URL and
# GITHUB_REPOSITORY. Both default to this repository's values so it can be run
# by hand.
#
# The release is what staging and prod deploy from: it is the durable, versioned
# copy of a build. See docs/deployment.md.

set -euo pipefail

tag="${1:-}"
artifact="${2:-}"

if [ -z "$tag" ] || [ -z "$artifact" ]; then
  echo "usage: $0 <tag> <artifact-path>" >&2
  exit 2
fi

server="${GITHUB_SERVER_URL:-https://worktree.ca}"
repository="${GITHUB_REPOSITORY:-ironarachne/ironarachne}"
api="$server/api/v1/repos/$repository"

for tool in curl jq; do
  command -v "$tool" >/dev/null 2>&1 || {
    echo "error: $tool is required but not installed" >&2
    exit 1
  }
done

[ -n "${WORKTREE_TOKEN:-}" ] || {
  echo "error: WORKTREE_TOKEN is not set" >&2
  exit 1
}

[ -f "$artifact" ] || {
  echo "error: artifact '$artifact' does not exist" >&2
  exit 1
}

auth=(-H "Authorization: token $WORKTREE_TOKEN")

# Reuse the release if it already exists, so a re-run attaches the asset rather
# than failing outright.
release_id="$(
  curl -sS "${auth[@]}" "$api/releases/tags/$tag" | jq -r '.id // empty'
)"

if [ -z "$release_id" ]; then
  echo "==> Creating release $tag"
  release_id="$(
    curl -sS -X POST "${auth[@]}" \
      -H "Content-Type: application/json" \
      -d "$(jq -n --arg tag "$tag" \
        '{tag_name: $tag, name: $tag, body: "Automated release. Artifact attached below.", draft: false, prerelease: false}')" \
      "$api/releases" | jq -r '.id // empty'
  )"

  [ -n "$release_id" ] || {
    echo "error: could not create release $tag" >&2
    exit 1
  }
else
  echo "==> Release $tag already exists (id $release_id)"
fi

name="$(basename "$artifact")"

# An asset of the same name would be duplicated rather than replaced, so drop
# any previous copy first.
existing="$(
  curl -sS "${auth[@]}" "$api/releases/$release_id/assets" |
    jq -r --arg name "$name" '.[] | select(.name == $name) | .id'
)"

for asset_id in $existing; do
  echo "--> Removing existing asset $name ($asset_id)"
  curl -sS -X DELETE "${auth[@]}" "$api/releases/$release_id/assets/$asset_id" >/dev/null
done

echo "--> Attaching $name"
curl -sS -X POST "${auth[@]}" \
  -F "attachment=@$artifact" \
  "$api/releases/$release_id/assets?name=$name" |
  jq -r '"    " + (.browser_download_url // "attached")'

echo "==> Released $tag"
