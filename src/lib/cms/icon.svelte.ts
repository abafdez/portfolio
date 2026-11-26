// A Sveltia field type ("lucide") whose control is the icon picker (IconPicker.svelte).
// Like focal.svelte.ts: Sveltia renders field controls with its own React, so this React
// component only gives Svelte an element to mount into, and passes the props through a
// $state object.
import { mount, unmount } from 'svelte';
import IconPicker from './IconPicker.svelte';

type ControlProps = { forID: string; value?: string; onChange: (value: string) => void };
type ReactLike = {
	createElement: (type: string, props: object) => unknown;
	useRef: <T>(value: T) => { current: T };
	useEffect: (effect: () => void | (() => void), deps: unknown[]) => void;
};

export function iconControl(React: ReactLike) {
	return function IconControl({ forID, value, onChange }: ControlProps) {
		const target = React.useRef<HTMLElement | null>(null);
		const props = React.useRef<{ value?: string; onchange: (v: string) => void } | null>(null);

		React.useEffect(() => {
			const state = $state({ id: forID, value, onchange: onChange });
			props.current = state;
			const app = mount(IconPicker, { target: target.current!, props: state });
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
