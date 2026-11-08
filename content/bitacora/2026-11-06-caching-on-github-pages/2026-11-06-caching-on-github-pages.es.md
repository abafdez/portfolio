---
title: ¿Cada despliegue invalida la caché de mis visitantes?
reviewed: false
---

## Qué hicimos

- Construí el sitio dos veces con el mismo código y comparé los 257 archivos: todos los nombres eran iguales, y no cambió nada en `_app/immutable/`. Solo cambian las páginas HTML y `_app/version.json`, porque SvelteKit marca cada build con una versión (por defecto, la hora del build).
- Leí las cabeceras del sitio publicado. GitHub Pages envía `cache-control: max-age=600` para todos los archivos, y un ETag como `"6aedbb5c-23e"`: la fecha de modificación del archivo en hexadecimal (`0x6aedbb5c` es la hora del despliegue) y su tamaño.
- Cronometré un build con una imagen de portada: 6,5s con la caché de imágenes vacía y 5,0s con la caché llena. Una portada se convierte en 16 archivos, más o menos 1s de trabajo.

## Qué aprendí

- Los nombres de archivo con hash (`start.YPx50nGZ.js`) salen del **contenido** del archivo, así que un despliegue no renombra los archivos que no han cambiado. Mi suposición (cada despliegue lo renombra todo) era errónea.
- Pero el ETag de GitHub Pages sale de la **hora del despliegue**. Después de cualquier despliegue, un navegador que pregunta "¿ha cambiado esto?" vuelve a recibir el archivo entero, aunque sea idéntico. Entre despliegues recibe un `304 Not Modified`: una respuesta mínima, y se usa la copia en caché.
- `max-age=600`: un navegador puede reutilizar un archivo durante 10 minutos sin preguntar. Los archivos con hash podrían guardarse en caché un año (`Cache-Control: immutable`), pero GitHub Pages no me deja poner cabeceras.
- La CI empieza en una máquina limpia, y `cache: true` en el paso de preparación solo guarda en caché los paquetes de pnpm, así que cada ejecución vuelve a procesar todas las imágenes. La caché local es `node_modules/.cache/imagetools`.
- `actions/cache` guarda archivos **entre ejecuciones** en el servicio de caché de GitHub, no en el repositorio (está en la página Actions → Caches). Restaura `path` cuando coincide `key` (o un prefijo de `restore-keys`), y guarda al final de un job que ha ido bien cuando no hubo una coincidencia exacta. Una caché no se puede modificar, solo sustituir por una clave nueva. Si no se usa en 7 días, se borra; un repositorio tiene 10 GB. Las cachés de una PR solo sirven para volver a ejecutar esa PR; las de `main` sirven para todas.
- Para las imágenes, la clave necesita también el hash del lockfile en el prefijo de restauración, o un `sharp` nuevo recibiría los resultados antiguos.
- El procesado de imágenes es determinista: un build con la caché de imágenes vacía dio los mismos nombres y bytes que uno con la caché, y los archivos del avatar de mi build local tienen los mismos nombres que los del sitio publicado (construido por la CI). Así que volver a procesar en la CI nunca hace que los visitantes descarguen otra vez una imagen; la caché solo ahorra tiempo de build.

## Siguiente

- Cuando estén publicados los primeros artículos con imágenes: guardar en caché `node_modules/.cache/imagetools` en la CI con `actions/cache`.
- Quizá más adelante: un service worker que guarde `_app/immutable/*` en el navegador.
