---
title: 'Animaciones de entrada: que decida la página'
description: Por qué mi componente de portada no se anima a sí mismo, cómo la página le pasa las animaciones como props de CSS y una red de seguridad para la reducción de movimiento que de verdad cubre los retrasos.
cover: Una maquetación con componentes que entran y salen.
reviewed: false
---

Mi portada hace aparecer sus partes una detrás de otra: la foto, el texto y luego las secciones de artículos y proyectos. Llegar ahí me llevó tres versiones, y cada una arreglaba algo que la anterior hacía mal.

## Versión 1: el componente se anima solo

La portada tenía su animación en sus propios estilos. Funcionaba, pero si reutilizo la portada en otra página, se anima siempre, lo quiera esa página o no. El orden en que aparecen las cosas en una página es decisión **de la página**, no del componente.

## Versión 2: una clase de utilidad global

Luego añadí una clase `.enter` en `global.css`, con un retraso para cada elemento. Mejor, pero la animación seguía viviendo lejos de la página que la usaba, y la página no podía animar por separado la foto y el texto de la portada.

## Versión 3: la página pasa la animación como prop

Svelte deja pasar custom properties de CSS directamente a un componente:

```svelte
<Hero … --photo-animation={enter(0)} --text-animation={enter(150)} />
```

Svelte las pone en un elemento envoltorio (`display: contents`). El componente solo las lee:

```css
/* Hero.svelte */
.photo {
	animation: var(--photo-animation, none);
}
.text {
	animation: var(--text-animation, none);
}
```

Si no se le pasa nada, el valor por defecto es `none`: un componente reutilizable no debería moverse a menos que se lo pidan.

La página define todo lo demás:

```svelte
<script lang="ts">
	const enter = (delay: number) => `home-enter 600ms ease-out ${delay}ms both`;
</script>

<section style:animation={enter(300)}>…</section>

<style>
	@keyframes -global-home-enter {
		from {
			opacity: 0;
			translate: 0 var(--size-3);
		}
	}
</style>
```

**¿Por qué `-global-`?** Svelte renombra los keyframes definidos en un componente, a algo como `svelte-abc123-home-enter`, para que no choquen con los de otros componentes. Pero Hero es otro componente y se refiere a los keyframes por su nombre. El prefijo `-global-` conserva el nombre tal como está escrito.

**¿Por qué `both`?** Mantiene el estado `from` durante el retraso (si no, el elemento se vería, desaparecería y luego aparecería poco a poco) y conserva el estado final después.

## ¿Por qué no `transition:` de Svelte?

Las transiciones de Svelte (`in:fade` y compañía) no se ejecutan durante la hidratación, así que no se verían en la primera carga de la página, que es justo cuando importa una animación de entrada. Las animaciones de CSS empiezan en cuanto se pinta el HTML, antes de que se ejecute JavaScript. Las transiciones de Svelte son la herramienta adecuada para cosas que aparecen y desaparecen por un cambio de **estado**, como filtrar una lista.

## Cuando los keyframes de la librería te sorprenden

Primero usé las animaciones listas de Open Props. El fundido no fundía. Sus keyframes son:

```css
@keyframes fade-in {
	to {
		opacity: 1;
	}
}
```

Solo hay un paso `to`. Un elemento que ya tiene opacidad 1 no tiene nada que animar. Open Props espera que pongas tú `opacity: 0` en el elemento. Y `slide-in-up` empieza en `translateY(100%)`, que es el 100% de la altura **del propio** elemento: unos 300px en mi portada, así que la foto parecía saltar a su sitio. Lee los keyframes antes de usarlos.

## Una red de seguridad para la reducción de movimiento que cubre los retrasos

A algunas personas el movimiento les marea o les da náuseas, y activan "reducir movimiento" en su sistema operativo. Lo respeto con una regla en mi capa de reset:

```css
@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		animation-delay: 0s !important;
		animation-iteration-count: 1 !important;
		transition-duration: 0.01ms !important;
		transition-delay: 0s !important;
	}
}
```

- **0.01ms en vez de `none`**, para que las animaciones sigan llegando a su estado final y sigan lanzándose los eventos `animationend`.
- **Los retrasos importan.** Mi primera versión solo acortaba las duraciones. Por culpa de `both`, mis secciones con retraso se quedaban invisibles hasta 450ms y luego aparecían todas de golpe. Para alguien que pidió menos movimiento, eso es peor que la animación.
- **El `!important` en la primera capa es intencionado.** Con `!important`, el orden de las cascade layers se invierte: gana la capa **más temprana**, y también gana a los estilos sin capa. Una preferencia de accesibilidad de quien usa la página debería estar por encima de cualquier decisión de diseño, así que este es el único sitio donde `!important` tiene sentido.

## Probar animaciones

Un fundido de 600ms no se puede comprobar a ojo con fiabilidad, pero `document.getAnimations()` te deja pausar cada animación en un momento dado y leer sus estilos:

```js
document.getAnimations().forEach((a) => {
	a.pause();
	a.currentTime = 100;
});
```

A los 100ms, cada parte estaba al 26% de opacidad y 12px más abajo: el fundido estaba ocurriendo de verdad.
