---
title: Cómo limita Svelte el ámbito de los estilos
reviewed: false
---

## Qué hicimos

- Descubrí por qué los estilos de la página de una entrada no llegaban al markdown renderizado, y lo arreglé con una clase global `.prose`.
- Compilé componentes diminutos con el compilador de Svelte y en el playground para leer qué le hace a un bloque `<style>`.
- Escribí dos borradores de artículo: cómo funciona el ámbito de los estilos y los recursos que uso para aprenderlo.

## Qué aprendí

- El compilador añade una clase (`svelte-<hash>`) a cada elemento escrito en el marcado de un componente, y la misma clase a cada selector. El hash sale de la ruta del archivo: uno por archivo, nunca uno por instancia.
- Lo que decide es dónde se escribe un elemento, no dónde acaba. Los elementos de un componente hijo reciben la clase del hijo. Los hijos que le paso a un componente están escritos en mi archivo, así que reciben mi clase y les aplican mis reglas.
- Los selectores que no pueden coincidir con nada del marcado se eliminan, con un aviso de "Unused CSS selector". Una regla `h2` en una página no da estilo a los encabezados que muestra un hijo.
- `:global(h2)` se salta la clase solo en esa parte: `.prose :global(h2)` se convierte en `.prose.svelte-x h2`, que sigue atado al `.prose` de este archivo.
- La especificidad sube en una clase: las demás partes reciben la clase dentro de `:where()`. Los keyframes se renombran por componente.
- `--accent="red"` en un componente no crea ninguna clase. Svelte envuelve el componente en `<svelte-css-wrapper style="display: contents; --accent: red">`; la regla con ámbito lee el valor con `var()`, y se hereda a todo lo que hay dentro del envoltorio.
- El ámbito decide con qué elementos coincide una regla (al compilar). Las custom properties deciden qué valores usa (por instancia, en tiempo de ejecución).

## Enlaces

- [Documentación de Svelte: estilos con ámbito](https://svelte.dev/docs/svelte/scoped-styles)
- [Documentación de Svelte: estilos globales](https://svelte.dev/docs/svelte/global-styles)
- [Documentación de Svelte: custom properties](https://svelte.dev/docs/svelte/custom-properties)
- [Tutorial de Svelte: estilos](https://svelte.dev/tutorial/svelte/styling)

## Siguiente

- Repasar los recursos del artículo sobre estilos y añadir mi opinión de cada uno.
