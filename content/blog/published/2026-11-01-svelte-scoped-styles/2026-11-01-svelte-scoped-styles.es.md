---
title: 'Cómo limita Svelte el ámbito de los estilos, leído en lo que genera el compilador'
description: Qué le hace el compilador de Svelte al bloque de estilos de un componente, por qué los estilos de una página no llegaban a mi markdown renderizado, y cuándo la solución es :global() y cuándo una clase global.
cover: El logo de Svelte en un escudo de cristal, con nombres de clase generados alrededor.
reviewed: false
---

Cuando renderizaba las entradas de mi Devlog con mdsvex, los estilos propios de la página no llegaban al texto de la entrada. Una regla `h2` en el `<style>` de la página no daba estilo a los encabezados de la entrada, y el compilador avisaba de que no se usaba. Los estilos con ámbito me parecían magia, así que compilé un componente diminuto y leí lo que salía. Son tres pasos sencillos.

## El experimento

Una página que muestra otro componente dentro de un div, con cuatro reglas:

```svelte
<script>
	import Body from './Body.svelte';
</script>

<div class="prose"><Body /></div>
<p class="intro">Hi</p>

<style>
	.intro {
		color: green;
	}
	h2 {
		color: red;
	}
	.prose :global(h2) {
		margin-top: 2rem;
	}
	.prose p {
		color: blue;
	}
</style>
```

El compilador devuelve este marcado:

```html
<div class="prose svelte-70xyc3"><!----></div>
<p class="intro svelte-70xyc3">Hi</p>
```

Y este CSS:

```css
.intro.svelte-70xyc3 {
	color: green;
}
/* (unused) h2 { color: red; }*/
.prose.svelte-70xyc3 h2 {
	margin-top: 2rem;
}
/* (unused) .prose p { color: blue; }*/
```

Más dos avisos: `Unused CSS selector "h2"` y `Unused CSS selector ".prose p"`.

<!-- TODO: probarlo en el playground de Svelte y contar qué me sorprendió -->

## Paso 1: una clase en los elementos

Cada elemento escrito en el marcado del componente recibe una clase extra, `svelte-70xyc3`. Ese es todo el truco: un nombre de clase que no usa nadie más. El `<div>` y el `<p>` la reciben. Lo que muestra `<Body />`, no: esos elementos están escritos en `Body.svelte`, así que reciben la clase de `Body`.

El nombre es un hash de la ruta del archivo del componente. Cada compilación del mismo archivo da la misma clase, y un archivo distinto da otra, aunque tenga el mismo CSS.

## Paso 2: la clase en los selectores

Cada selector recibe la misma clase: `.intro` se convierte en `.intro.svelte-70xyc3`. Ahora solo coincide con elementos de este componente. Un `.intro` de otro componente tiene otra clase, así que no coincide.

## Paso 3: se quitan las reglas que no se usan

El compilador ve todo el marcado, así que sabe qué selectores pueden coincidir con algo de él. Los demás se comentan en el resultado, con un aviso:

- `h2` no se usa porque no hay ningún `<h2>` en el marcado de este componente. Los encabezados vienen de `Body`.
- `.prose p` no se usa porque el `<p>` del marcado no está dentro de `.prose`.

El aviso es útil. Me dijo que la regla no podía funcionar antes de que perdiera el tiempo preguntándome por qué mis encabezados se veían mal.

## Dónde está el límite

La regla es **dónde se escribe el elemento**, no dónde acaba en la página. Eso tiene un lado sorprendente. El contenido que le pasas a un componente hijo como hijos está escrito en tu marcado, así que recibe tu clase:

```svelte
<Card><p class="note">hi</p></Card>

<style>
	.note {
		color: red;
	}
</style>
```

```html
<p class="note svelte-70xyc3">hi</p>
```

El `<p>` se muestra dentro de `Card`, pero la regla `.note` de este componente sigue dándole estilo.

## Salir del ámbito: :global()

`:global(...)` le dice al compilador que no añada la clase a esa parte de un selector. En `.prose :global(h2)`, el resultado es `.prose.svelte-70xyc3 h2`:

- `.prose` conserva la clase, así que la regla solo se aplica dentro del div `.prose` de este componente.
- `h2` no, así que coincide con los encabezados que muestra `Body`.

Así que solo es global a medias. En otra página, aunque tenga un div `.prose`, el div tiene la clase de esa página, y la regla no coincide. Una regla global del todo es `:global(body) { … }`, que sale como `body { … }` sin más.

Los keyframes también tienen ámbito: `@keyframes pop` sale como `svelte-70xyc3-pop`, así que dos componentes pueden tener cada uno una animación `pop`.

## Especificidad

La clase añade especificidad, pero solo una vez por selector. `.tags li` se convierte en:

```css
.tags.svelte-1lj1c2h li:where(.svelte-1lj1c2h) { … }
```

`:where()` no añade especificidad, así que el selector sube una clase, no dos. Eso ayuda a que una regla global siga ganando cuando hace falta.

De todas formas, en este sitio la especificidad casi nunca decide nada. Mis estilos globales están en cascade layers, y los de los componentes están fuera de cualquier capa, así que el estilo de un componente gana por muy específico que sea el global.

## Cuál usé

El markdown de una entrada del Devlog viene de otro componente, y el blog va a necesitar los mismos estilos. Así que no usé `:global()` en la página. Hice una clase global `.prose` en la capa `components` de `global.css`. Cualquier página puede ponérsela al div que rodea su markdown.

<!-- TODO: cuándo elegiría :global() en un componente en vez de una clase global -->

## Enlaces

- [Svelte: estilos con ámbito](https://svelte.dev/docs/svelte/scoped-styles)
- [Svelte: estilos globales](https://svelte.dev/docs/svelte/global-styles)
- [MDN: :where()](https://developer.mozilla.org/es/docs/Web/CSS/:where)
- [El playground de Svelte](https://svelte.dev/playground) (la pestaña de salida de CSS lo muestra todo)
