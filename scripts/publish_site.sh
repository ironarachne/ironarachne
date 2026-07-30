#!/usr/bin/env bash
#
# Publishes a built site to an environment's Object Storage bucket and purges the
# CDN cache in front of it.
#
#   scripts/publish_site.sh <dev|staging|prod> [build-dir]
#
# Reads SCW_ACCESS_KEY, SCW_SECRET_KEY and BUNNYNET_API_KEY from the environment.
# Builds nothing: point it at a directory `npm run build` already produced.
#
# See docs/deployment.md for why the upload is two passes and why the cache
# headers matter.

set -euo pipefail

usage() {
  echo "usage: $0 <dev|staging|prod> [build-dir]" >&2
  exit 2
}

environment="${1:-}"
build_dir="${2:-build}"

[ -n "$environment" ] || usage

# Bucket and pull zone per environment. The source of truth is the OpenTofu
# state -- `tofu output` in infra/environments/<env>. They are duplicated here
# rather than read from state because publishing should not need credentials for
# the state bucket; the deploy identity is scoped to object storage alone.
case "$environment" in
  dev)
    bucket="ironarachne-web-dev"
    pull_zone="6245647"
    ;;
  staging)
    bucket="ironarachne-web-staging"
    pull_zone="6245673"
    ;;
  prod)
    bucket="ironarachne-web-prod"
    pull_zone="6245674"
    ;;
  *)
    echo "error: unknown environment '$environment'" >&2
    usage
    ;;
esac

region="pl-waw"

# Content-hashed by Vite, so a given URL's bytes never change: safe to cache for
# a year and skip revalidation entirely.
immutable_prefix="_app/immutable"
immutable_cache="public, max-age=31536000, immutable"

# Everything else is mutable at a stable URL -- above all the HTML shells, which
# must not be served stale after a deploy, and 404.html, which the bucket serves
# as its error document.
mutable_cache="public, max-age=0, must-revalidate"

for tool in rclone curl; do
  command -v "$tool" >/dev/null 2>&1 || {
    echo "error: $tool is required but not installed" >&2
    exit 1
  }
done

for var in SCW_ACCESS_KEY SCW_SECRET_KEY BUNNYNET_API_KEY; do
  [ -n "${!var:-}" ] || {
    echo "error: $var is not set" >&2
    exit 1
  }
done

[ -d "$build_dir" ] || {
  echo "error: build directory '$build_dir' does not exist -- run npm run build first" >&2
  exit 1
}

# The bucket serves these two by name; without them every URL 404s.
for required in index.html 404.html; do
  [ -f "$build_dir/$required" ] || {
    echo "error: $build_dir/$required is missing; the bucket needs it at the root" >&2
    exit 1
  }
done

# Configuring the remote through RCLONE_CONFIG_* keeps the credentials out of
# the process arguments, where an on-the-fly connection string would put them.
# The whole remote is defined here, so point rclone away from any config file it
# would otherwise look for and warn about.
export RCLONE_CONFIG="/dev/null"
export RCLONE_CONFIG_SCW_TYPE="s3"
export RCLONE_CONFIG_SCW_PROVIDER="Scaleway"
export RCLONE_CONFIG_SCW_ACCESS_KEY_ID="$SCW_ACCESS_KEY"
export RCLONE_CONFIG_SCW_SECRET_ACCESS_KEY="$SCW_SECRET_KEY"
export RCLONE_CONFIG_SCW_REGION="$region"
export RCLONE_CONFIG_SCW_ENDPOINT="s3.$region.scw.cloud"

remote="SCW:$bucket"

# --checksum compares MD5 rather than size and modification time. CI checks the
# repository out fresh every run, so every file looks newly modified; without
# this the whole site would re-upload each time.
common_flags=(--checksum --stats-one-line --stats 10s)

echo "==> Publishing $build_dir to $environment ($remote)"

# Pass 1: the hashed assets, copied rather than synced so nothing is removed
# yet. New HTML must never reach a visitor before the assets it references.
echo "--> assets ($immutable_prefix, cached for a year)"
rclone copy "$build_dir/$immutable_prefix" "$remote/$immutable_prefix" \
  "${common_flags[@]}" \
  --header-upload "Cache-Control: $immutable_cache"

# Pass 2: everything else, synced so files deleted from the build are pruned
# from the bucket. The hashed assets are excluded, so this cannot delete an
# asset that a page still cached at the edge might ask for.
echo "--> pages and static files (revalidated on every request)"
rclone sync "$build_dir" "$remote" \
  "${common_flags[@]}" \
  --exclude "/$immutable_prefix/**" \
  --header-upload "Cache-Control: $mutable_cache"

# The edge holds the old HTML until told otherwise, so a publish is not visible
# until the cache is dropped. Hashed assets are unaffected -- their URLs changed.
echo "--> purging CDN cache (pull zone $pull_zone)"
status=$(
  curl -sS -o /dev/null -w '%{http_code}' -X POST \
    -H "AccessKey: $BUNNYNET_API_KEY" \
    -H "Content-Length: 0" \
    "https://api.bunny.net/pullzone/$pull_zone/purgeCache"
)

if [ "$status" != "204" ] && [ "$status" != "200" ]; then
  echo "error: cache purge returned HTTP $status" >&2
  exit 1
fi

echo "==> Published $environment"
