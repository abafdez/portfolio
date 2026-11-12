---
title: ¿Cada despliegue invalida la caché de mis visitantes?
description: 'Daba por hecho que cada despliegue renombraba todos los archivos y obligaba a los visitantes a descargarlo todo otra vez. Construí dos veces y leí las cabeceras: acerté a medias, por otro motivo.'
cover: Datos antiguos con un sello de invalidado, y la mascota de GitHub comprobando un ETag.
reviewed: false
---

El JavaScript y el CSS de mi sitio tienen nombres como `start.YPx50nGZ.js`. Sabía que la parte que parece aleatoria era un hash, y daba por hecho que cada despliegue generaba hashes nuevos: despliegas dos veces, aunque no cambies nada, y cada visitante lo descarga todo de nuevo.

Así que lo probé.

## Dos builds del mismo código

Construí el sitio dos veces sin cambiar nada y comparé todos los archivos del resultado, nombres y contenido:

```sh
(cd build && find . -type f -exec md5sum {} + | sort -k2) > sums1.txt
# build again, then the same into sums2.txt
diff sums1.txt sums2.txt
```

Los 257 nombres eran iguales. No cambió nada de `_app/immutable/`, donde viven los scripts, los estilos, las fuentes y las imágenes. Lo que sí cambió: las páginas HTML y `_app/version.json`.

El hash de un nombre de archivo se calcula a partir del **contenido** del archivo. Mismo contenido, mismo hash, mismo nombre. Un despliegue solo renombra los archivos que cambiaron de verdad (y los que los importan, porque su contenido incluye el nombre nuevo).

Las páginas cambian porque SvelteKit marca cada build con una versión, por defecto la hora del build, y la escribe en cada página. La usa para darse cuenta de que se ha desplegado una versión nueva mientras alguien tiene el sitio abierto.

## Lo que envía GitHub Pages

Luego miré las cabeceras que envía el sitio publicado para uno de esos archivos:

```sh
curl -sI https://abafdez.github.io/portfolio/_app/immutable/entry/start.YPx50nGZ.js
```

```http
cache-control: max-age=600
etag: "6aedbb5c-23e"
last-modified: Fri, 06 Nov 2026 11:34:52 GMT
```

Dos cosas:

- **`max-age=600`**: el navegador puede reutilizar el archivo durante 10 minutos sin preguntar. Después, le pregunta al servidor si ha cambiado. Para un archivo cuyo nombre cambia cada vez que cambia su contenido, eso es muy prudente: podría guardarse en caché un año con `Cache-Control: immutable`. Pero GitHub Pages envía las mismas cabeceras para todo, y no me deja cambiarlas.
- **El ETag.** Cuando el navegador pregunta "¿ha cambiado?", envía el ETag que tiene, y si sigue coincidiendo, el servidor responde `304 Not Modified`, sin cuerpo. Lo probé, y recibí un 304. Pero fíjate en el ETag: `6aedbb5c` es un número en hexadecimal, `1793964892`, que es exactamente la hora de `last-modified`. La segunda parte, `23e`, es el tamaño. El ETag sale de **cuándo se escribió el archivo**, no de lo que contiene.

Y cada despliegue vuelve a escribir todos los archivos.

## Así que acerté a medias

No todos los despliegues lo renombran todo: los archivos idénticos conservan sus nombres. Pero después de cualquier despliegue cambian todos los ETag, así que el navegador de un visitante que vuelve recibe entero cada archivo que pide, una vez, aunque sea idéntico al que ya tiene.

Para un sitio pequeño, son unos cientos de kilobytes por visitante y por despliegue. De momento lo dejo así. Si algún día importa, las opciones son:

- **Un service worker** que guarde los archivos de `_app/immutable/` en el navegador y los sirva desde ahí. Esos nombres cambian cada vez que cambia el contenido, así que servirlos desde una caché es seguro. Las páginas deberían seguir viniendo de la red, o los visitantes recibirían las antiguas.
- **Un alojamiento que me deje poner cabeceras**, como Cloudflare Pages o Netlify, con `Cache-Control: public, max-age=31536000, immutable` para `/_app/immutable/*`.

## La misma pregunta para mis imágenes

Mis imágenes se procesan al construir el sitio, y GitHub Actions empieza cada ejecución en una máquina limpia, así que vuelve a procesar todas las imágenes en cada ejecución. Eso sí tiene un arreglo que también funciona con GitHub Pages: [guardar en caché entre ejecuciones de GitHub Actions](./2026-11-06-caching-between-github-actions-runs).

## Enlaces

- [MDN: caché HTTP](https://developer.mozilla.org/es/docs/Web/HTTP/Guides/Caching)
- [MDN: ETag](https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Headers/ETag)
- [SvelteKit: service workers](https://svelte.dev/docs/kit/service-workers)
