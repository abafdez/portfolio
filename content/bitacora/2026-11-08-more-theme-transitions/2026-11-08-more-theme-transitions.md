---
title: Four more theme transitions, taking turns
date: 2026-11-08
tags: [css, view-transitions, animation, svg]
---

## What we did

- The colour-theme transitions now **take turns** instead of being random (random felt weird): ripple, glitch, scanline, CRT, dither, rain, then again from the start. A counter in `palette-transitions.ts`; a reload starts from the first.
- **Scanline redraw:** a glowing line in the brand colour sweeps down, drawing the new page above it with faint CRT scanlines, then a short flicker.
- **CRT switch-off:** the old page squashes into a bright line, then a dot, on a black screen; the new page grows from the line and opens out.
- **Dither dissolve:** the new page appears through a 4×4 Bayer dither of 6px pixels, one 24px SVG tile that CSS repeats over the screen.
- **Column rain:** each grid column drops the new page in from the top, at its own random moment, speeding up as it falls.
- The CSS moved out of `PalettePicker.svelte` into `src/lib/palette-transitions.css`. Every effect is one function in the `.ts` and one block in the `.css`, with a `--- Effect: name ---` header, so I can delete the ones I don't like.

## What I learned

- **The scanline's line isn't drawn by anything.** The new picture fades out just above the line and the old one fades in just below it, so right at the line both are see-through and the group's background (`--brand`) shows: that's the glow.
- **A custom property can only be animated once it's registered** (`@property --palette-scan { syntax: '<percentage>' }`). Unregistered, it's just text, and text jumps from one value to the next.
- **A Bayer matrix** orders the pixels of a tile so that the first k of them are always spread evenly. Built by doubling the 2×2 matrix (0 2 / 3 1). Small pixels and 64 steps looked like a plain fade; big pixels and 16 steps look like a dither.
- In keyframes, a property only interpolates between the keyframes that set it: the CRT's 70% keyframe sets only `filter`, so the glow fades fast while `scale` keeps going from 60% to 100%.
- `:active-view-transition-type(ripple, dither, rain)` takes a list, so the three SVG-mask effects share one rule.

## Problems & fixes

- **The palette transitions never set `mix-blend-mode: normal`.** The browser blends the two pictures with `plus-lighter`, made for a cross-fade, which brightens the page where both are fully visible. The light/dark toggle already had it; now the shared palette rule has it too.
- The CRT line was dim on a dark page (`brightness(3)` of nearly black is still dark): now `brightness(8)`. Then the whole screen flashed as it opened, so the glow drops to 1.4 by 70%.
- The production build works again, so I checked the themes there: all seven give the same colours as in dev, both modes, also when the toggle forces one (the build rewrites `light-dark()`).
- `pkill -f "vite preview"` never matched: the process is `vite.js preview`. And a pattern that matches the shell's own command line kills the shell. `[v]ite` avoids the second problem.

## Links

- [MDN: @property](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)
- [MDN: mix-blend-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode)
- [Wikipedia: Ordered dithering](https://en.wikipedia.org/wiki/Ordered_dithering)
- [MDN: SVG `<set>`](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/set)

## Next

- Try all six and delete the ones I don't like.
