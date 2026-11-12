---
title: Encabezados enlazables en markdown, y un build que los comprueba
description: Dos plugins de rehype les dan a todos los encabezados de mis artículos un id y un enlace a sí mismos. Por qué envuelvo el encabezado en vez de añadir un enlace "#", y cómo SvelteKit hace fallar el build con uno roto.
cover: Un encabezado con una almohadilla y un ancla que enlaza a una lista de secciones.
reviewed: false
---

Quería enlazar a una sección de un artículo: "mira la parte de la ruta base", directamente. Para eso hace falta un `id` en el encabezado, y mis encabezados de markdown no tenían ninguno. `## La ruta base` se convertía en un simple `<h2>La ruta base</h2>`.

## Dos plugins

Mi markdown pasa por mdsvex, que puede ejecutar plugins de [rehype](https://github.com/rehypejs/rehype) sobre el HTML que genera. Dos hacen este trabajo:

- [`rehype-slug`](https://github.com/rehypejs/rehype-slug) le da a cada encabezado un `id` sacado de su texto: en minúsculas, los espacios se convierten en guiones y la puntuación desaparece. Un segundo encabezado con el mismo texto recibe `-1`.
- [`rehype-autolink-headings`](https://github.com/rehypejs/rehype-autolink-headings) añade un enlace a ese `id`.

```ts
const out = await compile(markdown, {
	rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]]
	// …
});
```

El resultado:

```html
<h2 id="the-base-path"><a href="#the-base-path">The base path</a></h2>
```

## Envolver, no añadir

`rehype-autolink-headings` puede poner el enlace en varios sitios. El aspecto habitual, un pequeño `#` junto al encabezado, es `behavior: 'append'`: un enlace aparte dentro del encabezado. Pero el nombre accesible de un encabezado es todo el texto que tiene dentro, así que un lector de pantalla oiría "La ruta base #", o con una etiqueta en el enlace, "La ruta base, Enlace a esta sección". En cada encabezado, cada vez.

Con `behavior: 'wrap'`, el propio texto del encabezado es el enlace. Su nombre no cambia: "La ruta base", anunciado como encabezado y como enlace. Nada extra que leer.

Aun así quería el `#` como pista visual, así que lo dibuja el CSS, solo al pasar el ratón y con el foco del teclado:

```css
.prose :is(h2, h3, h4) > a[href^='#'] {
	color: inherit;
	text-decoration: none;

	&:is(:hover, :focus-visible)::after {
		content: '#' / '';
		margin-inline-start: 0.3em;
		color: var(--brand);
	}
}
```

El `/ ''` después del contenido es su texto alternativo: vacío, para que los lectores de pantalla se lo salten. El encabezado conserva el color de los encabezados, sin subrayado, así que se sigue leyendo como un encabezado.

## El build comprueba los enlaces

SvelteKit prerenderiza mi sitio siguiendo cada enlace para generar cada página. Resulta que también comprueba los enlaces con `#`: si una página enlaza a `#algo` y ningún elemento de la página de destino tiene ese `id`, el build falla:

```text
prerender_missing_id
```

Lo probé con un enlace a `#nope`, y el build se detuvo. Así que si cambio el nombre de un encabezado, lo que cambia su `id`, en el siguiente build se comprueban todos los enlaces a él desde mi propio sitio. Los enlaces desde otros sitios no se pueden comprobar, que es un buen motivo para no renombrar sin motivo un encabezado ya publicado.

## Un cast de tipos

mdsvex 0.12 está tipado con una versión de `unified`, la librería que hay debajo de remark y rehype, más antigua que la de estos plugins. Trabajan sobre los mismos árboles de HTML, así que funciona bien, pero TypeScript ve dos tipos `Node` distintos y protesta. Un cast, con un comentario que dice por qué:

```ts
const rehypePlugins = [
	rehypeSlug,
	[rehypeAutolinkHeadings, { behavior: 'wrap' }]
] as unknown as MdsvexCompileOptions['rehypePlugins'];
```

## Que no quede bajo la cabecera

Mi cabecera es fija en las pantallas anchas. Un salto a un encabezado lo dejaría justo debajo de la cabecera, oculto. Una regla que ya tenía se encarga de ello:

```css
html {
	scroll-padding-block-start: var(--header-space);
}
```

`scroll-padding` le dice al navegador que deje ese espacio arriba cada vez que hace scroll para mostrar algo, un `#encabezado` incluido.

**Actualización (2026-11-11):** mdsvex ya no está, ni rehype-slug ni rehype-autolink-headings. svelte-markdown crea los ids con github-slugger (los mismos ids, comprobado en todas las páginas), y un renderer `heading` mío envuelve el texto en el enlace. El crawler sigue rompiendo el build con un `#enlace` roto.

## Enlaces

- [rehype-slug](https://github.com/rehypejs/rehype-slug)
- [rehype-autolink-headings](https://github.com/rehypejs/rehype-autolink-headings)
- [Amber Wilson: Are your anchor links accessible?](https://amberwilson.co.uk/blog/are-your-anchor-links-accessible/)
- [SvelteKit: opciones de prerender](https://svelte.dev/docs/kit/configuration#prerender)
- [MDN: scroll-padding](https://developer.mozilla.org/es/docs/Web/CSS/scroll-padding)
- [Markdown con mdsvex](./2026-10-31-markdown-with-mdsvex)
