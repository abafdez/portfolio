---
title: 'Aprender los estilos de Svelte: los recursos que estoy usando'
description: Dónde aprender cómo da estilo Svelte a los componentes, del tutorial oficial a los vídeos, más los experimentos en el playground con los que por fin entendí el ámbito de los estilos.
reviewed: false
---

Los estilos con ámbito de Svelte me confundieron durante un tiempo. ¿Por qué una regla de mi página no llegaba a un componente que había dentro? ¿Por qué una regla para algo que le pasaba a una tarjeta sí se seguía aplicando? Dejé por escrito [cómo funciona el ámbito](./2026-11-01-svelte-scoped-styles), y esta es la lista de lo que estoy usando para aprenderlo bien.

El ámbito funciona igual desde Svelte 3, así que el material antiguo sigue valiendo. El único cambio en Svelte 5 es la especificidad: las partes extra de un selector con ámbito van envueltas en `:where()`, así que no suman nada.

<!-- TODO: mi opinión de cada uno después de repasarlo -->

## Empieza aquí

- **[Tutorial de Svelte: Styling](https://svelte.dev/tutorial/svelte/styling).** El tutorial interactivo oficial. Cada paso es un pequeño editor con el resultado al lado, y las lecciones siguientes tratan `:global`, el atributo `class` y cómo pasar estilos a los componentes.
- **[Documentación de Svelte: Scoped styles](https://svelte.dev/docs/svelte/scoped-styles)** y **[Global styles](https://svelte.dev/docs/svelte/global-styles).** Páginas de referencia cortas: qué hace el compilador, la especificidad, `:global(…)` y el bloque `:global { … }`.
- **[Documentación de Svelte: Custom properties](https://svelte.dev/docs/svelte/custom-properties).** Pasar valores como `--accent="red"` a un componente, y el elemento envoltorio que los contiene.

## Un curso

<!-- TODO: comprobar si el curso es gratis (la página le respondió con un 402 a un script) -->

- **[Joy of Code: The Complete Svelte 5 Course](https://joyofcode.xyz/learn-svelte).** Escrito, no en vídeo, y al día con Svelte 5. Su parte de estilos trata los estilos con ámbito, `:global`, el bloque anidado `:global { … }` y `article :global { … }` para dar estilo a todo lo que hay dentro de un elemento.

## Vídeos

- **["Styling in Svelte"](https://m.youtube.com/watch?v=etUliqGJAaY).** Primero el CSS con ámbito, luego `:global` para salir de él.
- **["Scoped Styles In Svelte With The Style Tag"](https://www.youtube.com/watch?v=KVogcmGsf9I).** Una introducción general al bloque `<style>`.
- **["Svelte - Global CSS"](https://www.youtube.com/watch?v=v7s6pb0jrhI).** Corto, solo sobre `:global`.
- **["Master Styling In Svelte 5"](https://m.youtube.com/watch?v=EfpJDs4MdXo).** Más largo, y específico de Svelte 5.

<!-- TODO: qué vídeo mereció la pena -->

## Pruébalo tú

Lo que me hizo entenderlo fue el [playground de Svelte](https://svelte.dev/playground). Compila mientras escribes, y las pestañas **CSS output** y **JS output** muestran exactamente qué ha hecho el compilador. Tres experimentos:

1. **Dónde va la clase.** Una página con un `<p>` y un componente hijo que muestra un `<h2>`. Añade una regla para cada uno en el `<style>` de la página. La regla del `h2` sale marcada como `(unused)`: el encabezado está escrito en el hijo, así que nunca recibe la clase de la página.
2. **Los hijos pertenecen al padre.** Pásale `<span class="new">` a una tarjeta como hijo. Una regla `.new` en la página le da estilo, aunque aparezca dentro de la tarjeta. Mueve la regla a la tarjeta y deja de funcionar.
3. **Custom properties.** Muestra la misma tarjeta con `--accent="red"` y con `--accent="blue"`, y haz que la tarjeta use `var(--accent, orange)`. Inspecciona el resultado: las dos tarjetas tienen la misma clase con ámbito, y cada una está dentro de un `<svelte-css-wrapper style="display: contents; --accent: …">`. El ámbito decide con qué elementos coincide una regla; la custom property solo cambia un valor que usa.

<!-- TODO: qué me sorprendió en cada experimento -->

## Relacionado, no específico de Svelte

- **[MDN: :where()](https://developer.mozilla.org/es/docs/Web/CSS/:where).** Por qué las clases extra del ámbito no añaden especificidad.
- **[MDN: @layer](https://developer.mozilla.org/es/docs/Web/CSS/@layer).** En mi sitio, los estilos globales viven en cascade layers y los de los componentes no, así que el estilo de un componente siempre gana. Eso importa más que la especificidad.
- **[MDN: usar custom properties de CSS](https://developer.mozilla.org/es/docs/Web/CSS/Using_CSS_custom_properties).** Cómo se heredan los valores a través del envoltorio.
