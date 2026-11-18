---
title: Una introducción fija con un menú que sigue al scroll, y un anclaje suave
description: Mi portada mantiene la introducción a la vista mientras pasan las secciones, y un pequeño menú muestra qué sección estás leyendo. position sticky, unas pocas líneas que miden con cada scroll y un anclaje de proximidad que solo se aplica a una página.
cover: Un índice fijo junto a una página, con una línea que marca la sección que se está leyendo.
reviewed: false
---

Me encanta la maquetación del [sitio de Brittany Chiang](https://brittanychiang.com): en una pantalla ancha, la introducción se queda a la izquierda mientras el contenido se desplaza a la derecha, y un pequeño menú bajo la introducción ilumina la sección que estás leyendo. Este artículo cuenta cómo hice mi versión: la columna fija, el seguimiento del scroll y un anclaje suave.

## La columna fija

A partir de 64rem de ancho, la página es una rejilla de dos columnas:

```css
@media (min-width: 64rem) {
	.landing {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--size-9);
		align-items: start;
	}
}

@media (min-width: 64rem) and (min-height: 45rem) {
	.intro {
		position: sticky;
		inset-block-start: var(--header-space);
	}
}
```

Dos detalles me costaron un rato:

- **`align-items: start`.** Por defecto, los elementos de un grid se estiran a la altura de su fila. La fila es tan alta como la columna que se desplaza, así que la introducción sería igual de alta, y un elemento fijo tan alto como su contenedor no tiene dónde quedarse fijo.
- **`min-height: 45rem`.** Un elemento fijo más alto que la pantalla nunca enseña su parte de abajo. La introducción mide unos 590px de alto, más la cabecera, así que en pantallas más bajas simplemente se desplaza con normalidad.

`--header-space` es el espacio que ocupa la cabecera fija. El mismo token va en `scroll-padding-block-start` de `html`, que le dice al navegador que la zona visible empieza por debajo de la cabecera. Sin él, al pulsar un enlace a `#projects` el encabezado queda justo debajo de la cabecera.

## El seguimiento del scroll

El menú es una lista de enlaces dentro de la página. Sin JavaScript siguen saltando a sus secciones; el JavaScript solo añade el resaltado.

La sección actual es la última cuyo borde superior ha pasado una línea a un tercio de la pantalla. Con cada scroll, el menú mide dónde está cada sección:

```svelte
<script lang="ts">
	let { sections }: { sections: Section[] } = $props();
	let current = $state<string>();

	function update() {
		const line = innerHeight / 3;
		const atBottom = scrollY + innerHeight >= document.documentElement.scrollHeight - 4;

		let id = sections[0]?.id;
		for (const section of sections) {
			const top = document.getElementById(section.id)?.getBoundingClientRect().top;
			if (top !== undefined && top <= line) id = section.id;
		}
		current = atBottom ? sections.at(-1)?.id : id;
	}

	$effect(() => {
		update();
		const observer = new ResizeObserver(update);
		observer.observe(document.body);
		return () => observer.disconnect();
	});
</script>

<svelte:window onscroll={update} onresize={update} />
```

Dos extremos están cubiertos a propósito:

- **Arriba.** Antes de que la primera sección llegue a la línea, ya es la actual (`id` empieza siendo la primera). Si no, no se resaltaría nada hasta hacer un poco de scroll.
- **Abajo.** Una última sección corta nunca llega a la línea: antes se acaba la página. Así que abajo del todo, la actual es la última.

El efecto lo ejecuta cuando la página ya está en el DOM, así que una recarga a mitad de página resalta la sección correcta en el acto. Después lo ejecutan los eventos de scroll y de cambio de tamaño de la ventana, y también un `ResizeObserver` sobre el body: en mi página sobre mí, las secciones se abren solas y mueven todo lo que tienen debajo sin ningún scroll.

Mi primera versión usaba un `IntersectionObserver` con `rootMargin: '-33% 0px -67% 0px'`, que reduce la zona vigilada a esa misma línea fina. Parece más limpio: no hay que medir con cada scroll, el navegador te avisa cuando una sección cruza la línea. Pero un observer solo informa de _cambios_. Cuando hacía scroll rápido, el scroll podía detenerse con la línea en el hueco entre dos secciones; nada la tocaba, no llegaba ningún evento y la sección anterior seguía resaltada. Medir diez secciones en cada scroll no cuesta nada, y los navegadores lanzan `scroll` como mucho una vez por fotograma, así que cambié la versión limpia por una que no puede desacompasarse.

El enlace actual recibe `aria-current="location"`, el valor pensado para "dónde estás dentro de esta página", junto al `"page"` de la página actual en el menú principal.

## Anclaje, pero suave

El sitio de Julibe ancla cada sección en su sitio cuando dejas de hacer scroll. Yo quería una versión más suave:

```css
@media (min-width: 64rem) and (prefers-reduced-motion: no-preference) {
	:global(html:has(.landing)) {
		scroll-snap-type: y proximity;
	}

	.landing,
	section {
		scroll-snap-align: start;
	}
}
```

- **`proximity`, no `mandatory`.** Solo ancla cuando te detienes cerca de una sección. `mandatory` siempre ancla, y en una sección más alta que la pantalla te lleva la contraria.
- **`:has(.landing)`.** El anclaje se pone en `html`, pero SvelteKit mantiene cargado el CSS de una página después de salir de ella. Una regla `html` sin más haría que todas las páginas anclaran. Con `:has()`, solo coincide mientras la portada está en la página.
- **`.landing` también es un punto de anclaje.** Mi primera versión saltaba 50px hacia abajo al cargar: el principio de la página no era un punto de anclaje, así que el navegador se anclaba al más cercano, la primera sección.
- **Reducción de movimiento.** El anclaje mueve la página por sí solo, así que está desactivado para quien pidió menos movimiento.

## Revelaciones

Las tarjetas de cada sección se descubren desde arriba al entrar en pantalla, como un terminal que imprime líneas. Es una animación ligada al scroll sobre una línea de tiempo `view()` (las expliqué en [el artículo de la cabecera y el pie](./2026-10-31-scroll-driven-header-footer)):

```css
@keyframes reveal {
	from {
		clip-path: inset(0 0 100% 0);
		translate: 0 var(--size-6);
	}
	to {
		clip-path: inset(0);
	}
}
```

Va en la rejilla de las tarjetas, no en la sección, porque la sección ya tiene una entrada basada en el tiempo, y dos declaraciones `animation` en un mismo elemento se sustituyen la una a la otra.

Mi primera versión aparecía desde `opacity: 0`, y la puntuación de accesibilidad de Lighthouse bajó a 95. Lighthouse revisa la página en una ventana del tamaño de un móvil justo después de cargarla. El contenido por debajo de la primera pantalla todavía no se había revelado, así que medía un texto desvaído con un contraste de 1,86:1. Nadie lo ve así en realidad, pero un barrido oculta el contenido en vez de desvanecerlo, así que no hay texto desvaído que medir, y la puntuación volvió a 100.

Lo siguiente: [transiciones entre páginas](./2026-10-31-route-transitions-composition).
