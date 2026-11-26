---
title: Covers, icons and a timeline that fills
date: 2026-11-19
tags: [css, animation, design-tokens, cms]
---

## What we did

- **Devlog timeline:** three scroll-driven animations in `Timeline.svelte`. A brand line fills down each phase as the middle of the screen passes it, each entry is wiped in from the line as it enters, and its dot pops. Without scroll-driven animations, or with reduced motion, it's the plain grey line.
- **Project covers:** a dark-theme screenshot of each project (1600 × 900, the site's header and footer hidden, no personal data: the CV builder was empty), saved as `content/projects/<slug>/cover.avif` with sharp. The existing cover code finds them by folder, like a post's; the alt text is `cover: { en, es }` in `projects.ts`, and a test fails if one comes without the other. Shown on `/projects` and on the home page's featured projects.
- **Awesome list icons:** `icon:` (a Lucide name) or `logo:` (a Simple Icons slug) in each list's YAML, resolved at build time by `glyph.server.ts`, which fails on a name that doesn't exist. Drawn by `Glyph.svelte` in the card's tile (with a soft brand glow) and beside the list's title. Sparkles for AI, the CSS and Svelte logos, a globe for the web platform.
- **The CMS** only listed Modern CSS: the three lists from yesterday had no editor. All four now share one set of fields (a YAML anchor), with the two icon fields.
- Started the day on a new branch, `feat/covers-icons-and-motion`, from an up-to-date `main`.

## What I learned

- `view(50% 50%)` shrinks the viewport to a line across its middle, so `animation-range: cover 0% cover 100%` runs from the list's top reaching the middle of the screen to its bottom leaving it: a progress bar for reading.
- A `clip-path` wipe on an entry also clips anything drawn outside its box, like the timeline dot. The inset needs room on that side, at both ends of the animation (`inset()` doesn't interpolate to `none`).
- A more specific selector added for one layout (`.thumbnail:has(.tile.glyph)`) also beat the rule for the other layout, the square beside the text, so it had to be added there too.

## Next

- Decide what to do with the CMS questions: an icon picker field, an entry collection for the Awesome lists, branding and theme colours in data files.
