#!/usr/bin/env bash
#
# PreToolUse hook on Bash. Refuses, before the command runs, anything that would
# put a commit directly onto a protected branch or rewrite pushed history.
#
# The repo's conventions already say "never commit to main, never force-push",
# but a convention written in prose is advice. This makes it a constraint: an
# agent that has not read CLAUDE.md, or has forgotten it, still cannot do it.
#
# Reads the hook payload on stdin and, to deny, prints a PreToolUse decision.
# Exits 0 in every other case — a guard that fails closed on its own bugs would
# block all work, which is a worse failure than the one it prevents.

set -uo pipefail

PROTECTED='^(main|master)$'

payload=$(cat)
cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // ""' 2>/dev/null) || exit 0

# Cheap bail-out: the overwhelming majority of Bash calls are not git at all.
case "$cmd" in
*git*) ;;
*) exit 0 ;;
esac

branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null) || exit 0

deny() {
  jq -n --arg r "$1" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: $r
    }
  }'
  exit 0
}

matches() { printf '%s' "$cmd" | grep -Eq "$1"; }

# Commands that write history at HEAD. `git pull` is deliberately absent: a
# fast-forward pull on main is how you keep it current.
if matches '(^|[;&|[:space:]])git[[:space:]]+(commit|merge|rebase|cherry-pick|revert)([[:space:]]|$)'; then
  if [[ $branch =~ $PROTECTED ]]; then
    deny "Refused: this would write directly to '$branch', which is a protected branch.
Branch first (git checkout -b <name>), commit there, and open a pull request.
CI must report CI / verify and CI / e2e green before it can merge."
  fi
fi

if matches '(^|[;&|[:space:]])git[[:space:]]+push'; then
  if matches '(--force([[:space:]]|=|$)|--force-with-lease|[[:space:]]-[a-zA-Z]*f([[:space:]]|$))'; then
    deny "Refused: force-pushing rewrites history that others may have pulled.
If the branch needs different commits, add a new commit instead."
  fi
  if matches '(^|[;&|[:space:]])git[[:space:]]+push[^|;&]*[[:space:]](main|master)([[:space:]]|$)'; then
    deny "Refused: this pushes straight to a protected branch. Push your feature
branch and open a pull request instead."
  fi
  if [[ $branch =~ $PROTECTED ]]; then
    deny "Refused: you are on '$branch', so this pushes to a protected branch.
Branch first, then push that branch and open a pull request."
  fi
fi

exit 0
