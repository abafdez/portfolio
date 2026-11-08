---
title: Un filtro por perfil en /about
reviewed: false
---

## Qué hicimos

- `/about` puede mostrar solo las habilidades de un tipo de empleo: `?profile=web`, `support` o `mainframe` (los ids de `content/skills.yaml`). Un grupo que se queda sin habilidades desaparece, y también su enlace en el menú lateral.
- El selector es un grupo de radios (`fieldset` + `legend` "Mostrar habilidades para"), con "Todo" primero, y un contador (`13 de 93 habilidades`, `role="status"`). En pantallas anchas se queda fijo con el menú, así que puedo cambiar a mitad de página.
- Como los filtros de Awesome: el perfil se lee de la URL en `onMount` y se vuelve a escribir con `goto(url, { shallow: true, replace: true })`. "Todo" quita el parámetro. Un `?profile=` desconocido lo muestra todo.
- La marquesina de logos no se filtra: es decoración, y un perfil con pocos logos dejaría huecos en el bucle.

## Qué aprendí

- Un solo `$state` (`profile`) y todo lo demás `$derived` de él: los grupos, las secciones del menú, el contador. Si actualizara el menú a mano en `pick()`, también tendría que hacerlo en `onMount` y en cualquier otro sitio que cambie el perfil, y olvidarse de uno deja el menú desacompasado con las ventanas. Guarda el mínimo estado y calcula el resto.
- TypeScript estrecha `profile` después de `if (!profile)`, pero no dentro de un callback (podría ejecutarse más tarde, cuando `profile` haya cambiado). Copiarlo antes en un `const` conserva el estrechamiento.
- Radios para una sola elección, botones con `aria-pressed` para varias. Los radios traen las flechas del teclado, una sola parada del tabulador para el grupo y "botón de opción, 2 de 4" en un lector de pantalla.
- El input se oculta con `opacity: 0`, no con `display: none`: `display: none` lo saca del orden del tabulador y del árbol de accesibilidad. Lo que se ve es la etiqueta, con estilo mediante `label:has(:checked)` y `label:has(:focus-visible)`.
- La página se prerenderiza una sola vez, al construir el sitio, en un único `about.html` que GitHub Pages sirve para cualquier query string. Mientras se prerenderiza no hay `?profile=`, así que solo puede leerlo el navegador (`onMount`). Sin JS: todas las habilidades, todas las ventanas abiertas y sin filtro.

## Enlaces

- [Svelte: `$derived`](https://svelte.dev/docs/svelte/$derived)
- [MDN: `:has()`](https://developer.mozilla.org/es/docs/Web/CSS/:has)
- [APG: el patrón de grupo de radios](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
- [SvelteKit: enrutado superficial](https://svelte.dev/docs/kit/shallow-routing)

## Siguiente

- La herramienta `/projects/cv`: eliges un perfil y las habilidades salen del YAML, las más fuertes primero.
