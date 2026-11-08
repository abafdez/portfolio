---
title: Estilos globales con cascade layers
reviewed: false
---

## Qué hicimos

- Creé `src/lib/styles/global.css` con `@layer reset, base, components;`.
- `reset`: box-sizing, márgenes, elementos multimedia, fuentes de los formularios y `overflow-wrap`.
- `base`: fuente y colores de `body`, tamaños de los encabezados y color de los enlaces, todo a partir de tokens.
- Saqué del layout las reglas `:global(body)` y `:global(h1)`.

## Qué aprendí

- Las capas se miran antes que la especificidad. En la lista del orden, gana la capa posterior, por muy específica que sea la regla de la anterior.
- Los estilos sin capa ganan a todos los que están en capas. Los bloques `<style>` de los componentes Svelte no están en ninguna capa, así que sobrescriben los globales.
- `reset` va primero para que no borre mis valores por defecto de `base`.
- La posición de una capa la fija el sitio donde aparece su nombre por primera vez, así que la declaración del orden va arriba. El minificador la reescribió, y el orden se mantuvo.
- `var()` se resuelve cuando se calculan los estilos de un elemento, después de cargar todas las hojas de estilo. Así que el orden de los imports de `tokens.css` y `global.css` no importa.
- El orden en el código solo decide entre reglas que fijan la misma propiedad en el mismo elemento, con la misma especificidad, en la misma capa.
- Propiedades lógicas: `max-inline-size` y `min-block-size` en vez de `max-width` y `min-height`.

## Enlaces

- [MDN: @layer](https://developer.mozilla.org/es/docs/Web/CSS/@layer)
- [Josh Comeau: A Modern CSS Reset](https://www.joshwcomeau.com/css/custom-css-reset/)

## Siguiente

- El modo oscuro.
