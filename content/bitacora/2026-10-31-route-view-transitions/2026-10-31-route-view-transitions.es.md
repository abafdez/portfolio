---
title: View transitions entre rutas
reviewed: false
---

## Qué hicimos

- Ahora los cambios de ruta se ejecutan dentro de una view transition del tipo `route`, que se inicia desde `onNavigate` en el layout raíz.
- La cabecera se queda quieta, el contenido de la página antigua se desvanece (150ms) y el nuevo aparece y sube un poco (300ms). El fondo y el pie cambian de golpe.
- El subrayado de la página actual en el menú es ahora un elemento propio (un span `.marker`). Durante un cambio de ruta recibe un nombre, y el navegador lo desliza del enlace antiguo al nuevo.
- La comprobación de "¿podemos animar?" (tipos de view transition, sin preferencia de reducción de movimiento) pasó a `canTransition()` en `src/lib/view-transitions.ts`, compartida por el selector de tema y las rutas.
- Probado: los enlaces de ruta inician una transición `route`, los enlaces `#` dentro de la página y la reducción de movimiento no inician ninguna, y la revelación del tema sigue cubriendo toda la página.

## Qué aprendí

- `onNavigate` se ejecuta justo antes de que SvelteKit cambie la página, y SvelteKit espera si devuelve una promesa. Dentro de `startViewTransition`, `update()` resuelve esa promesa (para que SvelteKit cambie la página) y luego espera a `navigation.complete`, para que la foto del "después" del navegador muestre la página nueva.
- `view-transition-name` le da a un elemento su propio par de fotos, que se animan aparte del resto de la página (la raíz). La raíz es lo que queda con esos elementos recortados.
- Nombres solo durante las transiciones `route` (`:root:active-view-transition-type(route) header`). La revelación del tema solo anima la raíz; una cabecera con nombre se recortaría de ella y se quedaría fuera del círculo.
- Un subrayado de texto no puede moverse entre enlaces, pero un elemento sí. Solo existe un marcador por página, así que el navegador puede emparejar el antiguo con el nuevo.
- Por defecto, las fotos antigua y nueva se estiran al tamaño del grupo. Cuando la página antigua es más ancha que la nueva, la foto antigua se aplasta. Darle `inline-size: auto`, centrada con `inset-inline-start: 50%` y `translate: -50%`, la mantiene donde estaba.
- La red de seguridad en CSS para la reducción de movimiento no puede detenerlas: `*` no coincide con los pseudoelementos `::view-transition-*`. Así que la comprobación está en JS, antes de empezar la transición.

## Enlaces

- [SvelteKit: onNavigate](https://svelte.dev/docs/kit/$app-navigation#onNavigate)
- [Blog de Svelte: Unlocking view transitions in SvelteKit](https://svelte.dev/blog/view-transitions)
- [MDN: view-transition-name](https://developer.mozilla.org/es/docs/Web/CSS/view-transition-name)
- [MDN: ::view-transition-group()](https://developer.mozilla.org/docs/Web/CSS/::view-transition-group)

## Siguiente

- Una forma de que cada ruta fije su propia composición.
