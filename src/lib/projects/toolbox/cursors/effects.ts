// Effects around the pointer, in three kinds. None of them is the cursor itself (the
// animated cursors are, cursors.ts):
// 1. Drawn on a canvas laid over the area (trail, sparkles, ghost, dot and ring, ripple,
//    burst). The canvas has `pointer-events: none`, so clicks reach what's under it.
// 2. Pure CSS (spotlight, flashlight, invert, parallax): this sets where the pointer is
//    as custom properties on the area (--x, --y in px; --dx, --dy from -1 to 1 around
//    the centre) and the page's CSS does the rest.
// 3. Moving elements (magnetic, tilt): [data-magnetic] and [data-tilt] in the area.
// Our own code; the list of effects is the one mouse-animations (MIT) shows.
//
// An attachment: {@attach pointerEffect(() => effect)} on the area, with its <canvas>
// inside. The effect is read through a function, so switching effects doesn't tear the
// attachment down. It draws only while something moves: each frame asks for the next
// only while a particle is alive or a follower is catching up. With reduced motion it
// does nothing.
import { prefersReducedMotion } from 'svelte/motion';
import type { Effect } from './cursors.ts';

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	gravity: number;
	life: number; // 1 → 0, also its opacity
	decay: number;
	size: number;
	kind: 'dot' | 'star' | 'ring';
}

// The same arrow as the cursors' (a 32 grid, tip at 4 3).
const arrow = 'M4 3v23l6-6 5 10 4-2-5-10h8z';
const most = 300;

