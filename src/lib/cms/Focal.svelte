<!--
	The cover's focal point: click the picture (or use the arrow keys) and the point is
	stored as "x% y%", ready for object-position. A Svelte component inside Sveltia,
	which only renders React: focal.svelte.ts mounts it from a small React wrapper.
-->
<script lang="ts">
	interface Props {
		id: string;
		src?: string;
		value?: string;
		onchange: (value: string) => void;
	}
	let { id, src, value, onchange }: Props = $props();
	// No cover next to the entry: the route answers 404 and the picture fails to load.
	let failed = $state(false);

	const point = $derived.by(() => {
		const [x = 50, y = 50] = (value ?? '').split(/\s+/).map(parseFloat).filter(Number.isFinite);
		return { x, y };
	});
	const clamp = (n: number) => Math.round(Math.min(100, Math.max(0, n)));
	const set = (x: number, y: number) => onchange(`${clamp(x)}% ${clamp(y)}%`);

	function pick(event: MouseEvent) {
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		set(
			((event.clientX - box.left) / box.width) * 100,
			((event.clientY - box.top) / box.height) * 100
		);
	}
	const steps: Record<string, [number, number]> = {
		ArrowLeft: [-5, 0],
		ArrowRight: [5, 0],
		ArrowUp: [0, -5],
		ArrowDown: [0, 5]
	};
	function nudge(event: KeyboardEvent) {
		const step = steps[event.key];
		if (!step) return;
		event.preventDefault();
		set(point.x + step[0], point.y + step[1]);
	}
</script>

<button {id} type="button" class="focal" onclick={pick} onkeydown={nudge}>
	{#if src && !failed}
		<img {src} alt="" onerror={() => (failed = true)} />
	{:else}
		<span class="empty">No cover next to this entry yet</span>
	{/if}
	<span class="dot" style:left="{point.x}%" style:top="{point.y}%" aria-hidden="true"></span>
	<span class="visually-hidden">Focal point {point.x}% {point.y}%. Arrow keys move it.</span>
</button>
<p class="readout">{value ?? 'Not set: the centre is used'}</p>

<style>
	.focal {
		position: relative;
		display: block;
		inline-size: 100%;
		aspect-ratio: 16 / 9;
		padding: 0;
		border: 1px solid #8888;
		border-radius: 4px;
		background: repeating-conic-gradient(#8882 0 25%, transparent 0 50%) 0 0 / 16px 16px;
		cursor: crosshair;
		overflow: clip;
	}
	img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}
	.empty {
		display: grid;
		place-items: center;
		block-size: 100%;
	}
	.dot {
		position: absolute;
		inline-size: 1.25rem;
		aspect-ratio: 1;
		translate: -50% -50%;
		border: 2px solid white;
		border-radius: 50%;
		box-shadow: 0 0 0 2px black;
		pointer-events: none;
	}
	.readout {
		margin: 0.25rem 0 0;
		font-family: monospace;
	}
	.visually-hidden {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
