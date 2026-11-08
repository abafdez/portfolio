---
title: 'Caching between GitHub Actions runs: where it lives and how long'
date: 2026-11-06
tags: [ci, github-actions, caching, images]
description: "My build processes every image again on every run. How actions/cache keeps work between runs: where it's stored, when it disappears, which branches can see it, and a key that only redoes new images."
cover: A glowing cache box between a timer and build artifacts, labelled cache hit.
---

My site's images are processed when it builds: each cover becomes 16 files (three widths in three formats, two square crops, and a JPEG for link previews), and each image in a post becomes 6. On my machine the results are kept in `node_modules/.cache/imagetools`, so the second build skips them. With one cover, a build took 6.5 seconds with an empty cache and 5.0 with a full one: about a second per cover.

On GitHub Actions, though, every run starts on a **fresh virtual machine**. Nothing from the last run is there, so every image is processed again, every time. Today that's nothing: no published post has images yet. With dozens of posts it would be a minute per run.

That's what [`actions/cache`](https://github.com/actions/cache) is for.

## What it does

```yaml
- name: Restore processed images
  uses: actions/cache@v6
  with:
    path: node_modules/.cache/imagetools
    key: images-${{ hashFiles('content/**/*.png', 'content/**/*.jpg', 'content/**/*.webp') }}
    restore-keys: images-
```

It works in two halves:

1. **At its step, it restores.** It looks for a saved cache whose name is exactly `key`. If there's one (a _cache hit_), it downloads it and unpacks it into `path`. If not, it tries each line of `restore-keys` as a **prefix**: `images-` matches any key starting with `images-`, and the most recent one wins.
2. **At the end of the job, it saves.** If there was no exact hit, and only if the job succeeded, it packs `path` and uploads it under `key`. If there was an exact hit, nothing is saved: that cache already exists.

A saved cache can never be changed. New contents always need a new key. That's why the key includes a hash of the files the cache depends on: `hashFiles()` turns all my images into one short fingerprint, and adding or changing an image changes it.

## Where it lives

Not in the repository. A cache is stored in GitHub's cache service, next to the repo but not in it: it's not in git, not in the history, not in a clone, and it doesn't count towards the repo's size. The repo's **Actions → Caches** page lists them, with their sizes and when they were last used, and has a button to delete each one. Deleting one is always safe: the next run just does the work again.

<!-- TODO: a screenshot of the Caches page once there is one -->

It's also not the same as an **artifact**. My workflow already uses one: the build job uploads `build/` as an artifact, and the deploy job publishes it. An artifact passes files **within one run**, from job to job, and is kept for a fixed time. A cache passes files **between runs**, and may disappear whenever GitHub needs the space.

## How long it lasts

- A cache that **nobody uses for 7 days** is deleted.
- A repository gets **10 GB** of caches. Over that, the ones used least recently are deleted first.

So it's a speed-up, never storage. The build must work without it, and it does: with no cache, it just processes everything.

## Who can see it

This was the part I didn't expect. A cache belongs to the **branch** that made it:

- A run can restore caches from **its own branch** and from the **default branch** (`main`).
- A run for a **pull request** can also restore caches from the PR's base branch. But a cache it _saves_ belongs to the PR's merge ref (`refs/pull/12/merge`): only re-runs of that same PR can use it. Not `main`, not other PRs.
- Sibling branches can't see each other's caches.

For my workflow that works out well. A push to `main` (every merge) saves a cache in `main`'s scope. Every PR restores it, so it only processes the images that PR adds. After the merge, `main` restores its previous cache with `restore-keys`, processes the new images, and saves a new cache.

One more thing: anyone who can open a pull request can read the caches of the branch it targets. On a public repository, that's anyone. Never cache anything secret. Processed versions of images that are on my public site anyway are fine.

## The key, more carefully

The key above has a problem. Say I update `sharp`, the library that processes the images, and it starts making slightly different (better) files. My images haven't changed, so the key is the same, and the old cache is restored: new code, old results.

The fix: make the image library's version part of the key and of the restore prefix. Its version is in `pnpm-lock.yaml`:

```yaml
- name: Restore processed images
  uses: actions/cache@v6
  with:
    path: node_modules/.cache/imagetools
    key: images-${{ hashFiles('pnpm-lock.yaml') }}-${{ hashFiles('content/**/*.png', 'content/**/*.jpg', 'content/**/*.webp') }}
    restore-keys: images-${{ hashFiles('pnpm-lock.yaml') }}-
```

- Same dependencies, new image: the exact key misses, the prefix matches the last cache with the same dependencies, and only the new image is processed.
- New dependencies: nothing matches the prefix, so everything is processed again, once, with the new versions.

(Any change to the lockfile starts over, not only `sharp`'s. For a site this size that's fine.)

The cache folder only grows: imagetools keeps every result forever by default, so a deleted image's files stay in it. To start fresh, rename the prefix (`images-v2-`) or delete the caches on the Caches page.

The step goes after the one that installs dependencies and before the build.

<!-- TODO: once there are images: add the step, and compare the Build step's time with and without the cache -->

## Does reprocessing change the files?

One worry: if CI processes an image again, do visitors get a "new" file and download it again? I tested it:

- I built with the image cache, then with the cache folder deleted, and compared the image files: same names, same bytes.
- I compared my local build's file names with the live site's, which GitHub's runner built: the same six names for my avatar.

Image processing is **deterministic**: the same image, settings and library versions give exactly the same bytes, on any machine. And since the name is a hash of the content, the same bytes mean the same name, so a visitor's browser sees the file it already has.

Files only change when something real changes: I edit the image, change the settings (widths, formats, the crop), or update the library that encodes them. Then the name changes too, and visitors download the new version once.

So the CI cache only saves **build time**. Cached or freshly made, visitors get the same files.

## The cache I already had

My setup step has `cache: true`:

```yaml
- uses: pnpm/setup@v3.0.0
  with:
    cache: true
    runtime: node@22
```

That's the same mechanism for my dependencies: it caches pnpm's package store, with the lockfile in the key. It's why installing takes seconds instead of a minute. It just doesn't cover anything my build makes.

## Links

- [GitHub Docs: dependency caching reference](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)
- [actions/cache](https://github.com/actions/cache)
- [GitHub Docs: managing caches](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manage-caches)
- [Does every deploy bust my visitors' cache?](./2026-11-06-does-a-deploy-bust-the-cache)
- [Deploying SvelteKit 3 to GitHub Pages](./2026-10-20-sveltekit-3-github-pages-workflow)
