import { describe, expect, test, vi } from 'vitest';
import type { Media } from '#lib/markdown/media.ts';

// mount() needs a DOM; here it records what it was given, and unmount() what it removed.
const log: { mounted: unknown[]; unmounted: unknown[]; context?: Map<symbol, unknown> } = {
	mounted: [],
	unmounted: []
};
vi.mock('svelte', async (original) => ({
	...(await original<typeof import('svelte')>()),
	mount: (component: unknown, options: { context: Map<symbol, unknown> }) => {
		log.mounted.push(component);
		log.context = options.context;
		return component;
	},
	unmount: (app: unknown) => void log.unmounted.push(app)
}));

const { mdsvexBody } = await import('./mdsvex.svelte.ts');

// A stand-in for React with its rule for effects: before an effect runs again, what it
// returned last time is called, so it must be a function or nothing. Breaking that rule
// was "l is not a function" in react-dom, on every keystroke after the first.
function fakeReact() {
	const refs: { current: unknown }[] = [];
	const effects: { deps: unknown[]; cleanup: unknown }[] = [];
	let hook = 0;
	let pending: (() => void)[] = [];
	const React = {
		useRef: <T>(value: T) => (refs[hook++] ??= { current: value }) as { current: T },
		useEffect: (fn: () => unknown, deps: unknown[]) => {
			const i = hook++;
			const old = effects[i];
			if (old && deps.every((dep, k) => dep === old.deps[k])) return;
			pending.push(() => {
				if (old && old.cleanup !== undefined) (old.cleanup as () => void)();
				effects[i] = { deps, cleanup: fn() };
			});
		},
		createElement: (_type: string, props: { ref: { current: unknown } }) => props
	};
	return {
		React,
		render(Component: (props: never) => unknown, props: object) {
			hook = 0;
			pending = [];
			const out = Component(props as never) as { ref: { current: unknown } };
			out.ref.current = {}; // the element React would have made
			for (const run of pending) run();
		}
	};
}

describe('mdsvexBody, the preview body in React', () => {
	test('a new compile is mounted in place of the last; new file URLs are not', () => {
		const { React, render } = fakeReact();
		const Body = mdsvexBody(React as never);
		const one = () => {};
		const two = () => {};
		const asset = (url: string) => (path: string) => `${url}/${path.slice(2)}`;

		expect(() => {
			render(Body, { component: one, asset: asset('/a'), locale: 'es' });
			render(Body, { component: one, asset: asset('/b'), locale: 'es' });
			render(Body, { component: two, asset: asset('/c'), locale: 'es' });
		}).not.toThrow();
		expect(log.mounted).toEqual([one, two]);
		expect(log.unmounted).toEqual([one]);

		// The contexts the body's components read (markdown/context.ts): the file's
		// language, and Sveltia's files, the latest URLs.
		const [locale, media] = [...log.context!.values()] as [() => string, () => Media];
		expect(locale()).toBe('es');
		expect(media().url('x.md', './clip.mp4')).toBe('/c/clip.mp4');
	});
});
