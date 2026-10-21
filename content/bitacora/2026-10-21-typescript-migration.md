---
title: Migrating from JS + JSDoc to TypeScript
date: 2026-10-21
phase: 1
tags: [typescript, sveltekit, svelte]
---

## What we did

- Renamed `jsconfig.json` → `tsconfig.json` and pointed the `check` scripts at it.
- Renamed `vite.config.js`, `src/routes/+layout.js` and `src/lib/index.js` to `.ts`. Updated the `#lib` entry in the `imports` map in `package.json`.
- Switched `+layout.svelte` to `<script lang="ts">` and typed `$props()` with `Snippet`.
- Documented the `App` interfaces in `app.d.ts`.

## What I learned

- **0 errors doesn't mean typed.** After removing the JSDoc, `children` was silently `any` and svelte-check still passed.
- `import type` is erased at build time. It only exists for the type checker.
- `app.d.ts` holds global types. `export {}` makes the file a module, so `declare global` is needed to make `App.*` visible everywhere.
- On a static site, `Locals` and `Platform` are effectively unused because there's no server at runtime. `PageData`, `PageState` and `Error` can still matter client-side.
- Git shows renames as delete + add until the files are staged. `git mv` records them directly.

## Problems & fixes

- `pnpm lint` failed because `package.json` lost its final newline after the edit. Fixed with `pnpm format`.

## Next

- Phase 2: layout, routing and base path (`resolve()` from `$app/paths`).
