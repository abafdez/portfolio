---
title: Maquetación adaptable (casi) sin media queries
description: Rejillas de tarjetas que eligen su número de columnas, una portada que se adapta a su contenedor en vez de a la pantalla y una cabecera que se reorganiza con áreas de grid.
cover: Elementos que cambian de tamaño.
reviewed: false
---

La portada de mi portfolio tiene que funcionar desde un móvil de 320px hasta un escritorio ancho. Acabé con una sola media query en toda la página. Así es como lo hice.

## Una rejilla de tarjetas que elige sus columnas

```css
.grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
	gap: var(--size-4);
}
```

De dentro hacia fuera:

- `minmax(16rem, 1fr)`: cada columna mide al menos 16rem, y las columnas se reparten el espacio que sobre.
- `repeat(auto-fit, …)`: crea tantas columnas como quepan.
- `min(100%, 16rem)`: en una pantalla de menos de 16rem, la columna mide simplemente el 100% en vez de desbordarse.

**`auto-fill` frente a `auto-fit`:** mi primera versión usaba `auto-fill`. En escritorio, eso creaba 4 columnas para 3 tarjetas y dejaba vacía la cuarta. `auto-fit` colapsa las columnas vacías, así que las 3 tarjetas se estiran hasta llenar la fila.

## Container queries: adaptarse al espacio, no a la pantalla

La portada muestra mi foto encima del texto en pantallas estrechas y al lado en las anchas. Una media query preguntaría "¿cuánto mide la pantalla?". Pero puede que la portada acabe algún día en una barra lateral. La pregunta que importa es "¿cuánto mide el espacio en el que estoy?". Eso es una container query:

```css
.hero {
	container-type: inline-size;
}

.layout {
	display: grid;
	gap: var(--size-5);
}

@container (min-width: 36rem) {
	.layout {
		grid-template-columns: auto 1fr;
	}
}
```

**Un elemento no puede consultar su propio tamaño.** Por eso hay dos elementos: `.hero` es el contenedor, y `.layout`, dentro de él, es lo que cambia.

## Un bug que me enseñó algo

La foto mide 8rem por defecto y 12rem en la versión ancha. Tras una refactorización, se quedó en 8rem en todas partes. Había escrito:

```css
@container (min-width: 36rem) {
	.photo {
		inline-size: 12rem;
	}
}

.photo {
	inline-size: 8rem; /* ❌ va después, así que gana */
}
```

`@container`, como `@media`, **no añade especificidad**. Las dos reglas son solo `.photo`, así que empatan, y gana la que va después. La solución es poner primero las reglas base y después las condicionales.

## Una cabecera que se reorganiza

En el móvil quiero el nombre del sitio y el selector de tema en la primera fila, y el menú en su propia fila debajo. En escritorio, todo va en una fila. Las áreas de grid lo hacen sin tocar el marcado:

```css
.inner {
	display: grid;
	grid-template-areas:
		'name toggle'
		'nav nav';
	grid-template-columns: 1fr auto;
}

@media (min-width: 48rem) {
	.inner {
		grid-template-areas: 'name nav toggle';
		grid-template-columns: auto 1fr auto;
	}
}
```

Esa es la única media query. La cabecera siempre ocupa todo el ancho de la página, así que aquí preguntar por la pantalla está bien.

## Un pie que se queda abajo

En las páginas cortas, el pie flotaba a mitad de pantalla. La solución son tres filas en `body`:

```css
body {
	min-block-size: 100dvh;
	display: grid;
	grid-template-rows: auto 1fr auto; /* cabecera, main, pie */
}
```

SvelteKit envuelve la página en un `<div style="display: contents">`. Ese div no crea una caja propia, así que la cabecera, el main y el pie cuentan como elementos de la rejilla del body.

## Tipografía fluida

El encabezado de la portada usa `--font-size-fluid-3` de Open Props, que es `clamp(2rem, 9vw, 3.5rem)`. Crece de forma continua con el viewport entre esos dos tamaños, sin ningún breakpoint.

## Pruebas

Comprobé cada cambio a 320px y a 1280px con una sola pregunta: ¿la página se desplaza hacia los lados? Esa comprobación encontró un bug antiguo: mi menú era una fila flex que no podía pasar a la siguiente línea. `flex-wrap: wrap` lo arregló.
