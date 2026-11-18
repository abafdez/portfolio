---
title: 'Animaciones ligadas al scroll: una cabecera que se despega y un pie que avisa'
description: Animaciones que siguen al scroll en vez de al reloj, solo con CSS. Una cabecera que se eleva hasta ser una barra flotante, un pie que entra deslizándose y una pista de que hay más abajo, todo con alternativa para navegadores antiguos y para la reducción de movimiento.
cover: Una barra de desplazamiento con un dedo que tira hacia abajo.
reviewed: false
---

Descubrí [julibe.com](https://julibe.com) y me encantaron tres detalles: el menú superior se despega de la página al hacer scroll, el pie se queda oculto pero una pequeña animación avisa de que hay más abajo, y la barra de desplazamiento va en el color de acento. Ahora los tres son solo CSS.

## La idea: una línea de tiempo que no es tiempo

Una animación CSS normal va del 0% al 100% a lo largo de una duración, como `1s`. Una animación **ligada al scroll** avanza con otra cosa:

- `animation-timeline: scroll()`: la posición de scroll de la página. Arriba es el 0%, abajo el 100%.
- `animation-timeline: view()`: un elemento cruzando el viewport.

Y `animation-range` elige qué parte de esa línea de tiempo corresponde al 0%–100%.

## La cabecera se despega

Arriba de la página, la cabecera está plana, a ras de la página. Al hacer scroll, se eleva hasta ser una barra flotante con borde, esquinas redondeadas, un fondo translúcido desenfocado y una sombra.

El truco está en cuál es el estado "normal". Los estilos habituales de la cabecera son **la barra flotante**:

```css
.inner {
	border: var(--border-size-1) solid var(--surface-3);
	border-radius: var(--radius-3);
	background-color: color-mix(in oklch, var(--surface-1) 75%, transparent);
	backdrop-filter: blur(12px);
	box-shadow: var(--shadow-float);
}
```

La animación solo tiene un `from`, el estado plano:

```css
@keyframes header-detach {
	from {
		border-color: transparent;
		border-radius: 0;
		background-color: transparent;
		backdrop-filter: blur(0);
		box-shadow: none;
	}
}
```

Sin `to`, el navegador anima hacia los estilos propios del elemento. Luego la ato al scroll:

```css
.inner {
	animation: header-detach linear both;
	animation-timeline: scroll();
	animation-range: 0 var(--size-10);
}
```

`animation-range: 0 5rem` significa que toda la animación ocurre en los primeros 5rem de scroll. Después se queda al 100% (eso es lo que hace `both`).

¿Por qué hacer que la barra flotante sea el estado por defecto? Porque la animación es una mejora progresiva. En un navegador sin animaciones ligadas al scroll, o para alguien con la reducción de movimiento activada, la animación no se ejecuta, y la cabecera simplemente se ve terminada.

La cabecera solo es `position: sticky` a partir de 48rem de ancho. En el móvil ocupa dos filas y se comería demasiada pantalla, así que se va con el scroll.

## El pie avisa

Abajo de la pantalla, un pequeño chevrón verde sube y baja: "aquí abajo hay más". Cuando el pie entra en pantalla, el chevrón se desvanece y el contenido del pie sube deslizándose.

Esto usa una **línea de tiempo de vista**: el progreso sigue al propio pie entrando en pantalla, no a toda la página. Le doy un nombre en el pie para que sus hijos puedan usarla:

```css
footer {
	view-timeline: --footer;
}

.inner {
	animation: footer-in linear both;
	animation-timeline: --footer;
	animation-range: entry 0% entry 100%;
}

.hint {
	display: block;
	animation: hint-out linear both;
	animation-timeline: --footer;
	animation-range: entry 0% entry 50%;
}
```

`entry 0%` es el momento en que el borde superior del pie aparece abajo de la pantalla; `entry 100%`, cuando ya está entero dentro. La pista desaparece a mitad de camino, antes de que el contenido termine de entrar.

Dos detalles:

- **La pista está oculta por defecto** (`display: none`) y solo se muestra dentro del bloque donde la animación puede ejecutarse. Sin la animación, nada la ocultaría nunca.
- **El vaivén va en otro elemento.** El vaivén es un bucle normal basado en el tiempo; el desvanecido está ligado al scroll. En el mismo elemento, los dos se pelearían por las mismas propiedades, así que el vaivén va en el `svg` dentro del enlace.

La pista es decoración: `aria-hidden="true"` y `tabindex="-1"`. Quien usa el teclado o un lector de pantalla llega al pie como a cualquier otra parte de la página.

## Las protecciones

Todas las reglas de arriba están dentro de dos condiciones:

```css
@supports (animation-timeline: scroll()) {
	@media (prefers-reduced-motion: no-preference) {
		/* … */
	}
}
```

`@supports` para los navegadores que aún no tienen animaciones ligadas al scroll, y `prefers-reduced-motion` para quien le ha pedido a su sistema operativo menos movimiento. En los dos casos se ve el aspecto terminado.

## La barra de desplazamiento

El último detalle es una sola regla, con las propiedades estándar (Firefox, y Chrome desde la 121), así que sin `::-webkit-scrollbar`:

```css
html {
	scrollbar-color: var(--brand) var(--surface-1);
	scrollbar-width: thin;
}
```

## Enlaces

- [MDN: animaciones ligadas al scroll en CSS](https://developer.mozilla.org/docs/Web/CSS/CSS_scroll-driven_animations)
- [MDN: animation-range](https://developer.mozilla.org/docs/Web/CSS/animation-range)
- [scroll-driven-animations.style](https://scroll-driven-animations.style), las demos de Bramus y un visualizador de rangos
- [MDN: scrollbar-color](https://developer.mozilla.org/docs/Web/CSS/scrollbar-color)
