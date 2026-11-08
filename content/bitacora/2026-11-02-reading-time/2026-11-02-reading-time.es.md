---
title: El tiempo de lectura, contado al construir el sitio
reviewed: false
---

## Qué hicimos

- Añadí `minutes` a cada `Entry` en `content.ts`: las palabras del archivo sin su frontmatter, a 200 palabras por minuto, redondeado hacia arriba y como mínimo 1.
- Se muestra como `· N min de lectura` en `ArticleHeader` (las páginas de artículo y de entrada) y en `TeaserCard` (las listas y la portada).

## Qué aprendí

- `content.ts` es el único sitio que tiene todos los archivos como texto, todos a la vez. El layout solo recibe el contenido renderizado (un snippet), y la página `[slug]` recibe un componente compilado, no palabras.
- `/blog` necesita el número para cada tarjeta. Calculado en la página del artículo, significaría cargar el cuerpo de todos los artículos para mostrar una lista. Calculado en `content.ts`, son unos pocos bytes de datos en la página prerenderizada (`"minutes":14` en `__data.json`).
- Regla práctica: calcula un valor donde ya están sus datos de partida y pásaselo como dato a todo el que lo necesite. Las etiquetas funcionan igual: ya están en cada `Entry`, y la lista de todas las etiquetas es un paso más sobre `allPosts`.
- Contar sobre el markdown en bruto significa que nunca se cuentan las etiquetas HTML ni los `<span>` de Shiki. Es un efecto secundario, no el motivo.
- 200 palabras por minuto es algo menos de las ~238 habituales en textos de no ficción: estos artículos son técnicos y están llenos de código.

## Enlaces

- [Brysbaert (2019): How many words do we read per minute?](https://doi.org/10.1016/j.jml.2019.104047)
- [Vite: `import.meta.glob`](https://vite.dev/guide/features#glob-import)

## Siguiente

- Las páginas de etiquetas, `/blog/tags/[tag]`.
