---
title: Migas de pan, y un marcador del menú que nunca estuvo en el HTML
reviewed: false
---

## Qué hicimos

- Las páginas dentro de una sección muestran dónde están: `Inicio / Proyectos / Generador de CV`, `Inicio / Blog / #css`. Las páginas de sección (`/projects`, `/about`) no, porque eso ya lo dice el menú.
- `Breadcrumbs.svelte` está en el layout raíz, al principio de `<main>`. La sección sale de la propia lista del menú, ahora `sections` en `links.ts`, compartida por los dos. El nombre de la página sale de sus datos de load: cada ruta anidada devuelve `crumb` (el título de un artículo, el nombre de una herramienta, `#etiqueta`), tipado en `App.PageData`.
- Ahora el menú también marca la sección en las páginas que hay dentro: `aria-current="true"` en Proyectos mientras estoy en `/projects/cv`, con el mismo marcador. Antes, ahí no se marcaba ningún enlace.
- Por el camino arreglé un bug antiguo: el `aria-current` y el marcador del menú nunca estaban en el HTML prerenderizado. Solo aparecían cuando se ejecutaba el JS.

## Qué aprendí

- Unas migas de pan son un `<nav aria-label="Breadcrumb">` con una lista ordenada. El último elemento es la página actual: texto con `aria-current="page"`, no un enlace a donde ya estoy.
- `content: '/' / ''` le pone texto alternativo a un pseudoelemento. La segunda cadena está vacía, así que un lector de pantalla no lee "barra" entre los elementos.
- Mientras prerenderiza, `resolve()` da enlaces **relativos** (`./projects`, `../projects`), porque `paths.relative` está activado por defecto. Así que `page.url.pathname === resolve(href)` nunca coincidía en el HTML, solo en el navegador. `page.route.id` (`/projects/cv`, `/blog/[slug]`) no tiene ruta base y es igual en el servidor y en el cliente, así que ahora el menú y las migas de pan comparan ids de ruta.
- Para encontrarlo miré el resultado del build, no la página: un `grep` en `build/projects/cv.html` no mostraba migas de pan, aunque estaban en pantalla.
- `aria-current="true"` significa "el elemento actual de este conjunto". Es el valor adecuado para una sección en la que estoy dentro pero no en su página.

## Enlaces

- [WAI-ARIA APG: el patrón de migas de pan](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)
- [MDN: aria-current](https://developer.mozilla.org/es/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current)
- [MDN: content, texto alternativo](https://developer.mozilla.org/en-US/docs/Web/CSS/content#alternative_text_string_counter)
- [SvelteKit: paths.relative](https://svelte.dev/docs/kit/configuration#paths)
- [SvelteKit: page.route](https://svelte.dev/docs/kit/$app-state#page)

## Siguiente

- Fase 9: el componente `Seo`. Ahí las migas de pan también podrían ir como datos estructurados (`BreadcrumbList`).
