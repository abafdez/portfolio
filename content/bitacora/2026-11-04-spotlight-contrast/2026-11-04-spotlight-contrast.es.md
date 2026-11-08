---
title: El foco del fondo escondía mi texto
reviewed: false
---

## Qué hicimos

- El foco de `Blueprint.svelte` (la rejilla iluminada en verde alrededor del ratón) hacía difícil leer el texto. Primero lo medí: el texto atenuado (`--text-2`) sobre una línea principal iluminada más el brillo daba **1,89:1** en oscuro y 2,82:1 en claro. El texto normal necesita 4,5:1.
- Pasé los colores del foco a `tokens.css` como `--grid-spot-line` (8%), `--grid-spot-line-major` (15%) y `--grid-spot-glow` (4%), bajando desde el 25%, el 45% y el 8%. Son más o menos los valores más intensos con los que `--text-2` mantiene 4,5:1 en el punto más brillante: 4,89:1 en oscuro y 4,83:1 en claro.
- El efecto es más discreto. Sigue viéndose claro en oscuro, y en claro casi desaparece.

## Qué aprendí

- "Decorativo" deja de ser verdad en cuanto hay texto encima. Una línea iluminada bajo una letra es el fondo de esa letra, así que necesita el mismo contraste que cualquier superficie.
- Las líneas secundarias están a 1,5rem unas de otras, más o menos una línea de texto, así que dentro del círculo casi todas las líneas de texto tienen una línea iluminada atravesándolas. Y el foco es más brillante justo donde está el ratón, que suele ser donde estoy leyendo.
- Para medir una capa translúcida hay que componerla: pintar el color de la página y luego cada capa en un canvas de 1×1, leer el píxel resultante y calcular el ratio de las WCAG con el color del texto. El comprobador de contraste todavía no puede hacerlo, porque solo conoce superficies opacas.
- En claro, el texto es oscuro y el verde de marca también, así que una línea iluminada cuesta más contraste y la regla deja menos margen para el efecto.
- Los valores son tokens porque los temas con nombre cambiarán `--brand`, y estos ratios cambian con él. Un tema tiene que volver a comprobarlos (lo dice el comentario de `tokens.css`).

## Problemas y soluciones

- No podía abrir el servidor de desarrollo desde Windows: `ERR_CONNECTION_REFUSED` aunque respondía dentro de WSL. El reenvío de localhost de WSL se había caído. Reiniciar WSL no lo arregló; reiniciar el servicio Host Network Service (HNS) de Windows sí.

## Enlaces

- [WCAG 2.2: contraste (mínimo)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [MDN: color-mix()](https://developer.mozilla.org/es/docs/Web/CSS/color_value/color-mix)
- [MDN: CanvasRenderingContext2D.getImageData()](https://developer.mozilla.org/es/docs/Web/API/CanvasRenderingContext2D/getImageData)

## Siguiente

- Migas de pan, para saber dónde estoy dentro de un proyecto o un artículo.
- Quizá darle al tema claro sus propios valores del foco cuando rehaga el tema claro.
