// Sets up Sveltia CMS with our pieces, then starts it (index.html sets CMS_MANUAL_INIT,
// so nothing runs before this). Every collection is described in config.yml.
import { blockComponents } from './components.ts';
import { focalControl } from './focal.svelte.ts';
import { formats } from './formats.ts';
import { articlePreview, livePage, previewStyles, saved } from './preview.ts';

// The parts of Sveltia's global we use (its package's types point at missing files).
type Sveltia = {
	React: Parameters<typeof focalControl>[0] & Parameters<typeof articlePreview>[0];
	init: () => Promise<void>;
	registerCustomFormat: (name: string, extension: string, format: object) => void;
	registerEditorComponent: (definition: object) => void;
	registerFieldType: (name: string, control: unknown) => void;
	registerPreviewTemplate: (name: string, component: unknown) => void;
	registerPreviewStyle: (style: string, options?: { raw: boolean }) => void;
	registerEventListener: (listener: { name: string; handler: () => void }) => void;
};
const CMS = (window as unknown as { CMS: Sveltia }).CMS;

// How files are read and written: content-files.ts + Prettier.
for (const [name, { extension, ...format }] of Object.entries(formats)) {
	CMS.registerCustomFormat(name, extension, format);
}

// ```yt, ```video… from src/lib/blocks.ts.
for (const component of blockComponents()) CMS.registerEditorComponent(component);

// The cover's focal point: a Svelte component inside Sveltia's React.
CMS.registerFieldType('focal', focalControl(CMS.React));

// The preview pane: posts and Devlog entries drawn in the browser with the site's CSS
// (preview.ts, render.ts), plus the real page in dev; the Awesome list, the real page as
// last saved, in dev only (hosted, Sveltia's own preview).
CMS.registerPreviewStyle(previewStyles, { raw: true });
const articles: Record<string, (slug: string) => string> = {
	posts: (slug) => `/blog/${slug}`,
	drafts: (slug) => `/blog/${slug}`,
	devlog: (slug) => `/devlog/${slug}`
};
for (const [name, path] of Object.entries(articles)) {
	CMS.registerPreviewTemplate(name, articlePreview(CMS.React, path));
}
if (import.meta.env.DEV) {
	CMS.registerPreviewTemplate(
		'modern-css',
		livePage(CMS.React, () => '/awesome/modern-css', false)
	);
}
CMS.registerEventListener({ name: 'postSave', handler: saved });

CMS.init();
