---
title: 'One cover image, four jobs: cards, posts and link previews'
date: 2026-11-06
tags: [images, components, seo, accessibility]
description: How one cover.png next to a post becomes a card thumbnail, the post's hero, and its link preview, with the right sizes, the right alt text and one clickable card.
---

Once my posts could have images, the list of posts looked bare: every card was a box of text. So each post can now have a **cover image**, and that one file does four jobs:

- a **thumbnail** on the post's card;
- a placeholder when there's no cover yet;
- the **hero** at the top of the post;
- the **og:image**, the picture LinkedIn or Slack show when someone shares the link.

<!-- TODO: a screenshot of /blog with covers and placeholders -->

## The convention

A cover is a file called `cover.png` (or `.jpg`, `.webp`) in the post's folder, next to the markdown. Its alt text goes in the frontmatter:

```yaml
---
title: Pages that jump
cover: The Performance panel in DevTools, with the layout shifts track highlighted
---
```

(**Update:** a post's Spanish version, `<slug>.es.md` in the same folder, shares the image and has its own `cover:` in Spanish.)

The two go together, and the build checks it. A cover nobody described fails, and so does alt text with no image:

```ts
export function checkCover(path: string, alt: unknown, files: string[] = coverFiles) {
	const folder = path.slice(0, path.lastIndexOf('/') + 1);
	const file = files.find((file) => file.startsWith(folder));
	if (file && (typeof alt !== 'string' || !alt.trim())) {
		throw new Error(`${file}: a cover needs alt text in the frontmatter: cover: What it shows`);
	}
	if (!file && alt !== undefined) {
		throw new Error(`${path}: has cover: but no cover.png, .jpg or .webp next to it`);
	}
}
```

## One glob, the right sizes

The covers are found with Vite's `import.meta.glob`, processed by `@sveltejs/enhanced-img`. One glob covers everything under `content/`, so the same code will serve Devlog entries and Awesome lists when they get covers. A `!` pattern leaves the drafts out of a build:

```ts
const pictures = import.meta.glob<Picture>(
	['/content/**/cover.{png,jpg,jpeg,webp}', '!/content/blog/drafts/**'],
	{ eager: true, import: 'default', query: { enhanced: true, w: '1600;800;480' } }
);
```

Each cover is then found by its **folder**: every post knows where it lives (`/content/blog/published/<slug>`), and `coverOf(post.folder)` returns its cover, if it has one.

Each one becomes AVIF, WebP and the original format, each at three widths. On the page that's a `<picture>` with a `srcset` like `cover.avif 1600w, cover.avif 800w, cover.avif 480w`. With `sizes`, the browser picks the smallest file that's still sharp:

```svelte
<!-- At the top of the post: the reading column -->
<enhanced:img
	src={cover.picture}
	alt={post.cover}
	sizes="(min-width: 800px) 740px, 100vw"
	fetchpriority="high"
/>
```

The cover at the top of a post is usually the biggest thing on screen when it loads (its **LCP**, Largest Contentful Paint), so it gets `fetchpriority="high"` and is never lazy. Card thumbnails are lazy: `/blog` lists every post, and most cards are off screen.

## Two kinds of alt text

The same image gets different alt text in different places:

- **In a card, `alt=""`.** The title is right next to it. A screen reader would read the image's description, then the title, both about the same post. An empty alt says "decorative, skip it".
- **At the top of the post, the real description.** There it's content: it shows something the text talks about.

<!-- TODO: what my screen reader said on a card before and after -->

## The card

I tried three layouts: a thumbnail beside the text, a banner on top, and the image in a terminal window frame. I went for the thumbnail beside: the list stays compact.

The same card appears in the wide column on `/blog` and in a narrower grid on my home page. A media query would ask how wide the **window** is, which says nothing about the card. A **container query** asks the card:

```css
article {
	container-type: inline-size;
}

@container (min-width: 34rem) {
	.layout.with-thumbnail {
		grid-template-columns: 12rem 1fr;
		align-items: center;
	}
}
```

Narrower than that, the image sits on top of the text.

### 16:9 or square?

My first version put the 16:9 cover beside the text. At 240px wide it was 135px tall, next to about 220px of text: a gap under the image in every card. I weighed five options:

| Option                                   | Why not (or why)                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| Keep 16:9, centre it vertically          | The gap is only split in two, and changes with each description          |
| Stretch 16:9 to the card's height        | Every card crops differently, depending on its text                      |
| **Square, cropped at build time**        | About as tall as the text; the crop keeps the middle                     |
| Square, plus an optional `thumbnail.png` | Choose the crop by hand when the middle doesn't work; can be added later |
| 4:3                                      | Still a small gap, and still a crop                                      |

I went for the square. The important part is **where** it's cropped. With CSS (`object-fit: cover` on the 16:9 file), the browser would need a much wider file to fill a square sharply, so it's either blurry or heavy. Instead, imagetools (which enhanced-img uses) crops it at build time:

```ts
const squares = import.meta.glob<Picture>(
	['/content/**/cover.{png,jpg,jpeg,webp}', '!/content/blog/drafts/**'],
	{ eager: true, import: 'default', query: { enhanced: true, w: '480;240', aspect: '1:1' } }
);
```

That makes 480×480 and 240×240 files (29 KB and 12 KB as PNG for my test image, less as AVIF), cut from the middle of the cover. So covers need what matters in the middle.

On a narrow card the square would be huge, so there the 16:9 version sits on top. Both are in the HTML, and the container query shows one:

```svelte
<div class="wide"><enhanced:img src={cover.picture} alt="" loading="lazy" … /></div>
<div class="square"><enhanced:img src={cover.square} alt="" sizes="192px" loading="lazy" /></div>
```

Both are `loading="lazy"`, and a lazy image that's `display: none` never comes into view, so the browser never downloads it. I checked: on `/blog` only the square was fetched.

<!-- TODO: which option I'd pick if a CMS let me choose the focal point -->

### No cover yet

None of my posts has a cover yet. Text-only cards next to cards with images would look uneven, so a post without a cover gets a tile drawn in CSS: my site's blueprint grid with the post's first tag.

```css
.tile {
	background-image:
		linear-gradient(var(--grid-line-major) 1px, transparent 1px),
		linear-gradient(90deg, var(--grid-line-major) 1px, transparent 1px);
	background-size: var(--grid-size) var(--grid-size);
	font-family: var(--font-label);
	color: var(--brand);
}
```

It's `aria-hidden`: the tag is already in the card's tag list. Beside the text it's square like the covers; on top of the text it's a 4:1 strip, because it says no more than its tag.

### The whole card is the link

Before, only the title was a link. Now the whole card is, still with one `<a>`. The title's link gets a pseudo-element that covers the card:

```css
article {
	position: relative;
}

h3 a::after {
	content: '';
	position: absolute;
	inset: 0;
}
```

Wrapping the whole card in an `<a>` would also work, but a screen reader would then read the date, the description and every tag as the link's name. With the stretched link, the link is still just the title.

The tags are links too, so they're lifted above the stretched one:

```css
[aria-label='Tags'] a {
	position: relative;
	z-index: 1;
}
```

And since the link now covers the card, the focus ring goes around the card:

```css
article:has(h3 a:focus-visible) {
	outline: var(--border-size-2) solid var(--brand);
}
```

<!-- TODO: try it: tab through /blog, then click a card's description and a tag -->

## Figures in a post

Images inside a post can have a caption, from the markdown title:

```md
![The layout shifts track](./shifts.png 'Each purple block is a layout shift')
```

My markdown step turns it into a `<figure>` with a `<figcaption>`. It replaces the whole paragraph, since a `<figure>` can't go inside a `<p>`.

## Link previews

A post with a cover also gets it in its `<head>`:

```html
<meta
	property="og:image"
	content="https://abafdez.github.io/portfolio/_app/immutable/assets/cover.CMaF8XsI.jpg"
/>
<meta property="og:image:alt" content="…" />
<meta name="twitter:card" content="summary_large_image" />
```

For this one I use a separate glob with `{ w: '1200', format: 'jpg' }`: 1200px is the size LinkedIn and Slack ask for, and not every service that reads `og:image` understands AVIF. `og:image` must be a full URL, so the path from the import goes through `new URL(src, page.url.href)`.

## Links

- [SvelteKit: images](https://svelte.dev/docs/kit/images)
- [MDN: responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images)
- [MDN: container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [Inclusive Components: cards](https://inclusive-components.design/cards/)
- [The Open Graph protocol](https://ogp.me/)
- [Images next to the post](./2026-11-06-images-next-to-the-post)
- [SEO on a GitHub Pages project site](./2026-11-04-seo-on-a-github-pages-project-site)
