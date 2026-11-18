// A card that tilts in 3D toward the pointer (the hire panel's ID card, IdCard.svelte).
// It writes on the element:
//   --rx, --ry  the rotation, in degrees;
//   --px, --py  where the pointer is over the card, for a light (0% to 100%);
//   --tilt      how much it's tilting, 0 to 1 (the light's opacity, say).
// The component's CSS does the rest. Only with a real pointer, never under reduced motion.
//
// Two things it gets right that a plain pointermove on the card doesn't:
// - It anticipates. It listens to the pointer anywhere on the page, and starts leaning
//   while the pointer is still `reach` px away, more the closer it gets, so the tilt is
//   already under way when the pointer arrives instead of jumping on hover.
// - It doesn't bounce at the edges. It measures the card's untilted box: offsetLeft/Top
//   and offsetWidth/Height ignore transforms, against the offsetParent's box (which
//   isn't tilted). Measuring the tilted card (getBoundingClientRect) moved its edge
//   out from under the pointer, which reset the tilt, which brought the edge back...
//   So the card's offsetParent must not be transformed: give its wrapper
//   position: relative.
// The angles ease toward their target on every frame (exponential smoothing), so the
// motion is smooth however fast the pointer moves, and frames stop once it settles.
import type { Attachment } from 'svelte/attachments';

export function tilt(max = 8, reach = 120): Attachment<HTMLElement> {
	return (element) => {
		const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!fine || still) return;

		let pointer: { x: number; y: number } | null = null;
		const now = { rx: 0, ry: 0, tilt: 0, px: 50, py: 50 };
		let frame = 0;
		let last = 0;

		// The card's box as laid out, without its tilt, in viewport pixels.
		const box = () => {
			const parent = (element.offsetParent ?? document.body).getBoundingClientRect();
			const left = parent.left + element.offsetLeft;
			const top = parent.top + element.offsetTop;
			return { left, top, width: element.offsetWidth, height: element.offsetHeight };
		};

		// Where it should be for the pointer as it is now.
		const target = () => {
			if (!pointer) return { rx: 0, ry: 0, tilt: 0, px: now.px, py: now.py };
			const { left, top, width, height } = box();
			const x = Math.min(1, Math.max(0, (pointer.x - left) / width));
			const y = Math.min(1, Math.max(0, (pointer.y - top) / height));
			// Distance from the box (0 inside it), and a strength that rises smoothly from
			// 0 at `reach` px away to 1 at the edge.
			const dx = Math.max(left - pointer.x, 0, pointer.x - (left + width));
			const dy = Math.max(top - pointer.y, 0, pointer.y - (top + height));
			const t = Math.max(0, 1 - Math.hypot(dx, dy) / reach);
			const strength = t * t * (3 - 2 * t); // smoothstep
			return {
				rx: (0.5 - y) * max * 2 * strength,
				ry: (x - 0.5) * max * 2 * strength,
				tilt: strength,
				px: x * 100,
				py: y * 100
			};
		};

		const step = (time: number) => {
			const goal = target();
			// About 90% of the way in 300 ms, whatever the frame rate.
			const dt = Math.min(0.05, (time - (last || time)) / 1000);
			last = time;
			const k = 1 - Math.exp(-dt * 8);
			let moving = false;
			for (const key of ['rx', 'ry', 'tilt', 'px', 'py'] as const) {
				now[key] += (goal[key] - now[key]) * k;
				if (Math.abs(goal[key] - now[key]) > 0.01) moving = true;
			}
			element.style.setProperty('--rx', `${now.rx.toFixed(2)}deg`);
			element.style.setProperty('--ry', `${now.ry.toFixed(2)}deg`);
			element.style.setProperty('--px', `${now.px.toFixed(1)}%`);
			element.style.setProperty('--py', `${now.py.toFixed(1)}%`);
			element.style.setProperty('--tilt', now.tilt.toFixed(3));
			frame = moving ? requestAnimationFrame(step) : 0;
			if (!moving) last = 0;
		};
		const wake = () => {
			frame ||= requestAnimationFrame(step);
		};

		const move = (event: PointerEvent) => {
			pointer = { x: event.clientX, y: event.clientY };
			wake();
		};
		const away = () => {
			pointer = null;
			wake();
		};
		addEventListener('pointermove', move, { passive: true });
		document.documentElement.addEventListener('pointerleave', away);
		return () => {
			removeEventListener('pointermove', move);
			document.documentElement.removeEventListener('pointerleave', away);
			cancelAnimationFrame(frame);
			for (const name of ['--rx', '--ry', '--px', '--py', '--tilt']) {
				element.style.removeProperty(name);
			}
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
