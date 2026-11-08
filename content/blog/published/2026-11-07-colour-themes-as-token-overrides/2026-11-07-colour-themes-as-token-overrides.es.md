---
title: 'Seis temas de color como tokens sobrescritos'
description: Mi sitio ya tiene seis temas de color, de Tokyo Night a Solarized. Cada uno es un archivo CSS, no cambió ningún componente y un test unitario comprueba el contraste de cada tema.
cover: Tres paletas de temas de color en una pantalla, con una llave que las desbloquea.
reviewed: false
---

Mi sitio tiene un modo claro y uno oscuro. Ahora también tiene temas de color: un botón de paleta en la cabecera pasa todo el sitio a Tokyo Night, Dracula, Catppuccin, Rosé Pine, Gruvbox o Solarized, cada uno en claro y en oscuro. Añadirlos no tocó ni un solo componente.

## Por qué salió barato

Desde el principio, los componentes solo usan **tokens semánticos**: `--text-1`, `--surface-2`, `--brand`, nunca un color como `--green-bright`. Los colores que hay detrás de los tokens viven en un solo archivo, y cada token elige su valor claro u oscuro con `light-dark()`:

```css
:root {
	--brand: light-dark(var(--green-dark), var(--green-bright));
}
```

Así que un tema no es más que otro conjunto de valores para los mismos tokens:

```css
:root[data-palette='tokyo-night'] {
	--brand: light-dark(#2959aa, #7aa2f7);
	--surface-1: light-dark(#e6e7ed, #1a1b26);
	/* …and the rest */
}
```

El selector de claro y oscuro sigue eligiendo qué mitad de `light-dark()` recibes. El tema elige lo que hay en las dos mitades. Las cosas que había hecho a partir de otros tokens, como la rejilla de planos (de `--text-1`) y el foco que sigue al ratón (de `--brand`), cambiaron de color solas.

<!-- TODO: Alfonso, una captura de la misma página en Phosphor y en Tokyo Night, en oscuro. -->

## ¿Tema o paleta?

En mi código, "tema" ya significaba claro u oscuro (`data-theme`, el componente `ThemeToggle`). Llamar tema también a lo nuevo habría hecho ambigua cada línea, así que en el código es una **paleta** (`data-palette`). Los visitantes ven "Tema de color", porque es la palabra que conocen.

## Un menú casi sin JavaScript

