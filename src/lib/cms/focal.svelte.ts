// A Sveltia field type ("focal") whose control is a Svelte component. Sveltia renders
// field controls with its own React, so this is a React component that only gives
// Svelte an element to mount into, and passes the props through a $state object.
import { mount, unmount } from 'svelte';
import Focal from './Focal.svelte';
import { coverOf } from './covers.ts';

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

export function focalControl(React: ReactLike) {
	return function FocalControl({ forID, value, onChange, entry }: ControlProps) {
		const target = React.useRef<HTMLElement | null>(null);
		const props = React.useRef<{ value?: string; onchange: (v: string) => void } | null>(null);

		React.useEffect(() => {
			const state = $state({
				id: forID,
				src: coverOf(String(entry.get('path') ?? '')),
				value,
				onchange: onChange
			});
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
