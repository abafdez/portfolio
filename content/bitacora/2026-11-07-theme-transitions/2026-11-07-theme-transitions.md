---
title: Glitch and grid ripple theme transitions
date: 2026-11-07
tags: [css, view-transitions, animation, svg]
---

## What we did

- Changing the **colour theme** now plays one of two transitions, picked at random each time, starting from the radio you picked. The light/dark toggle keeps its circle (one effect per control, my call).
- **Grid ripple:** the blueprint grid's cells flip to the new theme in a wave from the radio, with a pixelated edge. The new page is drawn through a mask: an SVG the size of the screen, one square per grid cell, each fading in with `<animate>` after a delay that grows with its distance (plus some randomness). Cells with the same delay share one `<path>`, so there are ~30 animations, not thousands.
- **Glitch:** for 450 ms the new page shows only in random horizontal bands, shifted sideways, some frames with the colour channels split (an SVG filter: red left, green and blue right, blended with screen), then it settles. The bands and shifts are random each time: JS makes them and hands them to the keyframes as custom properties.
- Both live in `src/lib/palette-transitions.ts`; the CSS is in `PalettePicker.svelte`, scoped with view transition types (`palette` plus the effect's name). Reduced motion: no transition, the colours just change.
- The picker shows names only; the credit is a hover hint (`title`: "Tokyo Night by Enkia"). The licence notices are in `themes/_licences.css` so the build keeps them.

## What I learned

- **A view transition is two pictures**, the page before and after, as `::view-transition-old(root)` and `::view-transition-new(root)`. Anything that can style an image can be the effect: a mask, a filter, `translate`. The GIF-mask trick I saw is the same idea: a moving image as the mask of the new picture.
- **An SVG used as a CSS image runs its own animations.** So a generated SVG with `<animate>` in it is a self-animating mask, with no JavaScript running per frame.
- **`steps(1, end)`** makes every keyframe a jump instead of a fade, which is what makes a glitch look broken.
- `:active-view-transition-type(name)` scopes CSS to one kind of transition, so the circle, the route change and these effects never meet.
- To see a 450 ms effect, I paused it: the transition's animations are in `document.getAnimations()`, so `pause()` and `currentTime` freeze any frame. Chrome's screencast (CDP) captured the rest frame by frame.

## Problems & fixes

- **Quick changes (arrow keys) broke the next effect:** a new transition skips the running one, whose clean-up then removed the properties the new one had just set. Now only the latest transition cleans up, and it removes everything any of them set.
- A skipped transition rejects its `ready` promise ("Transition was skipped"), which showed as a console error. It's expected, so it's caught, in the palette picker and in the light/dark toggle (three quick clicks did the same).
- The licence comments vanished from the built CSS: the minifier keeps only a `/*! */` comment at the very start of the bundle. The theme files are first in the bundle (the glob's imports come before `tokens.css`), so the notices are in `_licences.css`, which sorts first.

## Links

- [MDN: View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [MDN: :active-view-transition-type()](https://developer.mozilla.org/en-US/docs/Web/CSS/:active-view-transition-type)
- [MDN: mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image)
- [MDN: SVG `<animate>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate)
- [Ian Duffy: a theme switcher with view transitions](https://iankduffy.com/articles/creating-a-theme-switcher-using-view-transition) and [theme toggle effects](https://theme-toggle.rdsx.dev/), where the ideas came from

## Next

- More effects (CRT scanlines, dither dissolve), or the mascot as a mask once it's designed.
