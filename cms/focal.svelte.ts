// A Sveltia field type ("focal") whose control is a Svelte component. Sveltia renders
// field controls with its own React, so this is a React component that only gives
// Svelte an element to mount into, and passes the props through a $state object.
import { mount, unmount } from 'svelte';
import Focal from './Focal.svelte';

type ControlProps = {
	forID: string;
	value?: string;
	onChange: (value: string) => void;
	entry: { get: (key: string) => unknown };
};
type ReactLike = {
	createElement: (type: string, props: object) => unknown;
	useRef: <T>(value: T) => { current: T };
	useEffect: (effect: () => void | (() => void), deps: unknown[]) => void;
};

// The cover next to the entry, served in dev by cms/plugin.ts (Sveltia's getAsset() didn't
// find it): content/blog/published/<slug>/<slug>.md → /admin/cover/content/blog/published/<slug>
function coverOf(entry: ControlProps['entry']) {
	const path = String(entry.get('path') ?? '');
	return path ? `/admin/cover/${path.replace(/\/[^/]*$/, '')}` : undefined;
}

export function focalControl(React: ReactLike) {
	return function FocalControl({ forID, value, onChange, entry }: ControlProps) {
		const target = React.useRef<HTMLElement | null>(null);
		const props = React.useRef<{ value?: string; onchange: (v: string) => void } | null>(null);

		React.useEffect(() => {
			const state = $state({ id: forID, src: coverOf(entry), value, onchange: onChange });
			props.current = state;
			const app = mount(Focal, { target: target.current!, props: state });
			return () => void unmount(app);
		}, []);

		// React gives new props on every change; hand them to the Svelte state.
		React.useEffect(() => {
			if (!props.current) return;
			props.current.value = value;
			props.current.onchange = onChange;
		}, [value, onChange]);

		return React.createElement('div', { ref: target });
	};
}
