---
title: Páginas más anchas y un tamaño de texto
reviewed: false
---

## Qué hicimos

- `--content-width` crece con la ventana: `clamp(70rem, 82vw, 96rem)`. A 1920 px son 1536 px en lugar de 1120 px.
- Las páginas de lectura (artículos, entradas del Devlog) mantienen sus 80 caracteres por línea y se amplían por escalones en pantallas anchas: 1,12 desde 100rem, 1,25 desde 120rem, 1,4 desde 150rem. A 1920 px la columna mide 875 px en lugar de 700 px.
- La fuente manuscrita del Devlog (Shantell Sans) ya no está; usa la fuente del cuerpo como el resto del sitio, y desinstalé el paquete.
- Un control de tamaño de texto en el menú de temas: más pequeño, el porcentaje (un `<output aria-live>`), más grande y restablecer, con iconos de Lucide. Pone `--text-scale` en `<html>`, y `html { font-size: calc(var(--text-scale, 1) * 100%) }` escala todo lo que está en rem. Se guarda en `localStorage` y `app.html` lo recupera antes del primer pintado, como el tema.
- A 320 px los cuatro iconos de la cabecera no dejaban sitio al nombre: por debajo de 24rem miden 2,5rem en lugar de 3rem.

## Qué aprendí

- 80ch se mide con la fuente del propio elemento, así que una fuente más grande da una columna más ancha, pero los encabezados están en `rem` y no crecerían con ella. `zoom` escala todo lo de dentro por igual.
- `rem` en una media query es el tamaño por defecto del navegador, no el de la raíz de la página, así que el tamaño de texto no mueve los puntos de corte.
- Los estilos del botón del menú de temas se aplicaban a todos los `<button>` del componente, también a los nuevos, y les habrían dado su `anchor-name`: el botón del menú necesitaba su propia clase.

## Siguiente

- Lighthouse con el texto al 137,5 %.
