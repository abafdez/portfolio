// A card that tilts in 3D toward the pointer (the hire panel's ID card, IdCard.svelte).
// The attachment writes --rx / --ry (the rotation) and --px / --py (where the pointer
// is, for the light) on the element, and data-tilting while it follows the pointer;
// the component's CSS does the rest. Only with a real pointer, never under reduced motion.
import type { Attachment } from 'svelte/attachments';

export function tilt(max = 8): Attachment<HTMLElement> {
	return (element) => {
		const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!fine || still) return;

		const move = (event: PointerEvent) => {
			const box = element.getBoundingClientRect();
			const x = (event.clientX - box.left) / box.width;
			const y = (event.clientY - box.top) / box.height;
			element.style.setProperty('--rx', `${((0.5 - y) * max * 2).toFixed(2)}deg`);
			element.style.setProperty('--ry', `${((x - 0.5) * max * 2).toFixed(2)}deg`);
			element.style.setProperty('--px', `${(x * 100).toFixed(1)}%`);
			element.style.setProperty('--py', `${(y * 100).toFixed(1)}%`);
			element.dataset.tilting = '';
		};
		const leave = () => {
			for (const name of ['--rx', '--ry', '--px', '--py']) element.style.removeProperty(name);
			delete element.dataset.tilting;
		};
		element.addEventListener('pointermove', move);
		element.addEventListener('pointerleave', leave);
		return () => {
			element.removeEventListener('pointermove', move);
			element.removeEventListener('pointerleave', leave);
			leave();
		};
	};
}

// Something that leans toward the pointer while it's near (the magnetic button):
// --mx / --my on the element, up to `pull` pixels, from pointer moves over `area`.
export function magnet(pull = 10): Attachment<HTMLElement> {
	return (element) => {
		const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const area = element.parentElement;
		if (!fine || still || !area) return;

		const move = (event: PointerEvent) => {
			const box = element.getBoundingClientRect();
			const dx = event.clientX - (box.left + box.width / 2);
			const dy = event.clientY - (box.top + box.height / 2);
			const reach = Math.max(box.width, box.height) * 1.5;
			const strength = Math.max(0, 1 - Math.hypot(dx, dy) / reach);
			element.style.setProperty('--mx', `${((dx / reach) * pull * strength * 2).toFixed(1)}px`);
			element.style.setProperty('--my', `${((dy / reach) * pull * strength * 2).toFixed(1)}px`);
		};
		const leave = () => {
			element.style.removeProperty('--mx');
			element.style.removeProperty('--my');
		};
		area.addEventListener('pointermove', move);
		area.addEventListener('pointerleave', leave);
		return () => {
			area.removeEventListener('pointermove', move);
			area.removeEventListener('pointerleave', leave);
		};
	};
}
