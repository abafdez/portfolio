---
title: Un selector de idioma con efectos
reviewed: false
---

## Qué hicimos

- Cambiar de idioma reproduce los efectos de los temas de color (onda, glitch, línea de barrido, lluvia, por turnos con el selector de paleta), desde el selector. El `onNavigate` del layout raíz compara el idioma de la URL antigua y la nueva (`split()` de `locales.ts`) y llama a `transitionPalette()` en vez del fundido de ruta. `transitionPalette()` ahora acepta un cambio asíncrono, así que el navegador espera a la página nueva antes de su imagen del "después".
- `data-sveltekit-reset="false"` en el selector: te quedas donde estabas leyendo. En SvelteKit 3 sustituye a `data-sveltekit-noscroll`, que ahora da un aviso en la consola.
- Un icono nuevo: el carácter del icono "languages" de Lucide, con el código del otro idioma (ES o EN) donde el icono tiene su "A". Al señalarlo, los dos se inclinan uno hacia el otro con un rebote.

## Qué aprendí

- `onNavigate` puede devolver una promesa: SvelteKit la espera antes de cambiar la página. Resolverla dentro del callback de actualización de la view transition, y luego esperar a `navigation.complete`, es lo que permite que cualquier efecto envuelva una navegación.
- Un `<text>` de SVG toma la fuente del sitio por CSS (`font-family: var(--font-label)`), y `transform-box: fill-box` hace que una transformación gire alrededor del centro de la propia forma, no de la esquina del SVG.

## Siguiente

- Alfonso elige el efecto que mejor le va a un cambio de idioma, o los deja por turnos.
