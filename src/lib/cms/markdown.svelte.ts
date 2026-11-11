// The preview's body: the site's own <Markdown> (src/lib/markdown/), mounted live in
// Sveltia's preview pane. Sveltia draws the preview with React, so this is a React
// component that only gives Svelte an element to mount into (like focal.svelte.ts).
// The build renders the same component to HTML on the server (render.server.ts); here it
// runs in the browser, so what you see is drawn by the same code as the page.
import { mount, unmount, type ComponentProps } from 'svelte';
import Markdown from '#lib/markdown/Markdown.svelte';

type Props = ComponentProps<typeof Markdown>;
type ReactLike = {
	createElement: (type: string, props: object) => unknown;
	useRef: <T>(value: T) => { current: T };
	useEffect: (effect: () => void | (() => void), deps: unknown[]) => void;
};

export function markdownBody(React: ReactLike) {
	return function MarkdownBody({
		props,
		...attributes
	}: { props: Props } & Record<string, unknown>) {
		const target = React.useRef<HTMLElement | null>(null);
		const update = React.useRef<((props: Props) => void) | null>(null);

		React.useEffect(() => {
			// $state.raw: the tokens are replaced whole on every change, never edited, so
			// Svelte doesn't need to watch inside them (a post is thousands of tokens).
			let current = $state.raw(props);
			update.current = (next) => {
				current = next;
			};
			const app = mount(Markdown, {
				target: target.current!,
				props: {
					get tokens() {
						return current.tokens;
					},
					get file() {
						return current.file;
					},
					get locale() {
						return current.locale;
					},
					get highlighter() {
						return current.highlighter;
					},
					get media() {
						return current.media;
					}
				}
			});
			return () => void unmount(app);
		}, []);

		// React gives new props on every change; hand them to Svelte. A block, not an arrow's
		// value: whatever an effect returns, React calls as its cleanup on the next change,
		// and `update` used to return the props object ("l is not a function" in react-dom).
		React.useEffect(() => {
			update.current?.(props);
		}, [props]);

		return React.createElement('div', { ref: target, ...attributes });
	};
}
