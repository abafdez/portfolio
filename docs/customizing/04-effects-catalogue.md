# 4. The effects catalogue

Every animation and effect on the site: what you see, where its code is, the technique, how to turn it off, and what happens with reduced motion or without JavaScript. Chapter 5 goes deeper into the page and theme transitions; chapter 6 extracts the techniques so you can reuse them.

## How effects are switched off in general

Before the list, the three switches every effect respects:

1. **Reduced motion.** `global.css` has a safety net in its `reset` layer: under `prefers-reduced-motion: reduce`, every CSS animation and transition finishes in 0.01 ms. On top of that, most effects only start inside `@media (prefers-reduced-motion: no-preference)`, and scripted ones check `matchMedia('(prefers-reduced-motion: reduce)')` or Svelte's `prefersReducedMotion` from `svelte/motion`. View transitions check it in `canTransition()` (`src/lib/view-transitions.ts`), because `*` doesn't match `::view-transition-*` pseudo-elements, so the safety net can't reach them.
2. **No JavaScript.** Effects that need script are hidden or folded only under `@media (scripting: enabled)`, or are `disabled` until `onMount` runs. Without JS the content is all there, just still.
3. **Missing CSS features.** Scroll-driven animations sit inside `@supports (animation-timeline: scroll())` or `view()`; anchor positioning has an `@supports not` fallback; view transitions check for `ViewTransition` with `types`.

To test them: DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion", and Settings → Debugger → "Disable JavaScript".

---

## Everywhere

### The blueprint grid and its spotlight

- **You see:** a faint grid behind every page (minor lines, a major line every 4 cells, a "+" at major crossings), fading towards the bottom. With a mouse, the grid lights up in the brand colour around the pointer.
- **Files:** `src/lib/components/Blueprint.svelte` (drawn once in the root layout); the colours are tokens in `tokens.css` (`--grid-*`, `--grid-spot-*`, `--grid-size`).
- **Technique:** two `linear-gradient` backgrounds with hard stops make one 1 px line per tile; `background-size` repeats it. The "+" marks are an SVG used as a `mask-image` over a `background-color`, intersected (`mask-composite: intersect`) with a radial fade. The spotlight is the same grid in other colours, masked to a circle at `--x`/`--y`, which a `pointermove` listener on the window sets. Only for `event.pointerType === 'mouse'`, and the layer only exists under `@media (hover: hover) and (pointer: fine)`.
- **Turn off:** the spotlight, delete the `.spot` div (or its `@media (hover…)` block); the whole grid, remove `<Blueprint />` from `src/routes/+layout.svelte`; make it fainter or stronger with the `--grid-*` tokens. Not printed.
- **Careful:** the header's nav sits on the grid, so the spotlight counts as its background: `palettes.test.ts` checks text contrast at the spotlight's brightest point.

### The header that lifts off

