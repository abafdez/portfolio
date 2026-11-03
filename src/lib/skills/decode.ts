// A Svelte attachment ({@attach decode(text)}): when the element scrolls into view, its
// text "decodes" from random characters, left to right, like a terminal resolving it.
// Only visual: the element should be aria-hidden, with the real text next to it for
// screen readers (it's garbage while it runs). With reduced motion, or without JS,
// the text is just there.
import type { Attachment } from 'svelte/attachments';

const glyphs = '!<>-_\\/[]{}=+*^?#01';
const random = () => glyphs[Math.floor(Math.random() * glyphs.length)];

export function decode(text: string, duration = 600): Attachment<HTMLElement> {
	return (node) => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let frame = 0;
		const run = () => {
			const start = performance.now();
			const tick = (now: number) => {
				const progress = Math.min((now - start) / duration, 1);
				const done = Math.floor(progress * text.length);
				// The decoded part, then random glyphs (spaces stay spaces, so the words
				// keep their shape while they resolve).
				node.textContent =
					text.slice(0, done) +
					[...text.slice(done)].map((c) => (c === ' ' ? ' ' : random())).join('');
				if (progress < 1) frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		};

		// Once, the first time it's in view (a bit above the bottom edge).
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				observer.disconnect();
				run();
			},
			{ rootMargin: '0px 0px -10% 0px' }
		);
		observer.observe(node);

		// Svelte calls this when the element goes away.
		return () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
		};
	};
}
