// A Svelte attachment for a list ({@attach spotlight} on the <ul>): as the pointer
// moves over it, every item gets --x and --y, the pointer's position relative to that
// item. The CSS (Skill.svelte, TagCloud.svelte) draws a glow there. Because every item
// gets them, not only the one under the pointer, the glow spills onto the borders of
// the items next to it, like one light moving over the whole list.
import type { Attachment } from 'svelte/attachments';

export const spotlight: Attachment<HTMLElement> = (list) => {
	const move = (event: PointerEvent) => {
		for (const item of list.children as HTMLCollectionOf<HTMLElement>) {
			const box = item.getBoundingClientRect();
			item.style.setProperty('--x', `${event.clientX - box.left}px`);
			item.style.setProperty('--y', `${event.clientY - box.top}px`);
		}
	};

	list.addEventListener('pointermove', move);
	// Svelte calls this when the list goes away.
	return () => list.removeEventListener('pointermove', move);
};
