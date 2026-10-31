// View transitions with types (Chrome 125+, Safari 18.2+), and only for people who
// haven't asked for less motion. The CSS safety net in global.css can't help here:
// `*` doesn't match the ::view-transition-* pseudo-elements. Without a transition,
// the change just happens instantly.
export function canTransition(): boolean {
	return (
		typeof ViewTransition !== 'undefined' &&
		'types' in ViewTransition.prototype &&
		!matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}
