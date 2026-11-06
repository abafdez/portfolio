---
title: CI that checks PRs and deploys only from main
date: 2026-10-20
phase: 0
tags: [github-actions, ci, prettier, vscode]
---

## What we did

- Removed `actions/configure-pages`. Nothing used its outputs.
- Split `check`, `lint` and `build` into separate CI steps.
- Gated the artifact upload and the `deploy` job with `if: github.ref == 'refs/heads/main'`, so PRs only build and check.
- Moved `concurrency: pages` from the top level into the `deploy` job, so PR checks don't queue behind deploys.
- Ran `pnpm format` on the repo and enabled format on save in `.vscode/settings.json`. Recommended the Prettier extension.
- Started a blog post explaining the workflow (`content/blog/`, still a draft).

## What I learned

- Each job runs on its own fresh VM. The Pages artifact is how `build/` gets from the build job to the deploy job.
- You don't deploy _from_ a PR. A merged PR is a push to `main`.
- `github.ref` is safer than `github.event_name`: a manual run from a feature branch has `event_name == workflow_dispatch` but the wrong ref.
- Inside `if:` there's no `${{ }}`, and strings use single quotes.
- `pnpm lint` (`prettier --check`) only reports. `pnpm format` (`prettier --write`) fixes. Here "lint" is only formatting; there's no ESLint yet.
- Commit project-wide `.vscode/` settings, and keep personal preferences in User settings.

## Problems & fixes

- The ruleset had no status checks to choose from. A check only appears after it has run at least once, so open a PR first and then create the ruleset.

## Next

- Write the README, open the PR, confirm `deploy` is skipped, add the ruleset, merge.
- Phase 1: TypeScript migration.
