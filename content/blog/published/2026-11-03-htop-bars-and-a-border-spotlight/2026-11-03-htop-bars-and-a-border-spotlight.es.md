---
title: 'Barras de htop que se llenan cuando las ves, y un borde que sigue al puntero'
description: Los efectos de mi página sobre mí, y los bugs que hay detrás de cada uno. Una animación que nunca animaba, un observer que nunca veía y 168 KB de SVG duplicado.
cover: Una tableta que muestra barras de CPU y memoria al estilo de htop, con paneles de interfaz alrededor.
reviewed: false
---

Mi página sobre mí muestra mis habilidades como filas en ventanas de terminal, y cada nivel es una barra al estilo de htop: `[||||||......]`. Probé tres aspectos distintos en tres ramas antes de elegir este. Este artículo trata de los efectos que llegaron al final, y sobre todo de los bugs, porque cada uno me enseñó algo.

## La barra es texto

La barra son caracteres en la fuente del código, así que `1ch` es exactamente una marca:

```svelte
<span class="bar" style:--ticks={skill.level * 3} aria-hidden="true">
	[<span class="track"><span class="fill">||||||||||||</span></span>]
</span>
```

La pista mide 12 caracteres de ancho. El relleno tiene 12 marcas pero solo mide `--ticks` caracteres de ancho, con `overflow: hidden`, y los puntos de la parte vacía son un pseudoelemento por debajo. La barra es `aria-hidden`: el nivel también está escrito como una palabra ("A diario"), y eso es lo que lee un lector de pantalla.

## La animación que nunca animaba

Quería que cada barra se llenara de vacía a su nivel, de izquierda a derecha. Mis keyframes:

```css
@keyframes count-up {
	from {
		clip-path: inset(0 100% 0 0);
	}
}
```

Con solo un `from`, la animación termina en el valor propio del elemento, y el `clip-path` propio del relleno es `none`. El navegador puede mezclar un `inset()` con otro, pero no un `inset()` con `none`. Cuando dos valores no se pueden mezclar, CSS no se niega: salta de uno a otro a mitad de camino. Así que durante la mitad de la animación la barra estaba vacía, y luego estaba llena. Probé una versión ligada al scroll, una por pasos y una con tiempo, y todas "aparecían sin más", por este único motivo. La solución es una línea:

```css
@keyframes count-up {
	from {
		clip-path: inset(0 100% 0 0);
	}
	to {
		clip-path: inset(0);
	}
}
```

La lección que me quedo: si una animación salta en vez de moverse, comprueba que los dos extremos son el mismo tipo de valor.

## Empezarla cuando la barra está en pantalla

CSS (todavía) no puede iniciar una animación con tiempo cuando un elemento entra en pantalla. Esa parte la hace un pequeño attachment de Svelte: un único `IntersectionObserver` para todas las barras, que marca una barra con `data-filling` cuando se ve entera.

```ts
let observer: IntersectionObserver | undefined;

export const fillOnView: Attachment<HTMLElement> = (bar) => {
	observer ??= new IntersectionObserver(
		(entries) => {
			const visible = entries.filter((entry) => entry.isIntersecting);
			visible.forEach((entry, i) => {
				const target = entry.target as HTMLElement;
				target.style.setProperty('--delay', `${i * 70}ms`);
				target.dataset.filling = '';
				observer?.unobserve(target);
			});
		},
		{ threshold: 1 }
	);

	observer.observe(bar);
	return () => observer?.unobserve(bar);
};
```

Las barras que entran juntas en pantalla reciben cada una un `--delay` un poco más largo, así que caen en cascada por la lista.

Mi primera versión observaba el relleno, no la barra, y nunca se llenaba nada. Un observer mide la parte _visible_ de lo que observa, y `clip-path` cuenta: un relleno vacío está recortado a nada, así que nunca era visible. La barra que lo rodea no está recortada.

El CSS:

```css
@media (scripting: enabled) and (prefers-reduced-motion: no-preference) {
	.fill {
		clip-path: inset(0 100% 0 0);
	}

	.bar:global([data-filling]) .fill {
		animation: count-up calc(var(--ticks) * 90ms) var(--ease-out-3) var(--delay, 0s) both;
	}
}
```

