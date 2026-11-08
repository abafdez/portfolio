---
title: Un fondo de rejilla de planos con un foco que sigue al cursor
reviewed: false
---

## Qué hicimos

- Un `Blueprint.svelte` nuevo, montado una vez en `+layout.svelte`: una capa fija detrás de toda la página.
- La rejilla es solo CSS: cuatro `linear-gradient`, líneas secundarias en cada celda (`--grid-size`, 1,5rem) y líneas principales cada 4 celdas.
- Un pequeño "+" en cada cruce de líneas principales, dibujado con una máscara de CSS.
- La rejilla se desvanece hacia las esquinas inferiores con una máscara radial.
- Con ratón, la rejilla se ilumina en el color de acento en un círculo alrededor del puntero (el foco).
- Los colores de las líneas son tokens mezclados a partir de `--text-1`, así que la rejilla sigue al tema sin código extra.

## Qué aprendí

- Un `linear-gradient` con un corte seco dibuja una línea: `linear-gradient(var(--line) 1px, transparent 1px)` es 1px de color y luego transparente. `background-size` repite esa tesela, así que un degradado hace todas las líneas en una dirección.
- Con varios fondos, **el primero se pinta encima**: se listan del más cercano al más lejano. Nuestras líneas principales van primero, así que quedan encima donde cruzan las secundarias. (Aquí las dos son del mismo color con distinta transparencia, así que el orden no cambia el resultado; sí lo cambiaría con colores distintos o líneas opacas.)
- `mask-image` usa una imagen solo como forma: donde es opaca, se ve el elemento. El "+" es un SVG diminuto usado como máscara, y su color sale de `background-color`, así que sigue al tema. Una data URI con SVG no puede leer variables de CSS, pero una máscara no lo necesita.
- Dos máscaras con `mask-composite: intersect`: solo se ve lo que dejan pasar las dos, así que las cruces se desvanecen como la rejilla.
- `position: fixed; z-index: -1` pinta la capa encima del color de fondo del body pero debajo de todo el contenido de la página. `pointer-events: none` para que nunca capture clics.
- El foco es la misma `.grid` con otros valores de `--line`, recortada con `radial-gradient(circle 14rem at var(--x) var(--y), …)`. Svelte escribe `--x` y `--y` con `style:--x`.
- `pointerType === 'mouse'` se salta el tacto y el lápiz, y `@media (hover: hover) and (pointer: fine)` solo muestra el foco en dispositivos con un puntero de verdad que puede pasar por encima.
- `mouseout` con un `relatedTarget` a `null` significa que el ratón salió de la ventana, no solo de un elemento. Ahí es cuando el foco se desvanece.

## Enlaces

- [MDN: usar varios fondos](https://developer.mozilla.org/es/docs/Web/CSS/CSS_backgrounds_and_borders/Using_multiple_backgrounds)
- [MDN: mask-image](https://developer.mozilla.org/es/docs/Web/CSS/mask-image)
- [MDN: mask-composite](https://developer.mozilla.org/docs/Web/CSS/mask-composite)
- [MDN: @media pointer](https://developer.mozilla.org/es/docs/Web/CSS/@media/pointer)
- [Svelte: la directiva style:](https://svelte.dev/docs/svelte/style)

## Siguiente

- La cabecera y el pie reaccionan al scroll.
