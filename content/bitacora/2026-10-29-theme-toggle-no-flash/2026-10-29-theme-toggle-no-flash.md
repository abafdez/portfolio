---
title: A theme toggle that doesn't flash
date: 2026-10-29
phase: 3
tags: [svelte, dark-mode, accessibility, localstorage]
---

## What we did

- Added a blocking inline `<script>` in `app.html` that reads `localStorage.theme` and sets `data-theme` on `<html>` before the first paint.
- Built `ThemeToggle.svelte`: `$state` for the theme, `onMount` to sync the button with the current theme, and `toggle()` to update the state, the attribute and `localStorage`.
- Put the toggle in the header. Tested on the built site: the choice persists across pages and reloads without a flash.

## What I learned

- The flash: prerendered HTML has no `data-theme`, so the first paint follows the OS. SvelteKit's JS runs later, as module scripts after parsing, and switches the theme.
- A plain inline `<script>` in `<head>` blocks parsing, so it runs before `<body>` is painted. Component code runs after hydration, which is too late.
- `localStorage` is outside data: validate it (`'light' | 'dark'`), and wrap access in `try` because it can throw when storage is blocked.
- Prerendering runs with no visitor, so `theme` starts as `undefined` and the button is disabled until `onMount`. Starting it as `'light'` would bake the wrong `aria-pressed` into the HTML for dark-OS visitors.
- The inline script decides the colors. `onMount` only syncs the button with what the script already did.
- Accessible toggle: a `<button>` with a fixed label and `aria-pressed`. A label that flips between "Light" and "Dark" is ambiguous: is it the current state or the action?
- The OS theme is already detected with no JS, through `color-scheme: light dark`. JS only handles the user's override.

## Decisions

- One button, not a three-way control. If the site ever gets a settings panel, "Use system setting" goes there. I read the 2026 debate before deciding:
  - Lea Verou argues for two visible states (the system theme and its opposite), and later that most sites don't need a toggle at all.
  - Bramus makes the case for showing all three states (system, light, dark).
  - Kilian Valkhof's older post argues the toggle must have a way back to "system".
- I went with Lea's model. The button switches between the system theme and its opposite. Clicking back to the theme that matches the OS deletes the override (both `data-theme` and `localStorage`), so the site follows the OS again. One button, and there's still a way back to "system".
- A `matchMedia` `change` listener keeps the button in sync if the OS theme changes while the page is open.

## Problems & fixes

- My first browser test of the new version showed the old behavior. A preview server from an earlier test was still holding the port and serving the old build. When a test result makes no sense, check what's actually being served.
- The OS-change test failed at first because the `change` event fires a moment after the switch, and the test read the button too early. It passed after waiting 100 ms.

## Links

- [Lea Verou: Dark mode toggles: two states are enough](https://lea.verou.me/blog/2026/dark-mode-toggles/)
- [Lea Verou: The best dark mode toggle is probably none](https://lea.verou.me/blog/2026/dark-mode-toggles-2/)
- [Bramus: The case for tri-state dark mode toggles](https://www.bram.us/2026/08/18/the-case-for-tri-state-dark-mode-toggles/)
- [Kilian Valkhof: Your dark mode toggle is broken](https://kilianvalkhof.com/2020/design/your-dark-mode-toggle-is-broken/)
- [MDN: aria-pressed](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed)

## Next

- Self-host fonts.
