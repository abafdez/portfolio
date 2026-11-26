---
title: An icon picker inside Sveltia CMS
draft: true
date: 2026-11-19
tags: [cms, svelte, vite]
description: My Awesome lists each have a Lucide icon, chosen by name. Typing names from a website is no way to pick an icon, so the CMS got a field of its own, a Svelte component inside a React app, with the icon names read from the package at build time.
---

Each of my Awesome lists has an icon on its card: `icon: sparkles` in its YAML, a Lucide icon chosen by name. The build checks the name exists, but in the CMS it was a text box with a link to lucide.dev. Nobody picks an icon by typing its name from memory, so the CMS got a field of its own: search, a grid of the real icons, click.

![The icon field in Sveltia CMS: the chosen rocket icon with its name and a Clear button, a search box with "rocket", and a grid with the match](./icon-picker.png 'Search, see the icons, pick one')

## A Svelte component in a React app

Sveltia CMS lets you register your own field types with `CMS.registerFieldType(name, control)`, where the control is a React component that gets the field's `value` and an `onChange`. Sveltia ships its own React for that, but I'd rather write Svelte. The trick, the same one my cover's focal-point field uses: a tiny React component that renders one empty `div`, mounts a Svelte component into it, and passes React's props into a `$state` object, so Svelte re-renders when they change:

```ts
export function iconControl(React) {
	return function IconControl({ forID, value, onChange }) {
		const target = React.useRef(null);
		const props = React.useRef(null);

		React.useEffect(() => {
			const state = $state({ id: forID, value, onchange: onChange });
			props.current = state;
			const app = mount(IconPicker, { target: target.current, props: state });
			return () => void unmount(app);
		}, []);

		React.useEffect(() => {
			if (!props.current) return;
			props.current.value = value;
			props.current.onchange = onChange;
		}, [value, onChange]);

		return React.createElement('div', { ref: target });
	};
}
```

Then `CMS.registerFieldType('lucide', iconControl(CMS.React))`, and `widget: lucide` on the field in the config.

## Where the names come from

The picker needs the names as lucide.dev writes them, `arrow-up-right`. The `lucide` package exports an `icons` object, but its keys are PascalCase (`ArrowUpRight`) and include old aliases: 2,288 keys for 2,015 icons, and turning `Grid2x2` back into `grid-2x2` by rule gets some wrong. The package's files are the real list, one per icon, named exactly right. A browser can't list files, so a small Vite plugin does it at build time and serves the result as a virtual module:

```ts
export function lucideNames(): Plugin {
	return {
		name: 'lucide-names',
		resolveId: (id) => (id === 'virtual:lucide-names' ? '\0virtual:lucide-names' : undefined),
		load(id) {
			if (id !== '\0virtual:lucide-names') return;
			const folder = join(dirname(require.resolve('lucide')), '..', 'esm', 'icons');
			const names = readdirSync(folder)
				.filter((f) => f.endsWith('.mjs'))
				.map((f) => f.slice(0, -4));
			return `export default ${JSON.stringify(names)};`;
		}
	};
}
```

The picker imports `names from 'virtual:lucide-names'` (30 KB of strings) and loads the drawings, the whole `lucide` package, only when a picker is actually shown. Every word typed must be in the name, so "arrow up" finds `arrow-up-right`, and the grid shows the first 96 matches.

## Same icons everywhere

The picker draws each icon with the site's own `Glyph` component, the one the cards use. What you pick is what the page shows, and the build still checks the name, in case the YAML is edited by hand.
