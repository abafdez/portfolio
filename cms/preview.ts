// The preview pane. Posts and Devlog entries are drawn in the browser, as you type, by
// render.ts (the build's own markdown plugins) with the site's CSS: it works the same in
// dev and in a hosted CMS. In dev, a second tab shows the real page from the dev server.
import { localizePath, type Locale } from '#lib/i18n/locales.ts';
import { writeEntry } from '#lib/content-files.ts';
import { renderMarkdown } from './render.ts';
import tokens from '#lib/styles/tokens.css?inline';
import global from '#lib/styles/global.css?inline';
import fira from '@fontsource-variable/fira-code/index.css?inline';
import shantell from '@fontsource-variable/shantell-sans/index.css?inline';
import own from './preview.css?inline';

type Entry = { get: (key: string) => unknown };
type Asset = { url: string } | undefined;
type Props = { entry: Entry; getAsset: (path: string) => Asset; below?: number };
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

// Saves so far, and who wants to hear about the next one (each open "as saved" preview).
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
const minutes = (body: string) => Math.max(1, Math.round(body.split(/\s+/).length / 200));

export function articlePreview(React: ReactLike, path: (slug: string) => string) {
	const h = React.createElement;

	function Article({ entry, getAsset }: Props) {
		const locale = localeOf(entry);
		const values = valuesOf(entry, locale);
		const file = fileOf(entry, locale) || `new${locale === 'es' ? '.es' : ''}.md`;
		const body = String(values.body ?? '');
		const [html, setHtml] = React.useState('');
		const [problem, setProblem] = React.useState('');

		// Drawn again after each pause in the typing; the last good HTML stays meanwhile.
		React.useEffect(() => {
			let stale = false;
			const timer = setTimeout(async () => {
				try {
					const out = await renderMarkdown(body, file);
					if (stale) return;
					setHtml(out);
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

		// ./files (pictures, videos, posters) → URLs the frame can show. On every render, not
		// once per body change: getAsset() answers with an empty URL while Sveltia reads a
		// file, and the template is drawn again when it has it.
		const url = (path: string) => getAsset(path)?.url || '';
		const shown = html.replace(
			/\b(src|poster)="(\.\/[^"]+)"/g,
			(match, name: string, path: string) => (url(path) ? `${name}="${url(path)}"` : match)
		);
		const folder = fileOf(entry, locale).replace(/\/[^/]*$/, '');
		const cover =
			['./cover.avif', './cover.png', './cover.jpg', './cover.webp'].map(url).find(Boolean) ||
			(import.meta.env.DEV && folder && values.cover ? `/admin/cover/${folder}` : undefined);
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
					`${String(values.date ?? '')} · ${minutes(body)} ${words[locale]}`
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
				: h('div', {
						className: 'prose',
						'data-key-path': 'body',
						dangerouslySetInnerHTML: { __html: shown }
					})
		);
	}

	const RealPage = livePage(React, path);

	return function ArticlePreview(props: Props) {
		const [tab, setTab] = React.useState('preview');
		if (!import.meta.env.DEV) return h(Article, props);
		const button = (name: string, label: string) =>
			h(
				'button',
				{ type: 'button', 'aria-pressed': tab === name, onClick: () => setTab(name) },
				label
			);
		return h(
			'div',
			null,
			h(
				'p',
				{ className: 'preview-tabs' },
				button('preview', 'Preview'),
				button('page', 'Real page')
			),
			tab === 'preview' ? h(Article, props) : h(RealPage, { ...props, below: 40 })
		);
	};
}

// The unsaved entry, as the file it would be, for the real page (dev only, cms/plugin.ts).
function send(path: string, data: Record<string, unknown>) {
	return fetch('/admin/preview', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ path, text: writeEntry(data) })
	});
}

const bar = { font: '13px system-ui', padding: '6px 12px', margin: 0 };

// Dev only: the real page from the dev server, in an iframe. Live for posts and Devlog
// entries: the unsaved entry is written to a hidden .preview.md next to the file, and the
// page renders it with ?preview (src/lib/preview.ts); Vite reloads the page when it
// changes and SvelteKit keeps the scroll position. Otherwise (the Awesome list) the page
// as last saved, reloaded after each save.
export function livePage(React: ReactLike, path: (slug: string) => string, live = true) {
	const h = React.createElement;
	// below: room left at the top for the tabs (px).
	return function LivePage({ entry, below = 0 }: Props) {
		const locale = localeOf(entry);
		const slug = String(entry.get('slug') ?? '')
			.split('/')
			.pop();
		const file = live ? fileOf(entry, locale) : '';
		const data = plain(entry.get('data'));

		const [version, setVersion] = React.useState(saves);
		// Live: the iframe waits for the first copy, so it never shows the saved version first.
		const [ready, setReady] = React.useState(!file);
		const sent = React.useRef(false);

		React.useEffect(() => {
			const listener = () => setVersion((old) => old + 1);
			if (!file) listeners.add(listener);
			return () => void listeners.delete(listener);
		}, [file]);

		React.useEffect(() => {
			if (!file) return;
			const timer = setTimeout(
				async () => {
					await send(file, data);
					sent.current = true;
					setReady(true);
				},
				sent.current ? 400 : 0
			);
			return () => clearTimeout(timer);
		}, [file, JSON.stringify(data)]);

		if (!slug) return h('p', { style: bar }, 'Save it once to see its page.');

		const url = `${location.origin}${localizePath(path(slug), locale)}${file ? '?preview' : ''}`;
		return h(
			'div',
			{
				style: {
					position: 'fixed',
					inset: `${below}px 0 0`,
					display: 'flex',
					flexDirection: 'column'
				}
			},
			h(
				'p',
				{ style: { ...bar, display: 'flex', gap: '1ch', borderBottom: '1px solid #8884' } },
				file ? 'The real page, with your unsaved changes' : 'The page as last saved',
				h('a', { href: url, target: '_blank', rel: 'noopener' }, 'Open in a tab')
			),
			ready &&
				h('iframe', {
					key: version,
					src: url,
					title: 'The real page',
					style: { flex: 1, border: 0, width: '100%' }
				})
		);
	};
}
