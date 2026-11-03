// The Awesome lists in content/awesome/, one YAML file each.
// Like content.ts: only import this from +page.server.ts files, so the YAML is read at
// build time and only the data a page needs ships to the browser.
import { parse } from 'yaml';
import { checkTags } from '#lib/content.ts';

export interface AwesomeLink {
	title: string;
	url: `https://${string}`;
	description: string;
	tags: string[];
}

export interface Category {
	name: string;
	// For the heading's id: 'Dark mode' -> 'dark-mode'.
	id: string;
	links: AwesomeLink[];
}

export interface AwesomeList {
	// The file name: modern-css.yaml -> /awesome/modern-css
	slug: string;
	title: string;
	description: string;
	// 'YYYY-MM-DD', when the list last changed.
	updated: string;
	categories: Category[];
	// Every tag in the list, once, A to Z (the filter's buttons).
	tags: string[];
	// How many links in all.
	count: number;
}

// The file as written; the loader adds the rest.
type ListFile = Omit<AwesomeList, 'slug' | 'tags' | 'count' | 'categories'> & {
	categories: Omit<Category, 'id'>[];
};

const files = import.meta.glob<string>('/content/awesome/*.yaml', {
	eager: true,
	query: '?raw',
	import: 'default'
});

const toId = (name: string) =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

// The data is ours, but a typo shouldn't ship: a link that isn't https:// or a bad tag
// fails the build and names the file. Descriptions are shown as text ({…}), never as
// HTML, so there's nothing to sanitize.
function check(path: string, file: ListFile) {
	for (const { links } of file.categories) {
		for (const link of links) {
			if (!link.url?.startsWith('https://')) {
				throw new Error(`${path}: "${link.title}" needs an https:// url`);
			}
			checkTags(path, link.tags);
		}
	}
}

export const allLists: AwesomeList[] = Object.entries(files)
	.map(([path, text]) => {
		const file = parse(text) as ListFile;
		check(path, file);
		const links = file.categories.flatMap((category) => category.links);
		return {
			...file,
			slug: path
				.split('/')
				.at(-1)!
				.replace(/\.yaml$/, ''),
			categories: file.categories.map((category) => ({ ...category, id: toId(category.name) })),
			tags: [...new Set(links.flatMap((link) => link.tags))].sort(),
			count: links.length
		};
	})
	.sort((a, b) => a.title.localeCompare(b.title));
