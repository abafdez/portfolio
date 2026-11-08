---
title: 'Páginas que saltan: arreglar los saltos de maquetación en un sitio estático'
description: Tres de mis páginas sacaban menos de 90 en Lighthouse por un solo motivo, contenido que se mueve después de aparecer. Dos causas, las fuentes web y el contenido añadido por JavaScript, y cómo arreglé cada una.
cover: Un diagrama que representa un salto de maquetación.
reviewed: false
---

Empiezas a leer, o vas a pulsar un enlace, y la página salta. Eso es un **salto de maquetación** (layout shift), y Lighthouse lo mide como **CLS**, Cumulative Layout Shift: cuánto contenido visible se movió, y cuánto. Por debajo de 0,1 está bien.

Pasé Lighthouse por una página de cada tipo de mi sitio. Accesibilidad, buenas prácticas y SEO daban 100 en todas, y el rendimiento casi siempre entre 95 y 98. Tres páginas no: una entrada del Devlog con 89, una lista Awesome con 91 y mi comprobador de contraste con 86. Las tres tenían el mismo problema: un CLS de entre 0,14 y 0,24.

## Encontrar qué se movía

El informe de Lighthouse tiene una auditoría llamada "Avoid large layout shifts". Lista cada elemento que se movió, cuánto contó y, a menudo, por qué:

```text
0.073  article > div.prose > ul > li   cause: Web font loaded …shantell-sans-latin-wght-normal.woff2
0.159  main > section                   (no cause: something above it changed size)
0.234  main > div.themes > section
```

Dos causas distintas.

## Causa 1: las fuentes web

Mi sitio usa dos fuentes web. Cuando se carga una página, el navegador:

1. lee el HTML;
2. encuentra el CSS y lo descarga;
3. lee el CSS, encuentra las reglas `@font-face` y solo entonces empieza a descargar las fuentes.

Mientras tanto muestra el texto con una fuente de respaldo, una del sistema, con letras de otro ancho. Cuando llega la fuente de verdad, las líneas se parten de otra manera y todo lo que hay debajo se mueve.

La solución es avisar al navegador de las fuentes en el paso 1, con una precarga en el `<head>` del HTML:

```html
<link
	rel="preload"
	href="…/fira-code-latin-wght-normal.woff2"
	as="font"
	type="font/woff2"
	crossorigin
/>
```

No lo escribo a mano: los nombres de los archivos llevan un hash que cambia en cada build. SvelteKit puede añadirlos desde un hook `handle`:

```ts
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit/hooks';

const latin = /-latin-wght-normal\.woff2$/;

export const handle: Handle = ({ event, resolve }) =>
	resolve(event, {
		preload: (file) =>
			file.type === 'js' ||
			file.type === 'css' ||
			(file.type === 'font' && latin.test(file.filename))
	});
```

Por defecto, SvelteKit precarga el JavaScript y el CSS; esto lo mantiene y añade las fuentes. Pero solo los archivos **latinos**. Mis fuentes vienen de Fontsource, que divide cada fuente en un archivo por alfabeto (latino, latino extendido, cirílico, griego…), cada uno con un `unicode-range`. El navegador solo descarga los que usa de verdad una página. Si los precargas todos, cada visitante descarga todos los alfabetos.

## Causa 2: contenido añadido por JavaScript

Mi sitio está prerenderizado: cada página es un archivo HTML, generado al construir el sitio, que funciona sin JavaScript. Algunas partes solo tienen sentido con JavaScript, así que las añadía cuando este se ejecutaba:

- el cuadro de búsqueda y los filtros por etiqueta de la lista Awesome, con `{#if ready}` (`ready` se activaba en `onMount`);
- las puntuaciones del comprobador de contraste, que necesitan colores que solo puede leer el navegador.

Las dos aparecían **encima** de otro contenido, así que lo empujaban hacia abajo.

La solución es **reservar el espacio desde el primer pintado**. Los filtros ya están en el HTML prerenderizado, pero invisibles hasta que JavaScript está listo:

```svelte
<search class:ready>…</search>

<style>
	search:not(.ready) {
		visibility: hidden;
	}

	@media (scripting: none) {
		search {
			display: none;
		}
	}
</style>
```

`visibility: hidden` y `display: none` ocultan un elemento, pero de forma distinta. `visibility: hidden` conserva su espacio y solo lo oculta, a la vista, al teclado y a los lectores de pantalla. `display: none` lo saca de la maquetación. Así que: oculto pero presente mientras carga JavaScript, y luego visible, sin que se mueva nada. Y cuando JavaScript está desactivado (`scripting: none`), los filtros no funcionarían nunca, así que se quitan del todo y la lista completa queda arriba.

En el comprobador de contraste fue aún más simple: la línea de la puntuación siempre está, con un espacio de no separación hasta que se conoce la puntuación:

```svelte
<p class="score">
	{#if colors}
		<strong>{format(pair)}:1</strong> {level(pair)}
	{:else}
		&nbsp;
	{/if}
</p>
```

## El resultado

| Página                      | CLS antes | CLS después | Rendimiento |
| --------------------------- | --------: | ----------: | ----------: |
| Una entrada del Devlog      |     0,143 |           0 |     89 → 96 |
| La lista de CSS moderno     |     0,162 |           0 |     91 → 97 |
| El comprobador de contraste |     0,237 |       0,003 |     86 → 96 |

Tuvo un coste. En la red móvil ralentizada de Lighthouse, el LCP (cuando aparece el contenido principal) pasó de unos 2,0 a 2,5 segundos: los 115 KB de fuentes ahora se descargan pronto y compiten con todo lo demás. Aun así, la puntuación subió, porque el CLS pesa más. Una página que aparece un momento después es mejor que una que se mueve bajo tu dedo.

## Enlaces

- [web.dev: Cumulative Layout Shift](https://web.dev/articles/cls)
- [web.dev: optimizar el CLS](https://web.dev/articles/optimize-cls)
- [MDN: rel=preload](https://developer.mozilla.org/es/docs/Web/HTML/Reference/Attributes/rel/preload)
- [SvelteKit: el hook handle y preload](https://svelte.dev/docs/kit/hooks#Server-hooks-handle)
- [MDN: @media scripting](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/scripting)
- [Devlog: una lista Awesome con los filtros en la URL](/devlog/2026-11-02-awesome-list-filters)
