// The Awesome lists in content/awesome/, one YAML file each.
// Like content.ts: only import this from +page.server.ts files, so the YAML is read at
// build time and only the data a page needs ships to the browser.
// Text can be in both languages (readText in locales.ts): the lists keep every language,
// and a page asks for its own with listIn().
import { parse } from 'yaml';
import { checkTags } from '#lib/content.ts';
import { readText, type Locale, type Translated } from '#lib/i18n/locales.ts';

// What a page gets: a list in one language.
export interface AwesomeLink {
	title: string;
	url: `https://${string}`;
	description: string;
	tags: string[];
}

export interface Category {
	name: string;
	// For the heading's id: 'Dark mode' -> 'dark-mode'. From the English name, so it's
	// the same in every language.
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

// What the loader keeps: the text in every language, and whether the list is translated.
type LinkData = Omit<AwesomeLink, 'title' | 'description'> & {
	title: Translated;
	description: Translated;
};
type CategoryData = Omit<Category, 'name' | 'links'> & { name: Translated; links: LinkData[] };
export type AwesomeListData = Omit<AwesomeList, 'title' | 'description' | 'categories'> & {
	title: Translated;
	description: Translated;
	categories: CategoryData[];
	// Whether its descriptions are written in every language (see readList()).
	translated: boolean;
};

// The file as written (text fields are plain text or { en, es }); the loader checks it.
type ListFile = {
	title: unknown;
	description: unknown;
	updated: string;
	categories: {
		name: unknown;
		links: (Omit<AwesomeLink, 'title' | 'description'> & {
			title: unknown;
			description: unknown;
		})[];
	}[];
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

// The data is ours, but a typo shouldn't ship: a link that isn't https://, a bad tag or
// a text field that isn't text fails the build and names the file. Descriptions are
// shown as text ({…}), never as HTML, so there's nothing to sanitize.
// A list is translated once its description is in every language; then every link's
// description must be too, or the Spanish page would be half English. Names and titles
// can stay plain: a category called CSS, or an article's own title.
// Exported for its tests (awesome.test.ts).
export function readList(path: string, file: ListFile): Omit<AwesomeListData, 'slug'> {
	const description = readText(file.description, `${path}: description`);
	const half = (where: string) => {
		throw new Error(`${path}: ${where} is in one language, but the list is translated`);
	};
	const categories = file.categories.map((category) => {
		const name = readText(category.name, `${path}: a category's name`).text;
		const links = category.links.map((link) => {
			const where = `${path}: "${String(link.url)}"`;
			if (!link.url?.startsWith('https://')) throw new Error(`${where} needs an https:// url`);
			checkTags(path, link.tags);
			const linkDescription = readText(link.description, `${where} description`);
			if (description.translated && !linkDescription.translated) half(`${where} description`);
			return {
				...link,
				title: readText(link.title, `${where} title`).text,
				description: linkDescription.text
			};
		});
		return { name, id: toId(name.en), links };
	});
	const links = categories.flatMap((category) => category.links);
	return {
		title: readText(file.title, `${path}: title`).text,
		description: description.text,
		updated: file.updated,
		categories,
		tags: [...new Set(links.flatMap((link) => link.tags))].sort(),
		count: links.length,
		translated: description.translated
	};
}

export const allLists: AwesomeListData[] = Object.entries(files)
	.map(([path, text]) => ({
		...readList(path, parse(text) as ListFile),
		slug: path
			.split('/')
			.at(-1)!
			.replace(/\.yaml$/, '')
	}))
	.sort((a, b) => a.title.en.localeCompare(b.title.en));

// A list in one language, for a page: every text field picked for that language.
export function listIn(list: AwesomeListData, locale: Locale): AwesomeList {
	return {
		slug: list.slug,
		title: list.title[locale],
		description: list.description[locale],
		updated: list.updated,
		tags: list.tags,
		count: list.count,
		categories: list.categories.map((category) => ({
			id: category.id,
			name: category.name[locale],
			links: category.links.map((link) => ({
				...link,
				title: link.title[locale],
				description: link.description[locale]
			}))
		}))
	};
}
