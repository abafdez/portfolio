---
title: 'Images next to the post, in plain markdown'
date: 2026-11-06
tags: [images, markdown, vite, svelte]
description: Where to keep a blog's images, why ![alt](./x.png) breaks on a prerendered site, and a small Vite plugin step that turns it into optimized, checked images.
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

<!-- TODO: why I wanted images in the first place (which post needed one) -->

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
const localImage = /<img src="(\.\/[^"]+)"([^>]*?)\s*\/?>/g;

function enhanceImages(code: string, id: string): string {
	const imports: string[] = [];
	const html = code.replace(localImage, (_, src: string, attributes: string) => {
		if (!/\salt="[^"]+"/.test(attributes)) {
			throw new Error(`${id}: ${src} needs alt text: ![What it shows](${src})`);
		}
		const name = `__image${imports.length}`;
		imports.push(`import ${name} from '${src}?enhanced';`);
		return `<enhanced:img src={${name}}${attributes} />`;
	});
	return imports.length ? html.replace('<script>', `<script>\n\t${imports.join('\n\t')}`) : code;
}
```

- `localImage` only matches sources starting with `./`, so an image from another site stays as it is.
- mdsvex leaves `alt` out completely when it's empty, so a missing description is easy to spot. I made it a build error: every image in a post should say what it shows.
- The imports go into the component's own `<script>`, which mdsvex always writes.

<!-- TODO: try it: add an image to a draft, then delete its alt text and read the error -->

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
