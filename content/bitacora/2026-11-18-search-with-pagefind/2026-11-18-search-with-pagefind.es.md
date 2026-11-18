---
title: Búsqueda con Pagefind
reviewed: false
---

## Qué hicimos

- Añadí búsqueda: un botón con una lupa en la cabecera abre una caja debajo (un popover con `popovertarget`, como el menú de temas de color). `/` la abre desde cualquier sitio.
- Pagefind 1.6.0 se ejecuta después de las dos compilaciones de Vite (`pagefind --site build`) y escribe un índice estático en `build/pagefind/`, uno por cada `<html lang>`. Una búsqueda descarga solo los trozos que necesita; sin servidor, así que funciona en GitHub Pages.
- Solo se indexan los elementos marcados con `data-pagefind-body` (artículos, entradas del Devlog, cabeceras de proyectos, listas Awesome, la introducción de Sobre mí), cada uno con `data-pagefind-meta="section:…"` para la etiqueta encima de cada resultado. Las líneas de fecha, las listas de etiquetas y las etiquetas de los bloques de código llevan `data-pagefind-ignore`: ensuciaban los extractos.
- `search.ts` importa `pagefind.js?lang=…` en tiempo de ejecución: otra URL es otro módulo, así que cambiar de idioma (que no recarga la página) usa el otro índice.
- La caja aparece y desaparece con animación (`@starting-style` y `allow-discrete`), los resultados entran uno tras otro y cada resultado es una tarjeta que se transforma: su título y su extracto vuelan a la cabecera de la página.
- `pnpm preview` y los tests e2e sirven ahora `build/` con `scripts/serve.ts`, que copia las reglas de GitHub Pages.

## Qué aprendí

- `vite preview` sirve `.svelte-kit/output`, no `build/`: lo que se añade después de SvelteKit (el índice de búsqueda, el CMS en `/admin`) no está ahí. Por eso la búsqueda "no funcionaba en preview".
- Un popover se cierra al instante porque `display` no se puede animar; `transition-behavior: allow-discrete` en `display` y `overlay` lo mantiene en pantalla hasta que termina el fundido.
- La caja de búsqueda sigue en la página mientras cambia la página de detrás, así que el resultado seguiría en la foto "después" de la transición con el mismo nombre que el nuevo título, y el navegador se saltaría la transición. `leave()` en `morph.ts` le quita la marca y cierra la caja sin animación (lo que también cancela una que ya estuviera en marcha).
- Svelte elimina las reglas CSS de atributos que se ponen desde JavaScript (`data-instant`) salvo que estén en `:global(...)`.

## Siguiente

- Quizá filtros por sección en la caja.
