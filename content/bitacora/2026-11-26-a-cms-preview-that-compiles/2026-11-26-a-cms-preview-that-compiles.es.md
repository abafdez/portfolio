---
title: Una vista previa del CMS que compila Svelte
reviewed: false
---

## Qué hicimos

- **La vista previa del CMS compila cada artículo en el navegador** igual que la construcción: `mdsvex/compile` con las opciones de la construcción (`src/lib/markdown/options.ts`), luego el compilador de Svelte y luego `mount()` (`src/lib/cms/mdsvex.svelte.ts`).
- El módulo compilado importa por nombre el motor de Svelte y nuestros componentes; cada nombre se convierte en un módulo `blob:` que entrega la copia del propio CMS, y solo se reescriben los imports del principio.
- Las imágenes y los archivos de los bloques vienen del `getAsset()` de Sveltia, y los enlaces toman el idioma del archivo, las dos cosas mediante los mismos contextos que ponen las páginas del sitio.
- Comprobado con el backend de prueba de Sveltia: los 72 artículos publicados se ven en la vista previa idénticos a las páginas construidas, colores del código incluidos. Una compilación en caliente tarda unos 6 ms.
- **Las llaves en los artículos ahora hacen fallar la construcción y la vista previa**, igual que el HTML: la vista previa ejecuta lo que compila, en la página que guarda el token de GitHub. **Actualización (2026-11-27):** ahora se permite una `{expresión}` simple; la vista previa la enseña como código en lugar de ejecutarla (entrada `2026-11-27-braces-in-posts`).

## Qué aprendí

- Svelte prohíbe importar `svelte/internal/*` desde archivos `.svelte.ts` (es privado); un archivo `.ts` normal sí puede, y el compilador y el motor de un mismo paquete siempre coinciden.
- Una de las exportaciones del motor de Svelte se llama `await`, así que `export const { await }` es un error de sintaxis: los módulos blob exportan mediante variables locales.
- Un artículo con datos de plugin importa `setContext` de `'svelte'`, así que ese nombre también necesita su módulo.

## Problemas y soluciones

- Playwright no puede manejar el selector de carpetas de Sveltia, así que los tests usaron el backend de prueba de Sveltia en el navegador, activado en `config.yml` solo durante la prueba.

## Enlaces

- [El compile de mdsvex](https://mdsvex.pngwn.at/docs/reference/compile)

## Siguiente

- Probar el CMS construido en `/admin` cuando se suba la rama.