- **You see:** at the top of the page the header sits flat; over the first 5rem of scrolling it becomes a floating, blurred, rounded bar with a shadow.
- **Files:** `src/lib/components/Header.svelte` (`@keyframes header-detach`).
- **Technique:** a scroll-driven animation: `animation-timeline: scroll()` ties the animation's progress to the page's scroll position, and `animation-range: 0 var(--size-10)` says it runs over the first 5rem. The keyframes only have a `from` (flat, transparent); the end state is the bar's normal style, which is also what you get without the feature.
- **Turn off:** delete the `@supports (animation-timeline: scroll())` block, and the header is always the floating bar. Sticky only from 48rem (on phones it's two rows tall).

### Smooth scrolling for in-page links

- **Files:** `global.css` (`html[data-smooth-scroll] { scroll-behavior: smooth }`), the root layout (`onNavigate` removes the attribute, `afterNavigate` sets it a frame later).
- **Why the attribute:** SvelteKit scrolls too, to the top of a new page or back where you were after a reload, and a smooth scroll would turn that jump into a glide. So smooth scrolling is only on between navigations.
- **Turn off:** delete the rule in `global.css`.

### Page transitions, the nav marker, cards that become pages

See chapter 5. In short: every route change is a view transition of type `route` (the page fades and rises, the header stays, the current section's pill in the nav slides to the new link), and a post or project card turns into the page it opens (type `morph`). Turn them off by returning early from `onNavigate` in `src/routes/+layout.svelte`.

### The light/dark circle

- **You see:** clicking the sun/moon, the new theme grows out of the button in a circle with a soft edge.
- **Files:** `src/lib/components/ThemeToggle.svelte`; `Header.svelte` passes `duration={500} blur={50}`.
- **Technique:** a view transition of type `theme`; the new picture is masked by a `radial-gradient` whose radius is a registered custom property (`@property --reveal-radius`), animated from 0 to past the farthest corner.
- **Change:** `duration` and `blur` props on `<ThemeToggle>`. **Turn off:** make `toggle()` call `flip()` directly.

### Colour-theme transitions: ripple, glitch, scanline, rain

- **You see:** picking a colour theme (or switching language), the page changes with one of four effects, taking turns: a ripple of grid squares from the radio you picked, a glitch with colour-split bands, a scan line redrawing the page from top to bottom, or columns raining down.
- **Files:** `src/lib/palette-transitions.ts` (one function per effect, the `effects` object sets the order), `src/lib/palette-transitions.css` (one `--- Effect: name ---` block each), the SVG filter `#palette-rgb-split` in `PalettePicker.svelte` (used by the glitch).
- **Turn off one:** delete its function, its line in `effects`, and its CSS block. **Use only one:** pass it as the third argument of `transitionPalette()`. **Turn all off:** make `transitionPalette()` call `change()` directly.

### The language switch effect

The language link (`LanguageSwitch.svelte`) is a normal navigation; the root layout's `onNavigate` sees the language changed and runs `transitionPalette()` instead of the route transition, starting from the switch. So it takes turns with the colour-theme effects.

### Search

- **You see:** the magnifying glass opens a box that drops from under it (fade, slide, springy scale), the page dims a little, results rise in one after another, and a result's title and excerpt fly into the page it opens.
- **Files:** `src/lib/components/Search.svelte` (markup and all its CSS), `src/lib/search.ts` (Pagefind), `src/lib/morph.ts` (`leave()`).
- **Technique:** a `popovertarget` popover; `@starting-style` plus `transition-behavior: allow-discrete` on `display` and `overlay` to animate it in and out; a staggered `animation-delay: calc(var(--index) * 35ms)`; results are `a[data-morph-card]` (chapter 5).
- **Turn off:** the animations are all inside one `@media (prefers-reduced-motion: no-preference)` block in `Search.svelte`; remove `data-morph-card` from the result link to stop the fly-in.

### The footer: the handle, the panel and its looks

- **The handle** (`Footer.svelte`, `.hint`): a faint grip at the bottom centre. A `pointermove` listener writes `--near` (0 → 1 over the last 10rem of the window, once a frame) on it, and its CSS grows, lifts, colours and labels it from that one number. It fades out as the footer enters (a view timeline on the footer, `animation-timeline: --footer`). Only shown where scroll-driven animations work. **Turn off:** delete `.hint-wrap` from the markup.
- **The bar's button** (`.more`): a brand pill; a light band sweeps across it every 5 s (`@keyframes shine`, shared with `.shine` buttons in the panel) and its arrow bobs.
- **The panel** (`#about-panel`): a bottom-sheet popover that slides up (`@starting-style`, `allow-discrete`), with a dimmed backdrop; its columns rise in one after another. `overflow: hidden auto` so nothing in it can make it scroll sideways.
- **The columns' borders:** a 1 px ring over each border (`section::before`, masked to the edge). Who I am and Elsewhere: a light that follows the pointer (the `spotlight` attachment on `.columns`). Hire me: a beam running round (a conic gradient whose angle is the registered `--beam`). Elsewhere's links pop their icons on hover.
- **The looks** of the top card, one per opening, in `src/lib/components/hire/` (listed in `looks.ts`, lazy loaded):
  - `Terminal.svelte`: types three commands (`setTimeout` per character), the photo sharpens from pixels on a `<canvas>`.
  - `Spotlight.svelte`: photo in a conic ring turned by a registered `--ring-angle`, a grid lit under the pointer, counters that count up (`requestAnimationFrame`).
  - `BusinessCard.svelte`: flips with `rotate: y 180deg` and `backface-visibility: hidden`; the hidden face is `inert`.
  - `OpenToWork.svelte`: a pinging status dot, the photo glitches with the colour themes' SVG filter, a magnetic button (`magnet()` in `tilt.ts`) with CSS sparkles.
  - `IdCard.svelte`: tilts toward the pointer (`tilt()`: it starts leaning before the pointer arrives, measures the untilted card so it doesn't bounce at the edges, and eases in script), parts at different `translateZ` depths inside `transform-style: preserve-3d`, a foil sheen at the pointer as strong as the tilt.
- **Turn off a look:** delete its line in `looks.ts`. **Always the same look:** set `look` in `Footer.svelte` to a fixed index instead of rotating.

### Buttons and links that react

Small hover effects are local to their components: the nav underline, the `.button` lift in the footer panel, the theme menu's keys. Search for `:hover` in the component.

---

## Home page (`src/routes/+page.svelte`)

### Entrance

- **You see:** the photo, the text, the section links and each section fade and slide up, one after another.
- **Technique:** one `@keyframes -global-home-enter` (the `-global-` prefix keeps its name, so another component can use it) and a helper `enter(delay)` that returns an `animation` value. The page passes it to `Hero` as CSS custom properties: `<Hero --photo-animation={enter(0)} --text-animation={enter(150)} />`, and `Hero.svelte` applies `animation: var(--photo-animation, none)`. Nothing passed means no animation, so `Hero` stays reusable.
- **Turn off:** remove the `--photo-animation`/`--text-animation` props and the `style:animation` attributes.

### Sections revealed as you scroll

- **Technique:** `animation-timeline: view()` with `animation-range: entry 0% entry 80%`: each section's grid is wiped in from the top (`clip-path: inset(0 0 100% 0)` → `inset(0)`) as it enters the screen. A wipe, not a fade: Lighthouse measured below-the-fold text at `opacity: 0` as failing contrast.
- **Turn off:** delete the `@supports (animation-timeline: view())` block.

### Scroll snapping and the section nav

- **Snapping:** on wide screens, `scroll-snap-type: y proximity` on `html` (only while this page is open, through `:global(html:has(.landing))`), so the page settles on a section when you stop near it.
- **Scroll-spy:** `src/lib/components/SectionNav.svelte` highlights the section you're reading: the last one whose top passed a third of the screen, worked out from positions on every scroll and on resize, not from an IntersectionObserver (which a fast scroll could skip).

---

## About page (`/about`)

| Effect                                                                  | Files                                    | Technique                                                                                                                                                                                                                                                                               | Turn off                           |
| ----------------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Skill bars fill up once on screen, in a cascade                         | `src/lib/skills/fill.ts`, `Skill.svelte` | One shared `IntersectionObserver` marks each bar `data-filling` with a `--delay` 70 ms apart; `@keyframes count-up` animates a `clip-path: inset()` from empty to the level. The bar starts empty only under `@media (scripting: enabled) and (prefers-reduced-motion: no-preference)`. | Remove `{@attach fillOnView}`      |
| A blinking block cursor and a springy "bump" on hover                   | `Skill.svelte`                           | `steps(1)` blink on the last tick; `scale` with a spring easing                                                                                                                                                                                                                         | the `:hover` rules                 |
| A light on the row borders that follows the pointer                     | `src/lib/spotlight.ts`, `Skill.svelte`   | the `spotlight` attachment sets `--x`/`--y` on every row; a 1 px masked ring with a radial gradient                                                                                                                                                                                     | Remove `{@attach spotlight}`       |
| Skill windows collapse and expand                                       | `SkillWindow.svelte`                     | one-row grid `grid-template-rows: 1fr ↔ 0fr`; `hidden="until-found"` after it shuts, so find-in-page still opens it (`beforematch`); windows open by themselves when they reach the top two thirds (IntersectionObserver), unless you chose                                             |                                    |
| The dock of icons in a collapsed title bar, looping when it doesn't fit | `SkillWindow.svelte`                     | icons pop in staggered; two copies slide when a `ResizeObserver` says they overflow                                                                                                                                                                                                     |                                    |
| The logo marquee                                                        | `src/lib/skills/LogoMarquee.svelte`      | the list twice; the track slides by half its width and starts over (60 s); it stands still under reduced motion                                                                                                                                                                         | delete `<LogoMarquee>` in `/about` |
| The profile filter                                                      | `/about` `+page.svelte`                  | radios styled with `:has(:checked)`; the choice in `?profile=`, written with a shallow `goto`                                                                                                                                                                                           |                                    |

---

## Lists, cards and posts

- **Cards** (`src/lib/components/TeaserCard.svelte`): the whole card is a link (the title's `a::after` stretches over it; tags sit above with `z-index`); the layout follows the card's own width (a container query at 34rem: thumbnail beside or on top). Cards are morph sources (chapter 5).
- **The tag column** (`TagCloud.svelte`, `TagColumns.svelte`): folded to a few rows with a `mask-image` fading the last row into a "+" button (only with JS); the hidden tags are `inert`; opening animates `max-block-size` to the measured height. Chips have the spotlight ring and a tint of their tag's hue (`src/lib/hue.ts`).
- **Code blocks** (`src/lib/markdown/CodeBlock.svelte`, `copy.ts`): the copy button is in the HTML, `hidden`, and the `copyCode` attachment shows it only if the browser can copy.
- **Callouts** (`> [!tip]`): no motion; colours from `--callout-*`.

---

## Projects

- **The 404 games** (`src/lib/projects/not-found/`): Breakout, Snake, an ASCII wave and loose dots, one at random on the 404, all four on `/projects/404`. Rules in plain TS, drawing on canvases with the helpers in `canvas.ts` (chapter 6). Animations hold still under reduced motion; games only move when you play. **Turn off one:** delete its line in `variants.ts`.
- **The cursors tool** (`src/lib/projects/toolbox/cursors/`): animated cursors (frames swapped by an interval while hovered) and twelve pointer effects in `effects.ts`: trail, sparkles, ghost, dot and ring, ripple, burst (canvas), spotlight, flashlight, invert, parallax (CSS reading `--x --y --dx --dy`), magnetic and tilt (moving `[data-magnetic]` / `[data-tilt]`). `pointerEffect()` is an attachment you can reuse (chapter 6).
- **The contrast checker** reads the live tokens through a hidden probe and a 1 × 1 canvas; no animation.

## The mascot

`src/lib/components/Mascot.svelte` is an original SVG mascot (costumes per section), shown only on the review page `/mascot` (`noindex`) while it's designed (`design/mascot.md`). Nothing else uses it yet.
