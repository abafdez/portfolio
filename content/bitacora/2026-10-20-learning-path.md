---
title: Planning the portfolio as a learning path
date: 2026-10-20
phase: 0
tags: [planning, sveltekit, workflow]
---

## What we did

- Reviewed the SvelteKit 3 scaffold: adapter-static, runes forced, GitHub Pages CI.
- Planned 10 phases (0–9): workflow → TypeScript → layout/routing → Open Props → Hero → CV → Bitácora (mdsvex) → Blog → Subprojects & Awesome-X → quality/SEO.
- Decided: mdsvex for markdown, switch to TypeScript, Bitácora = short dev log (separate from Blog), I write the code and Claude reviews.
- Created project folders: `.claude/` (skills, agents, project guide), `content/{bitacora,blog,awesome}`.

## What I learned

- Links like `/dev/` can break on GitHub Pages because of the base path. Use `resolve()` from `$app/paths`.
- My CI was deploying on pull requests too, so unreviewed code could go live.
- Git doesn't track empty folders, which is why `.gitkeep` files exist.

## Next

- Phase 0: split CI so PRs only build/check, fix the Open Props link, add `pnpm check`/`lint` to CI, write the README.
