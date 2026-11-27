---
title: Componentes en mis artículos, escritos como directivas
description: 'Como mis artículos son componentes de Svelte, también pueden contener componentes. Los escribo como directivas: dos puntos, un nombre y unos corchetes, sin HTML. Teclas, una sección que se abre, dos cosas lado a lado, pasos, pestañas y un índice, cada uno con unas pocas líneas de Svelte y dibujado con el aspecto del propio sitio.'
reviewed: false
---

Mis artículos los compila [mdsvex](https://mdsvex.pngwn.at), así que cada uno es un componente de Svelte. Ese fue el motivo para volver a él: un componente puede contener otros componentes. La pregunta era cómo escribirlos en markdown sin escribir HTML, que mi construcción rechaza en un artículo.

La respuesta de mdsvex son las [directivas](https://mdsvex.pngwn.at/docs/guides/directives). Una directiva son dos puntos, un nombre y unos corchetes, y mdsvex la dibuja con el componente de ese nombre. Hay tres formas:

- `:nombre[texto]` va dentro de una frase.
- `::nombre[texto]` ocupa una línea propia.
- `:::nombre[texto]` abre un bloque que termina en una línea de `:::`, con markdown dentro.

Los argumentos van entre paréntesis después de los corchetes, `(open=true)`, y llegan al componente como cadenas.

::toc[En esta página]

## Teclas

Pulsa :kbd[Ctrl+Shift+P] para abrir la paleta de comandos y :kbd[Esc] para cerrarla.

```md
Pulsa :kbd[Ctrl+Shift+P] para abrir la paleta de comandos.
```

El componente dibuja una tecla por cada una, con el `+` entre ellas como texto, así que un lector de pantalla y una copia leen "Ctrl+Shift+P". Un detalle hizo que fuera algo más que un componente: un componente recibe el texto de los corchetes como contenido que dibujar, no como una cadena que pueda partir. Así que mi plugin lee el texto cuando la directiva se cierra y lo pasa como argumento `keys`. Son tres líneas, y es justo el tipo de cosa para la que sirve un plugin.

## Una sección que se abre

:::details[¿Qué pasa sin JavaScript?]
Nada cambia. Es un `<details>` nativo: se abre y se cierra sin una línea de script, funciona con el teclado, y buscar en la página lo abre cuando la palabra que buscas está dentro.
:::

```md
:::details[¿Qué pasa sin JavaScript?]
Nada cambia. Es un `<details>` nativo…
:::
```

El resumen es obligatorio. Un `:::details` sin corchetes hace fallar la construcción, indicando el archivo y la línea, como cualquier otro error en un artículo.

## Dos cosas lado a lado

:::compare

### Antes

```md
> [!note]
> Un aviso es una cita con un tipo.
```

### Después

```md
:::details[Un aviso que se abre]
Una directiva con markdown dentro.
:::
```

:::

Cada título dentro de `:::compare` empieza un lado, y los lados van uno junto al otro mientras cada uno tiene sitio; en un móvil se apilan. Un título de otro nivel se queda dentro de su lado. Los títulos siguen siendo títulos, con su id y su enlace a sí mismos, así que el índice de arriba los incluye.

## Pasos

Estos vienen del propio mdsvex, como plugin. Cada título dentro de `:::steps` empieza un paso numerado:

:::steps

### Instala los plugins

```sh
pnpm add -D --save-exact @mdsvex/plugin-steps @mdsvex/plugin-tabs @mdsvex/plugin-toc
```

### Añádelos a las opciones

`tabs()`, `steps()` y `toc()` van en la lista `plugins`, con `css: false` en los dos primeros para que lleguen sin sus propios estilos.

### Dales estilo

El sitio los dibuja con sus propios colores, junto a los avisos: un marco como el de un bloque de código, y los números en círculos del color de la marca.

:::

## Pestañas

:::tabs

```sh [pnpm]
pnpm add -D @mdsvex/plugin-tabs
```

```sh [npm]
npm install -D @mdsvex/plugin-tabs
```

:::

Un grupo de pestañas de bloques de código es un `:::tabs` alrededor de ellos, con cada bloque nombrado entre corchetes después de su lenguaje. Los botones siguen el patrón de pestañas de ARIA: las flechas pasan de una a otra, y se anuncia la que está abierta.

## Índice

La lista del principio de este artículo es `::toc[En esta página]`. Recoge los títulos del artículo, anidados, a partir de los ids que mdsvex ya les da.

## Qué muestran GitHub y Obsidian

Una directiva es texto plano para todo lo que no sea mdsvex: GitHub y Obsidian muestran `:kbd[Esc]` con sus dos puntos y sus corchetes. El texto de dentro se sigue leyendo, así que un artículo sigue siendo legible allí, solo que sin el dibujo. Ese fue el precio que acepté por tener componentes sin HTML en el artículo.

## Enlaces

- [mdsvex: directivas](https://mdsvex.pngwn.at/docs/guides/directives)
- [Los plugins de mdsvex](https://mdsvex.pngwn.at/docs/plugins): pasos, pestañas e índice
- [MDN: `<kbd>`](https://developer.mozilla.org/es/docs/Web/HTML/Reference/Elements/kbd), y cómo anidarlo para una combinación de teclas
- [MDN: `<details>`](https://developer.mozilla.org/es/docs/Web/HTML/Reference/Elements/details)
