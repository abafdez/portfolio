---
title: 'Transiciones entre páginas en SvelteKit, y que cada ruta elija su maquetación'
description: View transitions entre rutas con onNavigate, un marcador del menú que se desliza hasta la página nueva y una forma tipada de que cada ruta le diga al layout raíz cómo colocarla.
cover: Una página de CSS frente a una página de Svelte que usa transiciones.
reviewed: false
---

Mi selector de tema ya usaba una [view transition](./2026-10-30-theme-toggle-view-transition). Este artículo las añade entre páginas: la cabecera se queda quieta, el contenido se funde con la página nueva y la barra verde bajo el enlace actual del menú se desliza hasta el nuevo. Después, un pequeño sistema para que cada ruta elija su propia maquetación, del que la transición se encarga sin coste.

<!-- TODO: un vídeo corto pulsando por el menú -->

## Empezar la transición

SvelteKit navega en el navegador, sin recargar la página, así que el navegador no puede saber cuándo ocurre un "cambio de página". SvelteKit nos lo dice con `onNavigate`:

```ts
onNavigate((navigation) => {
	if (!canTransition()) return;

	return new Promise<void>((resolve) => {
		document.startViewTransition({
			update: async () => {
				resolve();
				await navigation.complete;
			},
			types: ['route']
		});
	});
});
```

Lo difícil es el orden de los acontecimientos:

1. `onNavigate` se ejecuta justo antes de que SvelteKit cambie la página. Devuelve una promesa, y SvelteKit la espera.
2. `startViewTransition` hace una foto de la página antigua y luego llama a `update()`.
3. `update()` resuelve la promesa, así que SvelteKit cambia la página, y espera a `navigation.complete`.
4. El navegador hace la foto del "después" y anima entre las dos.

`canTransition()` comprueba que el navegador admite tipos de transición y que el visitante no ha pedido reducir el movimiento. Mi red de seguridad en CSS para la reducción de movimiento no sirve aquí: `*` no coincide con los pseudoelementos `::view-transition-*`.

## Poner nombres, pero solo a veces

Por defecto, toda la página se funde de una a otra. `view-transition-name` le da a un elemento su propio par de fotos, para que pueda animarse de otra manera:

```css
:root:active-view-transition-type(route) {
	& .site-header {
		view-transition-name: site-header;
	}

	& main {
		view-transition-name: page;
	}
}
```

Un nombre tiene que ser único en la página. Mi primera versión decía `& header`, y funcionó hasta que una entrada del Devlog tuvo su propio `<header>` para el título. Dos elementos tenían el nombre `site-header`, y el navegador cancelaba la transición con "Unexpected duplicate view-transition-name". Una clase en la cabecera del sitio lo arregló.

Los nombres solo existen durante las transiciones `route`. La revelación circular de mi selector de tema anima la foto raíz, y un elemento con nombre se recorta de la raíz. Con un nombre permanente, la cabecera quedaría fuera del círculo y cambiaría de tema por su cuenta.

Luego el contenido: la página antigua se desvanece deprisa y la nueva aparece y sube un poco.

```css
&::view-transition-old(page) {
	animation: route-out 150ms ease-in both;
}

&::view-transition-new(page) {
	animation: route-in 300ms var(--ease-out-3) both;
}
```

<!-- TODO: las duraciones que probé y cuál me pareció bien -->

## El marcador que se desliza

El enlace actual del menú tenía antes un subrayado grueso. Un subrayado forma parte del texto, así que no puede moverse entre enlaces. Así que lo convertí en un elemento:

```svelte
<a href={resolve(link.href)} aria-current={current}>
	{link.label}
	{#if current}
		<span class="marker" aria-hidden="true"></span>
	{/if}
</a>
```

`current` es `'page'` en la propia página de una sección, `'true'` en una página dentro de ella (un artículo está dentro de Blog) y `undefined` en el resto, que Svelte deja fuera del HTML.

Solo hay un marcador en cada página. Durante una transición de ruta se llama `nav-marker`, así que el navegador empareja el antiguo con el nuevo y lo mueve de la posición del enlace antiguo a la del nuevo.

## Cada ruta elige su composición

El blog y el Devlog son texto largo, y las líneas largas cuestan de leer. Quería una columna estrecha ahí, pero `<main>` pertenece al layout raíz, y los estilos de una página no llegan a él. Así que la página le manda al layout un dato.

El tipo va en `src/app.d.ts`, para que se conozca en todas partes:

```ts
interface PageData {
	composition?: 'default' | 'reading';
}
```

Una ruta lo fija en su `+layout.ts`, que cubre la ruta y todo lo que hay debajo:

```ts
export const load: LayoutLoad = () => ({ composition: 'reading' }) satisfies App.PageData;
```

`satisfies` comprueba el valor con el tipo y conserva `'reading'` como ese texto exacto. Sin él, TypeScript lo ensancharía a `string`.

El layout raíz lo lee y el CSS hace el resto:

```svelte
<main data-composition={page.data.composition ?? 'default'}>{@render children()}</main>
```

```css
main[data-composition='reading'] {
	max-inline-size: var(--size-content-3);
}
```

Ir de la portada (1120px de ancho) al blog (60 caracteres de ancho) no necesitó nada extra en la transición: la caja del contenido salta a su nuevo tamaño y el contenido nuevo aparece. La única pega fue la foto antigua. Por defecto se estira al tamaño nuevo, así que una página ancha se aplastaba mientras se desvanecía. Darle su propio tamaño, centrada donde estaba, lo arregló:

```css
&::view-transition-old(page) {
	inline-size: auto;
	block-size: auto;
	inset-inline-start: 50%;
	translate: -50% 0;
}
```

**Actualización:** lo de "donde estaba" no era del todo cierto. La foto antigua se coloca donde empieza el contenido _nuevo_, y al volver atrás SvelteKit desplaza la lista hasta donde estabas, así que el artículo antiguo se veía desde la mitad mientras se desvanecía. Ahora el layout mide dónde empieza el contenido antes y después del cambio y mueve la foto antigua la diferencia: `translate: -50% var(--route-shift, 0px)`. No se notaba hasta que [las tarjetas empezaron a convertirse en sus páginas](./2026-11-08-cards-that-become-the-page).

## Un bug que esto encontró

Mientras lo probaba, el `main` de la portada medía 876px de ancho en vez de 1120px. En la rejilla de mi body, `margin-inline: auto` impide que un elemento se estire, así que `main` se encogía hasta su contenido. Cada página era tan ancha como su texto. `inline-size: 100%` junto a `max-inline-size` lo arregló, y ahora una composición decide de verdad el ancho.

## Enlaces

- [SvelteKit: onNavigate](https://svelte.dev/docs/kit/$app-navigation#onNavigate)
- [Blog de Svelte: Unlocking view transitions in SvelteKit](https://svelte.dev/blog/view-transitions)
- [MDN: view-transition-name](https://developer.mozilla.org/es/docs/Web/CSS/view-transition-name)
