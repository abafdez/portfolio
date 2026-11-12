---
title: Un CMS más ligero
reviewed: false
---

## Qué hicimos

- Después de que [svelte-markdown sustituyera a mdsvex](./2026-11-11-svelte-markdown-instead-of-mdsvex), repasé el CMS y me pregunté de cada pieza si seguía mereciendo su sitio. Pasó de 977 a 694 líneas de código.
- El CMS pasó de `cms/` a `src/lib/cms/`, junto al código que comparte con el sitio. Ya nada necesita `cms/` en las carpetas permitidas de Vite, en `tsconfig` ni en la configuración de los tests.
- Sveltia se importa desde npm. `main.ts` pone `CMS_MANUAL_INIT`, importa `@sveltia/cms`, registra nuestras piezas y llama a `init({ config })` con `config.yml` leído por nuestro propio código. El plugin de Vite pasó de 92 líneas a 46: solo responde `/admin` con una página que tiene un script.
- La pestaña «Real page» ya no está: ni los archivos `.preview.md` ocultos, ni el endpoint que los escribía, ni las ramas `?preview` de las páginas `[slug]`. La vista previa dibuja ahora con los componentes de la propia página, así que ya no le quedaba nada que enseñar.
- Los componentes del editor muestran un resumen de una línea (el nombre y el título del bloque). El panel de vista previa de al lado dibuja el bloque de verdad, así que `blocks.ts` perdió su segunda copia del marcado de cada bloque como cadenas de HTML.
- Las portadas salen de un glob de Vite en lugar de una ruta solo de desarrollo; `content.ts` lee el frontmatter con el mismo `readEntry()` que el CMS; el tiempo de lectura de la vista previa es el `readingTime()` del sitio, en su propio archivo pequeño.
- Se queda: la cabecera del post en la vista previa, dibujada con React. Montar ahí `ArticleHeader.svelte` necesitaría una prop de idioma, y su CSS con ámbito no llega al marco de Sveltia.

## Qué aprendí

- La página del CMS no es una ruta de SvelteKit a propósito: todas las rutas van dentro del layout raíz y de su CSS global, y formaría parte del build.
- Un efecto de React debe devolver una función o nada. Lo que devuelva, React lo llama como limpieza antes de volver a ejecutar el efecto.
- El flujo editorial de Sveltia (una rama y una pull request por entrada, publicar = fusionar) necesita el backend de GitHub: es para cuando el CMS esté alojado, no para el flujo local.

## Problemas y soluciones

- Esperar con `await` a `import('@sveltia/cms')` al principio de `main.ts` se quedaba colgado sin ningún error. El `DOMContentLoaded` de la página espera a que termine ese módulo, y Sveltia espera a `DOMContentLoaded`. En su lugar, `import(…).then(setUp)`.
- El optimizador de dependencias de Vite rompía el build de npm de Sveltia, que carga fuentes y wasm desde una carpeta junto a su código. Está en `optimizeDeps.exclude`.
- El build de Sveltia usa `import.meta.hot`, así que el cliente de Vite está en la página del CMS de todos modos. Comprobé que cambiar el contenido no la recarga, así que los componentes del CMS ya no necesitan compilarse sin recarga en caliente.
- Leer `config.yml` nosotros mismos necesitaba `merge: true` en el paquete `yaml`: la configuración usa claves de fusión `<<:`.
- La vista previa en vivo dibujaba la primera versión y luego se paraba, con `l is not a function` en react-dom a cada tecla. El efecto del envoltorio de React era una función flecha que devolvía un valor (`() => update(props)`). Un cuerpo con llaves lo arregló, y `markdown.test.ts` lo comprueba con un React de pega que cumple la regla de React.

## Enlaces

- [Sveltia CMS: inicialización manual](https://sveltiacms.app/en/docs/api)
- [Sveltia CMS: flujo editorial](https://sveltiacms.app/en/docs/workflows/editorial)
- [React: useEffect y su limpieza](https://react.dev/reference/react/useEffect)
- [Vite: opciones de optimización de dependencias](https://vite.dev/config/dep-optimization-options)
- [MDN: DOMContentLoaded](https://developer.mozilla.org/es/docs/Web/API/Document/DOMContentLoaded_event)

## Siguiente

- Comprobar a mano todo el flujo de edición (el selector de carpetas de Sveltia no se puede automatizar).
- Las imágenes (mantener enhanced-img, cachearlo en la CI) y cómo se publican los borradores: preguntas abiertas en `design/svelte-markdown-spike.md`.
