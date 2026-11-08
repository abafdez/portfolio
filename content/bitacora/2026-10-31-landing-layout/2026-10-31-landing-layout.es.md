---
title: Una introducción fija, un menú que sigue al scroll y anclaje en la portada
reviewed: false
---

## Qué hicimos

- Dos columnas en la portada a partir de 64rem: la introducción (el Hero más un menú de la página) se queda fija a la izquierda mientras las secciones se desplazan a la derecha. Una columna por debajo de ese ancho.
- Un `SectionNav.svelte` nuevo: un menú de la página que resalta la sección que se está leyendo (scroll-spy), con `aria-current="location"`, una línea más larga y el color de marca.
- Un token `--header-space` y `scroll-padding-block-start` en `html`, para que la introducción fija y los saltos dentro de la página se detengan por debajo de la cabecera fija.
- Anclaje del scroll (scroll snapping) de tipo `proximity` en las secciones, solo en pantallas anchas y sin preferencia de reducción de movimiento.
- El contenido de cada sección se descubre desde arriba al entrar en pantalla (una línea de tiempo `view()` que anima `clip-path`).
- Lo probé en el sitio construido a 1280×800, 1280×700 y 320px, en los dos temas y con reducción de movimiento.

## Qué aprendí

- `position: sticky` dentro de un grid necesita `align-items: start`. Por defecto, los elementos de un grid se estiran a la altura de la fila, y un elemento tan alto como su contenedor no tiene dónde quedarse fijo.
- Un elemento fijo más alto que la pantalla nunca enseña su parte de abajo. Así que la introducción solo es fija en pantallas de al menos 45rem de alto.
- `IntersectionObserver` con `rootMargin: '-33% 0px -67% 0px'` reduce lo que observa a una línea fina a un tercio de la pantalla. La sección que cruza esa línea es la actual.
- Cambiar el estado dentro de un `$effect` suele ser mala señal, pero aquí el valor viene de fuera de Svelte (el callback del observer), así que no puede ser un `$derived`.
- `scroll-padding` le dice al navegador que el principio de la zona visible está más abajo de lo que parece. Sin él, un salto a `#projects` deja el encabezado debajo de la cabecera fija.
- `proximity` solo ancla cuando te detienes cerca de un punto de anclaje; `mandatory` siempre ancla y te lleva la contraria en las secciones largas.
- El CSS de una página se queda cargado después de salir de ella. Así que la regla del anclaje es `html:has(.landing)`, no `html`: solo coincide mientras la portada está en pantalla.
- Una animación por elemento: las secciones ya tienen una entrada basada en el tiempo, así que la revelación ligada al scroll va en su `.grid`.

## Problemas y soluciones

- La introducción medía 689px de alto: en una columna estrecha de 2fr, cada botón de enlace pasaba a su propia fila. Las columnas iguales lo arreglaron (589px).
- La página cargaba desplazada 50px hacia abajo. Con el anclaje `proximity`, la primera sección era el punto de anclaje más cercano al cargar, así que el navegador saltaba a ella. Hacer que el principio de la portada también fuera un punto de anclaje lo arregló.
- Calculé la cabecera en 5rem; mide 98px (unos 6,1rem). `--header-space` es ahora 6,5rem.
- La accesibilidad en Lighthouse bajó a 95 en la portada: contraste de 1,86:1 en "No projects yet". Lighthouse carga una ventana del tamaño de un móvil, donde ese texto queda por debajo de la primera pantalla, así que la revelación lo tenía todavía con `opacity: 0`. Cambiar la revelación de un fundido a un barrido con `clip-path` lo devolvió a 100 en los dos temas.
- `/bitacora` tenía un aviso de orden de encabezados: el subtítulo provisional era un `<h3>` justo después del `<h1>`. Ahora es un `<p>`.

## Enlaces

- [MDN: position: sticky](https://developer.mozilla.org/es/docs/Web/CSS/position#sticky_positioning)
- [MDN: Intersection Observer API](https://developer.mozilla.org/es/docs/Web/API/Intersection_Observer_API)
- [MDN: scroll-snap-type](https://developer.mozilla.org/es/docs/Web/CSS/scroll-snap-type)
- [MDN: scroll-padding](https://developer.mozilla.org/es/docs/Web/CSS/scroll-padding)
- [MDN: :has()](https://developer.mozilla.org/es/docs/Web/CSS/:has)
- [brittanychiang.com](https://brittanychiang.com), la inspiración de la maquetación

## Siguiente

- Contenido real en la portada, para poder juzgar la maquetación (en `feat/content`).
- View transitions entre rutas.
