---
title: twinkleplop en lugar de Shiki
reviewed: false
---

## Qué hicimos

- Los bloques de código los resalta **twinkleplop** (MIT, de pngwn) en lugar de Shiki. Cada token recibe una clase (`tok keyword`) en lugar de un `style` en línea; `global.css` reparte unas treinta clases entre nuestros ocho tokens `--code-*`, así que todos los temas de color siguen funcionando. `code-theme.ts`, el tema TextMate de Shiki, ha desaparecido.
- twinkleplop es síncrono, así que desapareció el paso que reunía los lenguajes de cada artículo y los esperaba antes de dibujarlo, tanto al construir como en la vista previa del CMS.
- Algunas clases significan cosas distintas según el lenguaje, así que el bloque de código dice su lenguaje (`data-lang`) y unas pocas reglas dependen de él: en TypeScript `property` y `constant` van sin color, en CSS una palabra de valor es una constante, en YAML un valor es texto.
- Comparé todos los bloques de código de la versión antigua y la nueva carácter a carácter: ningún texto cambió, el 86,9 % de 48.912 caracteres conserva su color (el 80,1 % antes de las reglas por lenguaje).

## Qué aprendí

- Los colores son cuestión de gusto y el texto no: comprobar que no había cambiado nada del código fue lo que me dejó aceptar las diferencias de color.
- Dónde flojea twinkleplop: bash no tiene tokens de comandos, la gramática de Svelte lee `<script lang="ts">` como JavaScript y, en un fragmento de CSS, las funciones dentro de propiedades personalizadas toman el color de los selectores (un fallo que avisar).
- Mi decisión: twinkleplop se queda solo si se queda mdsvex. Se quedó, y mdsvex resalta con él, así que mi propio código de resaltado también se fue.

## Enlaces

- [twinkleplop](https://twinkleplop.pngwn.at/docs)

## Siguiente

- Avisar del fallo de la gramática de CSS; pasar a un twinkleplop más nuevo cuando lo haga mdsvex.
