---
title: 'Un comprobador de contraste que lee sus propios design tokens'
description: Leer custom properties de CSS en el navegador, convertir cualquier color de CSS a sRGB con un canvas, y la sorpresa de light-dark() por el camino.
cover: Una máquina que evalúa el contraste.
reviewed: false
---

Los colores de mi sitio son design tokens: `--text-1`, `--surface-2`, `--brand` y unos cuantos más, cada uno un par de `light-dark()`. Cada vez que añado un par, compruebo su contraste. Quería una herramienta que los comprobara todos a la vez, en los dos temas, y que siguiera funcionando cuando añada temas con nombre.

## Leer los colores, no analizarlos

Lo evidente sería leer `tokens.css` al construir el sitio. Pero entonces tendría que hacer el trabajo del navegador: seguir las cadenas de `var()`, elegir un lado de cada `light-dark()` y convertir `oklch` a sRGB a mano. Y un tema que un visitante creara en el navegador nunca se comprobaría.

Así que la herramienta se lo pregunta al navegador. Dos APIs web hacen el trabajo:

```ts
const probe = document.createElement('div');
probe.hidden = true;
document.body.append(probe);
const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;

function read(token: string, scheme: 'dark' | 'light') {
	probe.dataset.theme = scheme;
	probe.style.color = `var(--${token})`;
	// 1. CSS resolves the token: this gives back something like oklch(0.92 0.012 250).
	ctx.fillStyle = getComputedStyle(probe).color;
	// 2. The canvas turns any CSS color into pixels: paint one, read it back.
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
	return [r, g, b];
}
```

El resto es la [fórmula de las WCAG](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum): convertir cada canal de nuevo en luz lineal, ponderarlos para obtener una luminancia y comparar la más clara con la más oscura. Un detalle: el ratio se corta a dos decimales, no se redondea. 4,497 no pasa el AA, así que no puede mostrarse como 4,50.

## La sorpresa: light-dark() ya estaba decidido

Mi primera versión ponía `color-scheme: dark` en la sonda, y los dos temas salían idénticos. En DevTools:

```js
getComputedStyle(document.documentElement).getPropertyValue('--text-1');
// "oklch(21% .02 250)"
```

Ya no quedaba ningún `light-dark()`. El token se declara en `:root`, y ahí es donde se calcula, con el esquema de color de `:root`. Los hijos heredan el color ya resuelto, no la fórmula, así que al `color-scheme` de un hijo no le queda nada que decidir. (Eso es lo que hace Chrome; lo medí ahí.)

La solución fue un selector en `tokens.css`. Los tokens se vuelven a declarar en cualquier elemento con `data-theme`, así que se vuelven a calcular ahí:

```css
:root,
[data-theme] {
	color-scheme: light dark;
	--text-1: light-dark(var(--ink-7), var(--ink-2));
	/* … */
}

[data-theme='light'] {
	color-scheme: light;
}
```

Ahora cualquier parte de una página puede estar en el otro tema. Las muestras del comprobador lo usan para dibujar cada par en los dos temas solo con CSS, y los temas con nombre también podrán usarlo.

## Un par que se puede compartir, en una página prerenderizada

El par que eliges va en la URL, para poder compartirlo. Dos detalles de SvelteKit:

- La página está prerenderizada, y al construir el sitio no hay URL de ningún visitante. SvelteKit lanza un error si lees `url.searchParams` mientras prerenderiza, así que la herramienta los lee en `onMount`, que solo se ejecuta en el navegador.
- Para escribir de vuelta la URL uso el enrutado superficial: `goto(url, { shallow: true, replace: true })`. La barra de direcciones cambia, pero no se navega a ningún sitio, y `replace` lo deja en una sola entrada del historial, así que Atrás sigue saliendo de la página.

Aun así, las navegaciones superficiales ejecutan `onNavigate`. Mi layout empieza ahí una view transition, así que cada elección hacía desvanecerse la página y volver a aparecer. Una condición lo arregló:

```ts
onNavigate((navigation) => {
	if (navigation.shallow || !canTransition()) return;
	// …
});
```

## Qué encontró

Todos los pares que uso pasan el AA en los dos temas. Dos que no uso no lo pasan: en el tema claro, `--code-constant` y `--code-type` sobre `--surface-3` solo llegan a 4,34 y 4,39, suficiente únicamente para texto grande. El código va sobre `--surface-2`, así que de momento es una nota, no un bug.

Puedes probarlo [aquí](/projects/contrast/)
