// The preview pane. Posts and Devlog entries are drawn in the browser, as you type, by
// the site's own markdown code (src/lib/markdown/: parse.ts, then <Markdown> mounted live,
// markdown.svelte.ts) with the site's CSS: it works the same in dev and in a hosted CMS.
import { localizePath, type Locale } from '#lib/i18n/locales.ts';
import { readingTime } from '#lib/reading-time.ts';
import { coverOf } from './covers.ts';
import { parse } from '#lib/markdown/parse.ts';
import { loadLanguages, type Highlighter } from '#lib/markdown/shiki.ts';
import type { Media } from '#lib/markdown/media.ts';
import type { Token } from 'marked';
import { markdownBody } from './markdown.svelte.ts';
import tokens from '#lib/styles/tokens.css?inline';
import global from '#lib/styles/global.css?inline';
import fira from '@fontsource-variable/fira-code/index.css?inline';
import shantell from '@fontsource-variable/shantell-sans/index.css?inline';
import own from './preview.css?inline';

type Entry = { get: (key: string) => unknown };
type Asset = { url: string } | undefined;
type Props = { entry: Entry; getAsset: (path: string) => Asset };
type ReactLike = {
	createElement: (type: unknown, props: object | null, ...children: unknown[]) => unknown;
	useState: <T>(value: T) => [T, (value: T | ((old: T) => T)) => void];
	useEffect: (effect: () => void | (() => void), deps: unknown[]) => void;
	useRef: <T>(value: T) => { current: T };
};

// The site's CSS for the preview frame (registerPreviewStyle). The frame is a blob:
// document, where a URL like /node_modules/… (the fonts) has nothing to resolve against,
// so they're made absolute.
export const previewStyles = [fira, shantell, tokens, global, own]
	.join('\n')
	.replace(/url\((['"]?)\//g, `url($1${location.origin}/`);

// Saves so far, and who wants to hear about the next one (each open "as saved" page).
let saves = 0;
const listeners = new Set<() => void>();
export function saved() {
	saves++;
	for (const listener of listeners) listener();
}

// entry.i18n holds the other languages: if it has English, this preview is Spanish.
function localeOf(entry: Entry): Locale {
	const others = entry.get('i18n') as { has?: (key: string) => boolean } | undefined;
	return others?.has?.('en') ? 'es' : 'en';
}

// Immutable Map → plain object.
const plain = (value: unknown): Record<string, unknown> =>
	(value as { toJS?: () => Record<string, unknown> } | undefined)?.toJS?.() ?? {};

// The values being edited, in the previewed language; date and tags live only in the
// English file, so a Spanish preview takes them from there.
function valuesOf(entry: Entry, locale: Locale) {
	const data = plain(entry.get('data'));
	if (locale === 'en') return data;
	const english = plain(entry.get('i18n')).en as { data?: Record<string, unknown> } | undefined;
	return { date: english?.data?.date, tags: english?.data?.tags, ...data };
}

// The file being edited, in the previewed language. Sveltia gives the path of the file
// being shown, in either language. A new entry has none yet.
function fileOf(entry: Entry, locale: Locale) {
	const saved = String(entry.get('path') ?? '');
	return saved ? saved.replace(/(\.es)?\.md$/, locale === 'es' ? '.es.md' : '.md') : '';
}

const words = { en: 'min read', es: 'min de lectura' };

export function articlePreview(React: ReactLike) {
	const h = React.createElement;
	const Body = markdownBody(React);

	return function ArticlePreview({ entry, getAsset }: Props) {
		const locale = localeOf(entry);
		const values = valuesOf(entry, locale);
		const file = fileOf(entry, locale) || `new${locale === 'es' ? '.es' : ''}.md`;
		const body = String(values.body ?? '');
		const [ready, setReady] = React.useState<{ tokens: Token[]; highlighter: Highlighter } | null>(
			null
		);
		const [problem, setProblem] = React.useState('');

		// Parsed again after each pause in the typing, with the code's languages loaded (the
		// build does the same before rendering); the last good body stays meanwhile. parse()
		// throws everything the build would stop on: that's shown instead of the post.
		React.useEffect(() => {
			let stale = false;
			const timer = setTimeout(async () => {
				try {
					const { tokens, languages } = parse(body, file);
					const highlighter = await loadLanguages(languages);
					if (stale) return;
					setReady({ tokens, highlighter });
					setProblem('');
				} catch (error) {
					if (!stale) setProblem((error as Error).message);
				}
			}, 150);
			return () => {
				stale = true;
				clearTimeout(timer);
			};
		}, [body, file]);

		// ./files (pictures, videos, posters) → URLs the frame can show, from Sveltia's
		// getAsset(). It answers with an empty URL while it reads a file, and the template is
		// drawn again when it has it, so this is made again on every render.
		const url = (path: string) => getAsset(path)?.url || '';
		const media: Media = { picture: (_file, src) => url(src), url: (_file, src) => url(src) };
		// A cover just added in the CMS (getAsset), or the one saved next to the entry.
		const cover =
			['./cover.avif', './cover.png', './cover.jpg', './cover.webp'].map(url).find(Boolean) ||
			(values.cover ? coverOf(fileOf(entry, locale)) : undefined);
		const tags = Array.isArray(values.tags) ? (values.tags as string[]) : [];

		return h(
			'article',
			{ className: 'preview-article sheet', lang: locale },
			h(
				'header',
				{ className: 'preview-header' },
				h(
					'p',
					{ className: 'meta', 'data-key-path': 'date' },
					`${String(values.date ?? '')} · ${readingTime(body)} ${words[locale]}`
				),
				h('h1', { 'data-key-path': 'title' }, String(values.title ?? '')),
				values.description
					? h(
							'p',
							{ className: 'description', 'data-key-path': 'description' },
							String(values.description)
						)
					: null,
				tags.length
					? h(
							'ul',
							{ className: 'tags', 'data-key-path': 'tags' },
							...tags.map((tag) => h('li', { key: tag }, `#${tag}`))
						)
					: null,
				cover ? h('img', { className: 'cover', src: cover, alt: String(values.cover ?? '') }) : null
			),
			problem
				? h('p', { className: 'preview-error' }, `The build would stop here:\n${problem}`)
				: ready &&
						h(Body, {
							className: 'prose',
							'data-key-path': 'body',
							props: { ...ready, file, locale, media }
						})
		);
	};
}

const bar = { font: '13px system-ui', padding: '6px 12px', margin: 0 };

// Dev only: a page of the site as last saved, in an iframe, reloaded after each save (the
// Awesome list, whose page is drawn from more than one entry's text).
export function savedPage(React: ReactLike, path: string) {
	const h = React.createElement;
	return function SavedPage({ entry }: Props) {
		const [version, setVersion] = React.useState(saves);

		React.useEffect(() => {
			const listener = () => setVersion((old) => old + 1);
			listeners.add(listener);
			return () => void listeners.delete(listener);
		}, []);

		const url = `${location.origin}${localizePath(path, localeOf(entry))}`;
		return h(
			'div',
			{ style: { position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' } },
			h(
				'p',
				{ style: { ...bar, display: 'flex', gap: '1ch', borderBottom: '1px solid #8884' } },
				'The page as last saved',
				h('a', { href: url, target: '_blank', rel: 'noopener' }, 'Open in a tab')
			),
			h('iframe', {
				key: version,
				src: url,
				title: 'The page as last saved',
				style: { flex: 1, border: 0, width: '100%' }
			})
		);
	};
}
