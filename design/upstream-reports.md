# Upstream reports to check and file

Three problems found during the mdsvex switch (2026-11-26/27), each with a minimal reproduction re-run on 2026-11-27. **Alfonso checks each one by hand before filing** (search the repo's open and closed issues first). Our workaround is noted under each, so it can go once a fix is released.

Versions: mdsvex 1.1.0 (@mdsvex/parse 1.1.0), @twinkleplop/css 0.1.10, @sveltejs/enhanced-img 1.0.1, @sveltejs/vite-plugin-svelte 7.3.1, Vite 8.3.8, Svelte 5.57.3.

## 1. mdsvex: an unclosed mark inside link or image text cancels the link

**Where:** [pngwn/MDsveX](https://github.com/pngwn/MDsveX/issues)

**Title:** An emphasis or subscript mark that never closes inside link text turns the whole link into plain text

**Reproduction** (Node, `mdsvex/compile`):

```js
import { compile } from 'mdsvex/compile';

for (const md of [
	'[~/dir](https://example.com)',
	'[see *this link](https://example.com)',
	'[see _this link](https://example.com)',
	'[a ~~b link](https://example.com)',
	'![a ~/toolbox window](./x.png)',
	'[home ~ dir](https://example.com)', // a ~ before a space doesn't open: fine
	'Open ~/toolbox in a tab.' // a lone ~ in a sentence: fine
]) {
	console.log(md, '=>', compile(md, { filename: '/x.md' }).code);
}
```

**Actual:** the first five print the source as text, for example `<p>[~/dir](https://example.com)</p>`; the image isn't an image.

**Expected:** a link (`<p><a href="https://example.com">~/dir</a></p>`) and an image whose alt is `a ~/toolbox window`. [PFM.md](https://github.com/pngwn/MDsveX/blob/main/PFM.md) says a mark that is never closed stays literal text, and outside link text it does (the last line).

**Our workaround:** `\~` in the one alt text that hit it (`2026-11-09-what-the-mit-licence-asks`, both languages); the publishing guide warns about it under "Markdown that reads a little differently" ([content/blog/posts/README.md](../content/blog/posts/README.md), line 211).

## 2. enhanced-img's markup step parses mdsvex's raw markdown

**Where:** [pngwn/MDsveX](https://github.com/pngwn/MDsveX/issues). mdsvex is the one that turns on enhanced-img for markdown images, and it already looks for this plugin. Search for "enhanced-img" in its open and closed issues first; if the maintainer says it belongs to enhanced-img, the same text works in [sveltejs/kit](https://github.com/sveltejs/kit/issues) (package `@sveltejs/enhanced-img`).

**Only with `enhancedImages()` in the Vite plugins.** Without it the markup step doesn't exist and the same post builds (case D below). But that plugin is what makes mdsvex enhance markdown images (`import_images` is on by default and uses enhanced-img when the plugin is there), so anyone who wants optimised images in posts has it.

Reproduced on 2026-11-27 with a minimal Vite build (no SvelteKit). Ready to paste:

**Title:** With `enhancedImages()`, a `.svx` file that shows `<enhanced:img>` in a code block fails to build, or its code sample is rewritten

`````md
mdsvex uses enhanced-img for markdown images when `enhancedImages()` is in the Vite plugins. With that setup, a document that _shows_ the tag in a code block (a post about enhanced-img, say) goes through enhanced-img's markup step before mdsvex has compiled it. That step parses the raw markdown as a Svelte component, and one of three things happens:

1. The markdown isn't valid Svelte (a CSS block is enough): the build fails.
2. It parses, and the sample's image doesn't exist: the build fails.
3. It parses, and the image exists: the build passes, and the code sample readers see is enhanced-img's generated markup instead of the line I wrote. Nothing warns about it.

Without `enhancedImages()` the same files build and the sample shows as written.

### Reproduction

`vite.config.js`:

```js
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { mdsvex } from 'mdsvex';

export default {
	build: { ssr: 'src/main.js' },
	plugins: [
		mdsvex(),
		enhancedImages(),
		svelte({ extensions: ['.svelte', '.svx'], compilerOptions: { generate: 'server' } })
	]
};
```

`src/main.js`:

```js
export { default } from './post.svx';
```

`src/post.svx`:

````md
A post about images.

```svelte
<enhanced:img src="./photo.jpg" alt="A photo" />
```
````

Then `vite build`:

- **As above, no `src/photo.jpg`:**

  ```text
  [plugin vite-plugin-enhanced-img-markup] src/post.svx
  Error: Could not locate ./photo.jpg. See https://vitejs.dev/guide/assets for more details on referencing assets.
  ```

- **Add a CSS block to the post** (`img { border-radius: 8px; }` in a `css` fence):

  ```text
  [plugin vite-plugin-enhanced-img-markup] src/post.svx
  CompileError: Expected token }
  https://svelte.dev/e/expected_token
  ```

- **Without the CSS block, with a real `src/photo.jpg`:** the build passes, and rendering the component (`svelte/server`), the code block reads:

  ```text
  <picture><source srcset={"/assets/photo-BgsjhETJ.avif 1x, /assets/photo-BvssZlEW.avif 2x"} type="image/avif" /><source srcset={"/assets/photo-DO1uQ9Dn.webp 1x, /assets/photo-m0Lrat1L.webp 2x"} type="image/webp" /><source srcset={"/assets/photo-DkHErv_p.jpg 1x, /assets/photo-CK7tdQkH.jpg 2x"} type="image/jpeg" /><img src={"/assets/photo-CK7tdQkH.jpg"} alt="A photo" width=40 height=30 /></picture>
  ```

  The image was processed into the six versions it names, for an image nobody shows.

- **The same, without `enhancedImages()`:** the build passes and the code block reads `<enhanced:img src="./photo.jpg" alt="A photo" />`.

### Expected

Code samples stay text. Markdown should reach enhanced-img's markup step only after mdsvex has compiled it (by then the sample is escaped and doesn't match), or that step should skip mdsvex's extensions, since mdsvex already enhances markdown images itself.

### Why, as far as I can tell

mdsvex adds its extensions to vite-plugin-svelte's and compiles markdown inside vite-plugin-svelte's compile step. enhanced-img's markup plugin takes its id filter from vite-plugin-svelte (every Svelte extension, so `.svx` too) and its transform has `order: 'pre'` with a code filter for `<enhanced:img`, so it runs before that compile step and gets the raw markdown. Putting `mdsvex()` before `enhancedImages()` doesn't change it: `order: 'pre'` runs first whatever the plugin order.

### Also with `.md`

My site uses `mdsvex({ extensions: ['.md'] })` with SvelteKit; the same thing happens (16 build errors, one per post and language that mentions the tag in code, `Unexpected token` or `Expected whitespace`).

### Workaround

Wrap the markup step's handler so it skips markdown files. mdsvex still enhances markdown images, so nothing is lost:

```js
async function enhancedImagesExceptMarkdown() {
	const plugins = await enhancedImages();
	for (const plugin of plugins) {
		const hook = plugin.transform;
		if (plugin.name !== 'vite-plugin-enhanced-img-markup' || typeof hook !== 'object') continue;
		const handler = hook.handler;
		hook.handler = function (code, id, ...rest) {
			if (/\.(svx|md)$/.test(id.split('?')[0])) return;
			return handler.call(this, code, id, ...rest);
		};
	}
	return plugins;
}
```

Versions: mdsvex 1.1.0, @sveltejs/enhanced-img 1.0.1, @sveltejs/vite-plugin-svelte 7.3.1, Svelte 5.57.3, Vite 8.3.8, Node 24.
`````

**Our workaround:** `enhancedImagesExceptMarkdown()` in `vite.config.ts`, the same wrapper as in the issue. Ours checks `.md` only: this site gives mdsvex `extensions: ['.md']`, so `.svx` isn't a Svelte extension here and enhanced-img never sees a `.svx` file. The issue's copy checks both, for readers on mdsvex's default.

## 3. twinkleplop: CSS declarations outside a rule are read as a selector

**Where:** [pngwn/twinkleplop](https://github.com/pngwn/twinkleplop/issues) (`languages/css`)

**Title:** CSS: a declaration outside a rule (a fragment) is tokenized as a selector

**Reproduction** (through mdsvex's highlighter, the token classes printed as `text=class`):

````js
import { compile } from 'mdsvex/compile';
import { create_highlight, load_default_languages } from 'mdsvex/highlight';

const highlight = create_highlight({ languages: await load_default_languages() });
for (const code of [
	'color: light-dark(white, black);',
	'--accent: oklch(70% 0.15 160);',
	':root {\n\t--accent: oklch(70% 0.15 160);\n}'
]) {
	console.log(compile('```css\n' + code + '\n```', { filename: '/x.md', highlight }).code);
}
````

**Actual:** outside a rule, `color: light-dark(white, black);` gives `color` = `selector`, `:` = `selector_pseudo`, `light-dark` = `selector`, and `white, black` one `identifier`; `--accent: oklch(…)` gives `-accent` = `selector` (the first `-` outside any token), `oklch` = `selector`, `70% 0.15 160` one `identifier`.

**Expected:** what the same declaration gets inside `:root { … }` (third snippet): `--accent` = `css_variable`, `oklch` = `function`, `70` = `number`, `%` = `unit`. Posts and docs show CSS as bare declarations all the time; Shiki and GitHub highlight them as declarations.

**Our workaround:** none; those words show in the selector colour (10 CSS blocks in 7 posts and entries). Only colours are wrong; the text is right.
