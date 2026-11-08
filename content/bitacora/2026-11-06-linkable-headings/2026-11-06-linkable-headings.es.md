---
title: Encabezados enlazables, portadas en AVIF y una etiqueta de borrador
reviewed: false
---

## Qué hicimos

- **Los encabezados del markdown ya tienen id.** `rehype-slug` le da a cada encabezado un `id` a partir de su texto (`## The base path` → `#the-base-path`; uno repetido recibe `-1`), y `rehype-autolink-headings` con `behavior: 'wrap'` convierte su texto en un enlace a sí mismo. Al pasar el ratón o al enfocarlo aparece un `#` (CSS, con texto alternativo vacío para que no se lea). Los tienen tanto los artículos como las entradas de la Bitácora.
- Las páginas Svelte ya tenían id en los encabezados de sus secciones (13, que usan `aria-labelledby` y los menús de secciones), así que los `#enlaces` a esos ya funcionaban.
- **Las portadas pueden ser AVIF**: `cover.avif` se une a `.png`, `.jpg` y `.webp`.
- **Una etiqueta de borrador/publicado en desarrollo** (`PostStatus.svelte`) en las tarjetas y las cabeceras de los artículos: un "borrador" atenuado con borde discontinuo o un "publicado" en verde, cada uno con un icono de Lucide. No está en el build en absoluto.
- La guía de publicación (`content/blog/published/README.md`) explica los id de los encabezados y el AVIF.

## Qué aprendí

- **SvelteKit comprueba los `#enlaces` mientras prerenderiza**: un enlace a un id que no está en la página hace fallar el build con `prerender_missing_id`. Lo probé con un enlace a `#nope`.
- **'wrap' frente a 'append'**: envolver el texto del encabezado en el enlace mantiene su nombre accesible tal cual ("The base path"). Añadir un enlace "#" aparte dentro del encabezado sumaría el texto de ese enlace al nombre del encabezado.
- mdsvex 0.12 usa un `unified` más antiguo (v9) que los plugins de rehype (v11). Trabajan sobre los mismos árboles, así que funciona bien, pero TypeScript no está de acuerdo; un cast en `vite.config.ts`, con un comentario.
- SvelteKit 3 renombró `$app/environment` a `$app/env` (`dev`, `browser`, `building`).
- Cuando un valor solo importa en desarrollo, `dev` de `$app/env` lo deja completamente fuera del build: la etiqueta no está oculta ahí, no está.
- Un AVIF de origen debería exportarse con mucha calidad: el build lo vuelve a codificar, y comprimir dos veces pierde detalle dos veces.
- Con la cabecera fija, un salto a un encabezado se detiene por debajo de ella, gracias al `scroll-padding-block-start` en `html` de la fase 4.5.

## Enlaces

- [rehype-slug](https://github.com/rehypejs/rehype-slug)
- [rehype-autolink-headings](https://github.com/rehypejs/rehype-autolink-headings)
- [SvelteKit: prerender, handleMissingId](https://svelte.dev/docs/kit/configuration#prerender)
- [Amber Wilson: Are your anchor links accessible?](https://amberwilson.co.uk/blog/are-your-anchor-links-accessible/)
