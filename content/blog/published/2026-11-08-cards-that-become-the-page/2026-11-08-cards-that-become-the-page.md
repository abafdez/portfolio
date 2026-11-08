---
title: 'Cards that become the page: shared-element view transitions in SvelteKit'
date: 2026-11-08
tags: [view-transitions, sveltekit, css, animation]
description: Click a post card and its title, picture, date and tags fly into their places on the post. How view-transition-name pairs two elements across a navigation, and the four things that made it look right.
cover: A grid of cards with one lifting out and growing into a full article.
---

Until now, opening a post from my blog list was a fade: the list went, the post came. Now the card you click turns into the page. Its title grows into the post's heading, its thumbnail into the cover, and the date, description and tags slide to where the post has them, while the other cards drop away. Back plays it in reverse.

## Two elements, one name

My site already runs every navigation inside a view transition (SvelteKit's `onNavigate` plus `document.startViewTransition`). The browser takes a picture of the page before the change and one after, and animates between them.

Give an element a `view-transition-name` and it gets its own pair of pictures. If an element in the old page and one in the new page have the **same name**, the browser treats them as one thing that moved: it animates the box from the old position and size to the new one and crossfades the two pictures inside it. So "the card's title becomes the heading" is just:

```css
.card h3 {
	view-transition-name: morph-title;
}
.post h1 {
	view-transition-name: morph-title;
}
```

## Only the card you clicked

That CSS would break at once: a name must be **unique on the page**, and `/blog` has dozens of cards. So no card has a name until you click it. In `onNavigate`, before the transition starts, I find the card whose title links to where you're going and mark it:

```ts
export function cardLinkingTo(url: URL | undefined): HTMLElement | null {
	if (!url) return null;
	for (const link of document.querySelectorAll<HTMLAnchorElement>(
		'[data-morph-card] [data-morph="title"] a'
	)) {
		if (new URL(link.href).pathname === url.pathname) return link.closest('[data-morph-card]');
	}
	return null;
}
```

The parts are marked in the markup (`data-morph="title"`, `"picture"`, `"meta"`, `"description"`, `"tags"`), on the card and on the page's header, and the names only exist inside a marked one:

```css
:root:active-view-transition-type(morph) [data-morphing] [data-morph='title'] {
	view-transition-name: morph-title;
}
```

The other end is marked in the transition's `update()`, after SvelteKit has put the new page in, and before the browser takes its "after" picture. Going back, it's the other way round: the post's header is marked first, and the card is only found once the list is back on screen.

## Four things that made it look right

**Text as wide as its words.** A heading is a block: as wide as the column, mostly empty. Scaling that picture from a card's width to the post's width scales the empty space, not the words. During the transition the parts get `inline-size: fit-content`, so each picture is mostly text.

**A square that becomes 16:9.** The card shows a square crop, the post a 16:9 cover. By default each picture keeps its width and its own height, so one spills out of the moving box and the other falls short. Filling the box and cropping both, like `object-fit` on an image, fixes it, but only with a clip, because nothing clips a view transition's pictures by default:

```css
&::view-transition-old(morph-picture),
&::view-transition-new(morph-picture) {
	block-size: 100%;
	object-fit: cover;
	overflow: clip;
}
```

**The cover has to be there.** The post's cover is a bigger file than the card's thumbnail, and the browser takes the "after" picture as soon as `update()` is done. If the cover hasn't loaded, it flies in empty. So `update()` waits for it, at most 300ms:

```ts
await Promise.race([Promise.all(images.map((img) => img.decode().catch(() => {}))), timeout]);
```

**The old page stays where it was.** Going Back, SvelteKit scrolls the list to where you were, and the old page's picture is placed where the new content starts, far up. The post showed from its middle as it faded out. Measuring the content's top before and after, and moving the old picture by the difference (`--route-shift`), fixed it for every navigation, not only this one.

## The rest of the page

Everything without a name is still in the page's picture, so the other cards leave together: they drop a little and fade (220ms), and the post's body rises in after a short delay (250ms), once the moving parts are on their way. A part with nothing to land on, like a project card's date, leaves with the rest.

People who prefer reduced motion get no transition at all, like every other effect on the site.

## Links

- [MDN: view-transition-name](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-name)
- [MDN: view-transition-class](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-class)
- [Chrome for Developers: same-document view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/same-document)
- [SvelteKit: onNavigate](https://svelte.dev/docs/kit/$app-navigation#onNavigate)
