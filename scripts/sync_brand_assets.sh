#!/usr/bin/env bash
#
# Copies brand assets out of ironarachne_branding and into this repo.
#
#   scripts/sync_brand_assets.sh              # restore the pinned assets
#   scripts/sync_brand_assets.sh --check      # report drift, exit 1 if any
#   scripts/sync_brand_assets.sh --ref <ref>  # take a newer version, move the pin
#
# `brand-assets.json` records which brand-repo commit the vendored copies came
# from, and which directories map onto which. Assets flow one way — from the
# brand repo into this one — and the pin is what makes "are these current?" a
# question you can answer without comparing bytes by hand. They have silently
# drifted twice; both times the missing piece was a recorded source.
#
# By default the pinned tree is downloaded from the brand repo, which is public,
# so no token is needed. Set BRAND_REPO_DIR to a local clone to work offline —
# the ref is still resolved through git, so it means the same thing either way.
#
# Nothing is deleted: only files present in the brand repo are written, so
# anything else in a destination directory is left alone.

set -euo pipefail

mode="sync"
ref=""

while [ $# -gt 0 ]; do
  case "$1" in
    --check)
      mode="check"
      shift
      ;;
    --ref)
      ref="${2:-}"
      if [ -z "$ref" ]; then
        echo "error: --ref needs a branch, tag or commit" >&2
        exit 2
      fi
      shift 2
      ;;
    *)
      echo "usage: $0 [--check] [--ref <ref>]" >&2
      exit 2
      ;;
  esac
done

if [ "$mode" = "check" ] && [ -n "$ref" ]; then
  echo "error: --check reports on the pinned commit; drop --ref" >&2
  exit 2
fi

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
pinfile="$root/brand-assets.json"

for tool in jq tar; do
  command -v "$tool" >/dev/null 2>&1 || {
    echo "error: $tool is required but not installed" >&2
    exit 1
  }
done

repository="$(jq -r .repository "$pinfile")"
pinned="$(jq -r .commit "$pinfile")"
wanted="${ref:-$pinned}"

# https://worktree.ca/ironarachne/ironarachne_branding -> ironarachne/ironarachne_branding
slug="${repository#*://*/}"
api="${repository%/"$slug"}/api/v1/repos/$slug"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
tree="$work/tree"
mkdir -p "$tree"

if [ -n "${BRAND_REPO_DIR:-}" ]; then
  command -v git >/dev/null 2>&1 || {
    echo "error: git is required to read BRAND_REPO_DIR" >&2
    exit 1
  }
  echo "==> Reading $wanted from $BRAND_REPO_DIR"
  resolved="$(git -C "$BRAND_REPO_DIR" rev-parse "$wanted^{commit}")"
  git -C "$BRAND_REPO_DIR" archive "$resolved" | tar -x -C "$tree"
else
  command -v curl >/dev/null 2>&1 || {
    echo "error: curl is required (or set BRAND_REPO_DIR to a local clone)" >&2
    exit 1
  }
  echo "==> Fetching $wanted from $repository"
  resolved="$(curl -sSf "$api/git/commits/$wanted" | jq -r .sha)"
  if [ -z "$resolved" ] || [ "$resolved" = "null" ]; then
    echo "error: $repository has no commit $wanted" >&2
    exit 1
  fi
  curl -sSf -o "$work/brand.tar.gz" "$api/archive/$resolved.tar.gz"
  tar -xzf "$work/brand.tar.gz" -C "$tree" --strip-components=1
fi

echo "==> Commit $resolved"

copied=0
differing=0
missing=0

while read -r from && read -r to; do
  src="$tree/$from"
  dest="$root/$to"

  if [ ! -d "$src" ]; then
    echo "error: $from is not in the brand repo at $resolved" >&2
    exit 1
  fi

  while IFS= read -r relative; do
    if [ "$mode" = "check" ]; then
      if [ ! -f "$dest/$relative" ]; then
        echo "  missing:  $to/$relative"
        missing=$((missing + 1))
      elif ! cmp -s "$src/$relative" "$dest/$relative"; then
        echo "  differs:  $to/$relative"
        differing=$((differing + 1))
      fi
    else
      mkdir -p "$(dirname "$dest/$relative")"
      cp "$src/$relative" "$dest/$relative"
      copied=$((copied + 1))
    fi
  done < <(cd "$src" && find . -type f | sed 's|^\./||' | sort)
done < <(jq -r '.assets[] | .from, .to' "$pinfile")

if [ "$mode" = "check" ]; then
  if [ "$differing" -gt 0 ] || [ "$missing" -gt 0 ]; then
    echo "==> Drift: $differing file(s) differ, $missing missing"
    echo "    Run scripts/sync_brand_assets.sh to restore the pinned assets."
    exit 1
  fi
  echo "==> In sync with $resolved"

  if [ -z "${BRAND_REPO_DIR:-}" ] && command -v curl >/dev/null 2>&1; then
    latest="$(curl -sSf "$api/git/commits/HEAD" | jq -r .sha || true)"
    if [ -n "$latest" ] && [ "$latest" != "null" ] && [ "$latest" != "$resolved" ]; then
      echo "    Note: the brand repo has moved on to ${latest:0:12}."
      echo "    Run scripts/sync_brand_assets.sh --ref main to take it."
    fi
  fi
  exit 0
fi

echo "==> Copied $copied file(s)"

if [ "$resolved" != "$pinned" ]; then
  jq --arg commit "$resolved" --arg synced "$(date -u +%Y-%m-%d)" \
    '.commit = $commit | .synced = $synced' "$pinfile" >"$work/pin.json"
  mv "$work/pin.json" "$pinfile"
  echo "==> Pinned brand-assets.json to $resolved"
fi

echo "    Review the diff before committing: git status"
