---
title: Bloques de código con Shiki y mis propios tokens
reviewed: false
---

## Qué hicimos

- Sustituí el Prism de mdsvex por Shiki, que se pasa como `highlight.highlighter` en el plugin `markdown()`. Todos los archivos comparten un mismo resaltador, y cada lenguaje se carga la primera vez que lo usa un bloque.
- Primero probé el `createCssVariablesTheme` de Shiki y luego escribí mi propio tema de TextMate (`src/lib/code-theme.ts`). Sus colores son tokens `var(--code-…)` de `tokens.css`.
- Añadí un valor base verde azulado y le di más croma a la paleta clara. Cada color de código tiene al menos 5,3:1 sobre `--surface-2`, en sRGB, en los dos temas.
- Puse `tab-size: 2` en los bloques de código: los tabuladores de 8 columnas son demasiado anchos en un móvil.

## Qué aprendí

- Shiki se ejecuta mientras se construye el sitio. El visitante recibe un `<pre>` lleno de `<span>` de colores, sin JS de resaltado, y funciona sin JavaScript.
- Shiki sí admite temas (temas dobles, `defaultColor: 'light-dark()'`), pero los colores salen de sus temas. Para que los usuarios creen sus propios temas, los colores tienen que salir de mis tokens.
- El tema de variables CSS es "mucho menos detallado" (lo dice la documentación de Shiki). Solo unos diez tipos de token tenían color, y por eso mi tema claro se veía apagado. En su lugar, la documentación recomienda un tema con variables CSS como colores.
- Una gramática le da a cada token una pila de ámbitos, de lo general a lo concreto (`entity.name.tag.yaml`). Un selector de tema coincide con segmentos enteros desde el principio, y gana la coincidencia más larga, como la especificidad en CSS. Da igual cuántos selectores tenga una regla: la lista significa "cualquiera de estos".
- `entity.name.tag` cubre las etiquetas de HTML y Svelte, los selectores de elemento de CSS y las claves de YAML. Un selector más largo (`entity.name.tag.yaml`) en su propia regla les da a las claves de YAML su propio color.
- Escapar no es sanear. Shiki escapa `<` y `&` para el HTML. Yo escapo `{ }`, las comillas invertidas y `\` para la cadena de plantilla de Svelte. El `{@html}` de Svelte nunca sanea, lo que está bien para el markdown que escribo yo, no para el de otra persona.

## Problemas y soluciones

- El patrón habitual de mdsvex (el HTML de Shiki en una cadena de plantilla dentro de `{@html}`, escapado con `escapeSvelte`) se come las barras invertidas sin avisar: `\-\-` salía como `--`. Escapar cada llave, comilla invertida y barra invertida como una entidad HTML lo arregló.

## Enlaces

- [Shiki: temas dobles claro/oscuro](https://shiki.style/guide/dual-themes)
- [Shiki: manipular los colores del tema](https://shiki.style/guide/theme-colors)
- [mdsvex: highlight](https://mdsvex.pngwn.io/docs#highlight)
- [Svelte: `{@html}`](https://svelte.dev/docs/svelte/@html)

## Siguiente

- Un layout propio de mdsvex para los artículos, el tiempo de lectura y las páginas de etiquetas.
