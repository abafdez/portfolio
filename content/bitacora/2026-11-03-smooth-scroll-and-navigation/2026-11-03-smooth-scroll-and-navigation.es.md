---
title: Scroll suave, pero no cuando navega SvelteKit
reviewed: false
---

## Qué hicimos

- Ir a otra página la empezaba donde estaba desplazada la página anterior, y luego se deslizaba hasta arriba. Una recarga a mitad de página también se deslizaba hacia abajo. Ahora una página nueva empieza arriba, y una recarga salta directamente a donde estaba.
- `scroll-behavior: smooth` solo se aplica bajo `html[data-smooth-scroll]`. El layout quita el atributo en `onNavigate` y lo vuelve a poner un fotograma después de `afterNavigate`.

## Qué aprendí

- `scroll-behavior: smooth` en `html` afecta a todo scroll que no diga otra cosa, incluidos los del propio SvelteKit: el salto al principio de una página nueva y el salto a donde estabas después de recargar. El scroll suave convertía los dos en deslizamientos.
- `onNavigate` se ejecuta antes de una navegación; `afterNavigate`, después, y también tras la primera carga. Para entonces SvelteKit ya ha hecho scroll, así que un `requestAnimationFrame` después ya se puede volver a activar el scroll suave.
- Los enlaces dentro de una página (el menú "En esta página", la pista del pie) no son navegaciones de SvelteKit, así que siguen deslizándose.
- Medir ayudó: tomar `scrollY` cada 250ms después de un clic daba 1047, 389, 1, 0, un deslizamiento. Después del arreglo: 1047, 0.

## Enlaces

- [MDN: scroll-behavior](https://developer.mozilla.org/es/docs/Web/CSS/scroll-behavior)
- [SvelteKit: onNavigate](https://svelte.dev/docs/kit/$app-navigation#onNavigate)
- [SvelteKit: afterNavigate](https://svelte.dev/docs/kit/$app-navigation#afterNavigate)

## Siguiente

- Nada más aquí.
