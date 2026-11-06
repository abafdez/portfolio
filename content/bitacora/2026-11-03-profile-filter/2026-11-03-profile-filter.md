---
title: A profile filter on /about
date: 2026-11-03
phase: 5.5
tags: [svelte, css, accessibility]
---

## What we did

- `/about` can show only the skills for one kind of job: `?profile=web`, `support` or `mainframe` (the ids from `content/skills.yaml`). A group left with no skills disappears, and so does its link in the side nav.
- The picker is a radio group (`fieldset` + `legend` "Show skills for"), with "Everything" first, and a count (`13 of 93 skills`, `role="status"`). On wide screens it sticks with the nav, so I can switch halfway down the page.
- Like the Awesome filters: the profile is read from the URL in `onMount` and written back with `goto(url, { shallow: true, replace: true })`. "Everything" removes the param. An unknown `?profile=` shows everything.
- The logo marquee isn't filtered: it's decoration, and a profile with few logos would leave gaps in the loop.

## What I learned

- One `$state` (`profile`), everything else `$derived` from it: the groups, the nav sections, the count. If I updated the nav by hand in `pick()`, I'd also have to do it in `onMount` and anywhere else that changes the profile, and forgetting one leaves the nav out of step with the windows. Store the least state, compute the rest.
- TypeScript narrows `profile` after `if (!profile)`, but not inside a callback (it could run later, when `profile` has changed). Copying it into a `const` first keeps the narrowing.
- Radios for one choice, `aria-pressed` toggles for several. Radios come with arrow keys, one Tab stop for the group, and "radio button, 2 of 4" in a screen reader.
- The input is hidden with `opacity: 0`, not `display: none`: `display: none` takes it out of the tab order and the accessibility tree. The label is what you see, styled with `label:has(:checked)` and `label:has(:focus-visible)`.
- The page is prerendered once, at build time, into one `about.html` that GitHub Pages serves for every query string. There's no `?profile=` while prerendering, so only the browser can read it (`onMount`). Without JS: every skill, every window open, no filter.

## Links

- [Svelte: `$derived`](https://svelte.dev/docs/svelte/$derived)
- [MDN: `:has()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:has)
- [APG: radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [SvelteKit: shallow routing](https://svelte.dev/docs/kit/shallow-routing)

## Next

- The `/projects/cv` tool: pick a profile, and the skills come from the YAML, strongest first.
