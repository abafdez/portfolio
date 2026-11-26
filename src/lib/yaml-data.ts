// import site from '/content/site.yaml?data' gives the file's data, parsed at build time:
// the page's JavaScript gets plain JSON, and no YAML parser ships to the browser. For data
// the browser needs (site settings: the header's name, the footer's links); data only the
// server needs is read with ?raw in a .server.ts file instead (awesome.ts, skills.server.ts).
import { readFileSync } from 'node:fs';
import type { Plugin } from 'vite';
import { parse } from 'yaml';

const query = '?data';

export function yamlData(): Plugin {
	return {
		name: 'yaml-data',
		load(id) {
			if (!id.endsWith(`.yaml${query}`)) return;
			const file = id.slice(0, -query.length);
			// Editing the file reloads what imports it, in dev.
			this.addWatchFile(file);
			return `export default ${JSON.stringify(parse(readFileSync(file, 'utf8')))};`;
		}
	};
}
