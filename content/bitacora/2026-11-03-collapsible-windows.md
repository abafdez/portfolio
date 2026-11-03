---
title: Skill windows that collapse, and open as you read
date: 2026-11-03
phase: 5
tags: [svelte, accessibility, css, html]
---

## What we did

- Each skill group on `/about` is now a window that collapses (`SkillWindow.svelte`). The title bar is the button, with "expand [+]" or "collapse [-]" on the right.
- Collapsed, a window keeps its name, a new one-line description (in `content/skills.yaml`), chips for its first five skills with "+N more", and every icon in the title bar, like a dock. One light is on, in Mac colors (new tokens): yellow (minimize) while collapsed, green (zoom) while open. It fades and pops (a spring) when it changes.
- Collapsing and expanding animate: the list shrinks while the chips grow, and back. The dock's icons pop in one after another, and when they don't fit the title bar they loop like the logo marquee.
- Windows start collapsed, except the first, and open by themselves as they reach the top two thirds of the screen. Once I open or close one, that's my choice: it's kept in `localStorage` and the window stops opening by itself.
- Generic (Lucide) icons got colors: a hue from a hash of the skill's name, so each keeps the same color everywhere and on every build.

## What I learned

- `hidden="until-found"` hides content but lets find in page (Ctrl+F) search it. On a match, the browser fires `beforematch` on it, and the window opens.
- A `display: none` would stop that search, so the CSS never uses it on the list. Before the JS runs, a collapsed list just sits in a row of height zero (below); the attribute only goes on once the JS runs.
- `@media (scripting: enabled)` again: collapsed only happens with JS. Without it every window is open and the hint is hidden, because the button wouldn't do anything.
- The prerendered page can't know what's on screen, so the server opens the first window, the one you see when the page loads. The rest would have opened after load and shifted the page.
- Opening by itself uses an IntersectionObserver on a region (the top two thirds), not a line: a fast scroll can jump over a line, but where it stops, a window on screen is inside the region.
- `$state(prop)` only takes the prop's first value, and Svelte warns (`state_referenced_locally`). Here that's the point, so the warning is silenced with a comment saying why.
- The button's name for a screen reader is a hidden group name plus the hint ("Languages: collapse"), with `aria-expanded` for the state. The lights, path and icons are `aria-hidden`.
- `height: auto` can't be animated, but a one-row grid can: `grid-template-rows` from `1fr` (the content's height) to `0fr` (nothing). The child needs `min-block-size: 0` and `overflow: clip`; `overflow-clip-margin` keeps the rows' glowing borders from being cut.
- `hidden="until-found"` would hide the list at once, before it could shrink, so it's set on `transitionend`. Transitions inside the list (a bar's bump) bubble up too, so it checks `event.target === event.currentTarget` and the property name. With reduced motion there's no animation to wait for, so it's set straight away.
- An animation runs when its element goes from `display: none` to shown, so the dock icons' pop-in replays on every collapse, with `--i` for the stagger.
- Whether the dock's icons fit is measured with a `ResizeObserver` on the dock (a hidden dock is 0 wide, so it's measured again when it appears). Only then is the second copy rendered.
- `localStorage` can throw (private windows, blocked storage), so every use is in a `try`, and without it the windows just don't remember.

## Problems & fixes

- The section nav highlighted the wrong section after a window opened by itself: the page changed height without a scroll event. It now also updates from a `ResizeObserver` on the body.

## Links

- [MDN: `hidden="until-found"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden)
- [MDN: beforematch](https://developer.mozilla.org/en-US/docs/Web/API/Element/beforematch_event)
- [MDN: aria-expanded](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-expanded)
- [MDN: ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [CSS-Tricks: animating height with grid](https://css-tricks.com/css-grid-can-do-auto-height-transitions/)
- [MDN: overflow-clip-margin](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-clip-margin)
- [Svelte: state_referenced_locally](https://svelte.dev/e/state_referenced_locally)

## Next

- Review the group descriptions in `content/skills.yaml`, then the profile filter and the PR.
