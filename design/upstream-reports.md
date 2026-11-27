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

**Our workaround:** `\~` in the one alt text that hit it (`2026-11-09-what-the-mit-licence-asks`, both languages); the publishing guide warns about it.

## 2. enhanced-img's markup step parses mdsvex's raw markdown

**Where:** probably [pngwn/MDsveX](https://github.com/pngwn/MDsveX/issues) first (its docs build `import_images` on enhanced-img), and/or [sveltejs/kit](https://github.com/sveltejs/kit/issues) (package `@sveltejs/enhanced-img`). Check which one already knows.

**Title:** With mdsvex's Vite plugin, enhanced-img parses the raw markdown of any `.md` file that mentions `<enhanced:img` and fails

**Setup:** SvelteKit with `mdsvex({ extensions: ['.md'] })` and `enhancedImages()` in `vite.config`, and a post whose text mentions the tag in code, for example a fenced block:

````md
```svelte
<enhanced:img src="./photo.jpg" alt="A photo" />
```
````

**Actual:** `vite build` fails:

```text
[plugin vite-plugin-enhanced-img-markup] /…/content/blog/posts/2026-10-29-enhanced-img/2026-10-29-enhanced-img.md
CompileError: Unexpected token
https://svelte.dev/e/js_parse_error
```

(16 errors on this site, one per post and language that mentions the tag in code; some say `Expected whitespace`.)

**Why:** mdsvex registers `.md` as a Svelte extension. enhanced-img's markup plugin has a `transform` with `order: 'pre'` and a code filter for `<enhanced:img`, so it runs before mdsvex has compiled the file and parses the markdown as Svelte. Putting `mdsvex()` before `enhancedImages()` in `plugins` doesn't help (`order: 'pre'` wins over plugin order), and changing the hook's `filter` had no effect.

**Expected:** markdown files reach enhanced-img only after mdsvex has turned them into Svelte (or enhanced-img skips ids that aren't `.svelte`).

**Our workaround:** `enhancedImagesExceptMarkdown()` in `vite.config.ts` wraps that plugin's transform handler to skip `.md` ids; mdsvex imports markdown images through enhanced-img itself.

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

**Our workaround:** none; those words show in the selector colour in a few posts.
