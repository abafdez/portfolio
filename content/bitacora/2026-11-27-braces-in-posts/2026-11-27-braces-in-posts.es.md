---
title: Llaves en los artículos, como código en la vista previa
reviewed: false
---

## Qué hicimos

- **Una `{expresión}` simple vuelve a estar permitida en los artículos.** Se ejecuta al construir el sitio y otra vez en el navegador del lector, y ve el frontmatter como `metadata`: `{metadata.title}: {6 * 7} posts` escribe "Braces: 42 posts".
- **La vista previa del CMS nunca la ejecuta.** Un plugin de análisis solo para la vista previa (`cms/preview-braces.ts`) convierte cada expresión en código en línea que enseña su fuente. Comprobado en la vista previa real: una expresión que lee el almacenamiento del token sale como código y no ejecuta nada.
- **Los bloques y etiquetas de Svelte siguen haciendo fallar la construcción**, ahora nombrándolos: `{#if}` (en markdown un bloque puede tragarse los párrafos que le siguen), `{@html}` (colaría HTML saltándose la regla de no HTML), `{@const}`, `{@debug}`.
- Actualizados la documentación y los textos que describían la prohibición (el borrador de la vista previa, la guía de publicación, dos entradas del Devlog); la tarjeta del tablero está hecha.

## Qué aprendí

- La vista previa no está aislada: el marco de vista previa de Sveltia tiene el origen del CMS, y el artículo lo monta el propio código del CMS. Solo las demos se ejecutan en un marco aislado. Así que "enseñar la fuente" era la forma segura de permitir las llaves.
- mdsvex tiene tres tipos de nodos de llaves: `mustache` (`{expr}`), `svelte_block` (`{#if}`) y `svelte_tag` (`{@html}`). La primera prohibición solo cubría dos.

## Problemas y soluciones

- `{@html …}` pasaba la prohibición de ayer sin que nadie lo notara: es un `svelte_tag`, y solo se comprobaban `mustache` y `svelte_block`. Ahora hace fallar la construcción.

## Siguiente

- Page-data, y luego un feed RSS.
