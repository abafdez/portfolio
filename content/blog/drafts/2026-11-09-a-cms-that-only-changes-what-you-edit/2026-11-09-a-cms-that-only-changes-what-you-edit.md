---
title: A CMS that only changes what you edit
date: 2026-11-09
tags: [cms, markdown, testing, yaml]
description: I added Sveltia CMS to my site's dev server. Its first save rewrote lines I never touched, so I gave it my own file format and a test that saves every file and compares the bytes.
---

My posts are markdown files in a Git repo. I write them in Obsidian, and they're published by a build. I wanted a form for the frontmatter, a picker for images and a dialog for my code-block components, without moving the content anywhere. A git-based CMS does exactly that: it edits the files in the repo and leaves the rest to Git.

I picked [Sveltia CMS](https://sveltiacms.app/en/docs), and the first save taught me something about every CMS of this kind.

## Why Sveltia

I compared three options: building my own, Sveltia and TinaCMS. What decided it was the shape of my content:

- each post is a folder with its images next to it (`./diagram.png`);
- the Spanish version is a second file in the same folder, `<slug>.es.md`, with only the words in it;
- drafts are a folder the build doesn't read.

Sveltia handles all three with configuration. Tina wanted the images in `static/` and has no translations. Building my own would fit perfectly, but it would be the biggest job on the site so far, and I'd have to maintain it afterwards.

Sveltia runs in the browser and edits a local folder through the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API), so it needs no server. I serve it from a small Vite plugin with `apply: 'serve'`: it exists in `pnpm dev` and never reaches the build.

## The first save

I added one character to a title and saved. Git showed this:

```diff
-title: 'Callouts that read well everywhere'
+title: Callouts that read well everywhere!
-tags: [markdown, accessibility, sveltekit]
+tags:
+  - markdown
+  - accessibility
+  - sveltekit
```

The quotes went, the tags became a block list, and the Spanish file, which I hadn't opened, was rewritten too. Every save would bring lines like these into the diff, and every edit by hand in Obsidian would put them back.

The reason is how a CMS works. It doesn't edit text: it reads the file into data, I change the data, and it writes a new file from that data. The quotes and the `[a, b]` aren't data, so they're whatever its writer prefers. The way out isn't to configure the CMS harder, it's to give it a writer that writes like me.

## My own file format

Sveltia lets you register a file format: one function that reads a file into data, one that writes data into a file. Mine lives in `src/lib/content-files.ts`, and the writer is a few lines of the [`yaml` package](https://eemeli.org/yaml/):

```ts
function yaml(data: Record<string, unknown>) {
	const doc = new Document(data);
	// A list of plain values (tags) on one line: [css, dark-mode]
	visit(doc, {
		Seq(_, seq) {
			if (seq.items.every(isScalar)) seq.flow = true;
		}
	});
	// Quotes only where YAML needs them, single ones; long lines never folded
	return doc.toString({ singleQuote: true, lineWidth: 0, flowCollectionPadding: false });
}
```

Then the CMS runs Prettier on the result, with the same config `pnpm lint` checks. So whatever the CMS writes, the linter has nothing to say about it, tables included.

```ts
CMS.registerCustomFormat('entry', 'md', {
	fromFile: readEntry,
	toFile: (data) => prettier.format(writeEntry(data), { ...options, parser: 'markdown' })
});
```

## The test: save everything, change nothing

How do I know the writer writes like me? I save every file without editing it, and compare the bytes:

```ts
test.each(entries)('%s', async (file) => {
	const text = readFileSync(file, 'utf8');
	expect(await pretty(writeEntry(readEntry(text)), 'markdown')).toBe(text);
});
```

That's over 270 files in under three seconds. The first run failed on 74 of them, all for the same reason: titles in quotes they didn't need. Most blog titles had them, most Devlog titles didn't. There was no rule to copy, so I let the writer decide (quotes only where needed) and rewrote those 74 lines once, with a script that does exactly what the CMS does: `pnpm content:format`.

Now the test passes, and it's what keeps the promise: **a save changes only what I edited.** If I edit frontmatter by hand and write it differently, `pnpm test` tells me, and `pnpm content:format` fixes it.

## What a CMS can't keep

Some things aren't data at all, and no writer can bring them back. My Awesome list had a comment block at the top explaining its rules. A save drops it, because the CMS never sees it. The comments moved to a `README.md` next to the list.

The same goes for shapes. One category name was plain text (`Color`) and the others were `{ en, es }`. A CMS field has one shape, so that one became `{ en: Color, es: Color }`.

## The preview

Sveltia's preview pane draws markdown with its own renderer, without my site's styles, callouts or components. It now runs the same markdown plugins as my build, in the browser, as I type. That took three tries, so it has a post of its own: [A CMS preview built from my own build](./2026-11-10-a-preview-built-from-my-own-build).

## Links

- [Sveltia CMS: custom file formats](https://sveltiacms.app/en/docs/api/file-formats)
- [Sveltia CMS: local workflow](https://sveltiacms.app/en/docs/workflows/local)
- [The `yaml` package: documents and options](https://eemeli.org/yaml/#documents)
- [Prettier's standalone build, for the browser](https://prettier.io/docs/browser)
