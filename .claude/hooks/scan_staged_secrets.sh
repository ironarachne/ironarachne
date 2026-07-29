#!/usr/bin/env bash
#
# PreToolUse hook on Bash. Before a `git commit` runs, looks at what is actually
# about to be committed and refuses if it contains something shaped like a
# credential. A secret that reaches a published branch has to be treated as
# leaked even after it is deleted, because the object stays in history and the
# remote is public — so the only cheap moment to catch it is here.
#
# Only added lines are scanned, so a pre-existing false positive elsewhere in a
# file does not block every later commit that touches it.
#
# Exits 0 unless it has a specific reason to object. A scanner that blocks on
# its own failure would be a scanner people disable.

set -uo pipefail

payload=$(cat)
cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // ""' 2>/dev/null) || exit 0

printf '%s' "$cmd" | grep -Eq '(^|[;&|[:space:]])git[[:space:]]+commit([[:space:]]|$)' || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

staged=$(git diff --cached --unified=0 2>/dev/null) || exit 0
names=$(git diff --cached --name-only 2>/dev/null) || exit 0

# `git commit -a` sweeps in tracked-but-unstaged edits, so those count too.
if printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+commit[^|;&]*[[:space:]]-[a-zA-Z]*a'; then
  staged="${staged}"$'\n'"$(git diff --unified=0 2>/dev/null)"
  names="${names}"$'\n'"$(git diff --name-only 2>/dev/null)"
fi

added=$(printf '%s' "$staged" | grep -E '^\+' | grep -Ev '^\+\+\+' || true)
[ -n "$added" ] || [ -n "$names" ] || exit 0

hits=""
note() { hits="${hits}  - ${1}"$'\n'; }

# `--` matters: several patterns start with a hyphen, which grep would otherwise
# read as an option.
content_check() {
  local label=$1 pattern=$2 line
  line=$(printf '%s' "$added" | grep -Eim1 -- "$pattern" || true)
  [ -n "$line" ] && note "$label -> $(printf '%s' "$line" | cut -c1-100)"
}

name_check() {
  local label=$1 pattern=$2 file
  file=$(printf '%s' "$names" | grep -Eim1 -- "$pattern" || true)
  [ -n "$file" ] && note "$label -> $file"
}

content_check "AWS access key id" 'AKIA[0-9A-Z]{16}'
content_check "private key block" '-----BEGIN [A-Z ]*PRIVATE KEY-----'
content_check "GitHub token" 'gh[pousr]_[A-Za-z0-9]{30,}'
content_check "Slack token" 'xox[baprs]-[A-Za-z0-9-]{10,}'
content_check "npm token" 'npm_[A-Za-z0-9]{30,}'
content_check "PyPI token" 'pypi-[A-Za-z0-9_-]{30,}'
content_check "credential assigned to a variable" \
  '(api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|password|passwd)["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"']{16,}["'"'"']'

name_check "environment file" '(^|/)\.env($|\.)'
name_check "private key file" '\.(pem|p12|pfx|key)$'
name_check "SSH private key" '(^|/)id_(rsa|dsa|ecdsa|ed25519)$'
name_check "npm auth config" '(^|/)\.npmrc$'
name_check "Claude local settings" '(^|/)\.claude/settings\.local\.json$'

[ -n "$hits" ] || exit 0

jq -n --arg r "Refused: the staged changes look like they contain a credential.

${hits}
Nothing has been committed. Verify each item above.

If it is a real secret: remove it from the working tree, keep it in an ignored
file such as .env, and rotate it — assume anything that reached a commit is
already compromised.

If it is a false positive (test fixture, sample data, generated prose), commit
that specific change outside the agent, or narrow the pattern in
.claude/hooks/scan_staged_secrets.sh so the next one does not trip either." '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: $r
  }
}'
exit 0
