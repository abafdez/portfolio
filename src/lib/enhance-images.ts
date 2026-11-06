// Used by the markdown() plugin in vite.config.ts, after mdsvex has turned a post
// into HTML. Its own file so it can be unit-tested (enhance-images.test.ts).

// Images next to the post. mdsvex turns ![A diagram](./diagram.png) into
// <img src="./diagram.png" alt="A diagram">, and a browser reads ./ from the page's
// URL, not from the file's folder: a 404. So each local image becomes an import (Vite
// finds the file next to the .md, and the build fails if it's missing) and an
// <enhanced:img>, which makes AVIF and WebP copies and sets width and height (its
// space is kept while it loads: no layout shift). The imports go in the component's
// <script>. mdsvex leaves alt out when it's empty, so a missing one fails the build.
// They load lazily: only when they come near the screen.
// An image alone in its paragraph with a title, ![alt](./x.png "Caption"), becomes a
// <figure> with the title as its <figcaption> (a <figure> can't sit inside a <p>).
// \s+, not a space: mdsvex puts each attribute on its own line when a tag gets long.
const localImage = /<img\s+src="(\.\/[^"]+)"([^>]*?)\s*\/?>/g;
const captioned = /<p>(<img\s+src="\.\/[^"]+"[^>]*?)\s+title="([^"]*)"\s*\/?><\/p>/g;

export function enhanceImages(code: string, id: string): string {
	const imports: string[] = [];
	const html = code
		.replace(captioned, '<figure>$1><figcaption>$2</figcaption></figure>')
		.replace(localImage, (_, src: string, attributes: string) => {
			if (!/\salt="[^"]+"/.test(attributes)) {
				throw new Error(`${id}: ${src} needs alt text: ![What it shows](${src})`);
			}
			const name = `__image${imports.length}`;
			imports.push(`import ${name} from '${src}?enhanced';`);
			return `<enhanced:img src={${name}}${attributes} loading="lazy" />`;
		});
	// The first plain <script> is the component's own; the frontmatter is in
	// <script context="module">.
	return imports.length ? html.replace('<script>', `<script>\n\t${imports.join('\n\t')}`) : code;
}
