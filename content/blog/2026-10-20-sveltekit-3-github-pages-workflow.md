---
title: Deploying SvelteKit 3 to GitHub Pages, step by step
date: 2026-10-20
tags: [sveltekit, github-actions, github-pages, ci]
draft: true
description: My GitHub Actions setup for a solo SvelteKit 3 project. PRs run checks, merges to main deploy, and an artifact connects the two jobs.
---

My portfolio is a static SvelteKit 3 site hosted on GitHub Pages. Getting the deploy working took a string of `fix:` commits, so this post walks through the final workflow and explains what each piece is for.

## The big picture

I work alone, but I still use branches and pull requests. The workflow does two different things depending on what triggered it:

```
feature branch ──push──► open PR ──► check + lint + build        (no deploy)
                                       │
                                  green? merge
                                       ▼
                          push to main ──► check + lint + build + deploy
```

Something I had backwards at first: you never deploy _from_ a pull request. Deploying on the `pull_request` event would publish code that hasn't been reviewed. You deploy when the PR is **merged**, and to GitHub a merge is just a push to `main`.

Inside a single run, it looks like this:

```
┌──────────── build job (VM 1) ────────────┐     ┌──── deploy job (VM 2) ────┐
│ checkout → install → check → lint →      │     │                           │
│ build → upload artifact (main only)      │ ──► │ deploy-pages (main only)  │
└──────────────────────────────────────────┘     └───────────────────────────┘
```

The key idea that took me a while to get: **every job runs on its own fresh virtual machine.** When `build` finishes, its machine and the `build/` folder are gone. Jobs don't share a disk.

## Triggers and permissions

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read # clone the repo
  pages: write # create a Pages deployment
  id-token: write # get an OIDC token so deploy-pages can prove who it is
```

`workflow_dispatch` adds a "Run workflow" button in the Actions tab, which is handy for redeploying without pushing a commit.

## The build job

```yaml
- uses: actions/checkout@v7
- uses: pnpm/setup@v3.0.0
  with:
    cache: true
    runtime: node@22
- run: pnpm check
- run: pnpm lint
- run: pnpm run build
- uses: actions/upload-pages-artifact@v5
  with:
    path: build/
```

- **checkout**: the VM starts empty, so this clones the repo into it.
- **pnpm/setup**: installs Node 22 (SvelteKit 3 requires it) and pnpm, then installs dependencies with caching.
- **check / lint**: `svelte-check` catches type and Svelte errors, and Prettier catches formatting. Either one failing stops the run before anything is built.
- **build**: `adapter-static` prerenders every page into `build/`.
- **upload-pages-artifact**: packs `build/` into a tar archive and stores it on GitHub as an artifact named `github-pages`, attached to this run.

## The deploy job

```yaml
deploy:
  needs: build
  environment:
    name: github-pages
    url: ${{ steps.deployment.outputs.page_url }}
  steps:
    - id: deployment
      uses: actions/deploy-pages@v5
```

This job has **no checkout and no build**. It never sees my code. It uses the OIDC token to tell the Pages API to publish the `github-pages` artifact from this run. That's why the artifact isn't optional: it's the only way files get from VM 1 to GitHub Pages.

`needs: build` makes it wait for the build to finish, and `environment` makes the live URL show up on the run page.

## Checking on PRs, deploying only from main

One workflow file serves both cases. The `build` job always runs, and the deploy parts are gated with an `if:` condition.

My first idea was `github.event_name != 'pull_request'`, which means "deploy unless this is a PR". That has a hole: the manual **Run workflow** button lets you pick _any_ branch, so it would deploy a half-finished feature branch. The better question is **which branch is this?**, and `github.ref` answers it:

| Trigger                     | `github.ref`           | Deploys? |
| --------------------------- | ---------------------- | -------- |
| Push / merged PR to `main`  | `refs/heads/main`      | ✅       |
| Manual run from `main`      | `refs/heads/main`      | ✅       |
| Manual run from `feature-x` | `refs/heads/feature-x` | ❌       |
| Pull request #12            | `refs/pull/12/merge`   | ❌       |

So both gates use the same condition:

```yaml
      - name: Upload GitHub Pages artifact
        if: github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v5
        with:
          path: "build/"

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
```

The upload step gets the `if:` too. Without it, every PR would upload an artifact that never gets deployed.

Two small details:

- **No `${{ }}` needed:** inside `if:`, GitHub evaluates the text as an expression automatically.
- **Single quotes:** strings in expressions must use `'single quotes'`. Double quotes are a syntax error.

I also split `pnpm check`, `pnpm lint` and `pnpm build` into separate steps. When one fails, the Actions UI shows exactly which one, instead of one red "check, lint, and build" box.

I chose one file with conditions over two separate files (`ci.yml` + `deploy.yml`) because otherwise checkout, setup and build would be duplicated in both, and I'd have to keep them in sync.

On a PR, the run page shows `build` ✅ and `deploy` as **skipped**, which is how I check that the conditions work.

## Concurrency: only deploys should wait

Templates put this at the top level of the workflow:

```yaml
concurrency:
  group: 'pages'
  cancel-in-progress: false
```

At the top level it applies to _every_ run, so a PR check would sit in the queue behind a running deploy. It only matters for deploys, where two at once could finish in the wrong order, so I moved it inside the `deploy` job.

```yaml
deploy:
  needs: build
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  concurrency:
    group: 'pages'
    cancel-in-progress: false
```

`cancel-in-progress: false` means a new deploy waits for the running one instead of killing it halfway through.

## Protecting main

CI only helps if I can't skip it. On GitHub, under **Settings → Rules → Rulesets**, I added a ruleset for `main` with:

- **Require a pull request before merging**, so no direct pushes to `main`, even from me.
- **Require status checks to pass**, with the `build` job selected, so a red PR can't be merged.

One gotcha: the status check list was **empty** when I first opened the ruleset. GitHub only offers checks that have already run in the repo, so I had to open a PR first, let `build` report, and then require it. If you rename the job later, update the ruleset too. Otherwise PRs wait forever for a check that never reports.

Also, set **Required approvals to 0** when working alone, because you can't approve your own PR.

Now `main` always matches the live site, and the live site has always passed check, lint and build.

## The step I removed: configure-pages

Most templates include `actions/configure-pages`. It reads the repo's Pages settings and outputs values such as `base_path`. If you pass `static_site_generator: sveltekit`, it also tries to patch your config file. That patching expects `svelte.config.js`, but SvelteKit 3 keeps its config in `vite.config.js`. I wasn't using its outputs, so I dropped it.

## Gotcha: the base path

A project repo deploys to `https://<user>.github.io/<repo>/`, not to the domain root. SvelteKit needs to know that through `paths.base`, and links must use `resolve()` from `$app/paths` instead of hard-coded `/about/` URLs. Otherwise the CSS loads (asset paths are relative by default), but internal links 404. <!-- TODO: link the post/Bitácora entry where I fix this -->

## What's next

- Fix the base path so internal links work under `/portfolio/`.
- Add tests (Vitest, Playwright) to the same `build` job once there's something worth testing.