export const pointerEffect = (effect: () => Effect) => (area: HTMLElement) => {
	const canvas = area.querySelector('canvas')!;
	const context = canvas.getContext('2d')!;
	const shape = new Path2D(arrow);
	let particles: Particle[] = [];
	// A follower eases a little of the way to the pointer each frame: the ghost arrow,
	// or the ring around the dot.
	const follower = { x: 0, y: 0, tx: 0, ty: 0, on: false };
	let frame = 0;
	let colour = '';

	// Sized to the area on entry, sharp on high-density screens; the colour is the
	// canvas's own `color` (var(--brand) in the page's CSS), resolved by the browser.
	function fit() {
		const ratio = devicePixelRatio;
		canvas.width = area.clientWidth * ratio;
		canvas.height = area.clientHeight * ratio;
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		colour = getComputedStyle(canvas).color;
	}

	function draw() {
		context.clearRect(0, 0, area.clientWidth, area.clientHeight);
		for (const p of particles) {
			p.x += p.vx;
			p.y += p.vy;
			p.vy += p.gravity;
			p.life -= p.decay;
		}
		particles = particles.filter((p) => p.life > 0);

		context.fillStyle = colour;
		context.strokeStyle = colour;
		context.lineWidth = 1.5;
		for (const p of particles) {
			context.globalAlpha = p.life;
			context.beginPath();
			if (p.kind === 'dot') {
				context.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
				context.fill();
			} else if (p.kind === 'ring') {
				// A ripple grows as it fades.
				context.arc(p.x, p.y, p.size + (1 - p.life) * 48, 0, Math.PI * 2);
				context.stroke();
			} else {
				const s = p.size * p.life;
				context.moveTo(p.x - s, p.y);
				context.lineTo(p.x + s, p.y);
				context.moveTo(p.x, p.y - s);
				context.lineTo(p.x, p.y + s);
				context.stroke();
			}
		}

		let catching = false;
		if (follower.on) {
			follower.x += (follower.tx - follower.x) * 0.15;
			follower.y += (follower.ty - follower.y) * 0.15;
			catching = Math.hypot(follower.tx - follower.x, follower.ty - follower.y) > 0.5;
			if (effect() === 'ghost') {
				context.globalAlpha = 0.6;
				context.save();
				context.translate(follower.x - 4, follower.y - 3);
				context.fill(shape);
				context.restore();
			} else {
				// Dot and ring: the dot is exactly at the pointer, the ring lags.
				context.globalAlpha = 1;
				context.beginPath();
				context.arc(follower.tx, follower.ty, 3, 0, Math.PI * 2);
				context.fill();
				context.beginPath();
				context.arc(follower.x, follower.y, 14, 0, Math.PI * 2);
				context.stroke();
			}
		}
		context.globalAlpha = 1;

		frame = particles.length || catching ? requestAnimationFrame(draw) : 0;
	}

	const wake = () => {
		if (!frame) frame = requestAnimationFrame(draw);
	};

	const at = (event: PointerEvent) => {
		const box = area.getBoundingClientRect();
		return { x: event.clientX - box.left, y: event.clientY - box.top, box };
	};

	// Magnetic: an element within reach moves a third of the way towards the pointer.
	// Tilt: a card leans towards the pointer, up to 14° each way.
	function moveThings(event: PointerEvent | null, kind: Effect | null) {
		for (const element of area.querySelectorAll<HTMLElement>('[data-magnetic]')) {
			const box = element.getBoundingClientRect();
			const dx = event ? event.clientX - (box.left + box.width / 2) : 0;
			const dy = event ? event.clientY - (box.top + box.height / 2) : 0;
			const near = kind === 'magnetic' && Math.hypot(dx, dy) < 120;
			element.style.translate = near ? `${dx / 3}px ${dy / 3}px` : '';
		}
		for (const element of area.querySelectorAll<HTMLElement>('[data-tilt]')) {
			const box = element.getBoundingClientRect();
			const px = event ? (event.clientX - box.left) / box.width : 0.5;
			const py = event ? (event.clientY - box.top) / box.height : 0.5;
			const inside = kind === 'tilt' && px >= 0 && px <= 1 && py >= 0 && py <= 1;
			// Up to 14° each way, under a short perspective, or the turn barely shows on
			// a flat card. --px/--py place a highlight where the pointer is (CSS).
			element.style.transform = inside
				? `perspective(30rem) rotateX(${(0.5 - py) * 28}deg) rotateY(${(px - 0.5) * 28}deg)`
				: '';
			element.style.setProperty('--px', `${px * 100}%`);
			element.style.setProperty('--py', `${py * 100}%`);
			element.toggleAttribute('data-tilting', inside);
		}
	}

	function move(event: PointerEvent) {
		if (prefersReducedMotion.current) return;
		const { x, y, box } = at(event);
		area.style.setProperty('--x', `${x}px`);
		area.style.setProperty('--y', `${y}px`);
		area.style.setProperty('--dx', `${(x / box.width) * 2 - 1}`);
		area.style.setProperty('--dy', `${(y / box.height) * 2 - 1}`);

		const kind = effect();
		if (kind === 'trail') {
			particles.push({
				x,
				y,
				vx: 0,
				vy: 0,
				gravity: 0,
				life: 1,
				decay: 0.04,
				size: 6,
				kind: 'dot'
			});
		} else if (kind === 'sparkles') {
			for (let i = 0; i < 2; i++) {
				particles.push({
					x,
					y,
					vx: (Math.random() - 0.5) * 3,
					vy: (Math.random() - 0.8) * 2,
					gravity: 0.05,
					life: 1,
					decay: 0.02 + Math.random() * 0.02,
					size: 3 + Math.random() * 4,
					kind: 'star'
				});
			}
		}
		particles = particles.slice(-most);
		if (kind === 'ghost' || kind === 'ring') {
			if (!follower.on) Object.assign(follower, { x, y });
			Object.assign(follower, { tx: x, ty: y, on: true });
		} else {
			follower.on = false;
		}
		moveThings(event, kind);
		wake();
	}

	// Ripple and burst happen where you press.
	function press(event: PointerEvent) {
		if (prefersReducedMotion.current) return;
		const { x, y } = at(event);
		const kind = effect();
		if (kind === 'ripple') {
			particles.push({
				x,
				y,
				vx: 0,
				vy: 0,
				gravity: 0,
				life: 1,
				decay: 0.025,
				size: 4,
				kind: 'ring'
			});
		} else if (kind === 'burst') {
			for (let i = 0; i < 18; i++) {
				const angle = (i / 18) * Math.PI * 2;
				const speed = 2 + Math.random() * 2;
				particles.push({
					x,
					y,
					vx: Math.cos(angle) * speed,
					vy: Math.sin(angle) * speed,
					gravity: 0.08,
					life: 1,
					decay: 0.025,
					size: 2 + Math.random() * 2,
					kind: 'dot'
				});
			}
		}
		wake();
	}

	function leave() {
		follower.on = false;
		moveThings(null, null);
		wake();
	}

	area.addEventListener('pointerenter', fit);
	area.addEventListener('pointermove', move);
	area.addEventListener('pointerdown', press);
	area.addEventListener('pointerleave', leave);
	return () => {
		cancelAnimationFrame(frame);
		area.removeEventListener('pointerenter', fit);
		area.removeEventListener('pointermove', move);
		area.removeEventListener('pointerdown', press);
		area.removeEventListener('pointerleave', leave);
	};
};
