// What a visitor is looking for in an Awesome list, and what matches.
// A class with $state fields: the state, what's derived from it and the ways to change
// it live together, and a component gets all of it as one object. The file ends in
// .svelte.ts because runes only work in .svelte and .svelte.ts files.
import type { Category } from './awesome.ts';

export class LinkFilter {
	// The search box. Every word must appear in a link's title, description or tags.
	query = $state('');
	// The tags picked. A link needs all of them (each one narrows the list).
	tags: string[] = $state([]);

	// A function, not the array: if the list changes (navigating to another list),
	// results follows. A plain array would be read once, here.
	#categories: () => Category[];

	constructor(categories: () => Category[]) {
		this.#categories = categories;
	}

	// The categories with only their matching links; empty ones are dropped.
	// $derived recomputes when query, tags or the list change, and only when read.
	results = $derived.by(() => {
		const words = this.query.toLowerCase().split(/\s+/).filter(Boolean);
		return this.#categories()
			.map((category) => ({
				...category,
				links: category.links.filter((link) => {
					const text = [link.title, link.description, ...link.tags].join(' ').toLowerCase();
					return (
						words.every((word) => text.includes(word)) &&
						this.tags.every((tag) => link.tags.includes(tag))
					);
				})
			}))
			.filter((category) => category.links.length);
	});

	count = $derived(this.results.reduce((sum, category) => sum + category.links.length, 0));

	get active() {
		return this.query.trim() !== '' || this.tags.length > 0;
	}

	toggle(tag: string) {
		this.tags = this.tags.includes(tag) ? this.tags.filter((t) => t !== tag) : [...this.tags, tag];
	}

	clear() {
		this.query = '';
		this.tags = [];
	}

	// The filter as URL params: ?q=grid&tag=docs&tag=layout. Empty ones are left out,
	// so a list with no filter has a clean URL.
	get params() {
		const params = new URLSearchParams();
		if (this.query.trim()) params.set('q', this.query.trim());
		for (const tag of this.tags) params.append('tag', tag);
		return params;
	}

	// The other way. Only tags the list has: a link with ?tag=nope shouldn't hide
	// everything behind a button that doesn't exist.
	// Pick<…>: only the two methods it uses, so page.url's read-only params fit too.
	read(params: Pick<URLSearchParams, 'get' | 'getAll'>, known: string[]) {
		this.query = params.get('q') ?? '';
		this.tags = params.getAll('tag').filter((tag) => known.includes(tag));
	}
}
