---
title: Cursores y selección, una herramienta que también es una guía
reviewed: false
---

## Qué hicimos

- La tercera herramienta de la caja (`/projects/toolbox/cursors`), idea de Alfonso: una página que es a la vez guía y banco de pruebas, en cinco secciones, cada una con qué hace, cuándo usarlo, qué evitar, una demostración y el CSS para copiar.
- **El cursor:** las 36 palabras clave en los seis grupos de MDN; cada ficha lleva su propio cursor, y un clic copia `cursor: grab;`.
- **Tu propio cursor:** un generador de cursores SVG (cuatro formas propias, color, tamaño, punto activo, alternativa), una vista ampliada con el punto activo marcado y una zona que lo usa.
- **`pointer-events`:** una capa de rayas encima de un botón, con contadores de clics; con `pointer-events: none` el clic la atraviesa, y Tab + Intro llegan al botón en los dos casos.
- **`user-select`:** `none`, `auto`, `all` y `text` uno al lado del otro, y un indicador de lo que se ha seleccionado (`selectionchange`).
- **`::selection`:** selectores de color, el contraste de la pareja según las WCAG (el propio `contrast()` del comprobador de contraste) y un botón que selecciona el ejemplo.
- Después, con Alfonso: **pestañas**, una por parte, porque una sola página larga era demasiado (el patrón de pestañas de ARIA: flechas, Inicio y Fin, la pestaña abierta en el hash de la URL; sin JS se ven todas las partes). Los paneles se ocultan con CSS bajo `@media (scripting: enabled)` y van marcados con `data-active` en el HTML, así que nada salta cuando la página despierta.
- Una **nota para móviles y tabletas** arriba, solo bajo `@media (hover: none)`: casi toda la página necesita un ratón o un panel táctil.
- **Cursores animados**, la técnica de animatedWebCursors, de alienmelon: los navegadores solo dibujan el primer fotograma de un GIF, así que un temporizador cambia la imagen de `cursor`. Fotogramas SVG propios (rueda, bloque que parpadea, latido), cada uno con su punto activo, y una tarjeta donde un título, un texto y un botón llevan uno cada uno. El repositorio no tiene licencia, así que no sale de él ni código ni imágenes (y sus GIF son los cursores de Windows XP, obra de Microsoft).
- **Efectos que siguen al puntero** (estela, chispas, una flecha fantasma que se retrasa): un canvas encima de la zona con `pointer-events: none`, que solo dibuja mientras algo se mueve. Los dos tipos se quedan quietos con movimiento reducido.
- **GIF**, a pregunta de Alfonso: un GIF como cursor solo muestra su primer fotograma (el fallo de Firefox sobre esto está abierto desde 2009), así que la pestaña Animados enseña el GIF de ejemplo de las dos formas: quieto como cursor normal, y en movimiento una vez dividido en fotogramas en el navegador (`ImageDecoder`, WebCodecs; cada fotograma escalado a 32 × 32 en un canvas y reproducido con su propia duración). También puedes elegir un GIF tuyo. El de ejemplo, `spinner.gif`, es nuestro: `scripts/cursor-gif.ts` (`pnpm data:cursor-gif`) dibuja los fotogramas SVG de la rueda con sharp y los une en un GIF animado (2,2 KB).
- **Más efectos**, de la lista de mouse-animations, de tgomilar (MIT; código propio, no la librería): ahora doce, elegidos en una lista agrupada con una línea de "cómo probarlo", en una pequeña escena (un botón imán, una tarjeta que se inclina, formas para el paralaje). Dibujados en el canvas: estela, chispas, fantasma, punto y anillo (el cursor real se oculta en la escena), onda y explosión al hacer clic. Solo CSS, a partir de la posición del puntero como propiedades personalizadas (`--x`, `--y`, `--dx`, `--dy`): foco, linterna, invertir (`backdrop-filter: invert(1)`, sin color propio), paralaje. Movidos con JavaScript: imán, inclinación.
- **Solo con CSS** también se puede: `cursor` es una propiedad discreta, así que `@keyframes` con un fotograma clave por fotograma recorre las imágenes (comprobado en Chromium: el cursor calculado cambia). El fragmento está en la página junto al de JavaScript.
- Los datos están comprobados en MDN y en sus datos de compatibilidad; el texto de la guía está escrito con nuestras palabras (la prosa de MDN es CC BY-SA).

## Qué aprendí

- Una imagen de cursor necesita una palabra clave de reserva, al final; su punto activo es por defecto la esquina de arriba a la izquierda; Chromium y Firefox ignoran los cursores de más de 128 × 128, y lo recomendable es 32 × 32.
- Un cursor SVG necesita un `width` y un `height` propios, y sus colores como valores: las variables de CSS no llegan dentro de una data URL.
- `pointer-events: none` detiene el ratón, no el teclado: es para decoración, nunca para desactivar.
- Safari aún necesita `-webkit-user-select`; Safari en iOS ignora `::selection` por completo.
- Un repositorio sin licencia tiene todos los derechos reservados, y ninguna licencia podría cubrir dibujos que nunca fueron de su autor.
- Cambiar solo el hash no recarga la página, así que `onMount` no vuelve a ejecutarse: las pestañas escuchan también `hashchange`.
- En los tests, las consultas por rol se saltan los elementos ocultos: un control en una pestaña cerrada necesita un localizador CSS normal.

## Problemas y soluciones

- `pnpm add -D sharp` escribió en el lockfile una variante de sharp que nunca se instaló (la instalada depende de `@types/node`), así que `node_modules/sharp` apuntaba a la nada y `--force` no ayudó. Apuntar esa entrada a la variante instalada y luego `pnpm install --frozen-lockfile` lo arregló.
- Dos de los efectos eran demasiado sutiles (Alfonso): la inclinación giraba 8° sobre una tarjeta plana, que parecía no hacer nada, así que ahora son 14° con una perspectiva más corta, un brillo y una sombra; una flecha que botaba solo se movía 3 px, e incluso a 10 px Alfonso prefirió quitarla. Y un test que medía un elemento justo después de desplazarse hasta él competía con el desplazamiento suave del sitio: ahora lo desactiva antes.

## Enlaces

- [MDN: `cursor`](https://developer.mozilla.org/es/docs/Web/CSS/cursor)
- [MDN: `pointer-events`](https://developer.mozilla.org/es/docs/Web/CSS/pointer-events)
- [MDN: `user-select`](https://developer.mozilla.org/es/docs/Web/CSS/user-select)
- [MDN: `::selection`](https://developer.mozilla.org/es/docs/Web/CSS/::selection)
- [MDN browser-compat-data](https://github.com/mdn/browser-compat-data)

## Siguiente

- Ajustes con Alfonso, y luego la herramienta de eventos de teclado.
