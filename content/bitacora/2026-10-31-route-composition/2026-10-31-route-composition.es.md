---
title: Cada ruta elige su composición
reviewed: false
---

## Qué hicimos

- Ahora una ruta puede decir cómo la coloca el layout raíz: `composition` en sus datos de load. De momento hay dos valores: `default` y `reading`.
- El tipo vive en `App.PageData` (`src/app.d.ts`), así que `page.data.composition` está tipado en todas partes.
- El layout raíz lo pone en `<main data-composition>`, y `global.css` da estilo a `main` para cada valor. Lectura es una columna de 60ch.
- `/blog` y `/bitacora` fijan `reading` en su `+layout.ts`, así que todas las páginas que cuelgan de ellas también lo reciben.
- Arreglé que `main` se encogiera hasta su contenido: ahora siempre ocupa todo su ancho máximo (`inline-size: 100%`).

## Qué aprendí

- ¿Por qué no dar estilo a `main` desde la página? Los estilos de una página tienen ámbito en el componente de la página; `main` pertenece al layout raíz. La página solo puede mandar datos hacia arriba, y el layout decide qué hacer con ellos.
- Un load en `+layout.ts` se aplica a su ruta y a todo lo que cuelga de ella, así que `/devlog/[slug]` será `reading` sin hacer nada.
- `satisfies App.PageData` comprueba el valor con el tipo y conserva `'reading'` como ese texto exacto. Sin él, TypeScript lo ensancha a `string`.
- En un grid, `margin-inline: auto` impide que un elemento se estire: se encoge hasta su contenido. Así que cada página era tan ancha como su texto. `inline-size: 100%` más `max-inline-size` lo arregla.
- Con las view transitions entre rutas, cambiar de composición (portada de 1120px → blog de 576px) no necesita nada extra: la caja del contenido salta al tamaño nuevo y el contenido nuevo aparece.

## Enlaces

- [SvelteKit: page.data](https://svelte.dev/docs/kit/$app-state#page)
- [SvelteKit: App.PageData](https://svelte.dev/docs/kit/types#PageData)
- [TypeScript: satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)

## Siguiente

- El lema de verdad (en palabras de Alfonso), y luego la PR de la fase 4.5.
