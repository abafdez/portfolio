---
title: An about page with my skills instead of a CV
date: 2026-11-03
phase: 5
tags: [sveltekit, typescript, icons, oklch]
---

## What we did

- Phase 5 changed: no public CV. It has my phone, email and employers, so I send it on request. `/cv` became `/about`: what I work with, grouped (languages, web, databases, mainframe, tools, ways of working, AI workflows, systems, multimedia, spoken languages), with buttons to ask for the CV on LinkedIn or GitHub.
- The skills are data in `src/lib/skills/skills.ts`, apart from the page, like `projects.ts`. Each skill has a name, an icon, a level (1 Learning to 4 Could teach it), a note and evidence: links to a Devlog entry, a tool, an Awesome list or a URL where it shows.
- Two icon libraries: Lucide (`@lucide/svelte`) for generic icons and Simple Icons for brand logos. Simple Icons gives each logo as data (a path and a brand color), so `BrandIcon.svelte` draws it.
- Each logo keeps its brand's hue but takes its lightness from the theme (`--icon-tone`), with OKLCH relative color syntax.
- A skill with more to say is a `<details>`: its row is the `<summary>`, and it opens to the note and the evidence.

## What I learned

- `Evidence` is a union of `{ entry }`, `{ tool }`, `{ list }` and `{ url }`, and `'entry' in evidence` narrows it, so `evidenceHref()` can only build a link that type-checks with `resolve()`.
- `'path' in Icon` tells a Simple Icon (data) from a Lucide icon (a component), so one `icon` field takes both.
- Import Lucide icons one file each (`@lucide/svelte/icons/globe`). The package's index pulls in all 2,000 in dev.
- LinkedIn, VS Code, Adobe and IBM aren't in Simple Icons: the brands asked to be removed. LinkedIn gets a generic message icon.
- `oklch(from var(--icon-tone) l var(--chroma, c) var(--hue, h))` takes the theme color's lightness and swaps in the brand's chroma and hue. A black logo (GitHub) still shows on the dark theme, and every icon has the contrast of the text.
- The hue and chroma come from the hex with the OKLab math (`brand-color.ts`): linear light, then the eye's cone responses, then a and b. Hue is the angle, chroma the distance from gray. Chroma is capped at 0.17, or very saturated brands leave the screen's gamut and get clipped unevenly.
- A screen reader hears the level as a word. The bar is `aria-hidden`, and a visually hidden comma makes it read "CSS, Daily".

## Problems & fixes

- At 320px a long name ("Virtualization") next to "Comfortable" made the page 17px too wide. `minmax(0, 1fr)` lets the name column shrink, and `hyphens: auto` breaks the word.
- The sticky intro was 805px tall, more than the screen. Only the section nav sticks now.

## Links

- [Lucide for Svelte](https://lucide.dev/guide/packages/lucide-svelte)
- [Simple Icons](https://simpleicons.org/) and its [legal disclaimer](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md)
- [MDN: relative colors](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_colors/Relative_colors)
- [Björn Ottosson: OKLab](https://bottosson.github.io/posts/oklab/)
- [TypeScript: narrowing with `in`](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#the-in-operator-narrowing)

## Next

- Review my levels and the intro text, and add what's missing.
