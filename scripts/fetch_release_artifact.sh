#!/usr/bin/env bash
#
# Downloads the build artifact attached to a release and unpacks it.
#
#   scripts/fetch_release_artifact.sh <version> [dest-dir]
#
# `version` may be given with or without the leading "v" (2.3.0 or v2.3.0).
# The repository is public, so no token is needed to read releases.
#
# This is how staging and prod get something to deploy: they publish the exact
# bytes a build produced, rather than rebuilding and hoping for the same result.

set -euo pipefail

version="${1:-}"
dest="${2:-build}"

if [ -z "$version" ]; then
  echo "usage: $0 <version> [dest-dir]" >&2
  exit 2
fi

tag="v${version#v}"
artifact="ironarachne-${version#v}.tar.gz"

server="${GITHUB_SERVER_URL:-https://worktree.ca}"
repository="${GITHUB_REPOSITORY:-ironarachne/ironarachne}"
api="$server/api/v1/repos/$repository"

for tool in curl jq tar; do
  command -v "$tool" >/dev/null 2>&1 || {
    echo "error: $tool is required but not installed" >&2
    exit 1
  }
done

echo "==> Looking up release $tag"
release="$(curl -sS "$api/releases/tags/$tag")"

# Distinguish "no such release" from "release exists but is missing the asset":
# the first means the version was never cut, the second means the build failed
# to attach it, and they need different fixes.
if [ -z "$(echo "$release" | jq -r '.id // empty')" ]; then
  echo "error: no release found for $tag" >&2
  echo "       Only released versions can be deployed. Cut one by bumping the" >&2
  echo "       version in package.json; see docs/versioning.md." >&2
  exit 1
fi

url="$(
  echo "$release" |
    jq -r --arg name "$artifact" '.assets[]? | select(.name == $name) | .browser_download_url'
)"

if [ -z "$url" ]; then
  echo "error: release $tag exists but has no asset named $artifact" >&2
  echo "       assets present:" >&2
  echo "$release" | jq -r '.assets[]?.name | "         " + .' >&2
  echo "       (the build that cut this tag may have failed before attaching it)" >&2
  exit 1
fi

echo "--> Downloading $artifact"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
curl -sSfL -o "$tmp/$artifact" "$url"

# The build publishes a .sha256 beside the artifact. Verify it when present, so
# a truncated download or a tampered asset cannot reach a bucket. Absent for
# releases cut before checksums were published, which is not an error.
checksum_url="$(
  echo "$release" |
    jq -r --arg name "$artifact.sha256" '.assets[]? | select(.name == $name) | .browser_download_url'
)"

if [ -n "$checksum_url" ]; then
  echo "--> Verifying checksum"
  curl -sSfL -o "$tmp/$artifact.sha256" "$checksum_url"
  expected="$(tr -d '\r' <"$tmp/$artifact.sha256" | awk '{print $1}')"
  actual="$(sha256sum "$tmp/$artifact" | awk '{print $1}')"

  if [ "$expected" != "$actual" ]; then
    echo "error: checksum mismatch for $artifact" >&2
    echo "       expected $expected" >&2
    echo "       actual   $actual" >&2
    exit 1
  fi
else
  echo "--> No checksum published for this release; skipping verification"
fi

echo "--> Unpacking into $dest"
rm -rf "$dest"
mkdir -p "$dest"
tar -xzf "$tmp/$artifact" -C "$dest"

echo "==> Fetched $artifact ($(find "$dest" -type f | wc -l | tr -d ' ') files)"
