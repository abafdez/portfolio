---
title: Borradores del blog que nunca se publican
reviewed: false
---

## Qué hicimos

- Moví todos los artículos a `content/blog/drafts/`. Un artículo es un borrador por dónde vive, así que `Entry.draft` sale de la ruta y el `draft: true` del frontmatter ya no está.
- Envolví el glob de los borradores en `import.meta.env.DEV ? import.meta.glob(…) : {}`, en `content.ts` (el frontmatter) y en `blog/[slug]/+page.ts` (los cuerpos).
- Construí `/blog` (los artículos agrupados por año con `Map.groupBy`) y `/blog/[slug]` igual que la Bitácora. Las dos páginas `[slug]` comparten ahora `ArticleHeader.svelte`.
- Añadí un manejador `prerender.handleUnseenRoutes` que solo ignora `/blog/[slug]`.

## Qué aprendí

- Ocultar un borrador con un filtro no basta. Un glob se resuelve al construir el sitio, solo a partir de las rutas de los archivos, antes de leer ningún frontmatter. Vite genera un chunk por cada archivo que coincide, así que un borrador filtrado seguiría en `build/_app/immutable/` como un archivo `.js` público.
- En un build, Vite sustituye `import.meta.env.DEV` por `false`, y la rama muerta se elimina con el glob dentro. No se lee ni se empaqueta ningún borrador.
- Un `load` de servidor devuelve datos que se serializan (`devalue`), y un componente es una función, así que no se puede serializar. Por eso el cuerpo sale de `+page.ts`, un `load` universal que también puede hacer `import()` del chunk en el navegador.
- Dos comprobaciones detectan problemas distintos con los enlaces: un enlace a una página que no existe hace fallar el rastreo (y `resolve()` con una errata falla en TypeScript), y `handleUnseenRoutes` detecta una ruta que nadie enlaza. Mantuve la comprobación activa para todo menos `/blog/[slug]`, que no tiene páginas hasta que se publica un artículo.

## Enlaces

- [Vite: glob import](https://vite.dev/guide/features.html#glob-import)
- [Vite: variables de entorno](https://vite.dev/guide/env-and-mode.html)
- [SvelteKit: load universal frente a load de servidor](https://svelte.dev/docs/kit/load#Universal-vs-server)
- [SvelteKit: configuración, prerender](https://svelte.dev/docs/kit/configuration#prerender)

## Siguiente

- Resaltado de sintaxis con Shiki.
