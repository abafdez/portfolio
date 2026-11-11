---
title: Markdown dibujado por mis propios componentes de Svelte
description: Sustituí mdsvex por svelte-markdown. Mis componentes renderizan los posts en el servidor, la vista previa del CMS monta los mismos y todas las páginas pesan menos.
reviewed: false
---

Mis artículos son archivos markdown. Hasta ahora, [mdsvex](./2026-10-31-markdown-with-mdsvex) convertía cada uno en un componente de Svelte al hacer el build, y una pila de plugins a su alrededor añadía lo que mi sitio necesita: callouts, componentes en bloques de código, Shiki, títulos enlazables, imágenes optimizadas. Funcionaba, pero había acumulado apaños: un plugin de Vite para ejecutarse antes que enhanced-img, un cambio de la sintaxis de Svelte 4 que mdsvex sigue escribiendo, expresiones regulares sobre su HTML para las imágenes y un segundo proceso, algo distinto, para la vista previa de mi CMS.

Así que probé [svelte-markdown](https://markdown.svelte.page): marked convierte el markdown en tokens y unos componentes de Svelte los dibujan, uno por cada tipo de elemento. Puedes darle tus propios componentes, y de eso se trata.

## Comparar antes de cambiar

Antes de tocar nada, rendericé los 262 posts y entradas del Devlog con svelte-markdown y los comparé con el build de mdsvex, bloque a bloque: texto, marcas en línea, ids de los títulos, enlaces, imágenes, código. Sin contar las comillas tipográficas (mdsvex las añade; decidí mostrar el texto tal como lo escribo), 234 eran idénticos. El resto se reducía a tres cosas:

- **Un fallo de svelte-markdown.** Su componente de código en línea imprime el markdown original sin ninguna comilla invertida, así que el código que contiene una (un tipo template literal en uno de mis posts) la perdía. El token de marked ya tiene el texto correcto; mi propio componente lo usa.
- **Un fallo de mdsvex.** `` `&rarr;` `` mostraba una flecha en lugar de la entidad que escribí.
- **Mi script de comparación.**

Después del cambio, 258 de 262 páginas son idénticas bloque a bloque al build anterior. Las otras 4 son ese fallo de mdsvex, ya corregido.

## Mi propia pasada por los tokens

Leo yo el markdown y le paso a svelte-markdown los tokens terminados. Así tengo un solo sitio, `parse.ts`, para:

- convertir `> [!tip]` en un token `callout` (svelte-markdown dibuja cualquier tipo de token que tenga un componente y le pasa los campos del token como props);
- convertir una imagen con pie, sola en su párrafo, en un token `figure`;
- apuntar los lenguajes de los bloques de código y los archivos que usa el post;
- romper el build.

## Estricto

Markdown deja escribir HTML, y mdsvex lo dejaba pasar: una etiqueta inventada se convertía en un elemento que nunca se cerraba, y una real se volvía marcado sin avisar. Ahora **el HTML en un post rompe el build**, sea cual sea la etiqueta. Nada de lo que se escribe en un post llega a la página como marcado sin más: cada elemento sale de uno de mis componentes, y lo que markdown no sabe decir va en [un bloque de código](./2026-11-07-components-in-code-blocks). Una imagen sin texto alternativo, o de otro sitio, también lo rompe. Todo lo lanza `parse()`, antes de renderizar nada.

## Renderizado en el servidor, mostrado como HTML

svelte-markdown renderiza en tiempo de ejecución. Si la página del post usara `<SvelteMarkdown>` directamente, el navegador descargaría marked, svelte-markdown, mis componentes, el markdown y Shiki, solo para dibujar un HTML que el servidor ya había dibujado.

Así que cada página de post lo renderiza en su load del servidor, con `render()` de `svelte/server`, y muestra el texto:

```svelte
{#key html}
	<div class="prose" {lang} {@attach copyCode}>{@html html}</div>
{/key}
```

De ahí salen tres cosas:

- **Un componente no puede esperar mientras se renderiza.** Shiki carga los lenguajes de forma asíncrona, y las imágenes se importan. Así que `parse()` apunta las dos cosas y se cargan antes de `render()`; después, el resaltado y la búsqueda de imágenes son síncronos.
- **Un componente que solo usa el servidor nunca manda su CSS a la página.** Los estilos del bloque de código pasaron a mi hoja de estilos global, bajo `.prose`, donde ya estaban los de los callouts.
- **Nada de lo que hay en `{@html}` es un componente vivo.** Los botones de copiar de los bloques de código están en el HTML, con `hidden`, y un attachment los muestra y atiende todos los clics con un solo listener en el contenedor. `{#key html}` lo vuelve a ejecutar al pasar a otro post.

El texto acaba dos veces en la página: como HTML y en los datos que SvelteKit envía para la hidratación. Aun así pesa menos que antes, cuando la página llevaba el HTML más el post como un chunk de JavaScript compilado:

| Media, comprimido        | mdsvex  | svelte-markdown |
| ------------------------ | ------- | --------------- |
| Primera visita a un post | 11,6 kB | 9,6 kB          |
| Pasar a otro post        | 4,1 kB  | 3,5 kB          |
| JavaScript en el build   | 3,5 MB  | 0,56 MB         |

## Los mismos componentes en el CMS

La vista previa de mi CMS ejecutaba en el navegador una copia de los plugins del build. Ahora [monta el mismo `Markdown.svelte`](./2026-11-10-a-preview-built-from-my-own-build) con los mismos tokens. La página lo renderiza en el servidor y la vista previa lo ejecuta en el navegador: un analizador, un juego de componentes, los mismos errores.

## Dos trampas de los globs

- **`'!/content/**/cover.*'` no excluye nada.** En `import.meta.glob` de Vite, un patrón negativo que empieza por `/` y tiene `**` en medio no se aplica. Mi servidor de desarrollo se colgaba leyendo todas las portadas a tamaño completo. `'!**/cover.*'` funciona.
- **Un glob eager dentro de una rama solo de desarrollo llega igualmente al build.** `import.meta.env.DEV ? import.meta.glob(…, { eager: true }) : {}` se convierte en imports al principio del módulo, fuera de la rama, y el plugin de imágenes escribe los archivos de los borradores en el build al leerlos. Un glob perezoso se queda dentro de la rama, que el build elimina.

## Enlaces

- [svelte-markdown](https://markdown.svelte.page)
- [marked: el lexer](https://marked.js.org/using_pro#lexer)
- [Svelte: renderizar en el servidor](https://svelte.dev/docs/svelte/svelte-server)
- [Svelte: attachments](https://svelte.dev/docs/svelte/@attach)
- [Vite: importar con glob](https://vite.dev/guide/features.html#glob-import)
