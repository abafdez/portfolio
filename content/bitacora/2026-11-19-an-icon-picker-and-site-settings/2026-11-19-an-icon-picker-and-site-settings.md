---
title: An icon picker and site settings in the CMS
date: 2026-11-19
phase: 11
tags: [cms, svelte, vite, content]
---

## What we did

- **An icon picker** for the Awesome lists' `icon`: a Sveltia field type (`lucide`) whose control is a Svelte component (`IconPicker.svelte`), mounted from a small React wrapper like the cover's focal field. Search by name, pick from a grid of the real icons, clear. It saves the name as on lucide.dev, which `glyph.server.ts` checks at build time.
- **Lucide's names** come from the package's file names: its `icons` object has PascalCase keys and old aliases of the same icons (2,288 keys for 2,015 icons). A Vite plugin (`lucide-names.ts`) reads the files at build time and serves the list as `virtual:lucide-names`; the drawings come from `lucide`, loaded only when a picker opens.
- **The Awesome lists are a folder collection**: every `.yaml` in `content/awesome/` shows up, and New makes a list named after its English title (`slug: '{{title.en}}'`, editable on create). No more config entry per list; the dev preview follows the open list by slug.
- **Site settings**: the name, tagline, role, hiring texts, contact email and profile links moved from the code and the message files into `content/site.yaml`, a Sveltia singleton ("Site settings"). `src/lib/site.ts` imports `/content/site.yaml?data` through a tiny Vite plugin (`yaml-data.ts`) that parses it at build time, so pages get JSON and no YAML parser; `checkSite()` fails the build on a missing translation, a non-https link or a bad email.
- `writeList()` drops empty top-level fields, so an unset icon or email isn't saved as `''`.
- Tried the CMS with Sveltia's in-browser test backend (temporarily, not committed): the config loads, the picker searches and picks, the settings form shows every field.

## What I learned

- Sveltia renders lower fields lazily: a DOM query found two of three fields, and I briefly blamed a label and a field name before scrolling showed the third one was there.
- A file collection needs every file listed; a folder collection with `extension: yaml` and `create: true` turns a folder into a list with a New button.
- The Color field exists (the browser's native picker, hex), which makes a theme page possible later.

## Next

- The theme page (colours in YAML with Color fields), later.
- A real save from the CMS, to confirm the singleton writes with our `list` format.
