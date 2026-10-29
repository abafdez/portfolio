---
title: 'Entrance animations: let the page decide'
date: 2026-10-29
tags: [css, animation, svelte, accessibility]
draft: true
description: Why my hero component doesn't animate itself, how the page passes it animations as CSS props, and a reduced-motion safety net that actually covers delays.
---

My home page fades its parts in one after another: photo, text, then the posts and projects sections. Getting there took three versions, and each one fixed something the previous one got wrong.

## Version 1: the component animates itself

The hero had its animation in its own styles. It worked, but if I reuse the hero on another page, it always animates, whether that page wants it or not. The order things appear in across a page is the **page's** decision, not the component's.

## Version 2: a global utility class

Next I added an `.enter` class in `global.css`, with a delay set per element. Better, but the animation still lived far from the page that used it, and the page couldn't animate the photo and the text inside the hero separately.

## Version 3: the page passes the animation as a prop

Svelte lets you pass CSS custom properties straight to a component:

```svelte
<Hero … --photo-animation={enter(0)} --text-animation={enter(150)} />
```

Svelte puts them on a wrapper element (`display: contents`). The component only reads them:

```css
/* Hero.svelte */
.photo {
	animation: var(--photo-animation, none);
}
.text {
	animation: var(--text-animation, none);
}
```

With nothing passed, the default is `none`: a reusable component shouldn't move unless asked.

The page defines everything else:

```svelte
<script lang="ts">
	const enter = (delay: number) => `home-enter 600ms ease-out ${delay}ms both`;
</script>

<section style:animation={enter(300)}>…</section>

<style>
	@keyframes -global-home-enter {
		from {
			opacity: 0;
			translate: 0 var(--size-3);
		}
	}
</style>
```

**Why `-global-`?** Svelte renames keyframes defined in a component, to something like `svelte-abc123-home-enter`, so they don't clash with other components. But Hero is a different component and refers to the keyframes by name. The `-global-` prefix keeps the name as written.

**Why `both`?** It holds the `from` state during the delay (otherwise the element would show, disappear, then fade in) and keeps the final state afterwards.

## Why not Svelte's `transition:`?

Svelte transitions (`in:fade` and friends) don't run during hydration, so they wouldn't play on the first page load, which is exactly when an entrance animation matters. CSS animations start as soon as the HTML is painted, before any JavaScript runs. Svelte transitions are the right tool for things that appear and disappear because of **state**, like filtering a list.

## When the library's keyframes surprise you

I first used Open Props' ready-made animations. The fade didn't fade. Their keyframes are:

```css
@keyframes fade-in {
	to {
		opacity: 1;
	}
}
```

There's only a `to` step. An element that is already at opacity 1 has nothing to animate. Open Props expects you to set `opacity: 0` on the element yourself. And `slide-in-up` starts at `translateY(100%)`, which is 100% of the element's **own** height: about 300px for my hero, so the photo seemed to jump into place. Read the keyframes before using them.

## A reduced-motion safety net that covers delays

Some people get dizzy or nauseous from motion and turn on "reduce motion" in their OS. I respect that with one rule in my reset layer:

```css
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		animation-delay: 0s !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
		transition-delay: 0s !important;
	}
}
```

- **0.01ms instead of `none`** so animations still reach their end state and `animationend` events still fire.
- **The delays matter.** My first version only shortened durations. Because of `both`, my delayed sections stayed invisible for up to 450ms, then appeared all at once. For someone who asked for less motion, that's worse than the animation.
- **`!important` in the first layer is deliberate.** With `!important`, cascade layer order flips: the **earliest** layer wins and beats unlayered styles too. A user's accessibility preference should outrank any design decision, so this is the one place where `!important` belongs.

## Testing animations

You can't eyeball a 600ms fade reliably, but `document.getAnimations()` lets you pause each animation at a given time and read its styles:

```js
document.getAnimations().forEach((a) => {
	a.pause();
	a.currentTime = 100;
});
```

100ms in, every part was at 26% opacity and 12px low: the fade was really happening.
