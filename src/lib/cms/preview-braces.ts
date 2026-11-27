// A {expression} in a post runs in the build, but never in the CMS preview, the page that
// holds the GitHub token: the whole preview runs in the CMS's window (Sveltia's preview
// frame is same-origin, and the post is mounted by the CMS's own code). So the preview
// shows it as inline code instead, its source: {metadata.title} reads `metadata.title`.
// Only demos run there, in their sandboxed frame (SandboxDemo.svelte).
import type { ParsePlugin } from 'mdsvex/compile';

export const previewBraces: ParsePlugin = {
	mustache: { parse: (node) => () => void (node.type = 'code_span') }
};
