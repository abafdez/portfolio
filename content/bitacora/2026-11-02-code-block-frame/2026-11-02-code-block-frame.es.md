---
title: Un marco para los bloques de código, y una columna más ancha
reviewed: false
---

## Qué hicimos

- Ensanché la composición de lectura de 60ch a `--reading-width: 80ch` (`tokens.css`), tanto para el texto como para el código. Preferí una columna más ancha a una maquetación en la que el código se saliera de la columna o a los 70rem enteros.
- Añadí `CodeBlock.svelte`. `highlight()` envuelve en él cada `<pre>` de Shiki, como `Components.CodeBlock` (exportado desde `MarkdownLayout`). Añade:
  - una barra con el lenguaje;
  - un botón de copiar con respuesta mediante `role="status"`;
  - líneas que se parten;
  - números de línea.
- Quité el `tabindex="0"` de Shiki con un transformer: ya no se desplaza nada, así que no hay nada que enfocar. La antigua regla `.prose pre` ya no está.

## Qué aprendí

- Las líneas se parten con `white-space: pre-wrap` más `overflow-wrap: anywhere`, que también parte las palabras y las URLs largas.
- Los números de línea son un contador de CSS en `::before`. El contenido generado no está en el texto del DOM, así que al copiar (a mano o con el botón) nunca se incluyen.
- Cada `.line` es un `inline-block` a todo el ancho con `padding-inline-start: 4ch`, y el número se mete en ese espacio con un margen negativo. Una línea partida continúa debajo de su propio texto, no debajo del número.
- `:only-child` solo cuenta elementos, no los nodos de texto `\n` entre líneas, así que un bloque de una línea no lleva número.
- El botón solo se muestra después de ejecutarse un `$effect` y solo si existe `navigator.clipboard`. Sin JS no hay un botón que no haga nada.
- El HTML de Shiki entra con `{@html}`, así que los estilos del componente le llegan con `:global()`, sin salir del ámbito del `figure` del componente.

## Problemas y soluciones

- Las líneas con `display: block` añadían una línea vacía después de cada una: Shiki pone un `\n` entre líneas, y un `<pre>` lo muestra. `inline-block` con `inline-size: 100%` lo arregló.
- Con `position: absolute`, una línea vacía perdía su altura y su número se solapaba con el siguiente. Un `::before` dentro del flujo con un margen negativo lo arregló.

## Enlaces

- [MDN: usar contadores de CSS](https://developer.mozilla.org/es/docs/Web/CSS/CSS_counter_styles/Using_CSS_counters)
- [MDN: `overflow-wrap`](https://developer.mozilla.org/es/docs/Web/CSS/overflow-wrap)
- [MDN: `Clipboard.writeText()`](https://developer.mozilla.org/es/docs/Web/API/Clipboard/writeText)
- [MDN: el rol ARIA `status`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role)
- [Shiki: transformers](https://shiki.style/guide/transformers)

## Siguiente

- Las páginas de etiquetas, `/blog/tags/[tag]`.
