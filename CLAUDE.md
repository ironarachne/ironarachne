## Project style
- CODE_STYLE.md contains the rules for this repository's structure and coding style, follow it.

## Git workflow
- This repository's remote is Worktree.ca, a Forgejo instance. Do NOT use `gh` or other GitHub-only tools.
- Use the worktree MCP for interacting with the remote

## Testing
- Use `npm run test` to run all unit tests, but prefer `npm run test -- mypath` to run a subset of tests that is applicable to your work.
- Use `npm run test:e2e` to run Playwright tests.
- Don't run mutation testing (`npx stryker run`). Let humans handle that.
