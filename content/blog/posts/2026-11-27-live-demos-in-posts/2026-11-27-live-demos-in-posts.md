---
title: Live demos in my posts, and a sandbox to preview them
draft: true
date: 2026-11-27
tags: [mdsvex, svelte, cms, security]
description: "A code block in my posts can now run: the page shows what the code makes above the code itself. In the CMS, where my GitHub token lives, the same demo runs in a sandboxed frame that can't reach it."
---

The reason I moved my posts to [mdsvex](https://mdsvex.pngwn.at) was this: a post about a component should be able to show the component, working, next to its code. mdsvex calls it [code that runs](https://mdsvex.pngwn.at/docs/reference/code-that-runs). Write `run` after the language of a code block, and the block is shown as code and is also a module the page imports.

:::demo[A counter]

```svelte run
<script>
	let count = $state(0);
</script>

<button onclick={() => count++}>Clicked {count} {count === 1 ? 'time' : 'times'}</button>
```

The button above is the code below, compiled with the rest of the post and running on this page.

:::

## How the page shows it

mdsvex hands the block's module to the component that draws my code blocks, and that component decides what running means. For a Svelte block, it draws the block's component above its code, in a region a screen reader names "Live demo". For a script, it calls the default export and shows what it returns:

```ts run
export default () =>
	new Intl.DateTimeFormat('en-GB', { dateStyle: 'full' }).format(new Date(2026, 10, 27));
```

The demo is part of the page: rendered on the server with the rest of the post, then made interactive when the page's JavaScript runs. Its styles are scoped like any component's.

## A demo that waits

Some code can only run in a browser, or is heavy enough that it shouldn't load until someone wants it. `run=client` leaves it out of the page and puts a button in its place:

```js run=client
export default () => `This window is ${innerWidth} pixels wide.`;
```

## A frame around it

`:::demo[A title]` around a block and its explanation draws a window, with the title in its bar, like the counter at the top.

## In the CMS: a sandbox

My CMS shows a preview next to the editor, and it compiles each post in the browser, the way the build does. A demo is code the post's author wrote, and the preview runs in the page where my GitHub token is stored. That's why braces are banned in my posts. Running demos there would undo that rule: a post someone sent me could read the token.

So in the preview a demo never runs in the CMS's page. It runs in a frame:

```html
<iframe sandbox="allow-scripts" src="/admin/demo.html"></iframe>
```

`sandbox` takes everything away from the frame, and `allow-scripts` gives back only scripts. What it leaves out matters most: without `allow-same-origin`, the frame gets an opaque origin. To the browser it's a site of its own, with no storage and no cookies, that can't touch the page around it. It can't open windows or navigate the tab either.

The CMS compiles the demo with Svelte's compiler and posts the JavaScript into the frame. The page inside imports it with its own copy of Svelte and mounts it. It reports its height back so the frame grows to fit, and any error as text. Those are the only two messages the CMS accepts from it.

To check it, I previewed a demo that tries everything it shouldn't:

```text
storage blocked (SecurityError) | parent blocked (SecurityError) | cookie blocked (SecurityError) | top blocked (SecurityError)
```

Reading `localStorage`, reaching into the CMS's page, reading cookies and sending the whole tab elsewhere all fail. Chrome adds its own line about the last one: the frame "is sandboxed" and may not navigate the top window.

Two details I didn't expect. Module scripts in an opaque-origin frame are fetched with CORS, as if from another site, so the server has to allow the origin `null`: GitHub Pages already sends `Access-Control-Allow-Origin: *`, and the dev server needed one setting. And my first version never ran: Sveltia draws its preview in a frame of its own, so the window that sent the demo wasn't the frame's parent, and the frame ignored it. It now answers whichever window asked.

Script blocks don't run in the preview at all: a line says the result shows on the published page. A Svelte demo, the case I care about, runs there as it will on the site.

## Links

- [mdsvex: code that runs](https://mdsvex.pngwn.at/docs/reference/code-that-runs)
- [MDN: the `sandbox` attribute of `<iframe>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox)
- [MDN: opaque origins](https://developer.mozilla.org/en-US/docs/Glossary/Origin)
