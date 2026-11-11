import { describe, expect, test, vi } from 'vitest';

// mount() needs a DOM; here it only records the props it was given.
const mounted: { props?: Record<string, unknown> } = {};
vi.mock('svelte', async (original) => ({
	...(await original<typeof import('svelte')>()),
	mount: (_component: unknown, options: { props: Record<string, unknown> }) => {
		mounted.props = options.props;
		return {};
	},
	unmount: () => {}
}));

const { markdownBody } = await import('./markdown.svelte.ts');

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

describe('markdownBody, the preview body in React', () => {
	test('every change reaches the mounted component, and no effect breaks React', () => {
		const { React, render } = fakeReact();
		const Body = markdownBody(React as never);
		const props = (title: string) => ({ tokens: [title], file: 'a.md', locale: 'en' });
		expect(() => {
			render(Body, { props: props('One') });
			render(Body, { props: props('Two') });
			render(Body, { props: props('Three') });
		}).not.toThrow();
		expect(mounted.props?.tokens).toEqual(['Three']);
	});
});
