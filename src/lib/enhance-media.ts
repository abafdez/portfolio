// Used by the markdown() plugin in vite.config.ts, after mdsvex has turned a post
// into HTML. Its own file so it can be unit-tested (enhance-media.test.ts).
//
// Files next to the post, written with ./: a browser reads ./ from the page's URL, not
// from the file's folder, so it would ask for a URL that doesn't exist (a 404). So
// each local file becomes an import: Vite finds the file next to the .md (the build
// fails if it's missing), copies it into the build with a hash in its name, and the
// import gives that URL. The imports go in the component's <script>.

// Images. mdsvex turns ![A diagram](./diagram.png) into
// <img src="./diagram.png" alt="A diagram">, and each becomes an <enhanced:img>, which
// makes AVIF and WebP copies and sets width and height (its space is kept while it
// loads: no layout shift). mdsvex leaves alt out when it's empty, so a missing one
// fails the build. They load lazily: only when they come near the screen.
// An image alone in its paragraph with a title, ![alt](./x.png "Caption"), becomes a
// <figure> with the title as its <figcaption> (a <figure> can't sit inside a <p>).
// \s+, not a space: mdsvex puts each attribute on its own line when a tag gets long.
const localImage = /<img\s+src="(\.\/[^"]+)"([^>]*?)\s*\/?>/g;
const captioned = /<p>(<img\s+src="\.\/[^"]+"[^>]*?)\s+title="([^"]*)"\s*\/?><\/p>/g;

// Videos. Markdown has no syntax for them, so they're written as HTML in the post:
// <video src="./clip.mp4" width="1280" height="720" controls muted ...></video>, or
// with <source src="./clip.webm"> children, a poster="./clip.png" and captions in a
// <track src="./clip.vtt">. Every ./ in a src or poster on those tags becomes an
// import; the file is used as it is (nothing is re-encoded). A <video> needs width and
// height, like an image: without them it has no size until the file arrives, and the
// page jumps.
const mediaTag = /<(video|source|track)\b[^>]*>/g;
const localFile = /\b(src|poster)="(\.\/[^"]+)"/g;

export function enhanceMedia(code: string, id: string): string {
	const imports: string[] = [];
	const html = code
		.replace(captioned, '<figure>$1><figcaption>$2</figcaption></figure>')
		.replace(localImage, (_, src: string, attributes: string) => {
			// An alt attribute is required. Markdown can't write an empty one (mdsvex
			// leaves alt out for ![](./x.png)), so alt="" only comes from a block that
			// marks its picture as decorative on purpose (```yt, blocks.ts).
			if (!/\salt="[^"]*"/.test(attributes)) {
				throw new Error(`${id}: ${src} needs alt text: ![What it shows](${src})`);
			}
			// mdsvex 0.12 doesn't escape quotes: ![A "big" one](./x.png) becomes
			// alt="A "big" one", which ends the attribute early and breaks the page with
			// nothing but a 500. A value's closing quote is followed by a space, / or >.
			if (/="[^"]*"[^\s/>]/.test(attributes)) {
				throw new Error(
					`${id}: ${src} has a double quote in its alt text or caption; use ' or “ ” instead`
				);
			}
			const name = `__image${imports.length}`;
			imports.push(`import ${name} from '${src}?enhanced';`);
			return `<enhanced:img src={${name}}${attributes} loading="lazy" />`;
		})
		.replace(mediaTag, (tag: string, element: string) => {
			if (element === 'video' && !(/\swidth="\d+"/.test(tag) && /\sheight="\d+"/.test(tag))) {
				throw new Error(
					`${id}: a <video> needs width and height (the size it was exported at), or the page jumps when it loads`
				);
			}
			return tag.replace(localFile, (_, attribute: string, src: string) => {
				const name = `__file${imports.length}`;
				imports.push(`import ${name} from '${src}';`);
				return `${attribute}={${name}}`;
			});
		});
	// The first plain <script> is the component's own; the frontmatter is in
	// <script context="module">.
	return imports.length ? html.replace('<script>', `<script>\n\t${imports.join('\n\t')}`) : code;
}
