---
title: Tarjetas que se convierten en la página
reviewed: false
---

## Qué hicimos

- Pulsar una tarjeta (blog, Devlog, proyectos, Awesome, la portada) la convierte en su página: el título, la imagen, la línea de fecha, la descripción y las etiquetas vuelan a su sitio en la cabecera de la página, mientras las demás tarjetas caen y el cuerpo de la página sube detrás. Atrás, o las migas de pan, lo reproducen al revés. Decisiones de una entrevista: se mueven las cinco partes, el mosaico sin portada se desvanece, las demás tarjetas caen.
- `src/lib/morph.ts`: `cardLinkingTo(url)` (la tarjeta cuyo título enlaza ahí), `pageHeader()`, `mark()`, `unmarkAll()`, `picturesReady()`. El `onNavigate` del layout raíz marca un extremo antes de la transición y el otro en `update()`, y añade el tipo `morph`.
- HTML: `data-morph-card` en `TeaserCard`, `data-morph-page` en `ArticleHeader`, `ProjectHeader` y la cabecera de una lista Awesome, `data-morph="title|picture|meta|description|tags"` en las partes (la línea de fecha de la cabecera del artículo recibió un contenedor para ello).
- `global.css`: nombres solo dentro de `[data-morphing]` durante una transición `morph`, `view-transition-class: morph` para su tiempo común (450ms), texto con `fit-content`, la portada recortada a la caja que se mueve, `route-drop` para la página antigua.
- Arreglado para todos los cambios de ruta: la imagen de la página antigua se queda ahora donde estaba en pantalla (`--route-shift`).

## Qué aprendí

- Dos elementos con el mismo `view-transition-name`, uno antes y otro después, se convierten en una sola caja que se mueve. Los nombres tienen que ser únicos, así que solo se ponen en la tarjeta pulsada, en el momento del clic.
- Las imágenes antigua y nueva de un grupo conservan su propia proporción por defecto; `object-fit: cover` las recorta a la caja, pero solo con `overflow: clip` en las imágenes y en su par.
- `::view-transition-old(.morph):only-child` da estilo a una parte que no tiene pareja en la otra página.
- El navegador toma la imagen del "después" cuando termina `update()`, así que una imagen que todavía está cargando llega volando vacía: `img.decode()`, en una carrera contra un tiempo máximo.

## Problemas y soluciones

- Al volver atrás, el artículo antiguo se veía desde la mitad: su imagen se coloca donde empieza el contenido nuevo, y SvelteKit restaura el scroll de la lista. El layout mide dónde empieza el contenido antes y después y mueve la imagen antigua la diferencia.
- Un clic durante una transición la salta, y su limpieza quitaba las marcas de la siguiente: ahora solo limpia la última transición, y cada navegación borra las marcas viejas antes de poner las nuevas.

## Enlaces

- [MDN: view-transition-name](https://developer.mozilla.org/es/docs/Web/CSS/view-transition-name)
- [MDN: view-transition-class](https://developer.mozilla.org/en-US/docs/Web/CSS/view-transition-class)
- [Chrome for Developers: view transitions en el mismo documento](https://developer.chrome.com/docs/web-platform/view-transitions/same-document)

## Siguiente

- Alfonso lo prueba en el móvil y dice si hay que ajustar los tiempos.
