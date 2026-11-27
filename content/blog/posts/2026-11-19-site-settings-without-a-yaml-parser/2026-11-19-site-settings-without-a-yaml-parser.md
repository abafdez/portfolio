---
title: Site settings without a YAML parser in the browser
date: 2026-11-19
tags: [cms, vite, content]
description: "My name, tagline, hiring texts and profile links were spread over the code and the message files. Now they're one YAML file the CMS edits, and the browser gets them as plain JSON: a nine-line Vite plugin parses the file at build time."
---

Some of my site's words weren't content and weren't code either: my name in the header, the footer and every page title; the tagline on the home page; the hiring texts in the footer panel; my GitHub and LinkedIn links. They were spread over a TypeScript file, two message files and half a dozen components. Changing the tagline meant finding all of them. Now they're one file, `content/site.yaml`, with a page of their own in the CMS.

## A singleton in the CMS

Sveltia CMS calls a lone settings file a [singleton](https://sveltiacms.app/en/docs/collections/singletons): it gets its own entry in the sidebar, "Site settings", and opens straight into its form. Each text that differs by language is an object with `en` and `es`, like everywhere else on the site, and the email and links have patterns, so the form won't accept a link that isn't `https://`.

## Data, not a parser

The header and footer are on every page and run in the browser, so the settings have to reach the browser. Importing the YAML and parsing it there would ship a YAML parser to every visitor for six fields. Instead, a Vite plugin parses the file at build time:

```ts
export function yamlData(): Plugin {
	return {
		name: 'yaml-data',
		load(id) {
			if (!id.endsWith('.yaml?data')) return;
			const file = id.slice(0, -'?data'.length);
			this.addWatchFile(file);
			return `export default ${JSON.stringify(parse(readFileSync(file, 'utf8')))};`;
		}
	};
}
```

`import data from '/content/site.yaml?data'` then gives a plain object, compiled into the page's JavaScript as JSON. Editing the file in dev reloads what uses it (`addWatchFile`). A one-line declaration tells TypeScript what `*.yaml?data` imports are.

## Checked at build time

The data comes from a file anyone can edit, in the CMS or by hand, so `src/lib/site.ts` checks it before anything uses it: every text needs both languages, links must be `https://`, an email must look like one. Anything wrong fails the build with the field's name (`content/site.yaml: tagline.es must be some text`), so a mistake made in the CMS stops at that change's checks instead of reaching the live site.

## One small fix on the way

The CMS hands an optional field you left empty to the file writer as an empty string. The writer now leaves empty top-level fields out, so an unset email doesn't end up as `email: ''`, and "no email, no Email me button" just works.
