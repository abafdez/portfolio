---
title: Signing in to the CMS through a Worker
date: 2026-11-18
phase: 11
tags: [cms, github, security, cloudflare]
---

## What we did

- The CMS now ships with the site: `pnpm build` also builds `/portfolio/admin/`. To sign in there with GitHub it needs a small server, Sveltia's authenticator ([sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)), running as a Cloudflare Worker. These are the steps; I hadn't done them yet when I wrote this.
- **1. Deploy the Worker.** Make a Cloudflare account (the free plan is enough) and press "Deploy to Cloudflare Workers" in the project's README, or clone it and run `wrangler deploy`. The Worker gets a URL like `https://sveltia-cms-auth.<subdomain>.workers.dev`.
- **2. Register a GitHub App.** The README has a link that fills in most of the form. I change two fields: the name (unique on GitHub, 34 characters at most) and the **Redirect URI**, `<worker URL>/callback`. The rest stays as filled in: user tokens expire, no webhook, Contents and Pull requests _read and write_ (pull requests for the editorial workflow), Metadata read-only, installable only on my account. After **Create GitHub App** I copy the **Client ID**, then **Credentials → New secret** for the client secret.
- **3. Install the app** with **Install App → Only select repositories → portfolio**. It can only touch that repository.
- **4. Give the Worker its settings.** In Cloudflare, **Settings → Runtime variables and secrets**: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` (marked as a secret, so the dashboard hides it) and `ALLOWED_DOMAINS=abafdez.github.io`.
- **5. Point the CMS at it.** Uncomment `base_url` under `backend` in `src/lib/cms/config.yml` with the Worker's URL, push, and the next deploy shows "Sign In with GitHub" working.

## What I learned

- **Why a server at all:** swapping GitHub's one-time code for a token needs the client secret, and a secret can't live in a static site: anyone could read it in the JavaScript. GitHub Pages can't run code, so the secret lives in the Worker, and the Worker is the only thing that ever sees it.
- **The script is one file, `src/index.js`,** exporting `fetch(request, env)`: Cloudflare calls it for every request, and `env` holds the variables from step 4. It looks at the path and the method:
  - `GET /auth` (the CMS opens it in a popup): checks that the backend is `github` and that the site asking (`site_id`, the hostname) matches `ALLOWED_DOMAINS` (a `*` becomes a regex wildcard, the rest is escaped). Then it makes a random token, puts it in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie for 10 minutes and in the `state` parameter, and redirects to GitHub's sign-in page with the client ID.
  - `GET /callback` (GitHub sends me back here with a `code` and the same `state`): if `state` doesn't match the cookie, it stops, because someone else started that sign-in (CSRF). Otherwise it posts the code with the client ID and secret to GitHub and gets back an access token and a refresh token.
  - It answers with a tiny HTML page that passes the token to the CMS window with `postMessage`. First the popup says `authorizing:github` to whoever opened it; the CMS answers; the popup checks the **origin of that answer** against `ALLOWED_DOMAINS` and only then sends `authorization:github:success:{…}` to that origin. The browser sets a message's origin and the sender can't fake it, so another site that opens the popup never gets the token. The page is `Cache-Control: no-store` and deletes the cookie.
  - `POST /auth` refreshes: a GitHub App's user token expires after 8 hours, and refreshing it needs the secret too, so the CMS sends the refresh token (valid for 6 months) to the Worker, which adds the secret and asks GitHub. CORS headers only go to allowed origins.
- **GitHub App, not OAuth app:** an OAuth app's token reaches every repository I can push to, private ones too. A GitHub App's token is limited to the repositories it's installed on and the permissions it asked for. Scopes don't apply to it (the script still has them for old OAuth setups).
- **`ALLOWED_DOMAINS` is the lock.** Without it, anyone could use my Worker, and another site could get a token through it.
- **One thing to keep in mind:** the CMS keeps the token in the browser's storage for `abafdez.github.io`, which every GitHub Pages site of my account shares. A script on another of my Pages sites could read it, so those sites only get code I trust.

## Links

- [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth): the README's steps and `src/index.js`
- [Sveltia CMS: GitHub backend](https://sveltiacms.app/en/docs/backends/github)
- [Generating a user access token for a GitHub App](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app)
- [Refreshing user access tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/refreshing-user-access-tokens)
- [Cloudflare Workers: the fetch handler](https://developers.cloudflare.com/workers/runtime-apis/fetch/)
- [MDN: Window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

## Next

- Create the Worker and the GitHub App, uncomment `base_url`, and sign in on the live site. Then save a change and check it opens a pull request (the editorial workflow).
