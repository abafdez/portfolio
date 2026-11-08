---
title: Design tokens semánticos
reviewed: false
---

## Qué hicimos

- Creé `src/lib/styles/tokens.css` con tokens de color semánticos (`--brand`, `--text-1/2`, `--surface-1/2/3`) asignados a valores base de Open Props.
- Lo importé una vez en `+layout.svelte` y usé los tokens en `body` y `h1`.

## Qué aprendí

- Un token es una decisión de diseño con nombre. `--gray-8` es un valor (base); `--text-1` dice para qué sirve (semántico).
- Los componentes usan tokens semánticos y solo `tokens.css` usa los valores base. Así, el modo oscuro o un cambio de marca significan editar un solo archivo.
- Los tokens se nombran por su función, no por su aspecto. `--light-gray` miente en modo oscuro; `--surface-2`, no.
- No hay que envolver cada tamaño de Open Props en un token. Solo las decisiones reales que pueden cambiar necesitan un nombre semántico.
- Las escalas de color de Open Props van del 0 (el más claro) al 12 (el más oscuro). El texto y los enlaces sobre un fondo claro suelen necesitar del 7 al 9.
- Contraste AA de las WCAG: 4,5:1 para el texto normal, 3:1 para el texto grande y las partes de la interfaz. DevTools muestra el ratio en el selector de color.
- `import 'file.css'` es un import por efecto secundario. CSS no tiene exports, así que `import x from 'file.css'` falla.
- CSS no tiene `export`. Una custom property en `:root` está disponible en todas partes gracias a la herencia.

## Problemas y soluciones

- `[MISSING_EXPORT] "default" is not exported by tokens.css`: había escrito `import tokens from …` y envuelto el CSS en `export tokens { }`. Lo arreglé con un `import '…'` sin más y un bloque `:root { }` normal.
- Mi primer color de marca, `--brown-0`, era casi blanco y habría suspendido el contraste. Lo cambié por `--blue-9`.

## Enlaces

- [Colores de Open Props](https://open-props.style/#colors)
- [MDN: usar custom properties de CSS](https://developer.mozilla.org/es/docs/Web/CSS/Using_CSS_custom_properties)

## Siguiente

- `global.css` con cascade layers.
