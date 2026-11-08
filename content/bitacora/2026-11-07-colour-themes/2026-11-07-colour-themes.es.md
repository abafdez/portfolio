---
title: Temas de color, de Tokyo Night a Solarized
reviewed: false
---

## Qué hicimos

- **Temas de color**, que se eligen con un botón de paleta en la cabecera, junto al selector de claro y oscuro. En el código son **paletas** (`data-palette` en `<html>`), porque "tema" ya significa claro u oscuro (`data-theme`). La lista está en `src/lib/palettes.ts`; la primera, Phosphor, son los colores propios del sitio y no necesita CSS.
- **Un tema es un archivo CSS** en `src/lib/styles/themes/` que solo sobrescribe tokens semánticos, cada uno con `light-dark(claro, oscuro)`, así que el selector sigue eligiendo la mitad. Los componentes no cambiaron en absoluto. El layout carga todos los archivos de esa carpeta con `import.meta.glob`.
- **Tokyo Night** (de Enkia, MIT, con el crédito en el CSS y en el selector), a partir de los archivos de su tema de VS Code. Cambios por contraste: los comentarios usan `--text-2` (los del original dan 2,5:1), las tarjetas claras son un tono más claro (`#f1f2f6`) con el color de la barra lateral para los bordes, y el `--text-2` claro es algo más oscuro (`#4f5367`).
- **El selector** es un botón con `popovertarget` (la Popover API: Escape, clic fuera y la vuelta del foco sin hacer nada) con radios dentro, colocado bajo el botón con **anchor positioning**. La elección se guarda en `localStorage`, y `app.html` la vuelve a poner antes del primer pintado, así que nunca parpadea.
- El **comprobador de contraste** vuelve a leer los tokens cuando cambia la paleta (un `MutationObserver` sobre `data-palette`).
- `palettes.test.ts`: cada paleta tiene su archivo CSS y al revés, los selectores están bien y cada token está fijado para claro y oscuro.
- Comprobado: accesibilidad 100 en Lighthouse en cuatro páginas, con Tokyo Night, en los dos modos; sin desplazamiento horizontal a 320px.
- **Cinco más:** Dracula (con Alucard, su variante clara), Catppuccin (Latte y Mocha), Rosé Pine (Dawn y Main), Gruvbox y Solarized, todos MIT, cada uno a partir de su paleta oficial y con su crédito. Cada archivo de tema lista los colores que cambió por contraste.
- **Los arreglos de contraste conservan el aspecto del tema:** un color que no pasa mantiene su tono y su croma y solo se aclara (en oscuro) o se oscurece (en claro) hasta que pasa. Solarized fue el que más necesitó (29 colores): sus acentos son tonos medios pensados para funcionar sobre los dos fondos.
- **`palettes.test.ts` ahora comprueba el contraste** de cada tema, en sus dos mitades, en los pares que el sitio dibuja de verdad: el texto, `--text-2` y el color de marca sobre las tres superficies y sobre el foco, el error sobre la página y las tarjetas, y el código y los callouts sobre `--surface-2`. Detectó un fallo real en mi propio Tokyo Night: los enlaces de marca en claro daban 4,23:1 sobre el foco (ahora `#2252a2`, 4,65:1).
- Comprobado: accesibilidad 100 en Lighthouse en un artículo con callouts y código para cada tema nuevo, en los dos modos; el menú de siete opciones cabe a 320px.

## Qué aprendí

- Un sistema de temas sale barato cuando los componentes solo usan tokens semánticos: un tema nuevo es una lista de colores, no un cambio en cada componente. La rejilla, el foco y el tono de los iconos lo siguen solos, porque están hechos a partir de `--text-1` y `--brand`.
- **Comprobar el contraste significa comprobar los pares que la página usa de verdad.** Los colores de código de Tokyo Night Light no pasan sobre `--surface-3`, pero el código nunca va ahí. El foco también es un par: una línea azul bajo un texto gris dejaba el `--text-2` claro en 4,26:1.
- Lighthouse empieza cada pasada con el almacenamiento vacío. Para auditar una elección guardada: preparar un perfil de navegador que la tenga y luego pasar Lighthouse con `--user-data-dir` y `--disable-storage-reset`.
- **El foco está hecho con el color de marca, así que el color de marca tiene que pasar sobre su propia luz.** Si cambias el color de marca, cambia también su fondo; un arreglo tiene que recalcular el foco para cada color candidato.
- `--surface-3` son sobre todo bordes, pero hay texto encima: la etiqueta del mosaico de portada, los estados de hover y el código en línea dentro de los callouts. Así que sigue en las comprobaciones.
- **Listas de paletas:** [tinted-theming/schemes](https://github.com/tinted-theming/schemes) tiene 362 esquemas Base16 en un mismo formato YAML (MIT), un buen punto de partida para los temas de usuario más adelante. Cada archivo es una variante (oscura o clara), y muchas no pasan el contraste como texto web.
- En zsh, `path` está atado a `PATH`: una variable de bucle llamada `path` se cargó todos los comandos.

## Problemas y soluciones

- **Una cabecera rosa en Tokyo Night claro.** `color-mix(in oklch, #e6e7ed 75%, transparent)` salía como `oklch(0.93 0.008 none)`: Chrome descarta el tono de un color hex casi gris, y un tono que falta se dibuja como 0, que es rosa. Nuestros propios grises están escritos en `oklch()` y conservaban su tono, así que nunca se notó. Ahora todas las mezclas con `transparent` son `in oklab`, que no tiene tono que perder.
- Mis primeras pasadas de Lighthouse para los cinco temas auditaban los colores por defecto: el script que guardaba la paleta usaba `process.env` dentro de la página, donde `process` no existe. Revisar el perfil después lo puso en evidencia; pasando el id a `page.evaluate()`, las diez pasadas fueron de verdad con los temas.
- Vitest devolvía el CSS de los temas como un texto vacío (no procesa el CSS, ni siquiera con `?raw`), así que el test lee los archivos con `node:fs`.

## Enlaces

- [Tokyo Night para VS Code](https://github.com/enkia/tokyo-night-vscode-theme), [especificación de Dracula](https://draculatheme.com/spec), [paleta de Catppuccin](https://github.com/catppuccin/palette), [paleta de Rosé Pine](https://github.com/rose-pine/palette), [Gruvbox](https://github.com/morhetz/gruvbox), [Solarized](https://ethanschoonover.com/solarized/)
- [MDN: Popover API](https://developer.mozilla.org/es/docs/Web/API/Popover_API)
- [MDN: anchor positioning de CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)
- [MDN: light-dark()](https://developer.mozilla.org/es/docs/Web/CSS/color_value/light-dark)
- [MDN: MutationObserver](https://developer.mozilla.org/es/docs/Web/API/MutationObserver)

## Siguiente

- Más temas son un archivo CSS y una línea en `palettes.ts`; el test comprueba su contraste.
- El tema claro por defecto, que se ve apagado: hay tres direcciones en `design/light-theme-directions.md`.
