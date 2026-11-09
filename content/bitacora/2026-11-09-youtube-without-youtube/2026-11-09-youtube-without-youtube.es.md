---
title: Un vídeo de YouTube sin YouTube en la página
reviewed: false
---

## Qué hicimos

- Un nuevo componente de bloque de código, ` ```yt `: `src` (cualquier forma de enlace de YouTube), `title`, un `thumbnail` opcional (un archivo junto al artículo) y `caption`. Muestra una tarjeta con la imagen, el título y "se abre en una pestaña nueva", como un enlace normal a youtube.com.
- No se carga nada de Google hasta que alguien hace clic: ni reproductor, ni scripts, ni cookies, y la miniatura es una copia nuestra (una de `i.ytimg.com` también sería una petición a Google). Comprobado: cargar el artículo no hace ninguna petición fuera del sitio.
- `render()` en `blocks.ts` ahora recibe el nombre del archivo del artículo, para que el texto de la tarjeta siga su idioma (`<slug>.es.md` es español), como los títulos de los callouts.
- `enhance-media.ts` ahora acepta un `alt=""` explícito: en markdown no se puede escribir (mdsvex quita el `alt`), así que solo llega de un bloque que marca su imagen como decorativa.
- Se usa por primera vez en el borrador sobre UTF-8, para la charla "Plain Text" de Dylan Beattie.

## Qué aprendí

- Un reproductor de YouTube incrustado carga los scripts de Google en cada visita, se vea el vídeo o no. Un enlace con una imagen no cuesta nada hasta que se usa.
- `rel="noreferrer"` además evita que YouTube sepa la dirección de nuestra página; `noopener` ya es lo predeterminado con `target="_blank"`, pero escribirlo no cuesta nada.
- Abrir una pestaña nueva sin avisar sorprende, así que la tarjeta lo dice.

## Enlaces

- [MDN: `rel=noreferrer`](https://developer.mozilla.org/es/docs/Web/HTML/Attributes/rel/noreferrer)
- [El endpoint oEmbed de YouTube](https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=gd5uJ7Nlvvo&format=json) (donde se pueden consultar el título y la miniatura de un vídeo)

## Siguiente

- La herramienta de cursores y selección.
