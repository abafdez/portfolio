---
title: Cada artículo en su propia carpeta, con sus imágenes
reviewed: false
---

## Qué hicimos

- Moví cada artículo, borrador y entrada del Devlog a una carpeta con su propio nombre (`<slug>/<slug>.md`), 95 archivos con `git mv`, para que sus imágenes puedan estar a su lado. Los nombres de los archivos no cambiaron, así que los slugs y las URLs tampoco.
- Ahora el blog tiene dos carpetas explícitas: `content/blog/drafts/` (solo en desarrollo) y `content/blog/published/`. Publicar es `git mv content/blog/drafts/<slug> content/blog/published/`.
- Los globs pasaron a ser `*/*.md`. Un `slugOf()` nuevo en `content.ts` hace fallar el build cuando una carpeta y su archivo tienen nombres distintos.
- Las imágenes se escriben como markdown normal, `![Lo que muestra](./diagram.png)`. El plugin `markdown()` de `vite.config.ts` convierte cada una en un import más un `<enhanced:img>`: copias en AVIF y WebP, con ancho y alto.
- El build falla con una imagen sin texto alternativo, o con un archivo que no existe.
- `summary()` se salta una línea que solo es una imagen, y quita las imágenes que hay dentro de una frase. Ya son 83 tests unitarios.

## Qué aprendí

- Comparé seis sitios para las imágenes: `static/`, junto al archivo, una carpeta por artículo, una carpeta compartida, imports a mano y un alojamiento externo. Una carpeta por artículo mantiene juntos un artículo y sus imágenes: un movimiento para publicar, un borrado para quitarlo.
- `![alt](./x.png)` se convierte en `<img src="./x.png">`, y el navegador lee `./` a partir de la **URL de la página**, no de la carpeta del archivo markdown. El rastreador del prerenderizado también comprueba `src`, así que el build falló con un 404 en vez de publicar una imagen rota.
- `<enhanced:img src="./x.png">` escrito en el markdown no encontraba el archivo, pero un import sí: `import photo from './x.png?enhanced'`. Así que el plugin escribe los imports por mí.
- El bundler comprueba los imports: una imagen que falta es un error de build que nombra el archivo, no una imagen rota en el sitio publicado.
- mdsvex deja fuera `alt` del todo cuando está vacío, lo que hace fácil detectar un alt que falta.
- Las imágenes en `.prose` necesitan `block-size: auto`: con los atributos de ancho y alto y `max-inline-size: 100%`, una captura ancha se estrecharía pero conservaría toda su altura.
- Git guarda cada imagen para siempre, incluso después de borrarla. Hay que subirlas a más o menos el doble del ancho al que se muestran, comprimidas.

## Enlaces

- [Vite: recursos estáticos](https://vite.dev/guide/assets)
- [SvelteKit: imágenes, @sveltejs/enhanced-img](https://svelte.dev/docs/kit/images)
- [MDN: el elemento img, alt](https://developer.mozilla.org/es/docs/Web/HTML/Reference/Elements/img#alt)

## Siguiente

- Añadir las primeras imágenes de verdad a un artículo o a una entrada.
