---
title: My CMS from npm, and three traps on the way
date: 2026-11-11
tags: [cms, vite, svelte, react]
description: 'Importing Sveltia CMS from npm instead of serving its files made my setup half the size. On the way: a deadlock with no error, a bundler that lost the fonts, and a React effect that returned the wrong thing.'
---

My site's CMS, [Sveltia](https://sveltiacms.app/en/docs), runs only in development, at `/admin`. Until this week, a small Vite plugin of mine served everything it needed: an HTML page, the CMS's configuration, and Sveltia's own build, file by file, straight out of `node_modules`. The CMS code lived in a `cms/` folder next to `src/`, and Vite had to be told it was allowed to serve that folder.

It worked, but it felt like a second-class integration. Sveltia is also published as an npm module, so I tried importing it like any other dependency. The plugin went from 92 lines to 46, the CMS code moved into `src/lib/cms/`, and I fell into three traps on the way.

## The setup

The page the plugin serves now has a single script:

```ts
Object.assign(window, { CMS_MANUAL_INIT: true });
import('@sveltia/cms').then(setUp);
```

`CMS_MANUAL_INIT` tells Sveltia not to start by itself, so I can register my own pieces first: my file format, my editor components, my preview. A plain `import` at the top wouldn't work for that: imports are hoisted and run before any other line of the module, so Sveltia would load, and start, before the flag is set. Hence a dynamic `import()`.

The configuration is read by my code too, and handed over as an object:

```ts
const { fields: _anchors, ...config } = parse(source, { merge: true });
CMS.init({ config: { ...config, load_config_file: false } });
```

My `config.yml` shares fields between collections with YAML anchors, kept under a `fields:` key that Sveltia doesn't know and used to warn about. Parsing it myself, I can drop that key. And `merge: true`, because the anchors are used with merge keys (`<<: *title`), which the `yaml` package doesn't resolve by default.

## Trap 1: a deadlock with no error

My first version awaited the import:

```ts
const CMS = await import('@sveltia/cms');
```

The page never finished loading. No error in the console, every request answered, nothing pending. It just sat there.

A module script runs before the browser fires `DOMContentLoaded`, and with a top-level `await`, the browser waits for the whole module, await included. Sveltia, in turn, waits for `DOMContentLoaded` before it does its work. Each one was waiting for the other.

`import(…).then(setUp)` lets my module finish at once. `DOMContentLoaded` fires, Sveltia gets on with it, and `setUp` runs when the import is done.

## Trap 2: the bundler lost the fonts

Vite pre-bundles dependencies in development: it packs each one into a single file in `node_modules/.vite/deps/`. Sveltia's build loads its fonts and a few wasm files with `new URL('./assets/…', import.meta.url)`, a path relative to its own code. Moved into Vite's folder, that code looked for its assets in the wrong place.

The fix is to serve Sveltia as it's published: `optimizeDeps: { exclude: ['@sveltia/cms'] }`. Its own dependencies are already bundled inside it, so there's nothing for Vite to gain.

## Trap 3: an effect that returned the wrong thing

Sveltia draws its preview pane with React. Mine mounts a Svelte component inside it, the same one that renders my posts on the site, and hands it new props on every keystroke:

```ts
update.current = (next) => (current = next);
React.useEffect(() => update.current?.(props), [props]);
```

The preview drew the first version and then stopped, with `l is not a function` in react-dom on every keystroke.

An arrow without braces returns its expression, and React treats whatever an effect returns as its cleanup: it calls it before running the effect again. Here that was the props object. Braces fix it:

```ts
React.useEffect(() => {
	update.current?.(props);
}, [props]);
```

I had tested the Svelte side in the browser, but not the React wrapper around it. Now a test renders the wrapper three times under a few lines of stand-in React that keep that one rule. With the old code it fails with the same error react-dom gave.

## What I deleted

The bigger win wasn't the import. Once the preview was drawn by the page's own components, other parts had nothing left to do:

- a "Real page" tab that wrote unsaved posts to hidden files for the dev server to render;
- a dev-only route that served cover images, now a Vite glob of their URLs;
- a second copy of my code-block components' markup, as HTML strings, for the editor's previews, which are now a one-line summary.

The CMS went from 977 lines to 694. Most of what I removed had once been the clever part.

## Links

- [Sveltia CMS: JavaScript API](https://sveltiacms.app/en/docs/api)
- [MDN: DOMContentLoaded](https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event)
- [MDN: dynamic import()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [Vite: dependency optimization options](https://vite.dev/config/dep-optimization-options)
- [React: useEffect](https://react.dev/reference/react/useEffect)
- [A CMS preview built from my own build](./2026-11-10-a-preview-built-from-my-own-build)
