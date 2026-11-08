---
title: Cuatro transiciones de tema más, por turnos
reviewed: false
---

## Qué hicimos

- Las transiciones de los temas de color ahora **van por turnos** en vez de ser aleatorias (al azar resultaba raro): onda, glitch, barrido, CRT, tramado y lluvia, y luego otra vez desde el principio. Un contador en `palette-transitions.ts`; una recarga empieza por la primera.
- **Redibujado por barrido:** una línea brillante en el color de marca baja por la pantalla, dibujando la página nueva por encima de ella con unas líneas de CRT tenues, y luego un breve parpadeo.
- **Apagado de CRT:** la página antigua se aplasta hasta ser una línea brillante, luego un punto, sobre una pantalla negra; la página nueva crece desde la línea y se abre.
- **Disolución con tramado:** la página nueva aparece a través de un tramado de Bayer de 4×4 con píxeles de 6px, una sola tesela SVG de 24px que el CSS repite por la pantalla.
- **Lluvia de columnas:** cada columna de la rejilla deja caer la página nueva desde arriba, en su propio momento al azar, acelerando al caer.
- El CSS salió de `PalettePicker.svelte` a `src/lib/palette-transitions.css`. Cada efecto es una función en el `.ts` y un bloque en el `.css`, con una cabecera `--- Effect: name ---`, así que puedo borrar los que no me gusten.

## Qué aprendí

- **La línea del barrido no la dibuja nadie.** La foto nueva se desvanece justo por encima de la línea y la antigua aparece justo por debajo, así que justo en la línea las dos son transparentes y se ve el fondo del grupo (`--brand`): ese es el brillo.
- **Una custom property solo se puede animar cuando está registrada** (`@property --palette-scan { syntax: '<percentage>' }`). Sin registrar, es solo texto, y el texto salta de un valor al siguiente.
- **Una matriz de Bayer** ordena los píxeles de una tesela de forma que los k primeros siempre están repartidos por igual. Se construye duplicando la matriz de 2×2 (0 2 / 3 1). Con píxeles pequeños y 64 pasos parecía un fundido normal; con píxeles grandes y 16 pasos parece un tramado.
- En los keyframes, una propiedad solo se interpola entre los keyframes que la fijan: el keyframe del 70% del CRT solo fija `filter`, así que el brillo se apaga deprisa mientras `scale` sigue del 60% al 100%.
- `:active-view-transition-type(ripple, dither, rain)` acepta una lista, así que los tres efectos con máscara SVG comparten una regla.

## Problemas y soluciones

- **Las transiciones de paleta nunca ponían `mix-blend-mode: normal`.** El navegador mezcla las dos fotos con `plus-lighter`, pensado para un fundido, que ilumina la página donde las dos se ven del todo. El selector de claro y oscuro ya lo tenía; ahora la regla compartida de las paletas también.
- La línea del CRT se veía apagada en una página oscura (`brightness(3)` de algo casi negro sigue siendo oscuro): ahora `brightness(8)`. Entonces toda la pantalla destellaba al abrirse, así que el brillo baja a 1,4 al llegar al 70%.
- El build de producción vuelve a funcionar, así que comprobé ahí los temas: los siete dan los mismos colores que en desarrollo, en los dos modos, también cuando el selector fuerza uno (el build reescribe `light-dark()`).
- `pkill -f "vite preview"` nunca coincidía: el proceso es `vite.js preview`. Y un patrón que coincide con la propia línea de comandos de la terminal mata la terminal. `[v]ite` evita el segundo problema.

## Enlaces

- [MDN: @property](https://developer.mozilla.org/es/docs/Web/CSS/@property)
- [MDN: mix-blend-mode](https://developer.mozilla.org/es/docs/Web/CSS/mix-blend-mode)
- [Wikipedia: tramado ordenado](https://en.wikipedia.org/wiki/Ordered_dithering)
- [MDN: SVG `<set>`](https://developer.mozilla.org/es/docs/Web/SVG/Element/set)

## Siguiente

- Probar los seis y borrar los que no me gusten.
