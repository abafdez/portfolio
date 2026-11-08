---
title: Un selector de sol y luna con una revelación circular
reviewed: false
---

## Qué hicimos

- Planifiqué la fase 4.5 (identidad y movimiento): un aspecto técnico (terminal, monoespaciada, planos, código), primero en oscuro, una mascota, y cada ruta con su propia composición y su truco. El tema y los tokens siguen siendo compartidos.
- Convertí el selector de tema en un icono: un sol en SVG cuyos rayos se desvanecen mientras un círculo con máscara le arranca un mordisco en forma de luna creciente.
- Ahora el tema nuevo crece desde el botón en un círculo, con una view transition del tipo `theme`.
- Añadí un token `--dark` (1 en oscuro, 0 en claro) en `tokens.css`. El icono calcula sus transformaciones a partir de él.
- Lo probé en el sitio construido a 320px y en escritorio, en los dos temas y con reducción de movimiento. La accesibilidad en Lighthouse sigue en 100 en los dos temas.
- Rehíce el selector como un CodePen de HTML, CSS y JS normales con un panel de control (duración, curva, difuminado del borde y modo de fusión) para jugar con la revelación.
- Traje el borde suave de vuelta al proyecto: `ThemeToggle` recibe las props `duration` (ms) y `blur` (px). Los valores por defecto (600, 0) mantienen el aspecto anterior.

## Qué aprendí

- `light-dark()` solo funciona con colores. Para cualquier otra cosa que dependa del tema, un número 0/1 en una custom property funciona con `calc()`: `scale(calc(1 + 0.75 * var(--dark)))`.
- El icono lee `--dark`, no `aria-pressed`. El CSS se aplica antes de `onMount`, así que el icono está bien desde el primer pintado, incluso sin JS. Si leyera `aria-pressed`, quien tiene el sistema en oscuro vería un sol que se convierte en luna en cada carga de página.
- `startViewTransition()`: el navegador hace una foto de la página antigua, ejecuta `update()`, hace una foto del estado nuevo y luego anima entre las dos con `::view-transition-old(root)` y `::view-transition-new(root)`. La revelación deja quieta la antigua y recorta la nueva con un `circle()` que crece.
- Los tipos de transición le ponen una etiqueta a una transición, y el CSS solo coincide con la suya mediante `:active-view-transition-type(theme)`. Sin eso, el círculo también se reproduciría más adelante en las transiciones entre rutas.
- `flushSync` es una función de Svelte que aplica en el acto las actualizaciones pendientes del DOM en vez de en la siguiente tanda, así que llegan **antes** de la foto del "después" del navegador. Hoy es un seguro: el cambio visible sale de `data-theme`, que ponemos directamente.
- Por defecto, las dos fotos se mezclan para el fundido (`mix-blend-mode: plus-lighter`), así que la revelación pone `mix-blend-mode: normal`.
- `clip-path: circle()` siempre tiene un borde nítido. Un `mask-image: radial-gradient(...)` puede difuminarse: sólido hasta `radius - blur` y transparente en `radius`.
- Las custom properties son texto sin tipo, así que animar una solo salta del principio al final. `@property` la registra como `<length>`, y entonces los keyframes pueden interpolarla.
- Los pseudoelementos de la transición cuelgan de `:root`, no del componente. Así que las props no pueden ser props de CSS en el componente (`<ThemeToggle --x="…" />`, como en `Hero`): el manejador del clic las escribe en `:root`, junto a `--reveal-x/y/r`.

## Problemas y soluciones

- El botón prerenderizado tenía `aria-pressed="false"` para todo el mundo, aunque `theme` empieza en `undefined`. Svelte pinta `false` en un atributo `aria-*` como el texto `"false"`; solo `undefined` lo deja fuera. Lo arreglé con `aria-pressed={theme ? theme === 'dark' : undefined}`.
- Con la máscara, el tema antiguo parpadeaba al final. La transición se queda un fotograma o así después de que termine su animación, y en ese hueco `--reveal-radius` volvía a `0px`, así que la máscara ocultaba la foto nueva. Lo arreglé con `animation: … forwards`. (A `clip-path` nunca le pasó: sin la animación vuelve a `none`, que lo muestra todo.)
- En el CodePen, el SVG medía 0×0 y no se animaba nada. El nuevo editor de CodePen trabaja con archivos y no cargaba los de CSS y JS, así que `index.html` tiene que enlazarlos.
- En el CodePen, los modos de fusión distintos de `normal` parpadeaban al final: el último fotograma era la mezcla de la antigua y la nueva, y luego la página saltaba al tema nuevo sin mezclar. Allí lo arreglé desvaneciendo la foto antigua después de la revelación. El proyecto solo usa `normal`, así que no necesita ese arreglo.

## Enlaces

- [MDN: View Transition API](https://developer.mozilla.org/es/docs/Web/API/View_Transition_API)
- [MDN: :active-view-transition-type()](https://developer.mozilla.org/docs/Web/CSS/:active-view-transition-type)
- [MDN: el elemento SVG `<mask>`](https://developer.mozilla.org/es/docs/Web/SVG/Element/mask)
- [MDN: @property](https://developer.mozilla.org/es/docs/Web/CSS/@property)
- [MDN: mask-image](https://developer.mozilla.org/es/docs/Web/CSS/mask-image)
- [Svelte: flushSync](https://svelte.dev/docs/svelte/svelte#flushSync)
- [Adam Argyle: Building a theme switch component](https://web.dev/articles/building/a-theme-switch-component)
- [nerdy.dev](https://nerdy.dev), la inspiración de la revelación

## Siguiente

- La paleta técnica y la tipografía, primero en oscuro.
