// The skill bars fill up the first time they're on screen. A Svelte attachment on each
// bar ({@attach fillOnView}): it marks the bar "waiting" (an empty fill, in the CSS of
// Skill.svelte), and an IntersectionObserver marks it "filling" once the whole bar is
// visible, which starts the animation. Without JS nothing is marked and the bars are
// simply full; with reduced motion too.
// It watches the bar, not the fill: the observer measures the visible part of what it
// watches, clip-path included, and a waiting fill is clipped to nothing, so it never
// counted as visible and never filled.
import type { Attachment } from 'svelte/attachments';

// One observer for every bar on the page, not one each: it watches them all.
let observer: IntersectionObserver | undefined;

export const fillOnView: Attachment<HTMLElement> = (bar) => {
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

	observer ??= new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				(entry.target as HTMLElement).dataset.fill = 'filling';
				// Once is enough: it doesn't empty again when it scrolls away.
				observer?.unobserve(entry.target);
			}
		},
		// threshold 1: the whole bar is visible, not just its top pixel at the bottom
		// edge of the screen, so you see it fill.
		{ threshold: 1 }
	);

	bar.dataset.fill = 'waiting';
	observer.observe(bar);
	// Svelte calls this when the bar goes away.
	return () => observer?.unobserve(bar);
};
