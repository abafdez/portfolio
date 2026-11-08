---
title: Modo oscuro con light-dark()
reviewed: false
---

## Qué hicimos

- Reescribí cada token de `tokens.css` como `light-dark(valor claro, valor oscuro)`.
- Puse `color-scheme: light dark` en `:root`, más las sobrescrituras `[data-theme='light']` y `[data-theme='dark']` para el selector que viene después.
- No cambió nada fuera de `tokens.css`.

## Qué aprendí

- `color-scheme` hace dos cosas. Mueve `light-dark()`, y hace que la propia interfaz del navegador (barras de desplazamiento, controles de formulario) siga al tema.
- `light-dark()` mantiene los dos valores en una línea, en vez de repetir cada token dentro de `@media (prefers-color-scheme: dark)`.
- Sin el atributo `data-theme`, el sitio sigue al sistema operativo. Poner el atributo fuerza un tema.
- Lightning CSS (el minificador de Vite) sustituyó `light-dark()` por una alternativa para navegadores antiguos. Los selectores `[data-theme]` son más específicos que el `:root` generado dentro de la media query, así que un tema forzado sigue ganando al del sistema.
- Se prueba en DevTools con Ctrl+Mayús+P → "Emulate CSS prefers-color-scheme: dark".

## Enlaces

- [MDN: light-dark()](https://developer.mozilla.org/es/docs/Web/CSS/color_value/light-dark)
- [MDN: color-scheme](https://developer.mozilla.org/es/docs/Web/CSS/color-scheme)

## Siguiente

- Un selector de tema con `$state` y `localStorage`, y un script en línea en `app.html` para que la página no parpadee con el tema equivocado.
