---
title: 'La decoración bajo el texto también necesita contraste'
description: La rejilla de fondo de mi sitio se ilumina alrededor del ratón. Donde pasaba por debajo del texto, el texto bajaba a 1,89:1. Cómo medí una capa translúcida y cómo elegí el efecto más intenso que sigue pasando.
cover: Una página que se lee mal frente a una página con buen contraste y fácil de leer.
reviewed: false
---

Mi sitio tiene una [rejilla de planos detrás de cada página](./2026-10-31-blueprint-background), y con ratón la rejilla se ilumina en verde alrededor del puntero. Lo consideraba todo decorativo: líneas tenues, sin requisito de contraste.

Eso era verdad para la rejilla normal. No lo era para el foco.

## Dónde falló

El foco es la misma rejilla, dibujada otra vez en el color de marca y recortada con una máscara en un círculo alrededor del ratón:

```css
.spot {
	--line: color-mix(in oklch, var(--brand) 25%, transparent);
	--line-major: color-mix(in oklch, var(--brand) 45%, transparent);
	mask-image: radial-gradient(circle 14rem at var(--x) var(--y), black, transparent);
}
```

Dos cosas lo hacían difícil de leer:

- **Las líneas secundarias están a 1,5rem unas de otras.** Eso es más o menos una línea de texto, así que dentro del círculo casi todas las líneas de texto tenían una línea brillante atravesando sus letras.
- **El círculo es más brillante en el puntero.** Y el puntero suele estar donde estoy leyendo.

Una línea debajo de una letra es, para esa letra, su fondo. Así que la "decoración" tiene que cumplir la misma regla de contraste que cualquier superficie: 4,5:1 para el texto normal.

## Medir una capa translúcida

Mi [comprobador de contraste](./2026-11-02-a-contrast-checker-for-my-own-tokens) lee superficies opacas. El foco no es opaco: su color depende de lo que tenga debajo. Así que lo compuse yo, como lo hace el navegador: pintar el color de la página en un canvas de 1×1, pintar cada capa encima y leer el píxel resultante.

```js
// Any CSS color (a var(), a color-mix()…) resolved to something canvas accepts.
const probe = document.createElement('div');
document.body.append(probe);
const resolve = (value) => {
	probe.style.color = value;
	return getComputedStyle(probe).color;
};

const canvas = Object.assign(document.createElement('canvas'), { width: 1, height: 1 });
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// Paint the layers bottom to top, return the final pixel as [r, g, b].
function paint(...layers) {
	ctx.clearRect(0, 0, 1, 1);
	for (const layer of layers) {
		ctx.fillStyle = resolve(layer);
		ctx.fillRect(0, 0, 1, 1);
	}
	return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
}

const page = getComputedStyle(document.body).backgroundColor;
const underLetter = paint(
	page,
	'color-mix(in oklch, var(--brand) 8%, transparent)', // the glow
	'color-mix(in oklch, var(--brand) 45%, transparent)' // a major line
);
```

Luego, la fórmula habitual de las WCAG con `underLetter` y el color del texto (la luminancia relativa de cada uno, `(más clara + 0,05) / (más oscura + 0,05)`).

El punto más brillante es el centro del foco, donde se superponen el brillo y una línea principal. En el tema oscuro:

| Bajo el texto                        | `--text-1` | `--text-2` |
| ------------------------------------ | ---------- | ---------- |
| La página                            | 15,07:1    | 7,17:1     |
| Una línea secundaria encendida (25%) | 8,30:1     | 3,95:1     |
| Una línea principal encendida (45%)  | 4,54:1     | 2,16:1     |
| Línea principal + brillo             | 3,98:1     | **1,89:1** |

Hasta el texto normal suspendía en el punto más brillante.

## Elegir el valor más intenso que pasa

Como el texto atenuado es el que menos margen tiene, medí `--text-2` con distintas intensidades de línea, con un brillo del 4%, en los dos temas, y me quedé con la más intensa que seguía en 4,5:1 o más:

- líneas principales: **15%** (4,89:1 en oscuro, 4,83:1 en claro)
- líneas secundarias: **8%** (5,77:1 en oscuro, 5,40:1 en claro)

Ahora el foco es más discreto. En oscuro sigue viéndose como una rejilla verde que sigue al ratón. En claro casi ha desaparecido: el texto es oscuro y el verde de marca también, así que una línea encendida cuesta más contraste ahí.

## Por qué son tokens

Los tres valores pasaron del componente a `tokens.css`, junto a los demás tokens de la rejilla:

```css
--grid-spot-line: color-mix(in oklch, var(--brand) 8%, transparent);
--grid-spot-line-major: color-mix(in oklch, var(--brand) 15%, transparent);
--grid-spot-glow: color-mix(in oklch, var(--brand) 4%, transparent);
```

Tengo pensados temas con nombre (Tokyo Night, Dracula…) que sobrescriban mis tokens. Un tema con otro `--brand` cambia todos los ratios de arriba, así que los valores tienen que vivir donde un tema pueda sobrescribirlos, con un comentario que diga que hay que volver a comprobarlos.

**Actualización (2026-11-09):** el contraste no era todo el problema. Incluso a 4,5:1, una línea que atraviesa las letras de un texto pequeño cansa al leer. Así que el sitio tiene ahora una regla: la cuadrícula es para los títulos y el espacio vacío, y el texto de tamaño normal o menor va sobre una "hoja", una tarjeta del color de la propia página sin cuadrícula detrás. Las proporciones de arriba siguen importando para los títulos y lo que quede sobre la cuadrícula. Más en la entrada del Devlog [Papel sobre el tablero de dibujo](/devlog/2026-11-09-paper-on-the-drawing-board).

## Enlaces

- [WCAG 2.2: contraste (mínimo)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [MDN: color-mix()](https://developer.mozilla.org/es/docs/Web/CSS/color_value/color-mix)
- [MDN: getImageData()](https://developer.mozilla.org/es/docs/Web/API/CanvasRenderingContext2D/getImageData)
