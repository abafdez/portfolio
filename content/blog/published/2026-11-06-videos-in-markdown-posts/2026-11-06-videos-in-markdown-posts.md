---
title: Videos in markdown posts, and why not a GIF
date: 2026-11-06
tags: [markdown, video, performance, accessibility]
description: 'Short screen recordings next to a post: why not a GIF, how the build finds the files, and the attributes that keep a video from jumping or autoplaying.'
cover: A video player on a screen, with markdown code and MP4 and WebM files.
---

Some things are easier to show than to describe: a page that jumps while it loads, a button that animates. I wanted short screen recordings in my posts, next to the markdown like my images.

## Why not a GIF

My first idea was a GIF. Two reasons it isn't:

- **My build would freeze it.** Images in my posts go through [enhanced-img](https://svelte.dev/docs/kit/images), which makes smaller AVIF and WebP copies. Underneath, it opens each file with `sharp` without asking for animation, so a GIF comes out as its first frame.
- **It's the wrong format anyway.** A GIF is a sequence of full images with at most 256 colours. The same clip as a video is often five to ten times smaller, in full colour. And a GIF can't be paused, while [WCAG](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) asks that anything moving for more than five seconds can be.

So: a video.

## Writing it in markdown

Markdown has a syntax for images, `![alt](./x.png)`, but none for video. mdsvex lets me write HTML in a post, so a video is HTML:

```html
<figure>
	<video width="1280" height="720" controls muted playsinline preload="metadata">
		<source src="./awesome-list-shift.webm" type="video/webm" />
		<source src="./awesome-list-shift.mp4" type="video/mp4" />
	</video>
	<figcaption>The filters appear after the list has loaded, and push it down.</figcaption>
</figure>
```

That `./` has the same problem my images had: the browser reads it from the page's URL, not from the post's folder, and asks for a file that isn't there. My build already fixed that for images by turning each one into an import. Now it does the same for `src` and `poster` on `<video>`, `<source>` and `<track>`:

```ts
const mediaTag = /<(video|source|track)\b[^>]*>/g;
const localFile = /\b(src|poster)="(\.\/[^"]+)"/g;

// …inside enhanceMedia(), after the images:
.replace(mediaTag, (tag: string, element: string) => {
	if (element === 'video' && !(/\swidth="\d+"/.test(tag) && /\sheight="\d+"/.test(tag))) {
		throw new Error(`${id}: a <video> needs width and height …`);
	}
	return tag.replace(localFile, (_, attribute: string, src: string) => {
		const name = `__file${imports.length}`;
		imports.push(`import ${name} from '${src}';`);
		return `${attribute}={${name}}`;
	});
});
```

A plain `import clip from './clip.mp4'` is enough: [Vite](https://vite.dev/guide/assets) knows `.mp4`, `.webm` and `.vtt` as assets. It copies the file into the build with a hash in its name and gives back that URL. Unlike images, nothing is re-encoded: the file is used as it is, so I compress it before committing.

## The attributes

Each one is there for a reason:

- **`width` and `height`**: the size I exported at. Without them the video has no size until the file arrives, and the text below it jumps down: a layout shift, in a post about layout shifts. With them, the browser keeps the right space from the start, and CSS (`max-inline-size: 100%; block-size: auto`) scales it down on a phone. My build fails if a `<video>` doesn't have both.
- **`controls`**: a reader can play, pause and scrub.
- **No `autoplay`**: nothing moves until the reader asks for it, which also takes care of people who prefer reduced motion.
- **`muted`**: my recordings have no sound. Svelte warns about a `<video>` without a captions `<track>`, unless it's muted.
- **`playsinline`**: on an iPhone, it plays in the page instead of going full screen.
- **`preload="metadata"`**: the browser downloads only the start of the file (its size and length) until it's played, not the whole video on page load.
- **A `<figcaption>`**: a video has no alt text, so the text around it has to say what it shows.

## MP4 or WebM

**MP4** with H.264 plays in every browser. **WebM** with VP9 is usually smaller for the same quality. With both as `<source>`s, the browser plays the first one it can, so WebM goes first and MP4 is the fallback. If I only make one, it's MP4.

I record with the Windows Snipping Tool, then make both with [ffmpeg](https://ffmpeg.org/):

```sh
ffmpeg -i raw.mp4 -vf "scale=1280:-2" -c:v libx264 -crf 28 -preset slow -an -movflags +faststart clip.mp4
ffmpeg -i raw.mp4 -vf "scale=1280:-2" -c:v libvpx-vp9 -crf 40 -b:v 0 -row-mt 1 -an clip.webm
```

- `scale=1280:-2`: 1280 px wide, the height that keeps the proportions (an even number, which H.264 needs).
- `-crf`: quality; higher is smaller and worse.
- `-an`: no audio track.
- `+faststart`: the MP4's index goes at the start of the file, so it can start playing before it has all downloaded.

## Testing it without a recording

To test the build step before I had a real recording, I made one with Playwright, which can record a browser as WebM:

```js
const context = await browser.newContext({
	recordVideo: { dir: 'out', size: { width: 640, height: 360 } }
});
```

A page with a counter, two seconds, and I had a real video file to put in a throwaway post. Built, played in the preview at 320 px and on a desktop: both kept their 16:9 box, played, and nothing scrolled sideways.

## Later: a video block

All of this HTML is now one block in my posts: a code block whose language is `video`, with the file, the size and a caption as YAML. The build writes the same `<video>` and checks every field. That's [its own post](./2026-11-07-components-in-code-blocks).

## Links

- [MDN: the video element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [web.dev: Replace animated GIFs with video](https://web.dev/articles/replace-gifs-with-videos)
- [Vite: static asset handling](https://vite.dev/guide/assets)
- [WCAG: Pause, stop, hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)
- [Images next to the post](./2026-11-06-images-next-to-the-post)
- [Pages that jump](./2026-11-06-pages-that-jump)
