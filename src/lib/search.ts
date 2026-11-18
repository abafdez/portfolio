// Search, with Pagefind (https://pagefind.app). After `vite build`, `pagefind --site build`
// reads the finished HTML and writes an index into build/pagefind/: split in small
// files, so a search downloads only the slices it needs. No server: it's all static
// files, so it works on GitHub Pages.
//
// What it indexes: only the elements marked data-pagefind-body (posts, Devlog entries,
// projects, Awesome lists, the About intro), with data-pagefind-meta="section:…" for the
// label over each result. One index per language, from <html lang>.
//
// In dev there's no index (pnpm dev doesn't build one), so load() gives undefined and
// the box says search works on the built site.

interface Data {
	url: string;
	excerpt: string; // HTML: Pagefind escapes the text, then adds <mark> around matches
	meta: { title?: string; section?: string };
}

interface Pagefind {
	options(options: { baseUrl: string }): Promise<void>;
	init(): Promise<void>;
	debouncedSearch(
		query: string,
		options?: object,
		wait?: number
	): Promise<{ results: { data(): Promise<Data> }[] } | null>;
}

export interface Hit {
	url: string;
	title: string;
	section?: string;
	excerpt: string;
}

export interface Results {
	total: number;
	hits: Hit[];
}

const base = import.meta.env.BASE_PATH ?? '';

// One Pagefind per language. It picks its index from <html lang> when it starts, and the
// language switch changes <html lang> without a page load, so each language imports its
// own copy of the module: a different URL (?lang=…) is a different module.
const instances = new Map<string, Promise<Pagefind | undefined>>();

export function load(lang = document.documentElement.lang): Promise<Pagefind | undefined> {
	let instance = instances.get(lang);
	if (!instance) {
		const url = `${base}/pagefind/pagefind.js?lang=${encodeURIComponent(lang)}`;
		// @vite-ignore: a URL for the browser to fetch at run time, not a file for Vite to
		// bundle (it doesn't exist until after the build).
		instance = import(/* @vite-ignore */ url).then(
			async (pagefind: Pagefind) => {
				await pagefind.options({ baseUrl: `${base}/` });
				await pagefind.init();
				return pagefind;
			},
			() => undefined
		);
		instances.set(lang, instance);
	}
	return instance;
}

// The first `limit` results of a query, or null when a newer query came in meanwhile
// (debouncedSearch waits 200 ms and drops the older ones).
export async function search(query: string, limit = 8): Promise<Results | null | undefined> {
	const pagefind = await load();
	if (!pagefind) return undefined;
	const found = await pagefind.debouncedSearch(query, {}, 200);
	if (!found) return null;
	const data = await Promise.all(found.results.slice(0, limit).map((result) => result.data()));
	return {
		total: found.results.length,
		hits: data.map(({ url, excerpt, meta }) => ({
			// Pagefind links the file (blog/x.html); the site's addresses have no .html.
			url: url.replace(/\.html$/, ''),
			title: meta.title ?? url,
			section: meta.section,
			excerpt
		}))
	};
}
