---
title: Ventanas que se pliegan, se abren mientras lees y siguen saliendo en Ctrl+F
description: Una sección plegable que funciona sin JS, se abre sola al hacer scroll, respeta lo que elegiste y no le esconde su contenido a la búsqueda en la página.
cover: Una pila de ventanas que se pliegan, con un dedo que toca la de arriba.
reviewed: false
---

Mi página sobre mí agrupa mis habilidades en ventanas de terminal, diez, con unas noventa habilidades en total. Es una página larga, así que hice que las ventanas se plegaran, al estilo de Mac: plegada, una ventana conserva su nombre, una línea sobre ella, unas cuantas habilidades como chips y sus iconos en la barra de título.

La forma habitual de plegar cosas es `<details>`. Aquí no la usé: el summary tendría que contener el encabezado, y algunos lectores de pantalla pierden el rol de un encabezado dentro de un summary, que es un botón. En su lugar, la barra de título es un `<button>` de verdad con `aria-expanded`. Entonces tuve que hacer lo que `<details>` da gratis, y unas cuantas cosas que no da.

## Sin JavaScript, todo está abierto

El botón necesita JavaScript, así que sin él nada debería parecer plegable. Los estilos de plegado solo existen dentro de `@media (scripting: enabled)`, y la pista se oculta en `(scripting: none)`:

```css
@media (scripting: enabled) {
	.window:not([data-open]) .chips {
		display: flex;
	}
}

@media (scripting: none) {
	.hint {
		display: none;
	}
}
```

## Oculto, pero se puede buscar

Una lista plegada podría ser `display: none`, pero entonces Ctrl+F no puede encontrar "Docker" en ella. `hidden="until-found"` oculta el contenido y aun así deja que lo busque la búsqueda en la página. Cuando hay una coincidencia, el navegador lanza `beforematch` sobre el elemento justo antes de mostrarlo:

```svelte
<div
	id="{group.id}-skills"
	hidden={ready && !open ? 'until-found' : undefined}
	{@attach openOnFind}
>
```

```ts
const openOnFind: Attachment<HTMLElement> = (list) => {
	const show = () => (open = true);
	list.addEventListener('beforematch', show);
	return () => list.removeEventListener('beforematch', show);
};
```

`ready` importa: el atributo solo se pone cuando se ejecuta el JavaScript. Antes, una lista plegada solo está en una fila de altura cero (más sobre eso abajo). Y nunca un `display: none` desde el CSS: se impondría a `until-found`, y la búsqueda no encontraría nada.

## Animar desde y hacia la nada

CSS no puede animar `height: auto`. Sí puede animar una fila de grid de `1fr` (tan alta como su contenido) a `0fr` (nada):

```css
.reveal {
	display: grid;
	transition: grid-template-rows 400ms var(--ease-out-3);

	& > * {
		min-block-size: 0;
		overflow: clip;
		overflow-clip-margin: var(--size-1);
	}
}

.content {
	grid-template-rows: 1fr;
}

.window:not([data-open]) .content {
	grid-template-rows: 0fr;
}
```

`min-block-size: 0` deja que el hijo se encoja por debajo de su contenido, y `overflow: clip` corta lo que no cabe. El margen de recorte evita que se corten en los bordes los contornos brillantes de mis filas. Los chips usan el mismo truco al revés, así que crecen mientras la lista se encoge.

Hay una pega con `hidden="until-found"`: oculta la lista en el acto, antes de que quede nada que encoger. Así que la ventana lo pone cuando termina el pliegue:

```ts
function collapsed(event: TransitionEvent) {
	if (event.target !== event.currentTarget) return;
	if (event.propertyName === 'grid-template-rows' && !open) shut = true;
}
```

`transitionend` sube por el árbol, y la lista está llena de transiciones (una barra crece cuando la señalas), así que solo escucha a su propia fila. Con reducción de movimiento no hay nada que esperar, y la lista se oculta en el acto.

## La barra de título

Las luces dicen el estado: verde (zoom) mientras una ventana está abierta y amarilla (minimizar) mientras está plegada, con una curva de muelle para que la luz que se enciende dé un pequeño salto.

Plegada, la barra de título muestra los iconos de la ventana, como un dock. Aparecen uno tras otro: una animación se ejecuta cada vez que su elemento pasa de `display: none` a visible, así que se repite en cada pliegue, y el `--i` de cada icono lo retrasa un poco más. Cuando hay más iconos que espacio, un `ResizeObserver` se da cuenta, una segunda copia de los iconos sigue a la primera y dan vueltas como la franja de logos de arriba de la página.

## Abrirse mientras lees

Las ventanas empiezan plegadas y se abren solas a medida que suben por la pantalla:

```ts
const observer = new IntersectionObserver(
	([entry]) => {
		if (!entry.isIntersecting || chosen) return;
		open = true;
		observer.disconnect();
	},
	{ rootMargin: '0px 0px -33% 0px' }
);
```

El `rootMargin` le quita a la pantalla su tercio inferior, así que una ventana se abre cuando está en los dos tercios superiores. Es una región a propósito. Acababa de aprender (con mi menú de secciones) que un observer que vigila una línea fina se pierde cosas en un scroll rápido, pero donde se detiene un scroll, una ventana en pantalla está dentro de la región.

La página está prerenderizada, así que el servidor no puede saber qué hay en pantalla. Abre la primera ventana, la que ves al cargar la página. Si todas las ventanas empezaran plegadas, la primera se abriría justo después de cargar y empujaría todo hacia abajo.

## La elección del visitante gana

En cuanto abres o cierras una ventana tú, deja de abrirse sola:

```ts
function toggle() {
	show(!open);
	chosen = true;
}
```

Mi primera versión también guardaba cada elección en `localStorage`, para la siguiente visita. Lo quité: volver a una página con la mitad de las ventanas cerradas, sin recordar haberlas cerrado, parecía que estaba roto. Ahora una recarga empieza de cero.

## Un efecto secundario

Mi menú de secciones resalta la sección que estás leyendo, y se recalculaba con el scroll. Pero una ventana que se abre sola hace la página más alta sin ningún scroll, y el resaltado se quedaba desfasado. Un `ResizeObserver` sobre el body lo arregló: ahora el menú también se actualiza cada vez que la página cambia de altura.
