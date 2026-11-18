---
title: Least privilege for a GitHub Pages workflow
draft: true
date: 2026-11-18
tags: [ci, security, github]
description: My build job could push to main, and it runs code from hundreds of packages. Splitting the one job that writes from the ones that build, pinning actions to commits, and a faster smoke test on the runner's own Chrome.
---

My deploy workflow commits one thing back to the repo: the cache of encoded images, so the next build doesn't encode them again. To do that, the whole build job had `contents: write`, and `actions/checkout` left the token in `.git/config`.

That job also runs `pnpm install`, the type checker, the tests and the build, which is code from hundreds of packages I didn't write. Any one of them, compromised, could have pushed to `main`. A job's permissions are what any script in that job can do, so the fix is to give the build none of that.

## One job builds, one job writes

The build job now only reads:

```yaml
permissions:
  contents: read

jobs:
  build:
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7
        with:
          persist-credentials: false
```

After the build, a step checks whether `.image-cache` changed and, if so, uploads it as an artifact. A second job, the only one with `contents: write`, checks out the repo, empties `.image-cache`, downloads the artifact into it and commits. It runs no code from the repo or its packages: checkout, download and `git`.

Two details bit me. `upload-artifact` skips hidden files by default, and `.image-cache` starts with a dot, so it needs `include-hidden-files: true`. And the deploy's `pages: write` and `id-token: write` had been set for the whole workflow; they now live on the deploy job only.

## Pin actions to commits

`uses: actions/checkout@v7` points at a tag, and a tag can be moved to other code. A commit SHA can't. So every action is pinned to its commit, with the version in a comment for humans. Pins never update by themselves, so a small `dependabot.yml` opens one PR a week when they move, only for releases at least seven days old (the same idea as pnpm's `minimumReleaseAge` for packages).

## No races on main

A `concurrency` group per branch: a new push to a pull request cancels its older run, and runs on `main` queue instead of running side by side, so two cache commits never collide.

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

## A faster smoke test

The same day I sped up the Playwright tests. They ran one file per worker; with `fullyParallel` every test runs on its own, one worker per core of the runner. And GitHub's Ubuntu runners already have Google Chrome, so `channel: 'chrome'` on CI skips downloading Chromium, which took 27 seconds every run.
