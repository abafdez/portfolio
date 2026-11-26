---
title: A CMS on a GitHub Pages site
date: 2026-11-18
tags: [cms, github, security, vite]
description: My CMS only ran in development. Now it's built into the live site at /admin, as a second Vite build, and GitHub sign-in goes through a small Cloudflare Worker that keeps the one secret a static site can't.
---

My site's CMS, [Sveltia](https://sveltiacms.app/en/docs), edits the posts, the Devlog and the Awesome lists. Until now it only ran in development: `pnpm dev`, open `/admin`, pick the repo folder. Useful at my desk, useless anywhere else. Now it's part of the live site.

## A second build

`/admin` isn't a SvelteKit page on purpose: the root layout and the site's CSS would wrap it, and it has nothing to do with them. So `pnpm build` runs two builds:

```json
"build": "vite build && vite build -c src/lib/cms/vite.config.ts"
```

The second is a plain Vite build with the Svelte plugin and enhanced images, rooted in the CMS folder, writing `build/admin/`. The deploy uploads `build/`, so the CMS goes live with no change to the workflow. It's about 23 MB of files, mostly code highlighting languages loaded on demand; the CMS page itself loads a fraction of that.

One file is swapped in that build. In development the CMS preview reads post covers from the dev server. Shipping all 57 original covers again just for the preview would be 23 MB of pictures, so a small `resolveId` plugin replaces that module with one that points at the covers on `raw.githubusercontent.com`.

## The secret a static site can't keep

To sign in with GitHub, the site has to trade GitHub's one-time code for a token, and that trade needs the app's client secret. A secret can't live in a static site, where anyone can read the JavaScript, and GitHub Pages can't run code. So Sveltia's authenticator, a single-file script, runs as a Cloudflare Worker and is the only thing that ever holds it.

The Worker does four things:

- `/auth` checks that the site asking is one I allow, stores a random token in a short-lived cookie and in the `state` parameter (against CSRF), and redirects to GitHub.
- `/callback` checks that `state` matches the cookie, then trades the code for an access token and a refresh token.
- Its answer is a tiny page that hands the token to the CMS window with `postMessage`, but only to an allowed origin. The browser sets a message's origin, so another site can't fake it.
- A GitHub App's token expires after eight hours, and refreshing it needs the secret too, so the Worker refreshes it as well.

It's a GitHub App, not an OAuth app, so its token only reaches the repository it's installed on, with the permissions it asked for: contents and pull requests.

## One thing to keep in mind

The CMS keeps its token in the browser's storage for `abafdez.github.io`, and every GitHub Pages site of my account shares that origin. A script on another of my Pages sites could read it, so those sites only get code I trust.
