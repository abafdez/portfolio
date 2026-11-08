---
title: 'Un marco para los bloques de código: números de línea, saltos de línea y un botón de copiar'
description: Partir las líneas largas, numerarlas con un contador de CSS y añadir un botón de copiar que solo aparece cuando funciona, alrededor del HTML de Shiki.
cover: Un bloque de código con números de línea.
reviewed: false
---

Mis bloques de código se cortaban. La columna de lectura tenía 60 caracteres de ancho, así que la mayoría de las líneas no cabían, y en un escritorio el sitio parecía leerse en un móvil. Quería cuatro cosas: una columna más ancha, líneas que se partieran en vez de desplazarse, números de línea y una barra con el lenguaje y un botón de copiar.

## Una columna más ancha

La columna ahora es un solo token:

```css
--reading-width: 80ch;
```

`ch` es el ancho del "0" en la fuente actual. 80ch de mi fuente de texto caben unos 90 caracteres de texto y 80 de código. Pensé en una maquetación en la que el código se saliera de la columna, con el texto a 60ch y el código más ancho, y también en los 70rem enteros de la cabecera. Me quedé con una columna para los dos.

## El marco

Mi resaltador con Shiki envuelve cada bloque en un componente:

```ts
return `<Components.CodeBlock lang="${language}">{@html \`${escaped}\`}</Components.CodeBlock>`;
```

`CodeBlock` es un `<figure>`. Su `<figcaption>` lleva el lenguaje y el botón, y el `<pre>` llega como hijo. Ese HTML entra mediante `{@html}`, así que los estilos con ámbito de Svelte no le llegan por sí solos. Uso `:global()` dentro de un selector con ámbito, para que los estilos sigan aplicándose solo dentro de este componente:

```css
figure :global(pre) {
	white-space: pre-wrap;
	overflow-wrap: anywhere;
	tab-size: 2;
}
```

`pre-wrap` conserva todos los espacios y saltos de línea, pero deja que las líneas se partan. `overflow-wrap: anywhere` también parte dentro de palabras y URLs largas, que si no seguirían desbordándose. Ya no se desplaza nada, así que quité el `tabindex="0"` que Shiki pone en el `<pre>`: una parada del tabulador que no hace nada solo estorba.

## Números de línea en CSS

Shiki pone cada línea en un `<span class="line">`. Un contador de CSS las numera:

```css
figure :global(code) {
	counter-reset: line;
}

figure :global(.line) {
	display: inline-block;
	inline-size: 100%;
	padding-inline-start: 4ch;
}

figure :global(.line::before) {
	counter-increment: line;
	content: counter(line);
	display: inline-block;
	inline-size: 2.5ch;
	margin-inline: -4ch 1.5ch;
	text-align: end;
}
```

Cada línea deja 4ch de espacio a su izquierda, y el margen negativo mete el número ahí. Una línea que se parte continúa debajo de su propio texto, no debajo de su número.

Los números son contenido generado, así que no forman parte del texto de la página. Al seleccionar el código a mano nunca se cogen.

Antes fallaron dos intentos:

- **Líneas con `display: block`.** Shiki pone un salto de línea entre los span de cada línea, y un `<pre>` muestra los saltos de línea, así que cada línea tenía una vacía detrás. `inline-block` a todo el ancho ocupa la fila entera sin eso.
- **Números con `position: absolute`.** Una línea vacía no tenía altura para sostener su número, y los números se solapaban. Dentro del flujo, el propio número le da altura a una línea vacía.

Un bloque de una sola línea, como un único comando, no necesita número. `:only-child` solo cuenta elementos, no el texto del salto de línea, así que los encuentra:

```css
figure :global(.line:only-child::before) {
	content: none;
}
```

## Un botón de copiar que solo aparece cuando funciona

El botón necesita JavaScript y la API del portapapeles. Sin ellos, sería un botón que no hace nada. Así que solo se renderiza cuando un `$effect` se ha ejecutado en el navegador:

```svelte
<script lang="ts">
	let canCopy = $state(false);

	$effect(() => {
		canCopy = 'clipboard' in navigator;
	});
</script>
```

Copia el `textContent` del `<code>`: el código tal como está escrito, sin los números, y con una línea partida que sigue siendo una línea. Un span con `role="status"` a su lado dice "copiado" (o "no se pudo copiar") durante dos segundos, y los lectores de pantalla lo anuncian cuando cambia.
