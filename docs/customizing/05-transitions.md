# 5. Transitions between pages and themes

Four kinds of transition use the **View Transition API**: route changes, cards that become pages, the light/dark circle, and the colour-theme effects. This chapter explains the API as this site uses it, then each one, then how to add your own.

## The API in five minutes

```js
const transition = document.startViewTransition({
	update: () => changeTheDom(),
	types: ['route']
});
```

1. The browser takes a picture of the page as it is ("old").
2. It calls `update()`. You change the DOM; it can be async, and the browser waits.
3. It takes a picture of the new page ("new") and builds a tree of pseudo-elements on top of everything:

```text
::view-transition
└─ ::view-transition-group(root)
   └─ ::view-transition-image-pair(root)
      ├─ ::view-transition-old(root)
      └─ ::view-transition-new(root)
```

4. By default it crossfades old into new. You change that with CSS on those pseudo-elements.

**Names.** Give an element `view-transition-name: x` and it gets its own group, `::view-transition-group(x)`, animated apart from the rest. If an element named `x` exists before **and** after, the browser moves and resizes the group from the old box to the new one: that's how a card's title flies into a page's heading. A name must be unique on the page at the moment each picture is taken, or the browser skips the whole transition.

**Types.** `types: ['route']` lets CSS run only for that kind of transition: `:root:active-view-transition-type(route) { … }`. That's how the four transitions share one page without their CSS clashing.

**Classes.** `view-transition-class: morph` styles many named groups at once: `::view-transition-group(.morph)`.

**Skipping.** A second transition while one runs skips the first; its `ready` promise rejects. That's expected, so the code catches it: `transition.ready.catch(() => {})`.

**Support and motion.** `src/lib/view-transitions.ts` exports `canTransition()`: true only with view transition types (Chrome 125+, Safari 18.2+) and without `prefers-reduced-motion: reduce`. Every transition on the site checks it and otherwise changes the page instantly. The reduced-motion safety net in `global.css` can't help here, because `*` doesn't match the `::view-transition-*` pseudo-elements.

## Route changes (type `route`)

- **Where:** `onNavigate` in `src/routes/+layout.svelte`, CSS in `global.css` (`:root:active-view-transition-type(route)`), the nav marker in `src/lib/components/Nav.svelte`.
- **How it hooks into SvelteKit:** `onNavigate` runs just before SvelteKit swaps the page. If it returns a promise, SvelteKit waits for it. The layout starts a view transition and resolves that promise inside `update()`, so SvelteKit swaps the page between the two pictures:

```js
return new Promise((resolve) => {
	const transition = document.startViewTransition({
		update: async () => {
			resolve(); // let SvelteKit swap the page now
			await navigation.complete; // the "after" picture waits for the new page
		},
		types: ['route']
	});
});
```

- **What's named:** the `.site-header` (`site-header`), `main` (`page`) and the nav's underline (`nav-marker`). The header stays put, the underline slides to the new link (old box to new box), the root swaps at once.
- **The content:** the old `page` keeps its size, centred where it was, and fades out in 150 ms; the new one fades in and rises in 300 ms. `--route-shift` (old content top minus new content top, set by the layout) keeps the old picture where it was on screen even when the new page is scrolled elsewhere (Back restores the list's scroll position).
- **Shallow navigations** (a tool updating its URL with `goto(url, { shallow: true })`) also call `onNavigate`, but don't swap the page, so the layout returns early.
- **Turn off:** return early from `onNavigate`, or delete the CSS block.

## Cards that become the page (type `morph`)

The card's parts (title, picture, date line, description, tags) fly to their places in the page's header, and back again when you return.

- **Markup:** the card has `data-morph-card` (`TeaserCard.svelte`), the page's header `data-morph-page` (`ArticleHeader.svelte`, `ProjectHeader.svelte`, the Awesome list's header), and each part `data-morph="title" | "picture" | "meta" | "description" | "tags"`. A search result is `a[data-morph-card]`, a link that is the whole card.
- **Names only while morphing.** The CSS gives names only to parts inside an element marked `data-morphing`, and only during a `morph` transition:

```css
:root:active-view-transition-type(morph) {
	& [data-morphing] [data-morph='title'] {
		view-transition-name: morph-title;
	}
	/* … meta, description, tags, picture */
}
```

