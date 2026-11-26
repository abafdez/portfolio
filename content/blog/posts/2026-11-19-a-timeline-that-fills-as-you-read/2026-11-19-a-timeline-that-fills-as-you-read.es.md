---
title: Una línea de tiempo que se llena mientras lees
description: 'Tres animaciones ligadas al desplazamiento en la línea de tiempo de mi Devlog, sin JavaScript: una línea que se llena cuando la pasa el centro de la pantalla, entradas que aparecen barridas y puntos que saltan. Y el truco de los márgenes que hace que la línea siga tu lectura.'
reviewed: false
---

Mi Devlog es una línea de tiempo: entradas agrupadas por fase, con una línea a un lado y un punto por entrada. Era estática. Ahora se mueve con tu lectura, y todo es CSS: animaciones ligadas al desplazamiento, en las que el progreso de una animación sigue la posición del scroll en lugar de un reloj.

![La línea de tiempo del Devlog a mitad de desplazamiento: la línea junto a la fase anterior está llena de verde y la de la fase siguiente sigue gris](./timeline.png 'La línea llena marca hasta dónde has leído')

## Una línea que se llena

La lista tiene una línea gris (`::before`) y, encima, otra del color de marca (`::after`) que escala de 0 a 1 desde arriba:

```css
.timeline::after {
	transform-origin: top;
	animation: line-fill linear both;
	animation-timeline: view(50% 50%);
	animation-range: cover 0% cover 100%;
}

@keyframes line-fill {
	from {
		scale: 1 0;
	}
	to {
		scale: 1 1;
	}
}
```

El truco es `view(50% 50%)`. Una línea de tiempo de vista sigue a un elemento mientras cruza el área de desplazamiento, y los dos valores son márgenes: un 50 % por arriba y un 50 % por abajo reducen esa área a una línea en el centro de la pantalla. Con el rango de `cover 0%` a `cover 100%`, la animación empieza cuando el principio de la lista llega a esa línea y termina cuando su final la deja atrás. Así que el relleno siempre acaba en el centro de la pantalla: una barra de progreso de la lectura.

## Entradas que aparecen barridas

Cada entrada aparece barrida desde arriba y se desliza desde la línea al entrar en pantalla:

```css
li {
	animation: entry-in linear both;
	animation-timeline: view();
	animation-range: entry 0% entry 70%;
}

@keyframes entry-in {
	from {
		clip-path: inset(-2rem -2rem 100% -4rem);
		translate: -1.25rem 0;
	}
	to {
		clip-path: inset(-2rem -2rem -2rem -4rem);
	}
}
```

Hay dos detalles importantes. Un barrido, no un fundido: Lighthouse mide el contraste al cargar la página, y el texto por debajo del pliegue con `opacity: 0` no aprueba, aunque nadie lo vea transparente. Y los márgenes negativos: el punto está fuera de la entrada, a su izquierda, y un `clip-path` recorta todo lo que queda fuera de la caja, el punto también. El recorte llega 4rem a la izquierda, y tiene que ser un `inset()` en los dos extremos, porque `inset()` no se interpola hasta `none`.

## Puntos que saltan

El punto (`li::before`) escala de 0 a más de 1,6 y vuelve a 1 mientras llega su entrada, con el mismo tipo de línea de tiempo y un rango algo más tardío, para que aparezca cuando el barrido ya ha empezado.

## Cuando no se ejecuta

Las tres están dentro de `@supports (animation-timeline: view())` y `@media (prefers-reduced-motion: no-preference)`. Los navegadores sin animaciones ligadas al desplazamiento, y quien ha pedido menos movimiento, ven la línea de tiempo como era: una línea gris, los puntos y todas las entradas visibles. Las entradas que ya están en pantalla al cargar la página han pasado su rango, así que simplemente se muestran.
