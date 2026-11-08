---
title: Animaciones de entrada que controla la página
reviewed: false
---

## Qué hicimos

- La portada hace aparecer y deslizarse la foto del hero, luego el texto del hero, luego la sección de artículos y luego la de proyectos, con 150ms entre cada una.
- La animación es de la página: define los keyframes y le pasa a Hero la animación de cada parte como props de CSS (`<Hero --photo-animation={enter(0)} --text-animation={enter(150)} />`). Hero solo las lee, con `none` por defecto.
- Una red de seguridad para la reducción de movimiento en `global.css` (capa `reset`): todas las animaciones y transiciones terminan casi al instante, sin retraso.

## Qué aprendí

- Las transiciones de Svelte (`transition:`, `in:`) no se ejecutan durante la hidratación, así que no se verían en la primera carga de la página. Las animaciones de CSS se ejecutan en cuanto se pinta el HTML. `transition:` y `animate:` encajan en la fase 5, donde los elementos de una lista aparecen y desaparecen por un cambio de estado.
- El orden de entrada es una decisión de la página. Un componente reutilizable no debería animarse siempre a sí mismo.
- Svelte deja pasar custom properties de CSS a un componente (`--name={value}`). Las pone en un envoltorio con `display: contents`, y el componente las lee con `var()`.
- Svelte renombra los keyframes definidos en un componente (`svelte-abc-name`). `@keyframes -global-home-enter` conserva el nombre, para que Hero, que es otro componente, pueda usarlo.
- `!important` invierte el orden de las capas: gana la capa más temprana, e incluso gana al `!important` sin capa. Así que un `!important` en la capa de reset es el sitio adecuado para una regla que impone la preferencia del usuario. Ese es el único uso legítimo; no debería repartirlo por todas partes.
- `animation: var(--x, none)`: si no se pasa nada, no hay animación. `none` es un valor por defecto seguro, porque un componente no debería moverse a menos que se lo pidan.

## Problemas y soluciones

- El fundido no fundía. Los keyframes `fade-in` de Open Props solo son `to { opacity: 1 }`, así que un elemento que ya es visible no cambia. Escribí mis propios keyframes con un paso `from`.
- La foto aparecía de golpe en su sitio. El `slide-in-up` de Open Props empieza en `translateY(100%)` de la altura del propio elemento, unos 300px en el hero. La mía se mueve 1rem.
- Con la reducción de movimiento, las secciones con retraso se quedaban invisibles (opacidad 0 por `both`) hasta 450ms. La red de seguridad solo acortaba las duraciones. Ahora también pone a cero `animation-delay` y `transition-delay`.
- Para probar animaciones, `document.getAnimations()` puede pausar cada una en un momento dado para leer su opacidad.

## Enlaces

- [Svelte: --style-props](https://svelte.dev/docs/svelte/basic-markup#Component-props)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/es/docs/Web/CSS/@media/prefers-reduced-motion)
- [MDN: cascade layers e !important](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer#description)

## Siguiente

- Pulir las animaciones más adelante (tiempos, curvas).