That way only one card on the list has names, never all of them.

- **The steps** (`src/lib/morph.ts`, called from the layout's `onNavigate`):
  1. `cardLinkingTo(navigation.to.url)` finds the card whose title links to the page being opened. If there isn't one, `pageHeader()` is the "from" end (you're going back from a page to its list).
  2. `unmarkAll()` clears marks a skipped transition left, then `mark()` marks this end.
  3. In `update()`, after the new page is in, the other end is marked: the new page's header, or the card on the list you came back to.
  4. `picturesReady()` waits up to 300 ms for the page's cover to decode, so the "after" picture isn't blank.
  5. `leave(card)` unmarks a card that is still on the new page (a search result: the search box isn't part of the page) and closes its popover without its closing animation, or two elements would share a name.
  6. When the transition finishes, only the latest one cleans up (a counter), so a quick second click doesn't remove the marks the next transition just set.
- **The CSS** (`global.css`): parts are `inline-size: fit-content` while morphing (a title's picture is mostly words, so it scales cleanly); groups glide in 450 ms; the picture is cropped (`object-fit: cover`) inside its moving box, so a square thumbnail becomes a 16:9 cover; everything else drops away and the new page rises in; a part with no partner (`:only-child`) leaves or arrives with the page.

### Add the morph to a new kind of card

1. Put `data-morph-card` on the card and `data-morph="title"` on the element that contains the title's link (or `data-morph-card` on a link that is the whole card).
2. Put `data-morph-page` on the destination page's header and the same `data-morph` values on its parts.
3. That's all: the layout finds the card by the link's URL. Parts without a partner just fade.

## The light/dark circle (type `theme`)

- **Where:** `src/lib/components/ThemeToggle.svelte`.
- **How:** the click works out the button's centre and the distance to the farthest corner, writes them on `<html>` as `--reveal-x`, `--reveal-y`, `--reveal-r` (the pseudo-elements hang off `:root`, so that's where their CSS can read values), then starts a transition with `update: () => flushSync(flip)`. `flushSync` makes Svelte apply the change right away, before the "after" picture.
- **The CSS:** the new picture is masked by `radial-gradient(circle at var(--reveal-x) var(--reveal-y), #000 calc(var(--reveal-radius) - var(--reveal-blur)), transparent var(--reveal-radius))`, and `--reveal-radius` is registered with `@property` as a `<length>`, so it can be animated from 0 to past the corner. A gradient mask instead of `clip-path` because a gradient can have a soft edge.
- **Change:** `duration` and `blur` are props (`Header.svelte` passes 500 and 50).

## Colour-theme effects (types `palette` + the effect's name)

- **Where:** `src/lib/palette-transitions.ts` and `.css`. Called by `PalettePicker.svelte` (from the radio you picked) and by the layout on a language change (from the language switch).
- **How:** `transitionPalette(change, origin, effect?)` picks the next effect in `effects` (they take turns, per visit), calls that effect's function to get its settings as custom properties (`--palette-mask`, `--palette-duration`, `--glitch-bands-1`…), writes them on `<html>`, and starts a transition with `types: ['palette', effect]`. When the latest transition finishes it removes every property any of them set.
- **The effects:**
  - **ripple:** a generated SVG mask, one square per grid cell, each fading in with a delay that grows with its distance from the origin (`<animate>` inside the SVG, so the mask animates itself; squares with the same delay are grouped into one `<path>`).
  - **rain:** the same kind of mask, one rectangle per column growing down with a random start.
  - **glitch:** random hard-stop gradient masks show bands of the new page, shifted sideways with `steps(1)` keyframes, some frames through the `#palette-rgb-split` SVG filter (red one way, green and blue the other).
  - **scanline:** a registered `--palette-scan` percentage moves a line down the screen; the new page shows above it, the old one below, the brand colour at the line, with scanlines and a flicker.
- **Shared CSS:** under `palette`, `mix-blend-mode: normal` on both pictures (the default `plus-lighter` brightened overlaps).

## Debugging a transition

- DevTools → Animations panel: transitions appear there; slow them to 10%.
- Pause it from the console: `document.getAnimations().forEach((a) => a.pause())` right after starting one, then inspect the `::view-transition` tree in Elements.
- "Transition was skipped" in the console usually means a duplicate `view-transition-name` or an `update()` that threw.
