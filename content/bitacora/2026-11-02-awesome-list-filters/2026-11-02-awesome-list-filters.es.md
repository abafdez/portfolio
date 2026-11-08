---
title: Una lista Awesome con los filtros en la URL
reviewed: false
---

## Qué hicimos

- Las listas Awesome son archivos YAML en `content/awesome/`, uno por lista: categorías y luego enlaces con título, url, descripción y etiquetas. Una lista son datos, no prosa, así que nada de markdown. El nombre del archivo es la URL: `modern-css.yaml` → `/awesome/modern-css`.
- `src/lib/awesome/awesome.ts` las carga al construir el sitio (`import.meta.glob` con `?raw` y el paquete `yaml`, como `content.ts`). Un enlace que no es `https://` o una etiqueta que no está en kebab-case hacen fallar el build. Para esto, `checkTags` ahora se exporta desde `content.ts`.
- `LinkFilter` (`filter.svelte.ts`) guarda el texto de búsqueda y las etiquetas elegidas como `$state`, y los enlaces que coinciden y su número como `$derived`. Se convierte a sí mismo en parámetros de URL y los vuelve a leer.
- `AwesomeList.svelte` muestra un cuadro de búsqueda, botones de etiqueta que se activan y desactivan (`aria-pressed`), un contador en vivo (`role="status"`) y un botón de "Quitar filtros". El filtro va en la URL (`?q=grid&tag=docs`), así que una vista filtrada se puede compartir.
- `/awesome` lista las listas. La primera, CSS moderno, tiene 25 enlaces sacados de la documentación que ya cita esta Bitácora.

## Qué aprendí

- Las runes funcionan en clases, pero solo en archivos `.svelte` y `.svelte.ts`. Una clase reúne en un sitio el estado, lo que se deriva de él y las formas de cambiarlo, y un componente lo recibe todo como un solo objeto.
- `$derived` es perezoso: `results` solo se vuelve a calcular cuando se lee y ha cambiado algo de lo que usa.
- La clase recibe las categorías como una función (`() => list.categories`), no como el array. Un array normal se leería una sola vez, al crear la clase.
- `{#key list.slug}` crea un componente nuevo cuando cambia la lista. Si no, pasar de una lista a otra conservaría el filtro anterior.
- Un enlace de función, `bind:value={() => get, (v) => set}`, ejecuta mi código justo donde cambia el valor. Lo uso para actualizar la URL después del filtro, en ese orden.
- Los filtros solo se muestran cuando se ha ejecutado `onMount`. Sin JS serían controles que no hacen nada, y la página prerenderizada ya tiene todos los enlaces.
- Las descripciones son datos nuestros, mostrados como texto con `{…}`, que Svelte escapa. Solo el HTML que entra con `{@html}` necesitaría sanearse.
- `page.url.searchParams` es de solo lectura. `read()` solo pide `Pick<URLSearchParams, 'get' | 'getAll'>`, los dos métodos que usa, así que los parámetros de solo lectura encajan.

## Problemas y soluciones

- "Quitar filtros" se oculta cuando no hay nada filtrado, y el foco caía en `<body>`. Ahora quitar los filtros lleva el foco al cuadro de búsqueda.
- Un `?tag=` desconocido que llegara desde un enlace habría ocultado todos los enlaces detrás de un botón que no existe. `read()` solo conserva las etiquetas de la propia lista.

## Enlaces

- [Svelte: `$state` en clases](https://svelte.dev/docs/svelte/$state#Classes)
- [Svelte: `$derived`](https://svelte.dev/docs/svelte/$derived)
- [Svelte: enlaces de función](https://svelte.dev/docs/svelte/bind#Function-bindings)
- [Svelte: `{#key}`](https://svelte.dev/docs/svelte/key)
- [MDN: `<search>`](https://developer.mozilla.org/es/docs/Web/HTML/Element/search)
- [MDN: aria-pressed](https://developer.mozilla.org/es/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed)

## Siguiente

- Revisar la lista de CSS moderno (las descripciones, lo que falta) y luego abrir la PR de la fase 8.
