---
title: svelte-markdown en lugar de mdsvex
reviewed: false
---

## Qué hicimos

- Primero comparé: rendericé los 262 posts y entradas con svelte-markdown y comparé cada bloque (texto, etiquetas en línea, ids de los títulos, enlaces, imágenes, código) con el build de mdsvex. Sin contar las comillas tipográficas, 234 eran idénticos; el resto eran un fallo de svelte-markdown (su renderer de código en línea borra todas las comillas invertidas), uno de mdsvex (`` `&rarr;` `` salía como una flecha) y mi propio script.
- Sustituí mdsvex en todo el sitio. `src/lib/markdown/parse.ts` lee el texto con marked y cambia los tokens: `> [!type]` pasa a ser un token `callout`, una imagen sola con pie un `figure`, y apunta los lenguajes del código y los archivos que usa el post. Nuestros renderers (título, código, código en línea, imagen, figura, enlace, tabla, callout, ` ```video `, ` ```yt `) sustituyen a los de svelte-markdown.
- Cada página `[slug]` renderiza el post en el servidor (`render()` de `svelte/server` en `+page.server.ts`) y muestra el HTML con `{@html}`. Los botones de copiar están en el HTML, ocultos, y un attachment (`copy.ts`) los muestra y atiende los clics.
- Estricto: el HTML escrito en un post rompe el build, también las etiquetas reales. Lo mismo una imagen sin texto alternativo o de otro sitio. Todos los errores los lanza `parse()`, antes de renderizar.
- La vista previa del CMS monta el mismo `Markdown.svelte` en vivo en el marco de Sveltia (`cms/markdown.svelte.ts`). `cms/render.ts`, el segundo proceso, ya no existe.
- Quité mdsvex, unified, 7 paquetes de remark/rehype, el plugin `markdown()` de Vite, `enhance-media.ts`, `tables.ts`, el plugin de rehype de los callouts, `MarkdownLayout`, `MarkdownLink`, el `CodeBlock` antiguo y las excepciones de `onwarn`.
- Resultado: 258 de 262 páginas idénticas bloque a bloque al build de mdsvex (las otras 4 son el fallo de entidades de mdsvex). La primera visita a un post pasó de 11,6 a 9,6 kB comprimidos, y pasar a otro post de 4,1 a 3,5 kB. El JS del build pasó de 323 archivos (3,5 MB) a 59 (0,56 MB). Lighthouse: accesibilidad, buenas prácticas y SEO 100 en los dos temas, CLS 0.
- Añadí `parse.test.ts`, `render.test.ts` y `e2e/blog.test.ts` (el botón de copiar funciona, también tras navegar sin recargar; sin JS el post está completo).

- Después el CMS adelgazó, y eso tiene su propia entrada: [Un CMS más ligero](./2026-11-11-a-leaner-cms).

## Qué aprendí

- Un componente no puede esperar mientras se renderiza. Así que todo lo asíncrono (los lenguajes de Shiki, las imágenes del post) se carga antes de `render()`, a partir de listas que hace `parse()`.
- Un componente que solo renderiza el servidor nunca manda su CSS a la página. Los estilos del bloque de código tuvieron que pasar a `global.css`.
- `route()` lee el `page` de SvelteKit, que no existe dentro de una llamada a `render()` en una función load. Los renderers reciben el idioma de la página como prop.
- Renderizar en el servidor y mostrar `{@html}` hace que el texto esté dos veces en la página (el HTML y los datos de hidratación). Aun así pesa menos que el HTML de mdsvex más el chunk de JS del post.

## Problemas y soluciones

- El servidor de desarrollo se colgaba en las páginas de posts: `'!/content/**/cover.*'` no excluye nada. En los globs de Vite, un patrón negativo que empieza por `/` y tiene `**` en medio no se aplica, así que leía todas las portadas a tamaño completo. `'!**/cover.*'` funciona.
- Las imágenes de los borradores acababan en el build. Un glob eager dentro de `import.meta.env.DEV ? … : {}` se convierte en imports al principio del módulo, e imagetools escribe los archivos al leerlos. Un glob perezoso se queda dentro de la rama, que el build elimina.
- `{@html}` deja su propia marca de hidratación (`<!--1xwl4yi-->`), que mi primera expresión regular no quitaba.
- La página del CMS daba un `504 Outdated Optimize Dep`: Vite descubría svelte-markdown tarde y lo volvía a empaquetar. Ahora está en `optimizeDeps.include`.
- La pestaña «Real page» dejó de actualizarse: la página lee `.preview.md` con `readFileSync`, así que Vite no lo vigila. El plugin de Vite del CMS envía una recarga completa después de cada escritura.
- Un `code` en línea largo hacía que dos páginas se desplazaran en horizontal a 320 px (también en el build de mdsvex). El código en línea de `.prose` ahora se parte por cualquier punto.

## Enlaces

- [svelte-markdown](https://markdown.svelte.page)
- [marked: el lexer](https://marked.js.org/using_pro#lexer)
- [Svelte: renderizar en el servidor](https://svelte.dev/docs/svelte/svelte-server)
- [Svelte: mount](https://svelte.dev/docs/svelte/imperative-component-api#mount)
- [Svelte: attachments](https://svelte.dev/docs/svelte/@attach)
- [Vite: importar con glob](https://vite.dev/guide/features.html#glob-import)

## Siguiente

- Decidir si esto se fusiona.
- Comprobar a mano la vista previa del CMS (el modo de repositorio local de Sveltia necesita un selector de carpetas que los tests no pueden manejar).
