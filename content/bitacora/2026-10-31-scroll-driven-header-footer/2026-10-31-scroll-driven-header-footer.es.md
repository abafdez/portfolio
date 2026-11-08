---
title: Una cabecera que se despega y un pie que avisa, con animaciones ligadas al scroll
reviewed: false
---

## Qué hicimos

- Guardé [julibe.com](https://julibe.com) (y su página [Pillars](https://julibe.com/pen/pillars/)) en mis notas como inspiración. De ahí elegí: la barra de desplazamiento de color, el menú superior que se despega al hacer scroll y el pie oculto que avisa de que hay más. El audio no. El anclaje por secciones espera a la maquetación de la portada.
- Barra de desplazamiento: fina, con el control en el color de acento sobre el fondo de la página.
- Cabecera: arriba del todo está plana, a ras de la página. En los primeros 5rem de scroll se eleva hasta ser una barra flotante (borde, esquinas redondeadas, fondo translúcido desenfocado y sombra). Fija a partir de 48rem; en el móvil ocupa dos filas, así que se va con el scroll.
- Pie: su contenido entra deslizándose al aparecer en pantalla. Hasta entonces, una pestaña verde con un chevrón sube y baja abajo de la pantalla y se desvanece cuando llega el pie. Al pulsarla, se hace scroll hasta el pie.
- Lo probé en el sitio construido a 320px y en escritorio, en los dos temas y con reducción de movimiento.

## Qué aprendí

- `animation-timeline` sustituye el tiempo por otra cosa. `scroll()` es la posición de scroll de la página; `view()` (o una `view-timeline` con nombre) es un elemento cruzando el viewport.
- `animation-range` fija dónde están el 0% y el 100%. La cabecera usa `0 var(--size-10)`: toda la animación ocurre en los primeros 5rem de scroll. El pie usa `entry 0% entry 100%`: desde que empieza a entrar hasta que está entero dentro.
- `view-timeline: --footer` en el pie le da nombre a la línea de tiempo, para que sus hijos (la pista, el contenido) puedan usarla.
- Los estilos normales de la cabecera son la barra flotante; los keyframes solo tienen un `from` (plana). Donde no se admiten las animaciones ligadas al scroll, o con reducción de movimiento, la animación no se ejecuta y se ve el aspecto terminado.
- La misma idea con la pista: es `display: none` salvo que la animación pueda ejecutarse, porque sin ella nada la ocultaría nunca.
- Dos animaciones en un mismo elemento se pelearían por la misma propiedad, así que el vaivén basado en el tiempo va en el `svg` y el desvanecido ligado al scroll en el enlace.
- Todo está dentro de `@supports (animation-timeline: …)` más `@media (prefers-reduced-motion: no-preference)`.
- La pista es decoración: `aria-hidden="true"` y `tabindex="-1"`. Quien usa el teclado o un lector de pantalla llega al pie normalmente.
- `scrollbar-color` y `scrollbar-width` son las propiedades estándar (Firefox, Chrome 121+); no hace falta `::-webkit-scrollbar`.
- `scroll-behavior: smooth` solo dentro de `no-preference`, para que los saltos dentro de la página no se deslicen para quien pidió menos movimiento.

## Enlaces

- [MDN: animaciones ligadas al scroll en CSS](https://developer.mozilla.org/docs/Web/CSS/CSS_scroll-driven_animations)
- [MDN: animation-range](https://developer.mozilla.org/docs/Web/CSS/animation-range)
- [scroll-driven-animations.style](https://scroll-driven-animations.style) de Bramus, demos y un visualizador de rangos
- [MDN: scrollbar-color](https://developer.mozilla.org/docs/Web/CSS/scrollbar-color)

## Siguiente

- La maquetación de la portada: introducción fija, menú que sigue al scroll y anclaje.
