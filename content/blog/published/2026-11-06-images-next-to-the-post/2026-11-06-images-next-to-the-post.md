---
title: Images next to the post, in plain markdown
date: 2026-11-06
tags: [images, markdown, vite, svelte]
description: Where to keep a blog's images, why ![alt](./x.png) breaks on a prerendered site, and a small Vite plugin step that turns it into optimized, checked images.
cover: Folders of drafts and published content with people moving files between them.
---

My posts were flat markdown files, and I wanted to add screenshots and diagrams. The first question was where to put them. The second was how to write them, because the obvious way didn't work.

## Where the images live

I considered six options:

| Option                                     | Main problem                                                               |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| `static/images/…`, served as they are      | No optimization and no width or height (the page jumps); far from the post |
| Next to the `.md` file, in the same folder | The folder fills up; publishing means moving the images too                |
| **One folder per post**                    | Moving every existing file once                                            |
| A shared `content/images/` folder          | Relative paths change when a draft moves up a level; orphaned images       |
| `import` by hand in each post              | Not plain markdown anymore; no preview in the editor                       |
| An external host                           | Links can die, and the build can't check them                              |

I picked one folder per post. The file keeps its name, so the slug doesn't change:

```text
content/blog/
  drafts/
    2026-11-06-images-next-to-the-post/
      2026-11-06-images-next-to-the-post.md
      diagram.png
  published/
```

Everything about a post is in one place. Publishing is one move, and deleting a post deletes its images. While I was at it, drafts and published posts got a folder each, so where a post stands is obvious from its path.

## The globs

My site finds the posts with Vite's `import.meta.glob`. With a folder each, the pattern goes one level deeper:

```ts
const posts = import.meta.glob<string>('/content/blog/published/*/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});
```

The slug still comes from the file name. A small function makes sure the folder agrees with it, so a rename that misses one fails the build:

```ts
export function slugOf(path: string): string {
	const [folder, file] = path.split('/').slice(-2);
	const slug = file.replace(/\.md$/, '');
	if (folder !== slug) throw new Error(`${path}: the folder and the file must have the same name`);
	return slug;
}
```

**Update:** a post's Spanish version now sits in the same folder, `<slug>.es.md`, and shares the images. `slugOf()` accepts that `.es` too, so both files have the same slug.

## Why `![alt](./x.png)` breaks

I wanted to write images the normal markdown way, so they also preview in my editor:

```md
![The layout shift track in DevTools](./cls.png)
```

mdsvex turns that into `<img src="./cls.png" alt="…">`. But a browser reads `./` from the **page's URL**, `/portfolio/blog/my-post`, not from the folder the markdown file is in. The image isn't there. Luckily, SvelteKit's prerender crawler checks `src` as well as `href`, so the build failed with a 404 instead of shipping a broken image.

I use `@sveltejs/enhanced-img`, which turns `<enhanced:img src="./photo.jpg">` in a Svelte file into a `<picture>` with AVIF and WebP copies at two sizes, plus `width` and `height`. In a markdown file, though, it couldn't find the image. What did work was an import:

```svelte
<script>
	import photo from './photo.jpg?enhanced';
</script>

<enhanced:img src={photo} alt="A photo" />
```

An import is resolved by Vite from the file's own folder, so `./` means what I meant. And a missing file is a build error that names it.

## Writing the imports for me

I didn't want a script block in every post, so the step that compiles markdown writes it. After mdsvex has made the HTML, every local `<img>` becomes an import and an `<enhanced:img>`:

```ts
const localImage = /<img\s+src="(\.\/[^"]+)"([^>]*?)\s*\/?>/g;
const captioned = /<p>(<img\s+src="\.\/[^"]+"[^>]*?)\s+title="([^"]*)"\s*\/?><\/p>/g;

export function enhanceImages(code: string, id: string): string {
	const imports: string[] = [];
	const html = code
		.replace(captioned, '<figure>$1><figcaption>$2</figcaption></figure>')
		.replace(localImage, (_, src: string, attributes: string) => {
			if (!/\salt="[^"]+"/.test(attributes)) {
				throw new Error(`${id}: ${src} needs alt text: ![What it shows](${src})`);
			}
			const name = `__image${imports.length}`;
			imports.push(`import ${name} from '${src}?enhanced';`);
			return `<enhanced:img src={${name}}${attributes} loading="lazy" />`;
		});
	return imports.length ? html.replace('<script>', `<script>\n\t${imports.join('\n\t')}`) : code;
}
```

- `localImage` only matches sources starting with `./`, so an image from another site stays as it is.
- mdsvex leaves `alt` out completely when it's empty, so a missing description is easy to spot. I made it a build error: every image in a post should say what it shows.
- The imports go into the component's own `<script>`, which mdsvex always writes.
- An image with a title, `![alt](./x.png "What it shows")`, becomes a `<figure>` with the title as its `<figcaption>`. It replaces the whole `<p>`, because a `<figure>` can't go inside a paragraph.
- `loading="lazy"`: an image further down the post is only downloaded when you scroll near it.

### The bug my first test missed

My first version had `<img src=` with a single space. It worked on my test image, and failed on the next one: its description was longer, and when a tag gets long, mdsvex puts each attribute on its own line:

```html
<p>
	<img
		src="./screenshot.png"
		alt="A purple test image with the words a screenshot"
		title="A caption under the image"
	/>
</p>
```

The regex didn't match, the image stayed a plain `<img src="./screenshot.png">`, and the browser asked for a file that wasn't there. `\s+` matches any whitespace, line breaks included. The function now lives in its own file, so Vitest can test it with real mdsvex output, the long tag included. (Today it's `enhance-media.ts`, `enhanceMedia()`: it handles [videos](./2026-11-06-videos-in-markdown-posts) too.)

## One line of CSS

`<enhanced:img>` sets `width` and `height`, so the browser keeps the image's space while it loads: no layout shift. But my reset gives images `max-inline-size: 100%`. A wide screenshot gets narrower to fit, and without help, it keeps its full height and looks squashed:

```css
.prose img {
	block-size: auto;
}
```

`auto` lets the height follow the width, using the ratio from the two attributes.

## Before committing an image

- **Size:** git keeps every version of every file forever, even after I delete it. I commit images at about twice the width they're shown at, compressed. `enhanced-img` makes the smaller copies.
- **Privacy:** a screenshot can show more than I meant: open tabs, notifications, personal data in a form. Once it's pushed, it's public.

## Links

- [Vite: static asset handling](https://vite.dev/guide/assets)
- [SvelteKit: images](https://svelte.dev/docs/kit/images)
- [MDN: the img element, alt](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#alt)
- [Markdown with mdsvex](./2026-10-31-markdown-with-mdsvex)
- [Drafts that never ship](./2026-11-02-drafts-that-never-ship)
