---
title: De vuelta a mdsvex
reviewed: false
---

## Qué hicimos

- **mdsvex 1.0 vuelve a compilar los artículos y las entradas del Devlog** (dos semanas después de que svelte-markdown sustituyera a la versión 0.12). El motivo: componentes y demos en vivo en los artículos, que svelte-markdown no puede hacer.
- **Ningún cambio hasta no perder nada:** construí `main` en un worktree aparte, y un script comparó todas las páginas del blog y del Devlog de las dos versiones, en inglés y en español, bloque a bloque (texto, ids de los títulos, enlaces y `rel`, textos alternativos, etiquetas en línea). Resultado final: 158 de 158 en cada idioma.
- **Nuestras reglas como plugins de análisis** (`src/lib/markdown/plugins.ts`): avisos (una cita marcada que nuestro componente dibuja como aviso), figuras, el archivo en las tablas, y lo que hace fallar la construcción: HTML, `{ }`, una imagen que no es un archivo `./` con texto alternativo.
- **Los enlaces siguen el idioma de la página al mostrarse** (`Link.svelte`, que lee un contexto): un artículo compilado sirve para los dos idiomas. `@mdsvex/plugin-external-links` añade `rel="external"`.
- **Los bloques `video` y `yt`** son un plugin que reclama sus bloques de código y convierte cada uno en un componente. Un plugin no puede añadir imports, así que los archivos del bloque van a los datos de plugin del artículo y la página los carga.
- **svelte-markdown ha desaparecido** (marked, el código antiguo de análisis y dibujo, la vista previa antigua), todo está en una carpeta, `src/lib/markdown/`, y los tests son nuevos: markdown escrito en un archivo temporal, importado a través del plugin real de mdsvex y dibujado con `svelte/server`.
- Commits pequeños en `feat/mdsvex`, cada uno comprobado por separado (instalación, tipos, tests).

## Qué aprendí

- mdsvex lee Penguin-Flavoured Markdown: `_x_` es cursiva, `*x*` negrita, `**x**` negrita dentro de negrita (a propósito); las URL sueltas se quedan como texto; una llave es Svelte. Prettier ya escribe `_` y `**`, así que el Ctrl+I de Obsidian no puede llegar al sitio como negrita.
- Un plugin puede cambiar los atributos de un nodo clave a clave, no sustituirlos; los atributos solo se convierten en props en los elementos que mdsvex sustituye.
- Generar los lockfiles intermedios a partir del final hace que cada commit tenga las versiones de las dependencias que probamos.

## Problemas y soluciones

- enhanced-img analizaba el markdown sin compilar de los artículos que mencionan `<enhanced:img>` en el código (su paso va antes que cualquier plugin): un envoltorio hace que se salte los `.md`.
- Una marca que nunca se cierra dentro del texto de un enlace o una imagen anula el enlace (`[~/dir](…)`): un fallo de mdsvex; `\~` arregló nuestro único caso.
- El título propio de un aviso conserva ahora solo su texto (ningún artículo usa formato ahí).

## Enlaces

- [mdsvex 1.0](https://mdsvex.pngwn.at/docs), [Penguin-Flavoured Markdown](https://github.com/pngwn/MDsveX/blob/main/PFM.md)

## Siguiente

- Componentes en los artículos como directivas (`:name`, `::name`, `:::name`), empezando por los plugins oficiales.
- Avisar de los fallos; mdsvex 1.1.0 cuando pnpm lo permita.
