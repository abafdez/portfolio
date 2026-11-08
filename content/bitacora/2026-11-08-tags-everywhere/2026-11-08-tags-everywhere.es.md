---
title: Etiquetas en todas partes
reviewed: false
---

## Qué hicimos

- El Devlog recibió lo que tiene el blog: una barra lateral de etiquetas junto a la línea de tiempo y una página por etiqueta, `/devlog/tags/[tag]` (y `/es/devlog/tags/[tag]`), agrupada por fases. Sus etiquetas en las tarjetas y en las entradas ahora son enlaces (`devlogTag` en `links.ts`); el sitemap lista las páginas nuevas.
- La barra lateral salió de la página del blog a `TagColumns.svelte`, y la línea de tiempo de la página del Devlog a `Timeline.svelte`, para que las páginas de etiquetas las reutilicen. `content.ts` ganó `logTags`, `logTagged()`, `byPhase()` y `tagCloud()`, que crea las fichas de cualquier sección (número y tono, las más usadas primero).
- Los botones de filtro de la lista Awesome ahora son las fichas del blog: `TagCloud` crea enlaces o, si recibe `pressed` y `ontoggle`, botones que se activan y desactivan. Una ficha elegida tiene un anillo de su color y una marca.
- Las etiquetas de un enlace en una lista Awesome se pueden pulsar: son enlaces `?tag=css`, y un clic filtra en la misma página, activa la ficha y le lleva el foco.
- Las etiquetas de los proyectos siguen siendo texto: no hay una página de proyectos por etiqueta a la que llevar.

## Qué aprendí

- Una ficha elegida cambia de aspecto sin cambiar de tamaño: un `box-shadow` interior añade un anillo dentro del borde, donde un borde más grueso empujaría a sus vecinas.
- `content: '✓' / ''` le da texto alternativo al contenido generado, aquí ninguno, para que los lectores de pantalla no lean una marca que ya dice `aria-pressed`.
- Un enlace puede hacer otra cosa al pulsarlo y seguir siendo un enlace: `preventDefault()` solo para un clic izquierdo normal, así que Ctrl+clic y "abrir en una pestaña nueva" siguen recibiendo la URL.
- El rastreador del prerenderizado ignora la query de un enlace, así que los enlaces `?tag=css` no crean páginas de más.

## Siguiente

- Animar las tarjetas hacia el artículo que abren (el título y la miniatura transformándose en el artículo).
