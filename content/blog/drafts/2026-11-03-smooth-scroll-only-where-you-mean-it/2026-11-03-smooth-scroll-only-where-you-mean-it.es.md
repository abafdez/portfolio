---
title: 'Scroll suave, solo donde lo quieres'
description: Una línea de CSS hacía que cada cambio de página de mi sitio con SvelteKit se deslizara hacia arriba desde donde estaba la página anterior. La solución es un atributo data y dos hooks de navegación.
reviewed: false
---

Tenía esto en mi CSS global, para que los enlaces dentro de una página (mi menú "En esta página", una pista para bajar) se deslizaran en vez de saltar:

```css
@media (prefers-reduced-motion: no-preference) {
	html {
		scroll-behavior: smooth;
	}
}
```

Con esos enlaces funcionaba. También hacía algo de lo que tardé en darme cuenta: cuando iba de una página desplazada a la mitad a otra página, la nueva aparecía también a la mitad y luego se deslizaba hasta arriba.

<!-- TODO: una grabación corta de la pantalla con el deslizamiento, antes del arreglo -->

## Por qué

Cuando SvelteKit navega, hace scroll en la ventana él mismo: al principio de la página nueva, o de vuelta a donde estabas si recargas o vas atrás. `scroll-behavior` se aplica a todo scroll que no pida un comportamiento propio, así que el salto de SvelteKit se convertía en un scroll suave que empezaba en la posición anterior.

Lo medí para asegurarme, tomando `scrollY` cada 250ms después de pulsar un enlace: 1047, 389, 1, 0. Un deslizamiento de medio segundo.

## La solución

El scroll suave solo se aplica cuando lo dice un atributo:

```css
@media (prefers-reduced-motion: no-preference) {
	html[data-smooth-scroll] {
		scroll-behavior: smooth;
	}
}
```

Y el layout raíz lo quita mientras navega SvelteKit:

```ts
onNavigate(() => {
	delete document.documentElement.dataset.smoothScroll;
});

afterNavigate(() => {
	requestAnimationFrame(() => (document.documentElement.dataset.smoothScroll = ''));
});
```

`onNavigate` se ejecuta antes de que cambie la página. `afterNavigate` se ejecuta cuando la página nueva ya está en su sitio, y también después de la primerísima carga. Para entonces SvelteKit ya ha hecho su scroll, y el `requestAnimationFrame` espera un fotograma más para asegurarse. La primera carga nunca tuvo el atributo, así que una recarga a mitad de página salta directamente a donde estabas.

Los enlaces dentro de una página no son navegaciones de SvelteKit, así que siguen deslizándose. Después del arreglo, la misma medición: 1047, 0.

<!-- TODO: ¿el salto se siente mejor, o quedaría mejor un fundido entre páginas? -->
