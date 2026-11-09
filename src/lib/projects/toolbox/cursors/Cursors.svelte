<script lang="ts">
	// Cursors and selection: a guide and a playground in one page, one tab per part.
	// Each part has what it does, when to use it, what to avoid (Guide.svelte, text in
	// guide.ts) and a demo. The cursor data, the SVG builder and the animation frames
	// are in cursors.ts; the pointer effects are in effects.ts.
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { replaceState } from '$app/navigation';
	import { formatNumber, m, text } from '#lib/i18n/index.ts';
	import CopyButton from '../CopyButton.svelte';
	import { contrast, level } from '../../contrast/contrast.ts';
	import Guide from './Guide.svelte';
	import { guide, samples, sections } from './guide.ts';
	import { pointerEffect } from './effects.ts';
	import { canSplit, maxBytes, playFrames, splitGif, type Frame } from './gif.ts';
	import spinnerGif from './spinner.gif';
	import {
		animatedCursor,
		animationCode,
		animations,
		cursorSvg,
		cursorValue,
		dataUrl,
		effectGroups,
		effects,
		fallbacks,
		keyframesCode,
		hotspotAt,
		keywordGroups,
		shapes,
		sizes,
		type Animation,
		type CursorOptions,
		type Effect,
		type Shape
	} from './cursors.ts';

	const id = $props.id();

	let ready = $state(false);

	// --- Tabs (the ARIA tabs pattern) ---
	// The open tab is in the URL's hash (#user-select), so a link can open one. Without
	// JS there are no tabs: every part shows, one after another.
	let active = $state(sections[0].id);
	let tablist: HTMLElement;
	function open(next: string, focus = false) {
		active = next;
		replaceState(`#${next}`, {});
		if (focus) tablist.querySelector<HTMLElement>(`[aria-controls="${next}"]`)?.focus();
	}
	// Arrow keys move between tabs (and open them), Home and End jump to the ends; Tab
	// itself leaves the row, so it's one stop, not six.
	function onTabKey(event: KeyboardEvent) {
		const i = sections.findIndex((s) => s.id === active);
		const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: sections.length - 1 }[
			event.key
		];
		if (next === undefined) return;
		event.preventDefault();
		open(sections[(next + sections.length) % sections.length].id, true);
	}

	// --- Keywords: a click copies the tile's CSS ---
	let copied = $state('');
	async function copy(css: string) {
		try {
			await navigator.clipboard.writeText(css);
			copied = m.cursorsCopied({ css });
		} catch {
			copied = m.codeCopyFailed();
		}
	}

	// --- Your own cursor ---
	let shape = $state<Shape>('arrow');
	let color = $state('#50fa7b');
	let size = $state<CursorOptions['size']>(32);
	let fallback = $state<CursorOptions['fallback']>('auto');
	let x = $state(4);
	let y = $state(3);
	// A new shape or size puts the hotspot back where that shape clicks.
	function reshape(next: { shape?: Shape; size?: CursorOptions['size'] }) {
		shape = next.shape ?? shape;
		size = next.size ?? size;
		[x, y] = hotspotAt(shape, size);
	}
	const options = $derived({ shape, color, size, x, y, fallback });
	const svgUrl = $derived(dataUrl(cursorSvg(options)));
	const value = $derived(cursorValue(options));
	const css = $derived(`.element {\n\tcursor: ${value};\n}`);

	// --- Animated cursors: swap the frames while the pointer is over the element ---
	// An attachment per element; it starts again when the colour changes. With reduced
	// motion the first frame stays.
	const animate = (animation: Animation, colour: string) => (node: HTMLElement) => {
		const frames = animatedCursor(animation, colour);
		let timer: ReturnType<typeof setInterval> | undefined;
		let frame = 0;
		const show = () => (node.style.cursor = frames[frame++ % frames.length]);
		const start = () => {
			frame = 0;
			show();
			if (!prefersReducedMotion.current) timer = setInterval(show, animations[animation].interval);
		};
		const stop = () => clearInterval(timer);
		node.style.cursor = frames[0];
		node.addEventListener('pointerenter', start);
		node.addEventListener('pointerleave', stop);
		return () => {
			stop();
			node.removeEventListener('pointerenter', start);
			node.removeEventListener('pointerleave', stop);
		};
	};
	let effect = $state<Effect>('trail');

	// --- GIFs: the sample (spinner.gif, made by scripts/cursor-gif.ts) or your own,
	// split into frames once JS runs ---
	let gifFrames = $state<Frame[]>([]);
	let gifStatus = $state('');
	let splittable = $state(true);
	const gifInfo = (frames: Frame[]) =>
		m.cursorsGifInfo({
			count: frames.length,
			ms: Math.round(frames.reduce((sum, f) => sum + f.duration, 0) / frames.length)
		});
	async function useGif(data: ArrayBuffer | Blob) {
		try {
			gifFrames = await splitGif(data);
			gifStatus = gifInfo(gifFrames);
		} catch {
			gifStatus = m.cursorsGifFailed();
		}
	}
	function pickGif(event: Event & { currentTarget: HTMLInputElement }) {
		const file = event.currentTarget.files?.[0];
		if (!file) return;
		if (file.size > maxBytes) {
			gifStatus = m.cursorsGifTooBig({ max: `${formatNumber(maxBytes / 1024 / 1024, 0)} MB` });
			return;
		}
		useGif(file);
	}

	// --- pointer-events ---
	let through = $state(false);
	let buttonClicks = $state(0);
	let layerClicks = $state(0);
	// The layer is decoration (aria-hidden), so its click counter is a plain listener
	// rather than an onclick, which would ask for keyboard support it shouldn't have.
	const countLayer = (node: HTMLElement) => {
		const count = () => layerClicks++;
		node.addEventListener('click', count);
		return () => node.removeEventListener('click', count);
	};

	// --- user-select: show what the selection picked up ---
	let selected = $state('');

	// --- ::selection ---
	let fg = $state('#1a1b26');
	let bg = $state('#ffd23f');
	const rgb = (hex: string) =>
		[1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
	// Cut, not rounded, like the contrast checker: 4.499 isn't 4.5.
	const ratio = $derived(Math.floor(contrast(rgb(fg), rgb(bg)) * 100) / 100);
	const verdict = $derived(
		{ AAA: m.cursorsAAA, AA: m.cursorsAA, large: m.cursorsLarge, fail: m.cursorsFail }[
			level(ratio)
		]()
	);
	const selectionCss = $derived(`::selection {\n\tcolor: ${fg};\n\tbackground-color: ${bg};\n}`);
	let sample: HTMLElement;
	function selectSample() {
		const range = document.createRange();
		range.selectNodeContents(sample);
		const current = document.getSelection();
		current?.removeAllRanges();
		current?.addRange(range);
	}

	onMount(() => {
		ready = true;
		// The hash opens its tab on arrival, and later too: a link to #user-select on
		// this page changes only the hash.
		splittable = canSplit();
		if (splittable) {
			fetch(spinnerGif)
				.then((response) => response.arrayBuffer())
				.then(useGif);
		} else {
			gifStatus = m.cursorsGifCant();
		}
		const fromHash = () => {
			const hash = location.hash.slice(1);
			if (sections.some((s) => s.id === hash)) active = hash;
		};
		fromHash();
		window.addEventListener('hashchange', fromHash);
		const read = () => (selected = document.getSelection()?.toString().slice(0, 80) ?? '');
		document.addEventListener('selectionchange', read);
		return () => {
			window.removeEventListener('hashchange', fromHash);
			document.removeEventListener('selectionchange', read);
		};
	});
</script>

<!-- Only where the main pointer can't hover (phones, tablets). -->
<p class="touch">{m.cursorsTouch()}</p>
<p class="needs-js">{m.toolboxNeedsJs()}</p>

<div class="tabs" role="tablist" aria-label={m.cursorsParts()} bind:this={tablist}>
	{#each sections as section (section.id)}
		<button
			type="button"
			role="tab"
			id="{id}-tab-{section.id}"
			aria-controls={section.id}
			aria-selected={active === section.id}
			tabindex={active === section.id ? 0 : -1}
			onclick={() => open(section.id)}
			onkeydown={onTabKey}
		>
			{text(section.tab)}
		</button>
	{/each}
</div>

{#snippet panel(section: (typeof sections)[number], demo: import('svelte').Snippet)}
	<div
		id={section.id}
		class="panel sheet"
		role="tabpanel"
		aria-labelledby="{id}-tab-{section.id}"
		data-active={active === section.id || undefined}
	>
		<h2>{text(section.title)}</h2>
		<Guide {section} />
		{@render demo()}
	</div>
{/snippet}

<!-- 1. Keywords -->
{#snippet keywords()}
	<p class="hint">{m.cursorsTry()}</p>
	<p class="status" role="status">{copied}</p>
	{#each keywordGroups as group (group.name.en)}
		<h3>{text(group.name)}</h3>
		<ul class="keywords">
			{#each group.keywords as keyword (keyword.value)}
				<li>
					<!-- The button wears its own cursor: hovering it is the demo. -->
					<button
						type="button"
						style:cursor={keyword.value}
						onclick={() => copy(`cursor: ${keyword.value};`)}
					>
						<code>{keyword.value}</code>
						<span>{text(keyword.when)}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/each}
{/snippet}
{@render panel(guide.cursor, keywords)}

<!-- 2. Your own cursor -->
{#snippet builder()}
	<div class="builder">
		<fieldset class="controls" disabled={!ready}>
			<div class="field">
				<label for="{id}-shape">{m.cursorsShape()}</label>
				<select
					id="{id}-shape"
					value={shape}
					onchange={(event) => reshape({ shape: event.currentTarget.value as Shape })}
				>
					{#each Object.entries(shapes) as [value, { name }] (value)}
						<option {value}>{text(name)}</option>
					{/each}
				</select>
			</div>
			<div class="field">
				<label for="{id}-color">{m.cursorsColor()}</label>
				<input id="{id}-color" type="color" bind:value={color} />
			</div>
			<div class="field">
				<label for="{id}-size">{m.cursorsSize()}</label>
				<select
					id="{id}-size"
					value={size}
					onchange={(event) =>
						reshape({ size: Number(event.currentTarget.value) as CursorOptions['size'] })}
				>
					{#each sizes as value (value)}
						<option {value}>{value} × {value}</option>
					{/each}
				</select>
			</div>
			<div class="field">
				<label for="{id}-fallback">{m.cursorsFallback()}</label>
				<select id="{id}-fallback" bind:value={fallback}>
					{#each fallbacks as value (value)}
						<option {value}>{value}</option>
					{/each}
				</select>
			</div>
			<div class="field">
				<label for="{id}-x">{m.cursorsHotspotX()}: <output for="{id}-x">{x}</output></label>
				<input id="{id}-x" type="range" min="0" max={size - 1} bind:value={x} />
			</div>
			<div class="field">
				<label for="{id}-y">{m.cursorsHotspotY()}: <output for="{id}-y">{y}</output></label>
				<input id="{id}-y" type="range" min="0" max={size - 1} bind:value={y} />
			</div>
		</fieldset>

		<!-- Four times bigger, on a checkerboard so the edge shows; the dot is the hotspot. -->
		<div class="zoom" style:--size="{size * 4}px">
			<img src={svgUrl} alt={m.cursorsPreview()} width={size * 4} height={size * 4} />
			<span class="dot" style:left="{(x + 0.5) * 4}px" style:top="{(y + 0.5) * 4}px"></span>
		</div>
	</div>

	<p class="area" style:cursor={ready ? value : undefined}>{m.cursorsArea()}</p>

	<div class="output">
		<div class="label-row">
			<label for="{id}-css">{m.cursorsCss()}</label>
			<CopyButton value={css} what={m.cursorsCss()} />
		</div>
		<textarea id="{id}-css" rows="4" readonly spellcheck="false" value={css}></textarea>
	</div>
{/snippet}
{@render panel(guide.custom, builder)}

<!-- 3. Animated cursors and pointer effects -->
{#snippet moving()}
	{#if prefersReducedMotion.current}<p class="hint">{m.cursorsStill()}</p>{/if}
	<p class="hint">{m.cursorsAnimationsHint()}</p>
	<!-- In the builder's colour: change it there and these follow. -->
	<ul class="animations">
		{#each Object.entries(animations) as [name, animation] (name)}
			<li {@attach animate(name as Animation, color)}>{text(animation.name)}</li>
		{/each}
	</ul>

	<h3>{m.cursorsTheme()}</h3>
	<div class="theme">
		<p class="theme-heading" {@attach animate('spinner', color)}>{text(samples.themeHeading)}</p>
		<p {@attach animate('blink', color)}>{text(samples.themeText)}</p>
		<button type="button" class="action" {@attach animate('pulse', color)}>
			{text(samples.themeButton)}
		</button>
	</div>

	<div class="output">
		<div class="label-row">
			<label for="{id}-code">{m.cursorsCode()}</label>
			<CopyButton value={animationCode} what={m.cursorsCode()} />
		</div>
		<textarea id="{id}-code" rows="12" readonly spellcheck="false" value={animationCode}></textarea>
	</div>
	<div class="output">
		<div class="label-row">
			<label for="{id}-keyframes">{m.cursorsCssOnly()}</label>
			<CopyButton value={keyframesCode} what={m.cursorsCssOnly()} />
		</div>
		<textarea id="{id}-keyframes" rows="12" readonly spellcheck="false" value={keyframesCode}
		></textarea>
	</div>

	<h3>{m.cursorsGifs()}</h3>
	<p class="hint">{m.cursorsGifsHint()}</p>
	<div class="gifs">
		<!-- Left: the GIF as a plain cursor (first frame only). The picture beside it is
		     the same file as an image, which does move: images animate, cursors don't. -->
		<figure>
			<div class="area" style:cursor="url({spinnerGif}) 16 16, auto">
				<img src={spinnerGif} alt="" width="32" height="32" />
			</div>
			<figcaption>{m.cursorsGifAsIs()}</figcaption>
		</figure>
		<figure>
			<div
				class="area"
				{@attach playFrames(
					() => gifFrames,
					() => prefersReducedMotion.current
				)}
			>
				{m.cursorsEffectsArea()}
			</div>
			<figcaption>{m.cursorsGifFrames()}</figcaption>
		</figure>
	</div>
	<label class="gif-pick">
		{m.cursorsGifYours()}
		<input type="file" accept="image/gif" disabled={!ready || !splittable} onchange={pickGif} />
	</label>
	<p class="status" role="status">{gifStatus}</p>

	<h3>{m.cursorsEffects()}</h3>
	<div class="field effect-pick">
		<label for="{id}-effect">{m.cursorsEffect()}</label>
		<select id="{id}-effect" bind:value={effect} disabled={!ready || prefersReducedMotion.current}>
			{#each effectGroups as group (group.name.en)}
				<optgroup label={text(group.name)}>
					{#each Object.entries(group.effects) as [value, info] (value)}
						<option {value}>{text(info.name)}</option>
					{/each}
				</optgroup>
			{/each}
		</select>
		<p class="hint">{text(effects[effect].how)}</p>
	</div>
	<!-- A small scene for the effects (effects.ts): shapes at the back for parallax, a
	     button for the magnet, a card to tilt; the canvas, the flashlight and the invert
	     lens on top, all with pointer-events: none, like any decoration. -->
	<div class="playground" data-effect={effect} {@attach pointerEffect(() => effect)}>
		<div class="layers" aria-hidden="true"><span></span><span></span><span></span></div>
		<div class="scene">
			<p>{m.cursorsEffectsArea()}</p>
			<button type="button" class="action" data-magnetic>{m.cursorsMagnet()}</button>
			<div class="card" data-tilt>{m.cursorsTiltCard()}</div>
		</div>
		<canvas aria-hidden="true"></canvas>
		<div class="lamp" aria-hidden="true"></div>
		<div class="lens" aria-hidden="true"></div>
	</div>
{/snippet}
{@render panel(guide.animated, moving)}

<!-- 4. pointer-events -->
{#snippet pointer()}
	<div class="stage">
		<button type="button" class="target" onclick={() => buttonClicks++}>{m.cursorsButton()}</button>
		<div class="layer" class:through aria-hidden="true" {@attach countLayer}></div>
	</div>
	<label class="toggle">
		<input type="checkbox" bind:checked={through} disabled={!ready} />
		<code>pointer-events: none</code>
		{m.cursorsThrough()}
	</label>
	<p class="status" role="status">
		{m.cursorsClicks({ button: buttonClicks, layer: layerClicks })}
	</p>
	<p class="hint">{m.cursorsKeyboard()}</p>
{/snippet}
{@render panel(guide.pointerEvents, pointer)}

<!-- 5. user-select -->
{#snippet selecting()}
	<div class="selects">
		<figure>
			<figcaption><code>user-select: none</code></figcaption>
			<p class="select-none">{text(samples.none)}</p>
		</figure>
		<figure>
			<figcaption><code>user-select: auto</code></figcaption>
			<p>{text(samples.auto)}</p>
		</figure>
		<figure>
			<figcaption><code>user-select: all</code></figcaption>
			<p class="select-all"><code>pnpm data:symbols</code></p>
		</figure>
		<figure>
			<figcaption><code>none</code> + <code>text</code></figcaption>
			<p class="select-none">
				{text(samples.textOuter)}<span class="select-text">{text(samples.textInner)}</span>
			</p>
		</figure>
	</div>
	<p class="status" role="status">
		{m.cursorsSelected()} <q>{selected || m.cursorsNothing()}</q>
	</p>
{/snippet}
{@render panel(guide.userSelect, selecting)}

<!-- 6. ::selection -->
{#snippet colours()}
	<fieldset class="controls colours" disabled={!ready}>
		<div class="field">
			<label for="{id}-fg">{m.cursorsText()}</label>
			<input id="{id}-fg" type="color" bind:value={fg} />
		</div>
		<div class="field">
			<label for="{id}-bg">{m.cursorsBackground()}</label>
			<input id="{id}-bg" type="color" bind:value={bg} />
		</div>
		<button type="button" class="action" onclick={selectSample}>{m.cursorsSelectIt()}</button>
	</fieldset>
	<p
		class="sample"
		style:--selection-text={fg}
		style:--selection-background={bg}
		bind:this={sample}
	>
		{text(samples.selection)}
	</p>
	<p class="status" class:fail={level(ratio) === 'fail'}>
		{m.cursorsContrast({ ratio: formatNumber(ratio, 2) })} · {verdict}
	</p>

	<div class="output">
		<div class="label-row">
			<label for="{id}-selection-css">{m.cursorsCss()}</label>
			<CopyButton value={selectionCss} what={m.cursorsCss()} />
		</div>
		<textarea id="{id}-selection-css" rows="4" readonly spellcheck="false" value={selectionCss}
		></textarea>
	</div>
{/snippet}
{@render panel(guide.selection, colours)}

<style>
	h3 {
		margin-block-start: var(--size-5);
		font-family: var(--font-label);
		font-size: var(--font-size-1);
	}

	.needs-js {
		display: none;
		margin-block-start: var(--size-5);
		color: var(--text-2);

		@media (scripting: none) {
			display: block;
		}
	}

	/* The touch note: only where the main pointer can't hover. */
	.touch {
		display: none;
		margin-block-start: var(--size-5);
		padding: var(--size-3) var(--size-4);
		border-inline-start: var(--border-size-3) solid var(--callout-warning);
		border-radius: var(--radius-2);
		background: var(--surface-2);

		@media (hover: none) {
			display: block;
		}
	}

	/* --- Tabs --- */
	/* The open tab joins its panel, a sheet, like a folder's tab: the tab covers the
	   sheet's top border with its own background (z-index: above the sheet). */
	.tabs {
		position: relative;
		z-index: 1;
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-1);
		margin-block-start: var(--size-6);

		/* Without JS there are no tabs: every part shows. */
		@media (scripting: none) {
			display: none;
		}

		& button {
			margin-block-end: calc(-1 * var(--border-size-1));
			padding: var(--size-2) var(--size-3);
			border: var(--border-size-1) solid var(--surface-3);
			border-block-end: none;
			border-radius: var(--radius-2) var(--radius-2) 0 0;
			/* The tabs behind, on --surface-2: their labels never sit on the grid. */
			background: var(--surface-2);
			color: var(--text-2);
			font-family: var(--font-label);
			font-size: var(--font-size-1);
			cursor: pointer;

			&:hover {
				color: var(--text-1);
			}

			&[aria-selected='true'] {
				border-color: var(--surface-3);
				/* In the sheet's colour, over the sheet's top border: tab and panel join. */
				border-block-end: var(--border-size-1) solid var(--surface-1);
				background: var(--surface-1);
				color: var(--brand);
			}

			&:focus-visible {
				outline: var(--border-size-2) solid var(--brand);
				outline-offset: -2px;
			}
		}
	}

	.panel {
		border-start-start-radius: 0;

		/* With JS, only the open tab's panel (data-active, set in the HTML too, so
		   nothing jumps when the page wakes up). Without, all of them. */
		@media (scripting: enabled) {
			&:not([data-active]) {
				display: none;
			}
		}

		/* No tabs to join: a sheet like any other, one after another. */
		@media (scripting: none) {
			margin-block-start: var(--size-8);
			border-start-start-radius: var(--radius-3);
		}
	}

	.hint,
	.status {
		margin-block-start: var(--size-3);
		font-family: var(--font-label);
		font-size: var(--font-size-0);
		color: var(--text-2);
	}

	.status:empty {
		display: none;
	}

	.status.fail {
		color: var(--error);
	}

	code {
		font-family: var(--font-code);
	}

	/* --- Keywords --- */
	.keywords {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
		gap: var(--size-2);
		margin-block-start: var(--size-2);
		padding: 0;
		list-style: none;

		& button {
			display: grid;
			gap: var(--size-1);
			inline-size: 100%;
			block-size: 100%;
			padding: var(--size-3);
			border: var(--border-size-1) solid var(--surface-3);
			border-radius: var(--radius-2);
			background: var(--surface-2);
			color: var(--text-2);
			text-align: start;
			font-size: var(--font-size-0);

			&:hover {
				border-color: var(--brand);
			}

			&:focus-visible {
				outline: var(--border-size-2) solid var(--brand);
				outline-offset: 2px;
			}
		}

		& code {
			color: var(--text-1);
			font-size: var(--font-size-1);
		}
	}

	/* --- Forms shared by the builder and the selection colours --- */
	.controls {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 10rem), 1fr));
		gap: var(--size-3);
		padding: 0;
		border: none;
	}

	.field {
		display: grid;
		gap: var(--size-1);
		align-content: start;
	}

	label {
		font-family: var(--font-label);
		font-size: var(--font-size-1);
	}

	select,
	textarea {
		inline-size: 100%;
		padding: var(--size-2) var(--size-3);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
		color: var(--text-1);
		font: inherit;
	}

	input[type='color'] {
		inline-size: 100%;
		block-size: 2.5rem;
		padding: var(--size-1);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-2);
	}

	input[type='range'],
	input[type='checkbox'] {
		accent-color: var(--brand);
	}

	:is(select, textarea, input, button):focus-visible {
		outline: var(--border-size-2) solid var(--brand);
		outline-offset: 1px;
	}

	textarea {
		font-family: var(--font-code);
		font-size: var(--font-size-0);
		resize: vertical;
		tab-size: 2;
		overflow-wrap: anywhere;
	}

	.output {
		display: grid;
		gap: var(--size-2);
		margin-block-start: var(--size-4);
	}

	.label-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--size-2);
	}

	/* --- Your own cursor --- */
	.builder {
		display: grid;
		gap: var(--size-4);
		align-items: start;
		margin-block-start: var(--size-5);

		@media (min-width: 48rem) {
			grid-template-columns: minmax(0, 1fr) auto;
		}
	}

	.zoom {
		position: relative;
		inline-size: var(--size);
		block-size: var(--size);
		border: var(--border-size-1) solid var(--surface-3);
		background: repeating-conic-gradient(var(--surface-2) 0 25%, var(--surface-3) 0 50%) 0 0 / 16px
			16px;

		& img {
			display: block;
		}
	}

	.dot {
		position: absolute;
		inline-size: 8px;
		block-size: 8px;
		margin: -4px 0 0 -4px;
		border: 2px solid var(--surface-1);
		border-radius: var(--radius-round);
		background: var(--error);
	}

	.area,
	.playground {
		display: grid;
		place-items: center;
		min-block-size: 8rem;
		margin-block-start: var(--size-4);
		padding: var(--size-4);
		border: var(--border-size-2) dashed var(--surface-3);
		border-radius: var(--radius-3);
		color: var(--text-2);
		text-align: center;
		/* Plain, not the blueprint grid: there's text in it (the rule in global.css). */
		background: var(--surface-2);
	}

	/* --- GIFs --- */
	.gifs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
		gap: var(--size-3);
		margin-block-start: var(--size-3);

		& .area {
			margin-block-start: 0;
		}

		& figcaption {
			margin-block-start: var(--size-2);
			font-family: var(--font-label);
			font-size: var(--font-size-0);
			color: var(--text-2);
		}
	}

	/* The GIF as an image animates whatever the motion setting: hidden when less motion
	   is asked for. */
	@media (prefers-reduced-motion: reduce) {
		.gifs img {
			display: none;
		}
	}

	.gif-pick {
		display: grid;
		gap: var(--size-2);
		margin-block-start: var(--size-4);

		& input {
			font: inherit;
			font-size: var(--font-size-0);
		}
	}

	/* --- Animated cursors and effects --- */
	.animations {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 10rem), 1fr));
		gap: var(--size-2);
		margin-block-start: var(--size-3);
		padding: 0;
		list-style: none;

		& li {
			display: grid;
			place-items: center;
			min-block-size: 5rem;
			padding: var(--size-3);
			border: var(--border-size-1) solid var(--surface-3);
			border-radius: var(--radius-2);
			background: var(--surface-2);
			font-family: var(--font-label);
			font-size: var(--font-size-0);
			text-align: center;

			&:hover {
				border-color: var(--brand);
			}
		}
	}

	.theme {
		display: grid;
		gap: var(--size-3);
		justify-items: start;
		margin-block-start: var(--size-2);
		padding: var(--size-4);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-2);
	}

	.theme-heading {
		font-family: var(--font-label);
		font-size: var(--font-size-3);
		color: var(--text-1);
	}

	.effect-pick {
		max-inline-size: 24rem;
		margin-block-start: var(--size-3);

		& .hint {
			margin-block-start: 0;
		}
	}

	/* The scene. effects.ts writes where the pointer is: --x and --y in px, --dx and
	   --dy from -1 to 1 around the centre. Before it moves, the middle. */
	.playground {
		--x: 50%;
		--y: 50%;
		--dx: 0;
		--dy: 0;

		position: relative;
		min-block-size: 16rem;
		overflow: clip;
		color: var(--text-2);

		/* Over the scene, under the light effects; it reads its colour from here. */
		& canvas {
			position: absolute;
			inset: 0;
			z-index: 2;
			inline-size: 100%;
			block-size: 100%;
			pointer-events: none;
			color: var(--brand);
		}
	}

	.scene {
		position: relative;
		z-index: 1;
		display: grid;
		gap: var(--size-3);
		justify-items: center;
	}

	/* Big enough to see it turn. While tilting (data-tilting, effects.ts), a highlight
	   follows the pointer and the shadow deepens: depth needs light to read. */
	.card {
		display: grid;
		place-items: center;
		inline-size: min(100%, 16rem);
		min-block-size: 7rem;
		padding: var(--size-3) var(--size-5);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-1);
		color: var(--text-1);
		font-family: var(--font-label);
		font-size: var(--font-size-1);
		transition:
			transform 0.15s var(--ease-out-3),
			box-shadow 0.15s;

		/* :global: effects.ts sets the attribute, so Svelte can't see it in the markup. */
		&:global([data-tilting]) {
			background: radial-gradient(
				circle at var(--px) var(--py),
				color-mix(in oklab, var(--brand) 18%, var(--surface-1)),
				var(--surface-1) 70%
			);
			box-shadow: var(--shadow-4);
		}
	}

	[data-magnetic] {
		transition: translate 0.2s var(--ease-out-3);
	}

	/* Three soft shapes at the back; with parallax, nearer ones move further. */
	.layers span {
		position: absolute;
		border-radius: var(--radius-round);
		background: color-mix(in oklab, var(--brand) 10%, transparent);
		transition: translate 0.2s var(--ease-out-3);

		&:nth-child(1) {
			inset: 10% auto auto 8%;
			inline-size: 9rem;
			block-size: 9rem;
		}

		&:nth-child(2) {
			inset: auto 12% 12% auto;
			inline-size: 6rem;
			block-size: 6rem;
		}

		&:nth-child(3) {
			inset: 20% 30% auto auto;
			inline-size: 3rem;
			block-size: 3rem;
		}
	}

	[data-effect='parallax'] .layers span {
		&:nth-child(1) {
			translate: calc(var(--dx) * 8px) calc(var(--dy) * 8px);
		}

		&:nth-child(2) {
			translate: calc(var(--dx) * 20px) calc(var(--dy) * 20px);
		}

		&:nth-child(3) {
			translate: calc(var(--dx) * 36px) calc(var(--dy) * 36px);
		}
	}

	/* Dot and ring replaces the cursor in the scene, buttons included. */
	[data-effect='ring'],
	[data-effect='ring'] * {
		cursor: none;
	}

	/* A soft glow under the pointer, in the brand colour mixed into the surface. */
	[data-effect='spotlight'] {
		background: radial-gradient(
			circle at var(--x) var(--y),
			color-mix(in oklab, var(--brand) 14%, var(--surface-2)),
			var(--surface-2) 12rem
		);
	}

	/* The flashlight: the scene in the dark, but for a circle around the pointer. */
	.lamp {
		display: none;
		position: absolute;
		inset: 0;
		z-index: 3;
		pointer-events: none;
		background: radial-gradient(
			circle at var(--x) var(--y),
			transparent 0 3.5rem,
			color-mix(in oklab, var(--surface-1) 94%, transparent) 6rem
		);
	}

	[data-effect='flashlight'] .lamp {
		display: block;
	}

	/* The invert lens: no colour of its own; it inverts whatever is behind it. */
	.lens {
		display: none;
		position: absolute;
		inset: 0 auto auto 0;
		z-index: 3;
		inline-size: 6rem;
		block-size: 6rem;
		margin: -3rem 0 0 -3rem;
		border-radius: var(--radius-round);
		translate: var(--x) var(--y);
		backdrop-filter: invert(1);
		pointer-events: none;
	}

	[data-effect='invert']:hover .lens {
		display: block;
	}

	/* --- pointer-events --- */
	.stage {
		position: relative;
		display: grid;
		place-items: center;
		min-block-size: 8rem;
		margin-block-start: var(--size-5);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		background: var(--surface-2);
	}

	.target,
	.action {
		padding: var(--size-2) var(--size-4);
		border: var(--border-size-1) solid var(--brand);
		border-radius: var(--radius-2);
		background: var(--surface-1);
		color: var(--text-1);
		font-family: var(--font-label);
		cursor: pointer;
	}

	.target:hover {
		background: var(--surface-3);
	}

	/* Diagonal stripes over the whole stage, the button included. */
	.layer {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: repeating-linear-gradient(
			-45deg,
			color-mix(in oklab, var(--brand) 25%, transparent) 0 10px,
			transparent 10px 20px
		);

		&.through {
			pointer-events: none;
		}
	}

	.toggle {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--size-2);
		margin-block-start: var(--size-3);
		cursor: pointer;
	}

	/* --- user-select --- */
	.selects {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
		gap: var(--size-3);
		margin-block-start: var(--size-5);

		& figure {
			padding: var(--size-3);
			border: var(--border-size-1) solid var(--surface-3);
			border-radius: var(--radius-2);
			background: var(--surface-2);
		}

		& figcaption {
			font-size: var(--font-size-0);
			color: var(--text-2);
		}

		& p {
			margin-block-start: var(--size-2);
		}
	}

	/* Both spellings: Safari still only knows the prefixed one. */
	.select-none {
		-webkit-user-select: none;
		user-select: none;
	}

	.select-all {
		-webkit-user-select: all;
		user-select: all;
	}

	.select-text {
		-webkit-user-select: text;
		user-select: text;
		color: var(--brand);
	}

	/* --- ::selection --- */
	.colours {
		align-items: end;
		margin-block-start: var(--size-5);
	}

	.sample {
		max-inline-size: var(--reading-width);
		margin-block-start: var(--size-4);
		padding: var(--size-4);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		font-size: var(--font-size-2);
	}

	.sample::selection {
		color: var(--selection-text);
		background-color: var(--selection-background);
	}
</style>
