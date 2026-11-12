// Sets up Sveltia CMS with our pieces, then starts it. plugin.ts serves the page that loads
// this file; every collection is described in config.yml.
import { parse } from 'yaml';
import source from './config.yml?raw';
import { blockComponents } from './components.ts';
import { focalControl } from './focal.svelte.ts';
import { formats } from './formats.ts';
import { articlePreview, savedPage, previewStyles, saved } from './preview.ts';

// Sveltia starts by itself when it's loaded, unless this is set first. A static import
// would run before this line (imports are hoisted), so it's imported afterwards. Not with
// a top-level await: the page's DOMContentLoaded waits for this module to finish, and
// Sveltia's module waits for DOMContentLoaded, so neither would ever go on.
Object.assign(window, { CMS_MANUAL_INIT: true });
import('@sveltia/cms').then(setUp);

function setUp(CMS: typeof import('@sveltia/cms')) {
	// The config, read here rather than fetched by Sveltia, so its YAML anchors are resolved
	// by the yaml package and the `fields:` key that holds them can go: Sveltia would warn
	// that it doesn't know it.
	const { fields: _anchors, ...config } = parse(source, { merge: true }) as Record<string, unknown>;

	// How files are read and written: content-files.ts + Prettier.
	for (const [name, { extension, ...format }] of Object.entries(formats)) {
		CMS.registerCustomFormat(name, extension, format as never);
	}

	// ```yt, ```video… from src/lib/blocks.ts.
	for (const component of blockComponents()) CMS.registerEditorComponent(component as never);

	// The cover's focal point: a Svelte component inside Sveltia's React.
	const React = CMS.React as unknown as Parameters<typeof focalControl>[0] &
		Parameters<typeof articlePreview>[0];
	CMS.registerFieldType('focal', focalControl(React) as never);

	// The preview pane: posts and Devlog entries drawn with the site's own markdown components
	// and CSS (preview.ts); the Awesome list, in dev, its page as last saved (hosted, Sveltia's
	// own preview).
	CMS.registerPreviewStyle(previewStyles, { raw: true });
	for (const name of ['posts', 'drafts', 'devlog']) {
		CMS.registerPreviewTemplate(name, articlePreview(React) as never);
	}
	if (import.meta.env.DEV) {
		CMS.registerPreviewTemplate('modern-css', savedPage(React, '/awesome/modern-css') as never);
	}
	CMS.registerEventListener({ name: 'postSave', handler: saved } as never);

	CMS.init({ config: { ...config, load_config_file: false } } as never);
}
