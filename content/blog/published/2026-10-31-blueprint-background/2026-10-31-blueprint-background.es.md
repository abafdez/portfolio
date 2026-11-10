---
title: Una rejilla de planos solo con CSS, con un foco que sigue al cursor
description: Un fondo de papel milimetrado hecho con cuatro degradados, marcas dibujadas con una máscara y un foco que ilumina la rejilla alrededor del ratón. Una sola capa fija, sin imágenes, y sigue al tema.
cover: Un foco sobre una rejilla.
reviewed: false
---

El aspecto de mi sitio es "técnico": terminal, código, planos. Así que el fondo es una rejilla de planos: líneas tenues, líneas más marcadas cada pocas celdas, un pequeño "+" donde se cruzan las marcadas y, si usas ratón, un brillo verde que lo sigue.

Todo es un solo componente Svelte, `Blueprint.svelte`, montado una vez en el layout raíz.

## Una línea es un degradado con un corte seco

Un `linear-gradient` normalmente funde unos colores con otros. Si dos paradas están en la misma posición, no hay fundido, solo un borde seco:

```css
linear-gradient(var(--line) 1px, transparent 1px)
```

Eso es 1px de `--line` y luego transparente. Con `background-size: 1.5rem 1.5rem`, esa tesela se repite y tienes una línea horizontal cada 1,5rem. Gíralo con `90deg` para las líneas verticales.

La rejilla entera son cuatro de estos, dos para cada tamaño:

```css
.grid {
	--major: calc(var(--grid-size) * 4);

	background-image:
		linear-gradient(var(--line-major) 1px, transparent 1px),
		linear-gradient(90deg, var(--line-major) 1px, transparent 1px),
		linear-gradient(var(--line) 1px, transparent 1px),
		linear-gradient(90deg, var(--line) 1px, transparent 1px);
	background-size:
		var(--major) var(--major),
		var(--major) var(--major),
		var(--grid-size) var(--grid-size),
		var(--grid-size) var(--grid-size);
}
```

**El primer fondo se pinta encima**, así que se listan del más cercano al más lejano. Las líneas principales van primero para quedar por encima de las secundarias donde se cruzan.

Los colores de las líneas son el color del texto mezclado con transparente:

```css
--grid-line: color-mix(in oklch, var(--text-1) 3%, transparent);
--grid-line-major: color-mix(in oklch, var(--text-1) 6%, transparent);
```

`--text-1` ya cambia con el tema, así que la rejilla también, sin hacer nada.

## Las cruces: un SVG usado como máscara

Quería las marcas "+" en un color del tema. Un SVG en una data URI no puede leer variables de CSS, pero no le hace falta: lo uso como **máscara**, no como imagen. Una máscara solo dice dónde se ve el elemento; el color sale de `background-color`.

```css
.marks {
	background-color: var(--grid-mark);
	mask-image: url('data:image/svg+xml,…a plus in the middle of a 96×96 tile…');
	mask-size: calc(var(--grid-size) * 4) calc(var(--grid-size) * 4);
	mask-position: calc(var(--grid-size) * -2) calc(var(--grid-size) * -2);
}
```

La cruz está dibujada en el centro de su tesela, así que desplazo las teselas media tesela. Ahora cada cruz cae en un cruce de líneas principales.

## Desvanecerse

La rejilla es más fuerte arriba y se desvanece hacia las esquinas inferiores, con otra máscara:

```css
--fade: radial-gradient(ellipse 120% 100% at 50% 0%, black 30%, transparent 100%);
```

Las cruces necesitan las dos máscaras a la vez: la forma de la cruz y el desvanecido. `mask-composite: intersect` solo conserva lo que dejan pasar las dos.

## Detrás de todo

```css
.blueprint {
	position: fixed;
	inset: 0;
	z-index: -1;
	pointer-events: none;
}
```

`z-index: -1` pone la capa por encima del color de fondo del body, pero por debajo de todo el contenido de la página. `pointer-events: none` hace que nunca capture un clic.

## El foco

El foco es la misma rejilla otra vez, con los colores de las líneas cambiados por el de acento:

```svelte
<div class={['grid', 'spot', pointer && 'on']}></div>
```

```css
.spot {
	--line: var(--grid-spot-line);
	--line-major: var(--grid-spot-line-major);
	mask-image: radial-gradient(circle 14rem at var(--x) var(--y), black, transparent);
}
```

Los colores son el verde de marca, a solo un 8% y un 15% de intensidad. Empecé con un 25% y un 45%, y el texto encima de las líneas iluminadas se volvía difícil de leer: [la decoración bajo el texto también necesita contraste](./2026-11-04-decoration-under-text-needs-contrast).

La máscara solo lo muestra en un círculo alrededor de `--x`/`--y`. Svelte escribe esos dos valores a partir de la posición del puntero:

```svelte
<script lang="ts">
	let pointer = $state<{ x: number; y: number } | null>(null);

	function onpointermove(event: PointerEvent) {
		if (event.pointerType === 'mouse') pointer = { x: event.clientX, y: event.clientY };
	}
</script>

<svelte:window {onpointermove} />

<div class="blueprint" style:--x={pointer && `${pointer.x}px`} style:--y={pointer && `${pointer.y}px`}>
```

Las pantallas táctiles no tienen hover, así que un dedo en el móvil no debería arrastrar un brillo por la pantalla. Dos protecciones:

- en JS, `pointerType === 'mouse'` ignora el tacto y el lápiz;
- en CSS, el foco solo existe dentro de `@media (hover: hover) and (pointer: fine)`.

Cuando el ratón sale de la ventana, `mouseout` se lanza con `relatedTarget` a `null` (no va a otro elemento), y el foco se desvanece.

## Enlaces

- [MDN: usar varios fondos](https://developer.mozilla.org/es/docs/Web/CSS/CSS_backgrounds_and_borders/Using_multiple_backgrounds)
- [MDN: mask-image](https://developer.mozilla.org/es/docs/Web/CSS/mask-image)
- [MDN: mask-composite](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite)

Lo siguiente: [una cabecera y un pie que reaccionan al scroll](./2026-10-31-scroll-driven-header-footer).
