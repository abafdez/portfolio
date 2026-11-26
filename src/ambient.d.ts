// Modules that only exist at build time, made by our own Vite plugins.

// Every Lucide icon's name (src/lib/cms/lucide-names.ts), for the CMS's icon picker.
declare module 'virtual:lucide-names' {
	const names: string[];
	export default names;
}

// A YAML file's data, parsed at build time (src/lib/yaml-data.ts): import site from
// '/content/site.yaml?data'. No YAML parser ships to the browser.
declare module '*.yaml?data' {
	const data: unknown;
	export default data;
}
