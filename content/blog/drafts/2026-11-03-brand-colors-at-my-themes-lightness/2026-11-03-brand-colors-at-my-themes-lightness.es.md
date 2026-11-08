---
title: 'Iconos con el color de su marca a la luminosidad de mi tema'
description: Cada logo de mi página sobre mí conserva el tono de su marca pero toma la luminosidad del tema, con un poco de matemáticas de OKLab y colores relativos de CSS.
reviewed: false
---

Mi página sobre mí lista con qué trabajo, y cada habilidad tiene su logo: Svelte, Laravel, PostgreSQL, GitHub. Los logos en sus colores de marca quedan geniales, hasta que cambias de tema. El logo de GitHub es negro, así que desaparece en mi tema oscuro. El de JavaScript es amarillo, así que casi no se ve en el claro. Los colores de marca se eligieron para el fondo de la propia marca, no para el mío.

Lo que quería: que cada logo conservara el _tono_ de su marca (Svelte sigue siendo naranja, Tailwind sigue siendo cian), pero que su _luminosidad_ saliera de mi tema, como la del texto. Así cada icono tiene el mismo contraste que el texto que lo rodea, en los dos temas.

<!-- TODO: una captura de los iconos con sus colores de marca sin tocar en el tema oscuro, junto a la versión final -->

## Dos librerías de iconos

- **[Lucide](https://lucide.dev)** para los iconos genéricos (un globo, una base de datos, un robot). `@lucide/svelte` da cada icono como un componente Svelte. Hay que importarlos de uno en uno, `@lucide/svelte/icons/globe`: importar desde el índice del paquete carga los 2.000 iconos en desarrollo.
- **[Simple Icons](https://simpleicons.org)** para los logos de marca. Cada logo son datos, no un componente: un título, un color de marca en hexadecimal y un trazado SVG en una rejilla de 24×24. Así que lo dibujo yo:

```svelte
<script lang="ts">
	import type { SimpleIcon } from 'simple-icons';

	let { icon, size = '1em' }: { icon: SimpleIcon; size?: string } = $props();
</script>

<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
	<path d={icon.path} />
</svg>
```

`fill="currentColor"` es la parte importante: el logo toma el color del texto, que controla el CSS. Es `aria-hidden` porque el nombre de la habilidad siempre está escrito al lado.

Faltan algunas marcas. LinkedIn, VS Code, Adobe e IBM pidieron a Simple Icons que las quitara. En mi página, LinkedIn lleva un icono genérico de mensaje.

## El tono y el croma de la marca, a partir de su hex

OKLCH describe un color como luminosidad, croma (cuánto color tiene) y tono (qué color es). Quiero el croma y el tono de la marca, así que primero convierto su hex a OKLab. Las matemáticas son las de [Björn Ottosson](https://bottosson.github.io/posts/oklab/), y son más cortas de lo que parecen:

```ts
const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

export function hueAndChroma(hex: string): { hue: number; chroma: number } {
	const [r, g, b] = [0, 2, 4].map((i) => linear(parseInt(hex.slice(i, i + 2), 16) / 255));

	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

	const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
	const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

	return {
		hue: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360,
		chroma: Math.min(Math.hypot(A, B), 0.17)
	};
}
```

Paso a paso:

1. **De sRGB a luz lineal.** Los valores de la pantalla no son proporcionales a la luz; `linear()` deshace esa curva. Es el mismo paso que usa [mi comprobador de contraste](./2026-11-02-a-contrast-checker-for-my-own-tokens) para la luminancia.
2. **De luz lineal a l, m y s**, más o menos cómo responden los tres tipos de conos del ojo, y luego una raíz cúbica.
3. **De l, m y s a a y b:** de verde a rojo y de azul a amarillo. Un gris tiene a = b = 0.
4. **El tono** es el ángulo del punto (a, b), y **el croma** su distancia al gris.

El croma tiene un tope de 0,17. Una marca muy saturada (un rojo puro) a la luminosidad de mi tema quedaría fuera de lo que puede mostrar la pantalla, y el navegador la recortaría, unos colores más que otros.

## A partir de ahí se encarga el CSS

Esto se ejecuta al construir el sitio, cuando se lee mi archivo de habilidades, así que el navegador solo recibe dos números por logo. El componente los pone en la fila de la habilidad, y el CSS construye el color con la sintaxis de color relativo:

```svelte
<li class="skill" style:--hue={color?.hue} style:--chroma={color?.chroma}>
```

```css
.skill {
	--glow: oklch(from var(--icon-tone) l var(--chroma, c) var(--hue, h));
}

.icon {
	color: var(--glow);
}
```

Es una custom property en la fila porque el icono no es lo único que la usa: el borde de la fila se ilumina con el mismo color cuando la señalas.

`oklch(from X l c h)` parte del color X y te deja sustituir cualquier canal. Aquí `l` se queda con la del tema (`--icon-tone`, que es mi verde de marca en cada tema), y el croma y el tono vienen de la marca. Un icono de Lucide no tiene marca, así que `--hue` no está puesto, y los valores de respaldo `c` y `h` conservan los del propio color del tema: esos iconos simplemente son verdes.

`--icon-tone` vive en `tokens.css` con los demás tokens semánticos, así que un tema futuro puede cambiar lo claros que son los iconos sin tocar el componente.

<!-- TODO: abrir DevTools, cambiar --icon-tone en :root a otro color y describir qué les pasa a los logos -->

## El resultado

Cada logo se lee tan bien como el texto que tiene al lado, en los dos temas, y sigue pareciéndose a sí mismo. El logo negro de GitHub pasa a ser un gris claro en oscuro (el negro casi no tiene croma, así que sea cual sea su tono se queda en gris), y el amarillo de JavaScript se convierte en un dorado oscuro en claro.

<!-- TODO: qué logo me sorprendió más después del cambio -->
