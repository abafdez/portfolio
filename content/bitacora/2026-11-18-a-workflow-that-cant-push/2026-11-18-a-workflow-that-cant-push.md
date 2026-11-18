---
title: A workflow that can't push
date: 2026-11-18
tags: [ci, security, github, testing]
---

## What we did

- Faster e2e on CI: `fullyParallel` with one worker per core, and the Google Chrome the runner already has (`channel: 'chrome'`) instead of downloading Chromium (that step took 27 s).
- The build job only reads the repo now (`contents: read`) and checks out with `persist-credentials: false`, so the token isn't left in `.git/config` for the build's scripts to find.
- A new `image-cache` job is the only one that can push: it checks out, downloads the build's `.image-cache` artifact and commits it. It runs no code from the repo or its packages.
- `pages: write` and `id-token: write` moved from the whole workflow to the deploy job.
- Every action is pinned to a commit SHA with the version in a comment, and `.github/dependabot.yml` opens a weekly PR when they move (only releases at least 7 days old).
- `concurrency` per branch: a new push to a PR cancels its older run; runs on `main` queue, so two cache commits never race.
- Dropped the `minimumReleaseAgeExclude` for `@sveltia/cms`: 0.268.0 is old enough now.

## What I learned

- A job's permissions are what any script in it can do. The build runs code from hundreds of packages, so it shouldn't hold a token that can push.
- A tag like `v7` can be moved to point at other code; a commit SHA can't. Dependabot is what keeps SHA pins from going stale.
- `upload-artifact` skips hidden files by default, and `.image-cache` starts with a dot: `include-hidden-files: true`.

## Next

- Watch the first run on `main` commit the cache from the new job.
