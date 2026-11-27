---
title: Componentes en los artículos, como directivas
reviewed: false
---

## Qué hicimos

- **Nuestras propias directivas** son un paquete de plugins de mdsvex (`src/lib/markdown/directives-plugin.ts`) con sus componentes en `src/lib/markdown/directives/`: `:kbd[Ctrl+B]` (una tecla por cada una, `<kbd>` anidados), `:::details[Resumen]` (un `<details>` nativo, `(open=true)` para que empiece abierto) y `:::compare` (un lado por cada título de dentro, como los pasos).
- **Los plugins del propio mdsvex**, con versión fija: `:::tabs`, `:::steps` y `::toc`, sin sus estilos (`css: false`) y dibujados en `global.css` como un bloque de código: un marco `--surface-3`, una barra sobre `--surface-1` con la fuente de etiquetas, círculos del color de la marca para los números de los pasos.
- Los errores hacen fallar la construcción con el archivo y la línea: una directiva desconocida, un `:::details` sin resumen, un `:::compare` que no empieza con un título o que tiene un solo lado.
- La vista previa del CMS conoce los módulos nuevos y los dibuja todos (comprobado con el backend de prueba de Sveltia, y la configuración restaurada después).
- 16 pruebas nuevas (`plugins.test.ts`, `render.test.ts`, `keys.test.ts`), la guía de publicación tiene una sección "Components (directives)" y un borrador enseña cada directiva.
- Una construcción de producción con el borrador publicado un momento: todas las directivas en los dos idiomas, y los pasos convertidos en HTML al construir (sus componentes son `.static.svelte`, sin JavaScript).
- **`::video` y `::yt` sustituyen a los bloques de YAML.** El pie (vídeo) o el título (YouTube) va entre corchetes, y el resto son argumentos: `::yt[Plain Text](src=https://youtu.be/…, thumbnail=./talk.jpg)`. `blocks.ts` comprueba los argumentos (ya sin analizador de YAML), un bloque ` ```video ` que quede hace fallar la construcción con la sintaxis nueva, los widgets del CMS leen y escriben la línea, y los dos artículos que usaban bloques están migrados, con una nota de actualización en el artículo sobre componentes en bloques de código. Todas las páginas coinciden con la construcción de antes, salvo el texto que cambié.

## Qué aprendí

- El componente de una directiva recibe el texto de los corchetes como un snippet que dibujar, no como una cadena. Para partir `Ctrl+Shift+P` en teclas, el plugin lee `node.text_content` cuando la directiva se cierra y lo pasa como argumento.
- El truco del plugin de pasos: en cada título dentro del contenedor, cierra el envoltorio anterior y abre uno nuevo desde ese título (`wrap_from('directive_container', …)`), y envuelve el título como su etiqueta. `:::compare` hace lo mismo.
- Un nombre de directiva que no es un identificador de JavaScript (`compare-side`) se exporta con un nombre de cadena: `export { default as 'compare-side' }`.
- Los argumentos de una directiva son cadenas, escritas `nombre=valor` o `nombre="a, b"` cuando un valor tiene un espacio o una coma; un `\"` escapado dentro conserva su barra, así que la comprobación la quita.

## Problemas y soluciones

- La vista previa decía "can't import compare-side": reescribía la primera cadena entre comillas de cada import, y con un nombre exportado como cadena esa es el nombre, no el módulo. Ahora reescribe la cadena que va después de `from`.
- El CMS escribía un título como `Plain Text [NDC]` escapando solo el `]`, y el `[` suelto hacía que mdsvex leyera la línea como texto. Ahora se escapan los dos corchetes; una prueba pasa cada widget por la construcción real, ida y vuelta.

## Enlaces

- [mdsvex: directivas](https://mdsvex.pngwn.at/docs/guides/directives)
- [Los plugins de mdsvex](https://mdsvex.pngwn.at/docs/plugins)
- [MDN: `<kbd>`](https://developer.mozilla.org/es/docs/Web/HTML/Reference/Elements/kbd)

## Siguiente

- Demos en vivo (`:::demo` y ` ```svelte run `) con una vista previa aislada en el CMS.
