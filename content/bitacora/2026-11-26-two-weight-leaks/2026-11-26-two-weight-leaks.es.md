---
title: Lighthouse y dos fugas de peso
reviewed: false
---

## Qué hicimos

- **Lighthouse en cinco páginas de las dos versiones** (`main` y mdsvex), móvil, mediana de tres pasadas: accesibilidad, buenas prácticas y SEO 100 en las dos, sin movimientos de diseño ni bloqueos; rendimiento entre 1 y 5 puntos más bajo, primer pintado entre 0,2 y 0,5 s más tarde.
- Pesé lo que recibe de verdad quien visita (cada archivo comprimido, como lo sirve GitHub Pages): entre 13 y 26 kB más en una primera visita. Encontré dos causas y arreglé las dos:
  - **un glob de todos los cuerpos** (blog y Devlog, los dos idiomas: 316 rutas con sus funciones de import), 11 kB en cada página de artículo. Ahora el `+page.ts` de cada sección hace su propio glob con claves cortas (`base`), y la lista de archivos solo se carga cuando los bloques de un artículo nombran archivos;
  - **el analizador de YAML** (12 kB) en cada artículo con un bloque de vídeo o de YouTube, porque sus componentes importaban dos funciones de `blocks.ts`, que analiza YAML para la construcción. Las funciones se mudaron a `markdown/blocks/values.ts`.
- Después: de 96 a 103 kB en una primera visita (`main`: de 86 a 94), rendimiento de 80 a 82 (`main`: de 79 a 86).

## Qué aprendí

- Un glob es código: cada clave y cada función de import están en el fragmento que lo contiene, así que hay que ponerlo donde solo lo carguen las páginas que lo necesitan.
- Importar una función puede traerse una dependencia entera cuando el empaquetador no puede demostrar que es seguro quitarla.
- El servidor local no comprime, así que los tamaños de transferencia de Lighthouse exageran lo que se descarga. Para comparar, hay que comprimir los archivos.
- Lo que queda de diferencia es el precio de que un artículo sea un componente (los componentes que sustituyen elementos y la lista de una sección), que es por lo que cambié.

## Enlaces

- [Vite: glob import](https://vite.dev/guide/features#glob-import)

## Siguiente

- El paso 4 del cambio: documentación y notas de actualización en los artículos que describen svelte-markdown y Shiki.
