---
title: Componentes en bloques de código
reviewed: false
---

## Qué hicimos

- **Componentes en bloques de código:** un bloque de código cuyo lenguaje es el nombre de un componente, con campos YAML como contenido, se convierte en ese componente. En cualquier otro sitio (Obsidian, GitHub) es un bloque de YAML que se puede leer.
- `src/lib/blocks.ts`: un registro, `blocks`, de nombre → campos + `render()`. `highlight()` en `vite.config.ts` le pregunta primero a `renderBlock(lang, code, file)`; todo lo que no es uno de los nuestros lo resalta Shiki como antes. El plugin `markdown()` le pasa a `highlight()` el `id` del archivo.
- **El primer componente, `video`:** `src`, `width` y `height` obligatorios; `webm`, `poster` y `caption` opcionales. Genera el mismo `<video controls muted playsinline preload="metadata">` que antes escribía a mano (el `<source>` WebM primero, y un `<figure>` cuando hay pie). Los archivos con `./` pasan por `enhanceMedia()` como antes, así que se convierten en imports y la comprobación del tamaño se sigue ejecutando.
- **El build comprueba el YAML:** un campo obligatorio que falta, un campo desconocido (también `autoplay`, a propósito), un tamaño que no es un número entero, un archivo sin `./`, un texto que YAML lee como número o un YAML roto hacen fallar el build, nombrando el archivo y el bloque. Comprobado también en desarrollo: la página da un 500 y la terminal muestra el archivo y el campo.
- 12 tests en `blocks.test.ts`, uno de ellos pasando por `enhanceMedia()`.
- El borrador `components-in-code-blocks`, con un vídeo de verdad (`awesome-filter.webm`, 960×540, 580 KB, grabado con el `recordVideo` de Playwright: en WSL no hay ffmpeg). La sección de Vídeos de la guía de publicación ahora empieza por el bloque; el borrador de los vídeos apunta al nuevo.
- Los bloques ` ```text ` ya no imprimen un aviso de Shiki: `text` es texto sin resaltar a propósito.
- Comprobado: accesibilidad 100 en Lighthouse en el borrador, en los dos temas (en desarrollo), sin desplazamiento horizontal a 320px (el vídeo se reduce a 288×163), y `pnpm test:e2e` pasa.

## Qué aprendí

- mdsvex llama al resaltador con `(code, lang, meta, filename)` por cada bloque de código, y mete en la página como HTML en bruto lo que devuelva. Eso lo convierte en un enganche para cualquier cosa, no solo para los colores.
- El lenguaje de un bloque de código es solo una palabra. Las herramientas que no la conocen muestran el código como texto sin más, y por eso el YAML dentro encaja bien: se puede leer tal cual.
- **Mapped types de TypeScript:** `Values<Fields>` deduce los tipos de los valores a partir de la lista de campos (`size` → `number`, opcional → `| undefined`), así que `render()` no puede usar un campo que el bloque no declare.
- `Object.hasOwn(blocks, lang)` y no `lang in blocks`: `in` también encuentra claves predefinidas como `toString`, así que un bloque ` ```toString ` habría parecido un componente.

## Problemas y soluciones

- El tipo `Highlighter` de mdsvex dice que el nombre del archivo puede ser `undefined`, así que `highlight()` no podía exigirlo. El plugin `markdown()` siempre conoce el archivo (`id`), así que se lo pasa en una pequeña función flecha.
- `pnpm preview` fallaba con `preview_build_missing`: el resultado del build había desaparecido, seguramente borrado por un `pnpm check` o una ejecución de tests posteriores (los dos ejecutan la preparación de SvelteKit). Primero volví a construir.

## Enlaces

- [mdsvex: highlight](https://mdsvex.pngwn.io/docs#highlight)
- [TypeScript: mapped types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [MDN: Object.hasOwn()](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn)
- [Playwright: grabar vídeos](https://playwright.dev/docs/videos)

## Siguiente

- Abrir los dos borradores en Obsidian y en GitHub para comprobar que se leen bien ahí (el último punto del "terminado cuando" de la fase 9.5).
- Los siguientes componentes: `compare` (antes y después) o una demo en vivo.
