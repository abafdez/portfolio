// The skill bars fill up the first time they're on screen. A Svelte attachment on each
// bar ({@attach fillOnView}): an IntersectionObserver marks the bar data-filling once
// the whole of it is visible, and the CSS in Skill.svelte animates the fill from there.
// It watches the bar, not the fill: the observer measures the visible part of what it
// watches, clip-path included, and an empty fill is clipped to nothing, so it would
// never count as visible.
import type { Attachment } from 'svelte/attachments';

// One observer for every bar on the page, not one each: it watches them all.
let observer: IntersectionObserver | undefined;

export const fillOnView: Attachment<HTMLElement> = (bar) => {
	observer ??= new IntersectionObserver(
		(entries) => {
			// The bars that come into view together (all the ones on screen when the page
			// loads, say) start one after another, 70ms apart: a cascade down the list.
			const visible = entries.filter((entry) => entry.isIntersecting);
			visible.forEach((entry, i) => {
				const target = entry.target as HTMLElement;
				target.style.setProperty('--delay', `${i * 70}ms`);
				target.dataset.filling = '';
				// Once is enough: it doesn't empty again when it scrolls away.
				observer?.unobserve(target);
			});
		},
		// threshold 1: the whole bar is visible, not just its top pixel at the bottom
		// edge of the screen, so you see it fill.
		{ threshold: 1 }
	);

	observer.observe(bar);
	// Svelte calls this when the bar goes away.
	return () => observer?.unobserve(bar);
};
