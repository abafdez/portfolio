// Every Lucide icon's name, as on lucide.dev ('arrow-up-right'), for the CMS's icon picker
// (IconPicker.svelte). The package's `icons` object has the names in PascalCase, plus old
// aliases of the same icons; its file names are the real list, one file per icon. A browser
// can't list files, so this Vite plugin reads them at build time and serves the list as a
// virtual module: import names from 'virtual:lucide-names'.
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import type { Plugin } from 'vite';

const id = 'virtual:lucide-names';

export function lucideNames(): Plugin {
	return {
		name: 'lucide-names',
		resolveId: (source) => (source === id ? `\0${id}` : undefined),
		load(resolved) {
			if (resolved !== `\0${id}`) return;
			// dist/cjs/lucide.js → dist/esm/icons/<name>.mjs
			const main = createRequire(import.meta.url).resolve('lucide');
			const folder = join(dirname(main), '..', 'esm', 'icons');
			const names = readdirSync(folder)
				.filter((file) => file.endsWith('.mjs'))
				.map((file) => file.slice(0, -'.mjs'.length))
				.sort();
			return `export default ${JSON.stringify(names)};`;
		}
	};
}
