---
title: Papel sobre el tablero de dibujo
reviewed: false
---

## Qué hicimos

- A Alfonso le costaba leer el texto sobre la cuadrícula del fondo. Un script recorrió cada nodo de texto en una página de cada tipo y listó los que no tenían ningún fondo entre ellos y la cuadrícula: artículos y entradas del Devlog (hasta 152 por página), las tablas del comprobador de contraste (225), las introducciones, las etiquetas de los formularios, las migas de pan, el pie.
- Una regla, ya en CLAUDE.md: **la cuadrícula es para los títulos grandes y el espacio vacío; el texto de tamaño normal o menor va sobre una superficie.** Una clase global, `.sheet` (global.css): `--surface-1` opaco, el color de la propia página, con un borde, para que se lea como papel sobre el tablero de dibujo.
- Hojas en: cada artículo (posts, entradas), las introducciones, la barra lateral de etiquetas, los filtros de Awesome, las cabeceras de proyectos y herramientas, el comprobador de contraste, el formulario del CV, cada herramienta de la caja, la columna de presentación de la portada, la introducción de `/about` y su filtro. Las migas de pan pasaron a ser una pastilla pequeña, y el pie tiene el papel de la página detrás, como la cabecera.
- Las pestañas de la herramienta de cursores ahora se unen a su panel, una hoja, como la pestaña de una carpeta.
- Después: sobre la cuadrícula solo quedan títulos de 20 px o más.
- En el móvil (por debajo de 36rem) una hoja va de borde a borde, recuperando el margen lateral de `main`, así que su contenido conserva el ancho que tenía.
- Dos fallos antiguos arreglados de paso. Dos artículos ya se desplazaban de lado en el móvil por una tabla ancha: las tablas van ahora dentro de una caja con desplazamiento (`tables.ts`, un plugin de rehype, una región con nombre a la que llega el teclado), y `main` tiene `min-inline-size: 0`. Y tres enlaces vagos ("Read more", "aquí") ahora dicen adónde llevan.

## Qué aprendí

- El contraste no lo es todo: incluso a 4,5:1, una línea que atraviesa las letras de un texto pequeño cansa la vista.
- Los estilos globales en capas pierden ante los estilos de los componentes, tenga la especificidad que tenga: el `fieldset { padding: 0; border: none }` del CV le quitaba a la hoja su relleno y su borde sin avisar.
- Un elemento de grid no encoge por debajo de su contenido más ancho (`min-width: auto`): una tabla en una página hacía la página entera más ancha que el móvil. `min-inline-size: 0` le deja conservar el ancho de la columna.
- Un input de texto mide unos 20 caracteres por sí solo; como elemento de grid también necesita `min-inline-size: 0`.
- Una caja con desplazamiento necesita `tabindex="0"` y un nombre, para que el teclado pueda desplazarla; es el único caso en que el aviso `a11y_no_noninteractive_tabindex` de Svelte se equivoca, y solo ese se deja pasar.

## Problemas y soluciones

- La pastilla de las migas de pan tocaba la hoja de debajo, y las dos hojas de `/about` se tocaban entre sí: márgenes.
- Sin JS en el móvil, el lateral de `/about` habría sido una hoja vacía: se oculta en ese caso.
- La lista de Awesome se mueve 0,014 (antes 0) mientras aparecen sus filtros: muy poco, queda para más adelante.

## Enlaces

- [MDN: `min-width: auto` en elementos de grid](https://developer.mozilla.org/es/docs/Web/CSS/min-width#auto)
- [Deque: las regiones con desplazamiento deben ser accesibles con teclado](https://dequeuniversity.com/rules/axe/4.10/scrollable-region-focusable)
- [MDN: `@layer`](https://developer.mozilla.org/es/docs/Web/CSS/@layer)

## Siguiente

- De vuelta a la caja de herramientas: eventos de teclado.
