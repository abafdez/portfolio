---
title: Un menú que sigue al scroll y no puede desacompasarse
reviewed: false
---

## Qué hicimos

- Reescribí el seguimiento del scroll del menú de secciones (`SectionNav.svelte`). Usaba un IntersectionObserver sobre una línea de 1px a un tercio de la pantalla. Ahora, con cada scroll calcula la sección actual a partir de dónde están las secciones.
- Lo usan la portada y `/about`.

## Qué aprendí

- Un IntersectionObserver solo informa de cambios: una sección que empieza o deja de tocar la línea. Un scroll rápido podía detenerse con la línea en el hueco entre dos secciones; nada la tocaba, no llegaba ningún evento y la sección anterior seguía resaltada.
- Calculado a partir de las posiciones: la sección actual es la última cuyo borde superior (`getBoundingClientRect().top`) está por encima de la línea. Los huecos dan igual.
- Dos extremos: antes de que la primera sección llegue a la línea, ya es la actual (en `/about`, la franja de logos la empujaba por debajo de la línea, y arriba no se resaltaba nada); y abajo del todo, la actual es la última, porque una última sección corta nunca llega a la línea.
- `$effect(update)` lo ejecuta cuando la página ya está en el DOM, así que una recarga a mitad de página también sale bien. Luego, `<svelte:window onscroll onresize>`.
- Medir diez secciones en cada scroll es barato, y los navegadores lanzan `scroll` como mucho una vez por fotograma. Un observer solo trabaja cuando algo cambia, pero esto no puede perderse ningún cambio.

## Problemas y soluciones

- Al probar con `scrollTo()` se leía la sección antigua: el sitio tiene scroll suave, así que la página seguía moviéndose. Los tests ponen antes `scroll-behavior: auto`.

## Enlaces

- [MDN: getBoundingClientRect](https://developer.mozilla.org/es/docs/Web/API/Element/getBoundingClientRect)
- [Svelte: `<svelte:window>`](https://svelte.dev/docs/svelte/svelte-window)

## Siguiente

- Nada más aquí. De vuelta al contenido de `/about`.
