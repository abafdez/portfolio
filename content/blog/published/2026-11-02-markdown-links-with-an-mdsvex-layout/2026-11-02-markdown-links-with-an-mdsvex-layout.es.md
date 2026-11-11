---
title: 'Enlaces de markdown que conocen la ruta base: un layout de mdsvex'
description: Mi sitio vive bajo /portfolio en GitHub Pages, así que un enlace de markdown a /about se rompía. Un layout de mdsvex cambia cada enlace por un componente que lo arregla.
cover: Un archivo markdown con un icono de enlace que fluye hacia un layout de Svelte.
reviewed: false
---

Mi sitio se sirve desde `/portfolio`, porque ahí es donde GitHub Pages pone un sitio de proyecto. En mis componentes Svelte, cada enlace pasa por el `resolve()` de SvelteKit, que añade esa ruta base. Pero mis artículos son markdown, y un enlace de markdown a `/about` es solo `<a href="/about">`. Apunta a la raíz del dominio, fuera de mi sitio, y da un 404.

## Un layout para cada archivo markdown

mdsvex puede envolver cada archivo en un componente Svelte, su layout. Es una opción de `compile`, y tiene que ser una ruta de archivo, porque mdsvex lee el archivo:

```ts
const layout = fileURLToPath(
	new URL('./src/lib/components/MarkdownLayout.svelte', import.meta.url)
);

const out = await compile(code, { filename: id, extensions: ['.md'], layout });
```

El layout recibe el contenido como `children`. El mío solo lo muestra: la página del artículo ya muestra el título y la fecha.

## Sustituir elementos

La parte útil es el script de módulo del layout. Si exporta un componente con el nombre de un elemento HTML, mdsvex usa ese componente para todos los elementos de ese tipo en el markdown:

```svelte
<script module lang="ts">
	import a from './MarkdownLink.svelte';

	export { a };
</script>
```

Ahora cada enlace de cada artículo es un `MarkdownLink`. Recibe las mismas props que habría tenido el `<a>` (`href`, `title`) y el texto del enlace como `children`.

mdsvex importa el layout como `* as Components`, así que también se puede llegar a los demás exports. Mis bloques de código lo usan: el resaltador con Shiki envuelve cada uno en `Components.CodeBlock`, y `CodeBlock` no sustituye a ningún elemento.

## El componente del enlace

```svelte
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';

	const withBase = resolve as (path: string) => string;

	interface Props {
		href: string;
		title?: string;
		children: Snippet;
	}

	let { href, title, children }: Props = $props();

	let external = $derived(/^https?:\/\//.test(href));
	let url = $derived(/^\/(?!\/)/.test(href) ? withBase(href) : href);
</script>

<a href={url} {title} rel={external ? 'external' : undefined}>{@render children()}</a>
```

Tres tipos de enlaces:

- **`/about`**, una página de mi sitio. Recibe la ruta base. En el build sale como `href="../about"`, porque SvelteKit escribe enlaces relativos en las páginas prerenderizadas. La expresión regular comprueba que haya una barra y no dos: `//example.com` es un enlace a otro sitio que conserva el protocolo de la página, y no debe recibir la base.
- **`https://…`**, otro sitio. Recibe `rel="external"`.
- **`./otro-articulo` o `#un-encabezado`.** Son relativos, así que ya funcionan con cualquier base.

**Actualización:** el sitio ya está en inglés y en español, y un enlace a `/about` en un artículo en español debería llevar al `/about` en español. Así que ahora `withBase` es mi propio `route()` en vez de `resolve()`: añade la ruta base y, en una página en español, el `/es` detrás. Los enlaces relativos se quedan solos en el idioma en el que están.

## El cast, y quién comprueba los enlaces

`resolve()` está tipado a partir de mis rutas: solo acepta una ruta que conoce, como `'/about'` o `'/blog/[slug]'` con un slug. Un `href` de markdown es solo un `string`, así que TypeScript no puede comprobarlo. Para una ruta sin `[param]`, `resolve()` solo añade la base, así que ensancho su tipo una vez, en `withBase`.

Eso renuncia a una comprobación, así que otra cosa tiene que hacerla. La hace el rastreador del prerenderizado: sigue cada enlace mientras construye el sitio, y un enlace a una página que no existe hace fallar el build. Lo probé con un enlace a `/nope`, y el build se detuvo.

## Fuera `nofollow`

mdsvex añade `rel="nofollow"` a cada enlace. Les dice a los buscadores que no respondo de la página que enlazo. Eso está pensado para enlaces que no controlo, como los comentarios. Los enlaces de mis artículos son enlaces que recomiendo, así que `MarkdownLink` nunca lee la prop `rel`, y desaparece.

## Un reemplazo más

mdsvex 0.12 todavía escribe sintaxis de Svelte 4, y con un layout añade `{...$$props}` a la llamada al layout. El modo runes no tiene `$$props`, y de todas formas nada le pasa props a un artículo, así que mi plugin de Vite lo quita con un `replace` más.

**Actualización (2026-11-11):** mdsvex ya no está, y con él se fueron el layout y `MarkdownLink`. Los enlaces los dibuja ahora un renderer `link` de svelte-markdown, con las mismas reglas: ruta base e idioma para `/about`, `rel="external"` para `https://` y los relativos tal cual. Se renderiza en el servidor fuera de una página, así que no puede leer el idioma de la página desde SvelteKit: el idioma le llega como prop. Ya no hay `nofollow` que quitar ni `$$props` que borrar.
