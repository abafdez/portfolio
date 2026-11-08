---
title: 'Filtros de búsqueda y etiquetas en una clase de Svelte, guardados en la URL'
description: Una clase con $state para los filtros de una lista Awesome, resultados con $derived y una URL que se puede compartir, en una página prerenderizada.
reviewed: false
---

Mi sitio tiene listas Awesome: enlaces seleccionados por categorías, cada uno con una descripción y etiquetas. Veinticinco enlaces ya son demasiados para echarles un vistazo, así que quería un cuadro de búsqueda y filtros por etiqueta. Y si filtro la lista hasta dejar algo útil, quiero poder enviar esa vista como un enlace.

## Los datos: YAML, no markdown

Una lista son datos (un título, una URL, una descripción, unas etiquetas), no prosa. Así que cada lista es un archivo YAML en `content/awesome/`, leído al construir el sitio:

```yaml
title: Modern CSS
categories:
  - name: Color
    links:
      - title: oklch.com
        url: https://oklch.com
        description: Pick OKLCH colors and see which ones fit in sRGB and P3.
        tags: [tool, oklch]
```

El cargador hace fallar el build con un enlace que no es `https://` o con una etiqueta que no está en kebab-case, y nombra el archivo. Las etiquetas acaban en las URLs, así que no pueden existir a la vez `CSS` y `css`.

## El filtro es una clase

En Svelte 5, las runes también funcionan en clases (en un archivo `.svelte.ts`). Eso reúne en un sitio el estado, lo que se calcula a partir de él y las formas de cambiarlo:

```ts
export class LinkFilter {
	query = $state('');
	tags: string[] = $state([]);

	#categories: () => Category[];

	constructor(categories: () => Category[]) {
		this.#categories = categories;
	}

	results = $derived.by(() => {
		const words = this.query.toLowerCase().split(/\s+/).filter(Boolean);
		return this.#categories()
			.map((category) => ({
				...category,
				links: category.links.filter((link) => {
					const text = [link.title, link.description, ...link.tags].join(' ').toLowerCase();
					return (
						words.every((word) => text.includes(word)) &&
						this.tags.every((tag) => link.tags.includes(tag))
					);
				})
			}))
			.filter((category) => category.links.length);
	});

	toggle(tag: string) {
		this.tags = this.tags.includes(tag) ? this.tags.filter((t) => t !== tag) : [...this.tags, tag];
	}
}
```

Dos detalles en los que tuve que pensar:

- **Las categorías entran como una función.** Si la clase recibiera el array, se quedaría con la primera lista que le dieron. Con una función, `results` lee la lista actual cada vez.
- **`$derived` es perezoso.** `results` solo se vuelve a calcular cuando algo lo lee y han cambiado la búsqueda, las etiquetas o la lista.

Tiene que coincidir cada palabra, y cada etiqueta elegida. Cada cosa que añades estrecha la lista.

<!-- TODO: ¿me pareció bien el Y cuando lo usé, o preferiría las etiquetas como O? -->

## A la URL y de vuelta

El filtro se convierte a sí mismo en parámetros (`?q=grid&tag=docs&tag=layout`) y los vuelve a leer. Pero la página está prerenderizada, y al construir el sitio no hay ninguna URL de visitante que leer. Así que el componente la lee en `onMount`, que solo se ejecuta en el navegador:

```svelte
<script lang="ts">
	const filter = new LinkFilter(() => list.categories);
	let ready = $state(false);

	onMount(() => {
		filter.read(page.url.searchParams, list.tags);
		ready = true;
	});

	function share() {
		const url = new URL(page.url.href);
		url.search = filter.params.toString();
		goto(url, { shallow: true, replace: true });
	}
</script>
```

`shallow` cambia la barra de direcciones sin navegar. `replace` lo deja en una sola entrada del historial, así que escribir una palabra no deja un paso hacia atrás por cada letra.

`read()` solo conserva las etiquetas que la lista tiene de verdad. Si no, un enlace con `?tag=errata` ocultaría todos los enlaces detrás de un botón que no existe.

Para actualizar la URL justo donde cambia el texto de búsqueda, usé un enlace de función: un getter y un setter en vez de una variable.

```svelte
<input
	type="search"
	bind:value={() => filter.query, (value) => ((filter.query = value), share())}
/>
```

## Sin JavaScript

Sin JS, los filtros serían un cuadro de búsqueda y unos botones que no hacen nada. La página prerenderizada ya tiene todos los enlaces, así que no se pierde nada ocultándolos.

Mi primera versión no los mostraba en absoluto hasta que se ejecutaba `onMount` (`{#if ready}`). Lighthouse detectó el problema: al aparecer, empujaban toda la lista hacia abajo, un **salto de maquetación** (CLS de 0,16, suficiente para bajar la página de 90). Ahora están en el HTML prerenderizado, pero invisibles hasta que el JS está listo, y desaparecen del todo cuando los scripts están desactivados:

```css
search:not(.ready) {
	visibility: hidden;
}

@media (scripting: none) {
	search {
		display: none;
	}
}
```

`visibility: hidden` conserva el espacio de un elemento pero lo oculta a la vista, al teclado y a los lectores de pantalla. `display: none` también quita el espacio. La clase viene de `<search class:ready>`, que se activa en `onMount`.

## Pequeños detalles de accesibilidad

- Los botones de etiqueta se activan y desactivan: `aria-pressed` hace que los lectores de pantalla digan "presionado", y el relleno lo muestra a todos los demás. (**Actualización:** ahora son las mismas fichas de etiqueta del blog, del mismo componente `TagCloud`; una elegida tiene un anillo de su color y una marca.)
- El contador ("3 de 25 enlaces") es un `role="status"`, así que se anuncia cuando cambia.
- "Quitar filtros" desaparece cuando ya no hay nada que quitar, y con él el foco caía al principio de la página. Ahora, al quitar los filtros, el foco pasa al cuadro de búsqueda.

<!-- TODO: qué dijo un lector de pantalla al activar una etiqueta y escribir una búsqueda -->