El botón de paleta abre un menú con la [Popover API](https://developer.mozilla.org/es/docs/Web/API/Popover_API):

```svelte
<button popovertarget="palettes">…</button><div id="palettes" popover>…radio buttons…</div>
```

Ese atributo solo ya lo abre y lo cierra, lo cierra con Escape o con un clic fuera y devuelve el foco al botón. El [anchor positioning](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning) lo coloca justo debajo del botón (`anchor-name` en el botón, `position-anchor` y `position-area` en el menú). El único JavaScript es el que guarda la elección, y un script diminuto en `app.html` que la vuelve a poner antes de dibujar la página, así que una recarga nunca muestra un momento los colores por defecto.

## El contraste no viene con el tema

Tokyo Night está hecho para editores de código, donde los comentarios atenuados son una ventaja. En una página web no pasarían el contraste (2,5:1), así que mis comentarios usan el color de texto secundario del tema. Su variante clara necesitó más: tarjetas más claras, bordes más claros y un gris algo más oscuro para el texto secundario.

Eso último nunca lo habría encontrado revisando la paleta por sí sola. Mi fondo tiene un foco: líneas de la rejilla que se iluminan con el color de marca alrededor del ratón. Bajo esa luz azul, el texto gris del tema bajaba a 4,26:1. Un gris algo más oscuro lo mantiene en 4,75:1. Comprobar el contraste significa comprobar los pares que la página dibuja de verdad.

## Una cabecera rosa

En el tema claro de Tokyo Night, mi cabecera se volvió ligeramente rosa. El fondo de la cabecera es el color de la página al 75%:

```css
background-color: color-mix(in oklch, var(--surface-1) 75%, transparent);
```

Chrome mezcló `#e6e7ed` (casi un gris) en OKLCH y devolvió `oklch(0.93 0.008 none)`: el tono había desaparecido. Un tono que falta cuenta como 0, y el tono 0 es rosa. Mis propios grises están escritos en `oklch()` con un tono, así que nunca había pasado. Mezclar en OKLab, que no tiene tono en absoluto, lo arregló. Mezclar con `transparent` solo cambia la opacidad, así que el espacio de color no importa para el resultado, y OKLab es el seguro.

## Cinco más, y un test

Los demás salieron de la paleta oficial de cada tema. Elegí los que tienen una variante oficial clara _y_ otra oscura, porque cada token necesita las dos: Dracula tiene Alucard, Catppuccin tiene Latte y Mocha, Rosé Pine tiene Dawn y Main, y Gruvbox y Solarized se diseñaron como pareja.

Casi todas sus variantes claras fallaban el contraste en algún sitio: los temas de editor usan acentos de tono medio que se leen bien como código en una pantalla grande, pero no como texto normal al 4,5:1 de las WCAG. No quería cambiar unos colores por otros, así que un color que falla conserva su tono y su croma, y solo se mueve su luminosidad (más oscuro en claro, más claro en oscuro) hasta que pasa. Cada archivo de tema lista lo que cambió, el original y el nuevo. Solarized fue el que más cambió: sus acentos se hicieron para quedar bien sobre los dos fondos, así que están justo en el medio.

Luego convertí las comprobaciones en un test unitario. Para cada tema y en sus dos mitades, lee los colores del CSS y comprueba los pares que el sitio dibuja de verdad, el foco incluido. La primera ejecución falló, en Tokyo Night, el tema que ya había publicado: su color de marca claro daba 4,23:1 cuando un enlace quedaba sobre el foco. Lighthouse le había dado un 100 a esa página, porque el foco no estaba bajo un enlace cuando se ejecutó. Un test no depende de dónde esté el ratón.

<!-- TODO: Alfonso, tu favorito de los seis, y por qué. -->

## Una transición para cada cambio

Cambiar de tema no debería ser un simple salto. El selector de claro y oscuro ya tenía un círculo que crece desde el botón (una view transition). Los temas de color recibieron sus propios efectos, cuatro, que van por turnos:

- **Onda sobre la rejilla:** los cuadrados de mi fondo de planos pasan al tema nuevo uno a uno, en una onda que sale de donde hiciste clic. La página nueva se muestra a través de una máscara: un SVG con un cuadrado por celda de la rejilla, cada uno apareciendo un poco más tarde cuanto más lejos está. Un SVG usado como imagen en CSS ejecuta sus propios elementos `<animate>`, así que la máscara se anima sola.
- **Glitch:** durante menos de medio segundo, el tema nuevo aparece en franjas horizontales al azar que saltan hacia los lados, con el canal rojo desplazado hacia un lado y el verde y el azul hacia el otro, y luego se asienta. La temporización con `steps()` convierte cada fotograma en un salto en vez de un fundido.
- **Redibujado por barrido:** una línea brillante recorre la pantalla hacia abajo y dibuja el tema nuevo por encima de ella. Nada dibuja la línea: la foto nueva se desvanece justo por encima de ella y la antigua justo por debajo, así que justo en la línea ves lo que hay detrás de las dos, que es el color de marca.
- **Lluvia de columnas:** cada columna de la rejilla deja caer el tema nuevo desde arriba en su propio momento.

Todos están desactivados para quien prefiere reducir el movimiento: los colores simplemente cambian.

<!-- TODO: Alfonso, cuáles conservaste, cuál te gusta más y una grabación de él (mira la sección de Vídeos de la guía de publicación). -->

## Enlaces

- [Tokyo Night para VS Code](https://github.com/enkia/tokyo-night-vscode-theme) (MIT, de Enkia)
- [MDN: light-dark()](https://developer.mozilla.org/es/docs/Web/CSS/color_value/light-dark)
- [MDN: Popover API](https://developer.mozilla.org/es/docs/Web/API/Popover_API)
- [MDN: anchor positioning de CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)
- [MDN: color-mix()](https://developer.mozilla.org/es/docs/Web/CSS/color_value/color-mix)
