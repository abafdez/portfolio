---
title: 'Páginas de etiquetas en un blog estático con SvelteKit'
description: Una página prerenderizada por etiqueta, una lista de etiquetas construida a partir de los artículos y un build que falla con una etiqueta mal escrita.
cover: Un documento con varias etiquetas que van a carpetas.
reviewed: false
---

Cada artículo de mi blog tiene etiquetas en su frontmatter. Quería que cada una fuera un enlace a una página con los artículos que la llevan. El sitio es estático, así que cada página de etiqueta tiene que existir como archivo después del build.

## De dónde salen las etiquetas

Mi `content.ts` ya lee el frontmatter de todos los artículos, y las etiquetas vienen con él. Cada artículo conoce sus etiquetas. Lo que necesitaba era la lista de todas, una sola vez:

```ts
export const postTags = [...new Set(allPosts.flatMap((post) => post.tags ?? []))].sort();

export function postsTagged(tag: string): Entry<PostMeta>[] {
	return allPosts.filter((post) => post.tags?.includes(tag));
}
```

`flatMap` hace una lista larga con todas las etiquetas de todos los artículos, `Set` conserva cada una una vez y `sort` las ordena de la A a la Z. Esto no puede hacerse dentro del `.map()` que lee cada archivo: ese ve un archivo cada vez.

`allPosts` no tiene borradores en un build (se [dejan fuera a propósito](./2026-11-02-drafts-that-never-ship)). Así que una etiqueta que solo usan los borradores no tiene página, y no tuve que escribir ni una línea para eso.

## Una página por etiqueta

La ruta es `src/routes/blog/tags/[tag]/`. SvelteKit no puede adivinar qué etiquetas existen, así que `entries()` le dice qué páginas prerenderizar:

```ts
export const entries: EntryGenerator = () => postTags.map((tag) => ({ tag }));

export const load: PageServerLoad = ({ params }) => {
	const posts = postsTagged(params.tag);
	if (!posts.length) error(404, 'No posts with that tag');
	return { tag: params.tag, posts };
};
```

Mientras todos los artículos eran borradores, un build no tenía etiquetas, así que la ruta no tenía páginas y nada la enlazaba. El rastreador de SvelteKit informa de una ruta así como "sin visitar" y hace fallar el build. Le hice una excepción en `handleUnseenRoutes`. En cuanto se publica un artículo, su tarjeta enlaza a sus etiquetas, así que sus páginas ya no pueden quedar sin visitar.

<!-- TODO: el error de "unseen routes" que me salió, si lo vi -->

## Enlaces solo donde hay página

La misma lista de etiquetas aparece en las tarjetas del blog, en la cabecera del artículo y en el Devlog (mi diario de desarrollo). Las etiquetas del Devlog no tienen páginas. Una etiqueta como `planning` solo se usa ahí, y un enlace a `/blog/tags/planning` sería un 404.

Así que el componente de la lista no construye los enlaces él mismo. Recibe una función que convierte una etiqueta en un enlace, y sin ella las etiquetas se quedan como texto:

```svelte
<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	interface Props {
		tags: string[];
		tagHref?: (tag: string) => ResolvedPathname;
	}

	let { tags, tagHref }: Props = $props();
</script>

<ul aria-label="Tags">
	{#each tags as tag (tag)}
		<li>
			{#if tagHref}
				<a href={tagHref(tag)}>#{tag}</a>
			{:else}
				#{tag}
			{/if}
		</li>
	{/each}
</ul>
```

Las páginas del blog le pasan `blogTag`, una ayuda de una línea alrededor de `resolve('/blog/tags/[tag]', { tag })`. El Devlog no le pasa nada. El componente nunca necesita saber qué rutas existen.

**Actualización:** el Devlog ya tiene también páginas de etiquetas, en `/devlog/tags/[tag]`, así que pasa `devlogTag`. En una lista Awesome, las etiquetas de un enlace filtran la lista: `tagHref` da `?tag=css`, y una función `onTag` filtra en la misma página cuando se pulsa.

## Una etiqueta mal escrita hace fallar el build

Cada etiqueta pasa a formar parte de una URL. `CSS` y `css` serían dos etiquetas en el índice pero una sola página, y `design tokens` sería una URL con un `%20` dentro. Podría arreglar las etiquetas en silencio (pasarlas a minúsculas, cambiar los espacios por guiones), pero entonces cada sitio que usa una etiqueta tendría que arreglarla igual: la lista, el filtro, el enlace, el texto.

En cambio, hay una sola regla, que se comprueba mientras se construye el sitio:

```ts
const kebabCase = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function checkTags(path: string, tags: string[] = []) {
	const bad = tags.filter((tag) => !kebabCase.test(tag));
	if (bad.length) throw new Error(`${path}: tags must be lowercase kebab-case: ${bad.join(', ')}`);
}
```

Una etiqueta que la incumple detiene el build y dice en qué archivo está. Solo yo escribo estos artículos, así que la solución siempre es cambiar una palabra en un archivo.

## Dos arreglos de accesibilidad

- **El tamaño del objetivo.** Las etiquetas son enlaces pequeños en una lista, no dentro de una frase, así que las WCAG piden al menos 24 por 24 píxeles. Un poco de `padding-block` las deja en 26px de alto.
- **El orden de los encabezados.** Lighthouse le dio un 98 a la primera versión de la página de etiqueta: pasaba del `h1` directamente a los `h3` de las tarjetas. Agrupar los artículos por año, como hace `/blog`, pone un `h2` en medio.

<!-- TODO: una captura del índice de etiquetas en /blog -->
