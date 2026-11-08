---
title: Un selector de tema que no parpadea
reviewed: false
---

## Qué hicimos

- Añadí un `<script>` en línea y bloqueante en `app.html` que lee `localStorage.theme` y pone `data-theme` en `<html>` antes del primer pintado.
- Construí `ThemeToggle.svelte`: `$state` para el tema, `onMount` para sincronizar el botón con el tema actual y `toggle()` para actualizar el estado, el atributo y `localStorage`.
- Puse el selector en la cabecera. Lo probé en el sitio construido: la elección se mantiene entre páginas y recargas sin parpadear.

## Qué aprendí

- El parpadeo: el HTML prerenderizado no tiene `data-theme`, así que el primer pintado sigue al sistema operativo. El JS de SvelteKit se ejecuta más tarde, como scripts de módulo después del análisis, y cambia el tema.
- Un `<script>` normal en línea dentro de `<head>` bloquea el análisis, así que se ejecuta antes de pintar `<body>`. El código de los componentes se ejecuta después de la hidratación, que es demasiado tarde.
- `localStorage` son datos de fuera: hay que validarlos (`'light' | 'dark'`) y envolver el acceso en un `try`, porque puede lanzar un error cuando el almacenamiento está bloqueado.
- El prerenderizado se ejecuta sin visitante, así que `theme` empieza en `undefined` y el botón está desactivado hasta `onMount`. Empezar en `'light'` dejaría grabado en el HTML un `aria-pressed` equivocado para quien tiene el sistema en oscuro.
- El script en línea decide los colores. `onMount` solo sincroniza el botón con lo que ya hizo el script.
- Un selector accesible: un `<button>` con una etiqueta fija y `aria-pressed`. Una etiqueta que cambia entre "Claro" y "Oscuro" es ambigua: ¿es el estado actual o la acción?
- El tema del sistema ya se detecta sin JS, mediante `color-scheme: light dark`. El JS solo se ocupa de la preferencia propia del usuario.

## Decisiones

- Un solo botón, no un control de tres opciones. Si algún día el sitio tiene un panel de ajustes, "Usar la preferencia del sistema" irá ahí. Leí el debate de 2026 antes de decidir:
  - Lea Verou defiende dos estados visibles (el tema del sistema y su contrario), y más tarde que la mayoría de los sitios no necesitan ningún selector.
  - Bramus defiende mostrar los tres estados (sistema, claro, oscuro).
  - Un artículo más antiguo de Kilian Valkhof defiende que el selector tiene que tener una forma de volver a "sistema".
- Me quedé con el modelo de Lea. El botón cambia entre el tema del sistema y su contrario. Volver con un clic al tema que coincide con el del sistema borra la preferencia (tanto `data-theme` como `localStorage`), así que el sitio vuelve a seguir al sistema. Un solo botón, y sigue habiendo forma de volver a "sistema".
- Un listener `change` de `matchMedia` mantiene el botón sincronizado si el tema del sistema cambia con la página abierta.

## Problemas y soluciones

- Mi primera prueba en el navegador de la versión nueva mostraba el comportamiento antiguo. Un servidor de previsualización de una prueba anterior seguía ocupando el puerto y servía el build viejo. Cuando el resultado de una prueba no tiene sentido, hay que comprobar qué se está sirviendo de verdad.
- La prueba del cambio de tema del sistema falló al principio porque el evento `change` se lanza un momento después del cambio, y la prueba leía el botón demasiado pronto. Pasó al esperar 100 ms.

## Enlaces

- [Lea Verou: Dark mode toggles: two states are enough](https://lea.verou.me/blog/2026/dark-mode-toggles/)
- [Lea Verou: The best dark mode toggle is probably none](https://lea.verou.me/blog/2026/dark-mode-toggles-2/)
- [Bramus: The case for tri-state dark mode toggles](https://www.bram.us/2026/08/18/the-case-for-tri-state-dark-mode-toggles/)
- [Kilian Valkhof: Your dark mode toggle is broken](https://kilianvalkhof.com/2020/design/your-dark-mode-toggle-is-broken/)
- [MDN: aria-pressed](https://developer.mozilla.org/es/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-pressed)

## Siguiente

- Alojar las fuentes en el sitio.