- **`(scripting: enabled)`** se cumple cuando el navegador ejecuta JavaScript. Los rellenos empiezan vacíos desde el primer pintado, así que la página prerenderizada no muestra barras llenas que se vacían y se vuelven a llenar cuando arranca el JS. Sin JS, o con reducción de movimiento, las barras simplemente están llenas.
- **`:global()`**: `data-filling` lo pone el JavaScript, no la plantilla, así que Svelte cree que la regla no coincide con nada y la quita del CSS. `:global()` la conserva.
- **90ms por marca**: todas las barras se llenan a la misma velocidad, así que una más larga tarda más.

## Un borde que sigue al puntero

Cuando señalas una lista, los bordes que hay cerca del puntero se iluminan, cada fila en su propio color de marca. Otro attachment pone `--x` e `--y` en cada fila con cada `pointermove`: la posición del puntero respecto a esa fila. Como las reciben todas las filas, la luz llega a las de arriba y a las de abajo.

El anillo es un degradado radial centrado ahí, recortado al borde con una máscara:

```css
.skill::before {
	content: '';
	position: absolute;
	inset: -1px;
	padding: 1px;
	border-radius: inherit;
	background: radial-gradient(16rem circle at var(--x) var(--y), var(--glow), transparent 70%);
	mask:
		linear-gradient(#000 0 0) content-box exclude,
		linear-gradient(#000 0 0);
}
```

Dos máscaras: una solo cubre la caja del contenido y la otra la caja entera, y `exclude` conserva lo que está en una pero no en las dos, que es el relleno de 1px. Mi primera versión también iluminaba el interior de la fila, pero en el tema claro lo desteñía todo, así que solo quedan los bordes.

## El rebote

La barra de la fila que señalas crece un poco y vuelve a su sitio:

```css
.bar {
	display: inline-block;
	transform-origin: right;
	transition: scale 500ms var(--ease-spring-3);
}

.skill:hover .bar {
	scale: 1.12;
}
```

`--ease-spring-3` (de Open Props) es una curva `linear()` que se pasa y vuelve: ese es el rebote. Dos cosas que hice mal al principio: un `<span>` en línea no se puede escalar en absoluto, y `transform-origin` va en `.bar`, no en la regla del hover. Si no, vuelve de golpe al centro mientras la barra todavía se está encogiendo, y la barra se desliza hacia un lado.

## Una marquesina sin 168 KB de SVG

Por encima de las habilidades, todos los logos de marca pasan sin fin. Es la lista dos veces, desplazándose a la izquierda exactamente la mitad de su ancho: en ese punto, la segunda copia está donde empezó la primera, así que el bucle no se nota.

La primera versión escribía el trazado de cada logo dos veces en el HTML: 168 KB, la mitad de la página. Mi primer arreglo le dio un id a cada trazado de la primera copia e hizo que la segunda apuntara a él con `<use href="#logo-svelte">`: `<use>` dibuja una copia de un elemento que ya está en el documento. Eso ahorró 73 KB, pero las filas de habilidades seguían teniendo también todos los trazados.

Así que ahora no hay ningún trazado en la página. Todos los logos viven en un solo archivo, `logos.svg`, que escribe un endpoint de SvelteKit al construir el sitio, y cada icono de la página (las filas y las dos copias de la marquesina) apunta a él:

```svelte
<svg viewBox="0 0 24 24" width="2rem" height="2rem" fill="currentColor">
	<use href="{resolve('/logos.svg')}#svelte" />
</svg>
```

El navegador descarga ese archivo una vez y lo guarda en caché. La página pasó de 351 KB a 152 KB, y la puntuación de rendimiento de Lighthouse de 91 a 96. (Cómo se genera el archivo está en [su propio artículo](./2026-11-03-icons-as-data-and-an-svg-sprite).)

Una cosa más sobre la franja: `contain: inline-size` impide que la página mida toda la pista. Sin él, la página se ensanchaba 800px en el móvil. `overflow: hidden` solo no lo impide.
