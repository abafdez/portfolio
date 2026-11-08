---
title: Una paleta pensada primero en oscuro en oklch, y tipografía monoespaciada
reviewed: false
---

## Qué hicimos

- Elegí el acento: verde de terminal. Dos versiones, `--green-dark` para el modo claro y `--green-bright` (un verde fósforo) para el oscuro.
- Sustituí los grises de Open Props por nuestra propia escala de gris azulado, de `--ink-0` a `--ink-8`, en `oklch()`. Todos los pasos tienen el tono 250; solo cambia la luminosidad (y un poco el croma).
- Apunté los tokens semánticos (`--brand`, `--text-*`, `--surface-*`) a los nuevos valores base. Los componentes no cambiaron: solo usan tokens semánticos.
- Diseñé primero en oscuro: en cada `light-dark(a, b)`, el valor oscuro `b` es el que ajusté, y el claro es su adaptación.
- Comprobé el contraste de cada par de texto y superficie. Todos pasan el AA; el más bajo es green-dark sobre ink-3, con 4,69:1.
- Fira Code para los encabezados, el nombre del sitio, el menú, los botones y el pie, mediante dos tokens nuevos, `--font-heading` y `--font-label`. El texto normal sigue en sans.
- El acento también aparece en sitios pequeños: la selección de texto, el anillo de foco y el cursor de texto.

## Qué aprendí

- `oklch(L C H)`: L es la luminosidad **percibida**, no un número sin más. Dos colores con la misma L parecen más o menos igual de claros, sea cual sea su tono, así que valores de L igual de espaciados dan una escala uniforme, y el contraste es previsible al elegir pares. Con hex o HSL, dos colores que "parecen" igual de claros pueden estar muy lejos.
- El mismo tono en todos los pasos da un gris azulado coherente. Pero el tono está escrito nueve veces; una variable `--ink-hue` haría que cambiarlo fuera editar una línea.
- Los valores base (`--ink-5`) dicen qué es un color; los tokens semánticos (`--text-2`) dicen para qué sirve. Más adelante, los temas con nombre sobrescribirán el bloque semántico: `:root[data-theme='tokyo-night'] { --brand: …; }`. Un componente que usara `--green-bright` directamente ignoraría esa sobrescritura y seguiría en verde.
- `--font-heading` apunta a `--font-code`, no a `--font-body`. Las custom properties se resuelven donde se declaran (`:root`), así que una sección que cambie `--font-body` nunca podría llegar de todas formas a una fuente de encabezados definida a partir de ella.
- La monoespaciada es ancha, así que los encabezados grandes llevan `letter-spacing: -0.02em`.

## Problemas y soluciones

- Una captura con el modo oscuro emulado salió clara: un `theme=light` antiguo en `localStorage` (del selector) se imponía a la preferencia del sistema. Lo borré antes de probar.

## Enlaces

- [MDN: oklch()](https://developer.mozilla.org/es/docs/Web/CSS/color_value/oklch)
- [Evil Martians: OKLCH in CSS, why we moved from RGB and HSL](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)
- [oklch.com](https://oklch.com), un selector de color
- [MDN: light-dark()](https://developer.mozilla.org/es/docs/Web/CSS/color_value/light-dark)
- [Fira Code](https://github.com/tonsky/FiraCode)

## Siguiente

- El fondo de planos.
