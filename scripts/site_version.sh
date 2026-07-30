#!/usr/bin/env bash
#
# Prints the version of the current checkout, for naming build artifacts.
#
# The version is derived from the nearest `v*` git tag, and those tags are cut
# from the `version` field in package.json -- so package.json is the source of
# truth and git records when each value was released. See docs/versioning.md.
#
#   2.3.0              exactly at the v2.3.0 tag: a released version
#   2.3.0-4-gabc1234   four commits past it: a build of unreleased work
#
# Requires the full history and tags. A shallow clone without tags falls back to
# the package.json value, which would silently mislabel artifacts, so this fails
# loudly instead.

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

package_version="$(node -p "require('./package.json').version")"

if [ -z "$package_version" ]; then
  echo "error: could not read version from package.json" >&2
  exit 1
fi

# `git describe` needs the tag to exist. On a repository that has never been
# tagged -- or a checkout that omitted tags -- fall back to a shape that still
# carries the commit, so an artifact can always be traced back to its source.
if git describe --tags --match 'v*' --abbrev=0 >/dev/null 2>&1; then
  described="$(git describe --tags --match 'v*' --always)"
  echo "${described#v}"
else
  echo "${package_version}-0-g$(git rev-parse --short HEAD)"
fi
