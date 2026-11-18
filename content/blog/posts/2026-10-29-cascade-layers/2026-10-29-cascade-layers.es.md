---
title: 'Cascade layers: deja de pelearte con la especificidad'
description: Cómo @layer me deja decidir una sola vez qué estilos globales ganan, y por qué los estilos de mis componentes Svelte les ganan a todos sin esfuerzo extra.
cover: Capas de CSS apiladas.
reviewed: false
---

Todo el CSS que he visto acaba tarde o temprano con selectores como `html body main a:not(.x)` o con `!important`, solo para ganarle a alguna regla anterior. Las cascade layers lo arreglan dejándote decidir la prioridad en un solo sitio.

## El problema

Cuando dos reglas fijan la misma propiedad en el mismo elemento, el navegador elige una por:

1. **Especificidad**: los IDs ganan a las clases, y las clases a los selectores de elemento.
2. **Orden en el código**: si la especificidad es igual, gana la regla que va después.

Así que un reset que usa `a:not([class])` le gana al `a` simple de un componente, aunque debería ganar el componente. Subes la especificidad para esquivarlo, y la siguiente regla la vuelve a subir.

## Las capas van antes que la especificidad

```css
@layer reset, base, components;
```

Esta línea define un orden, y **una capa posterior siempre gana a una anterior, sea cual sea la especificidad.** Un `a {}` simple en `base` gana a `html body a` en `reset`.

El orden completo que usa el navegador para las declaraciones normales es:

1. Las reglas dentro de capas, en el orden declarado
2. Después, las reglas **sin capa**, que ganan a todas las capas

Ese segundo punto encaja muy bien con Svelte. Los bloques `<style>` de los componentes no están en ninguna capa, así que sobrescriben automáticamente mis valores globales. Los estilos locales ganan a los globales sin que yo haga nada.

## Mi global.css

```css
@layer reset, base, components;

@layer reset {
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}
	* {
		margin: 0;
	}
	img,
	picture,
	svg,
	video {
		display: block;
		max-inline-size: 100%;
	}
	input,
	button,
	textarea,
	select {
		font: inherit;
	}
}

@layer base {
	body {
		font-family: var(--font-sans);
		color: var(--text-1);
		background-color: var(--surface-1);
	}
	a {
		color: var(--brand);
	}
}
```

- **`reset`** elimina las rarezas de los navegadores. Me basé en el [reset de CSS moderno de Josh Comeau](https://www.joshwcomeau.com/css/custom-css-reset/), y su artículo explica por qué está cada regla.
- **`base`** fija los valores por defecto de los elementos usando mis [design tokens](./2026-10-27-design-tokens).
- **`components`** está declarada pero de momento vacía.

`reset` va primero por un motivo. Si fuera la última, `* { margin: 0 }` sobrescribiría todos los márgenes que pongo en `base`, y el reset borraría mis propios valores por defecto.

## Cosas que me sorprendieron

**El minificador reescribió mi declaración de orden.** El CSS generado tiene `@layer reset{…}`, luego `@layer base{…}` y luego `@layer components;`. El orden no cambia, porque la posición de una capa la fija el sitio donde su nombre **aparece por primera vez**. Por eso también la declaración de orden va al principio del todo del archivo.

**El orden de los imports no importaba.** `global.css` usa `var(--text-1)` de `tokens.css`, así que esperaba que tuvieran que cargarse en ese orden. No hace falta. `var()` se resuelve cuando el navegador calcula los estilos de un elemento, después de que se hayan cargado todas las hojas de estilo.

El orden en el código solo importa cuando dos reglas fijan **la misma propiedad en el mismo elemento**, con la misma especificidad, en la misma capa. Definir una variable en un archivo y usarla en otro no es un conflicto.

Lo siguiente: [el modo oscuro](./2026-10-29-dark-mode), que resultó ser un cambio en un solo archivo.
