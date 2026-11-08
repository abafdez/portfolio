---
title: Un layout de mdsvex para los enlaces del markdown
reviewed: false
---

## Qué hicimos

- Añadí `MarkdownLayout.svelte`, que se le pasa al `compile` de mdsvex como `layout`. Envuelve cada archivo .md (artículos y entradas de la Bitácora) y solo muestra `children`.
- El script de módulo del layout exporta `a` = `MarkdownLink.svelte`, así que cada enlace del markdown lo pinta ese componente en vez de un `<a>` normal:
  - `/cv` recibe la ruta base mediante `resolve()`, y en el build sale como `href="../cv"`.
  - `https://…` recibe `rel="external"`.
  - El `rel="nofollow"` de mdsvex desaparece: son enlaces que recomiendo.
- El plugin `markdown()` también quita el `{...$$props}` de mdsvex de la llamada al layout, que el modo runes no permite.

## Qué aprendí

- Sin el layout, `[CV](/cv)` apunta a la raíz del dominio. En GitHub Pages el sitio vive bajo `/portfolio`, así que ese enlace daría un 404.
- mdsvex sustituye un elemento cuando el layout exporta un componente con el nombre de ese elemento. Importa el layout como `* as Components`, así que cualquier otro export (como `CodeBlock`) puede usarse por su nombre, como `Components.CodeBlock`.
- `layout` tiene que ser una ruta de archivo, no una URL: mdsvex lee el archivo para ver qué elementos sustituye.
- Los tipos de `resolve()` solo aceptan rutas que conoce, y un enlace del markdown es solo un texto, así que TypeScript no puede comprobarlo. En su lugar lo comprueba el rastreador del prerenderizado: un enlace a una página que no existe hace fallar el build.

## Problemas y soluciones

- `resolve('/cv')` con un `string` no pasaba la comprobación de tipos (`$app/types` no tiene un tipo `Pathname` al que hacer el cast). Para una ruta sin `[param]`, `resolve()` solo añade la base, así que su tipo se ensancha una vez en `MarkdownLink`.

## Enlaces

- [mdsvex: layouts](https://mdsvex.pngwn.io/docs#layouts)
- [mdsvex: componentes propios](https://mdsvex.pngwn.io/docs#custom-components)
- [SvelteKit: `resolve`](https://svelte.dev/docs/kit/$app-paths#resolve)
- [SvelteKit: opciones de prerender](https://svelte.dev/docs/kit/configuration#prerender)
- [Google: calificar los enlaces salientes (`nofollow`)](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links)

## Siguiente

- Las páginas de etiquetas, `/blog/tags/[tag]`.
