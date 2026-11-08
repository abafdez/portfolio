---
title: 'Un selector de tema que se revela solo: máscaras SVG y view transitions'
description: Mi selector de tema se convirtió en un sol que se transforma en luna, y el tema nuevo ahora crece desde el botón en un círculo. Una máscara SVG, un token numérico y la View Transition API.
cover: Un interruptor con una luna y un sol.
reviewed: false
---

Mi [selector de tema](./2026-10-29-dark-mode) funcionaba, pero era un botón normal que decía "Dark theme". Quería algo con más personalidad, y me encantaba el del [sitio de Adam Argyle](https://nerdy.dev): un sol que se transforma en luna, y el tema nuevo extendiéndose desde el botón en un círculo. Este artículo cuenta cómo lo rehíce en Svelte, en dos partes: el icono y la revelación.

## Parte 1: el icono

El icono es un SVG de 24×24: un círculo para el sol, ocho líneas para sus rayos y una máscara.

```svelte
<svg aria-hidden="true" viewBox="0 0 24 24">
	<mask id="moon-mask">
		<rect width="24" height="24" fill="white" />
		<circle class="bite" cx="24" cy="10" r="6" fill="black" />
	</mask>
	<circle class="sun" cx="12" cy="12" r="6" mask="url(#moon-mask)" fill="currentColor" />
	<g class="rays" stroke="currentColor">
		<!-- eight <line>s around the sun -->
	</g>
</svg>
```

Una máscara es una imagen en blanco y negro colocada sobre un elemento: las partes blancas se ven y las negras se ocultan. Aquí, la máscara es toda blanca salvo un círculo negro que está justo a la derecha, fuera del sol. En modo oscuro, ese círculo se desliza hacia la izquierda sobre el sol y le arranca un mordisco en forma de luna creciente. A la vez, el sol crece y los rayos se desvanecen.

### Un número para el tema

Al principio movía la animación con el `aria-pressed` del botón. Pero la página está prerenderizada, y `aria-pressed` solo recibe su valor cuando el `onMount` de Svelte se ejecuta en el navegador. Un visitante con el sistema en oscuro vería un sol un momento y luego lo vería transformarse en luna en cada carga de página.

Los colores no tienen este problema, porque el CSS ya sabe el tema antes de que se ejecute ningún JS. Así que el icono también debería leer el tema desde el CSS. Mis colores usan `light-dark()`, pero eso solo funciona con colores, no con un `transform` o una `opacity`. Así que añadí un token numérico junto a ellos en `tokens.css`, con las mismas reglas que `color-scheme`:

```css
:root {
	--dark: 0;
}

@media (prefers-color-scheme: dark) {
	:root {
		--dark: 1;
	}
}

[data-theme='light'] {
	color-scheme: light;
	--dark: 0;
}

[data-theme='dark'] {
	color-scheme: dark;
	--dark: 1;
}
```

Con un 0 o un 1, `calc()` puede hacer el resto:

```css
.sun {
	transform: scale(calc(1 + 0.75 * var(--dark)));
	transition: transform 0.5s var(--ease-elastic-out-3);
}

.rays {
	opacity: calc(1 - var(--dark));
	transform: rotate(calc(-25deg * var(--dark)));
}

.bite {
	transform: translateX(calc(-7px * var(--dark)));
}
```

Ahora el icono está bien desde el primer pintado, incluso con JavaScript desactivado. Cuando cambia `--dark`, las transiciones animan el cambio. La curva elástica de Open Props le da al sol un pequeño rebote.

## Parte 2: la revelación

El círculo usa la [View Transition API](https://developer.mozilla.org/es/docs/Web/API/View_Transition_API). Cuando llamas a `document.startViewTransition()`, el navegador:

1. hace una foto de la página tal como está,
2. llama a tu función `update()`, donde cambias el DOM,
3. hace una foto del estado nuevo en cuanto termina `update()`,
4. anima desde la foto antigua hasta la nueva.

Esa animación se estiliza con dos pseudoelementos: `::view-transition-old(root)` y `::view-transition-new(root)`. Por defecto se funden uno con otro. Para la revelación, la foto antigua se queda quieta y la nueva se recorta en un círculo que crece desde el botón.

Esta fue mi primera versión:

```css
:root:active-view-transition-type(theme)::view-transition-old(root) {
	animation: none;
	mix-blend-mode: normal;
}

:root:active-view-transition-type(theme)::view-transition-new(root) {
	animation: theme-reveal 0.6s var(--ease-in-out-3);
	mix-blend-mode: normal;
}

@keyframes theme-reveal {
	from {
		clip-path: circle(0 at var(--reveal-x) var(--reveal-y));
	}
	to {
		clip-path: circle(var(--reveal-r) at var(--reveal-x) var(--reveal-y));
	}
}
```

`mix-blend-mode: normal` está porque el fundido por defecto mezcla las dos fotos, lo que iluminaría todo lo que hay dentro del círculo.

### Un borde suave

Un círculo con `clip-path` siempre tiene un borde nítido. Quería probar uno difuminado, así que me pasé a una máscara. Un `radial-gradient` puede ser negro sólido (visible) hasta un radio y desvanecerse hasta transparente (oculto) en otro, y el hueco entre los dos es el difuminado:

```css
:root:active-view-transition-type(theme)::view-transition-new(root) {
	animation: theme-reveal var(--reveal-duration) var(--ease-in-out-3) forwards;
	mix-blend-mode: normal;
	mask-image: radial-gradient(
		circle at var(--reveal-x) var(--reveal-y),
		#000 calc(var(--reveal-radius) - var(--reveal-blur)),
		transparent var(--reveal-radius)
	);
}
```

Ahora la animación tiene que hacer crecer `--reveal-radius`, una custom property. Por defecto, el navegador trata una custom property como texto sin más, y no puede animar entre dos textos, así que el círculo saltaría de nada a su tamaño completo. `@property` le dice que el valor es una longitud, y las longitudes sí se pueden animar:

```css
@property --reveal-radius {
	syntax: '<length>';
	inherits: false;
	initial-value: 0px;
}

@keyframes theme-reveal {
	from {
		--reveal-radius: 0px;
	}
	to {
		--reveal-radius: calc(var(--reveal-r) + var(--reveal-blur));
	}
}
```

El círculo termina un difuminado más allá de la esquina más lejana, para que el borde que se desvanece también salga de la pantalla.

El `forwards` me costó un parpadeo encontrarlo. La view transition se queda en pantalla un fotograma o así después de que termine su animación. Con `clip-path` daba igual: sin la animación, `clip-path` vuelve a `none` y lo muestra todo. Pero sin la animación, `--reveal-radius` vuelve a su `initial-value` de `0px`, la máscara oculta toda la foto nueva y se cuela el tema antiguo. `forwards` conserva el último fotograma de la animación hasta que desaparece la transición.

La velocidad y el difuminado son props: `<ThemeToggle duration={800} blur={120} />`. Mi `Hero` recibe props de CSS como `--photo-animation`, pero eso aquí no funciona. Svelte las pone en un envoltorio alrededor del componente, y los pseudoelementos de la transición cuelgan de `:root`, fuera de él. Así que el manejador del clic las escribe en `:root`, junto a la posición del círculo:

```ts
root.style.setProperty('--reveal-duration', `${duration}ms`);
root.style.setProperty('--reveal-blur', `${blur}px`);
```

Primero lo probé todo en un CodePen con controles deslizantes para la duración, la curva, el difuminado y el modo de fusión. Una cosa que aprendí ahí: con un modo de fusión distinto de `normal`, el último fotograma de la revelación son las dos fotos mezcladas, así que la página salta al tema nuevo de verdad cuando termina la transición. Eso es un parpadeo.

El manejador del clic calcula dónde empieza el círculo y cuánto tiene que crecer. Empieza en el centro del botón y tiene que llegar a la esquina más lejana de la pantalla:

```ts
function toggle(event: MouseEvent) {
	const canReveal = typeof ViewTransition !== 'undefined' && 'types' in ViewTransition.prototype;
	if (!canReveal || matchMedia('(prefers-reduced-motion: reduce)').matches) return flip();

	const { left, top, width, height } = (event.currentTarget as HTMLElement).getBoundingClientRect();
	const x = left + width / 2;
	const y = top + height / 2;
	const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

	const root = document.documentElement;
	root.style.setProperty('--reveal-x', `${x}px`);
	root.style.setProperty('--reveal-y', `${y}px`);
	root.style.setProperty('--reveal-r', `${radius}px`);

	document.startViewTransition({ update: () => flushSync(flip), types: ['theme'] });
}
```

`flip()` es la lógica de antes del selector: cambiar el tema y luego guardar la preferencia o quitarla.

### Por qué el tipo `theme`

Los tipos de transición le ponen una etiqueta a una transición, y `:active-view-transition-type(theme)` solo coincide mientras se ejecuta una transición con esa etiqueta. Sin él, el CSS del círculo se aplicaría a **todas** las view transitions. Tengo pensado hacer transiciones entre páginas después, y esas también reproducirían el círculo, empezando desde donde hubiera pulsado el selector por última vez.

### Por qué `flushSync`

Svelte no actualiza el DOM en el momento en que cambia un `$state`. Reúne los cambios y los aplica un momento después, de una vez. [`flushSync`](https://svelte.dev/docs/svelte/svelte#flushSync) los aplica en el acto, así que es seguro que están en la foto del paso 3. Para ser sincero, todavía no depende de ello nada visible: los colores y el icono salen de `data-theme`, que `flip()` pone directamente. Es un seguro para cualquier cosa que Svelte muestre a partir del tema más adelante.

### Las alternativas

La revelación es una mejora. Si el navegador no tiene tipos de view transition, o el visitante prefiere reducir el movimiento, `toggle()` solo llama a `flip()` y el tema cambia al instante. Comprobar `types` importa: los navegadores más antiguos admiten `startViewTransition()`, pero solo con una función como argumento, y lanzarían un error con el objeto de opciones.

**Actualización:** cuando añadí [transiciones entre páginas](./2026-10-31-route-transitions-composition), necesitaban la misma comprobación, así que pasó a una función compartida, `canTransition()` en `src/lib/view-transitions.ts`. Ahora el selector empieza con `if (!canTransition()) return flip();`.

## Un bug que encontré por el camino

El `theme` del botón empieza en `undefined`, porque la página prerenderizada no puede saber el tema del visitante. Creía que eso dejaba `aria-pressed` fuera del HTML. No era así: Svelte pinta `false` en un atributo `aria-*` como el texto `"false"`, así que todos los visitantes recibían `aria-pressed="false"` hasta que cargaba la página. Solo `undefined` deja fuera el atributo:

```svelte
aria-pressed={theme ? theme === 'dark' : undefined}
```

## Pruébalo

- Abre el panel Animations de DevTools, ralentízalo al 10% y pulsa el selector.
- En la consola, ejecuta `document.documentElement.style.setProperty('--dark', 1)` y mira cómo el icono cambia solo.
