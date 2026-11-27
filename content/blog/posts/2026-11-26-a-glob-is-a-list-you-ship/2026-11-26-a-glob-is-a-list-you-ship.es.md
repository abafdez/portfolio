---
title: Un glob es una lista que envías
description: 'Después de pasar mis artículos a mdsvex, Lighthouse dijo que todos pesaban más: de 13 a 26 kB comprimidos en una primera visita. La culpa era de dos líneas mías: un glob de todos los artículos, enviado a cada artículo, y un import pequeño que se traía un analizador de YAML.'
reviewed: false
---

Cuando [volví a pasar mis artículos a mdsvex](/blog/2026-11-26-back-to-mdsvex-measured), todas las páginas coincidían bloque a bloque con la versión anterior. Pero coincidir no es lo mismo que pesar lo mismo, así que antes de fusionar pasé Lighthouse por cinco páginas de cada versión: el artículo más largo, uno con un vídeo, uno con una tarjeta de YouTube, uno con mucho código y una entrada del Devlog. Ajustes de móvil, tres pasadas de cada una, quedándome con la mediana.

Accesibilidad, buenas prácticas y SEO dieron 100 en las dos, nada se movió y nada bloqueó el hilo principal. Pero el rendimiento bajaba entre 1 y 5 puntos, el primer pintado llegaba entre 0,2 y 0,5 s más tarde y Lighthouse contaba unos 110 kB más de JavaScript por artículo.

## Medir lo que recibe quien visita

Esos 110 kB engañaban en algo: mi servidor local no comprime, y GitHub Pages sí. Así que tomé la lista de scripts que cargaba cada página, comprimí cada archivo de la construcción y sumé el HTML:

| página               | versión anterior | mdsvex   |
| -------------------- | ---------------- | -------- |
| artículo más largo   | 94,3 kB          | 107,6 kB |
| artículo con YouTube | 87,4 kB          | 113,9 kB |
| entrada del Devlog   | 86,0 kB          | 100,3 kB |

Parte era de esperar. Cada artículo es ahora un módulo de JavaScript, y su texto, que antes venía dentro del HTML, viene en ese módulo. El HTML adelgazó más o menos lo que pesa el módulo. El resto eran dos archivos que no pintaban nada ahí.

## Fuga uno: la dirección de todos los artículos, en cada artículo

Para cargar un artículo, la página tiene que encontrar su módulo compilado, y el nombre de ese archivo solo lo conoce el empaquetador. Así que había escrito un glob:

```ts
const bodies = {
	...import.meta.glob(['/content/blog/posts/*/*.md', '!/:drafts:']),
	...import.meta.glob('/content/bitacora/*/*.md')
};
```

[`import.meta.glob`](https://vite.dev/guide/features#glob-import) convierte eso en un objeto: una clave por archivo, cada una con una función que lo importa. Eso es lo que hace que cada artículo sea su propio fragmento perezoso, y eso está bien. Pero el objeto en sí es código, y está en el fragmento que carga cada página de artículo: 316 rutas (artículos y entradas del Devlog, en los dos idiomas), cada una con su función de import y la lista de fragmentos que necesita. 68 kB sin comprimir, 11 kB comprimidos, para que un artículo del blog pudiera encontrar una entrada del Devlog que nunca va a mostrar.

Dos cambios. La página de cada sección hace su propio glob, así que un artículo del blog solo recibe la lista del blog. Y la opción `base` acorta las claves (`./slug/slug.md` en lugar de la ruta completa):

```ts
const bodies = import.meta.glob<Body>(['/content/blog/posts/*/*.md', '!/:drafts:'], {
	base: '/content/blog/posts'
});
```

El glob de los archivos que acompañan a los artículos, que solo necesitan los que tienen un vídeo o una tarjeta de YouTube, ahora se carga con un `import()` dinámico solo cuando los bloques de un artículo nombran archivos.

## Fuga dos: un analizador de YAML para un tipo de archivo

El otro archivo nuevo contenía un analizador de YAML, y se cargaba en cada artículo con un bloque de vídeo o de YouTube. Esos componentes necesitaban dos cosas pequeñas: una función que dice si un archivo es `video/webm` o `video/mp4`, y el texto "Ver en YouTube". Las importaban de `blocks.ts`, el archivo que define los campos de mis bloques. Ese archivo también lee el YAML de cada bloque para la construcción y el CMS, con `import { parse } from 'yaml'`.

Importar una función de un archivo no debería traerse el archivo entero, y normalmente no lo hace: el empaquetador quita lo que nadie usa. Pero solo puede quitar un módulo si demuestra que no tiene efectos secundarios, y aquí el analizador de YAML vino igualmente, 12 kB comprimidos, por una función de una línea. La solución fue dar a las funciones del navegador un archivo propio, `values.ts`, sin imports; `blocks.ts` las reexporta para todo lo demás.

## Cómo las encontré

Ninguna apareció en mis tests ni en la comparación de páginas. Las encontró algo aburrido: la lista de scripts que vio Lighthouse en la misma página de las dos versiones, una al lado de la otra, ordenada por tamaño. Los archivos nuevos destacaban, y bastó con abrirlos: uno empezaba con las rutas de todos los artículos que he escrito, el otro con `Symbol.for('yaml.alias')`.

## Después

| página               | versión anterior | antes de arreglarlo | después  |
| -------------------- | ---------------- | ------------------- | -------- |
| artículo más largo   | 94,3 kB          | 107,6 kB            | 102,8 kB |
| artículo con YouTube | 87,4 kB          | 113,9 kB            | 99,8 kB  |
| entrada del Devlog   | 86,0 kB          | 100,3 kB            | 95,9 kB  |

El rendimiento es ahora de 80 en el artículo más largo (la versión anterior: 79) y de 81 a 82 en los demás (la versión anterior: de 82 a 86). La diferencia que queda es el precio de que un artículo sea un componente: los componentes que sustituyen títulos, bloques de código y enlaces, y la lista de artículos de una sección. Ese es el precio de tener componentes y demos en vivo en mis artículos, que es por lo que cambié. Los 23 kB que había añadido sin darme cuenta no lo eran.

## Enlaces

- [Vite: glob import](https://vite.dev/guide/features#glob-import), con `base`
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview)
