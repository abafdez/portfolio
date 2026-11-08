---
title: Open Props con postcss-jit-props en Vite
reviewed: false
---

## Qué hicimos

- Instalé `open-props` y `postcss-jit-props` como dependencias de desarrollo.
- Configuré PostCSS dentro de `vite.config.ts` (`css.postcss.plugins`), no en un archivo `postcss.config.*` ni en `package.json`.
- Añadí la extensión CSS Variable Autocomplete, apuntando a `node_modules/open-props/open-props.min.css`, para que el editor sugiera las variables de Open Props.

## Qué aprendí

- Un sitio estático solo envía `build/`. Nada de `node_modules` se ejecuta en el navegador, así que con adapter-static todo es dependencia de desarrollo. `dependencies` solo importa en librerías o en aplicaciones de servidor que ejecutan `pnpm install --prod`.
- CSS no tiene tree-shaking. `@import "open-props/colors"` copia todos los colores en el bundle, y el minificador no puede quitar las custom properties sin usar. JIT hace ese trabajo: lee mi CSS e inyecta solo los `var(--x)` que uso.
- JIT solo ve el CSS. Las variables que solo se usan en atributos `style` en línea o en JS no se inyectan.
- Le paso el objeto `OpenProps` entero una vez. El plugin lo usa como tabla de consulta, así que no listo las variables a mano.
- Los bloques `<style>` de Svelte también pasan por el pipeline de CSS de Vite, así que una sola configuración de PostCSS cubre el CSS global y los componentes.
- `css.postcss` (plugins de PostCSS) y `plugins` (plugins de Vite) son listas distintas para herramientas distintas.
- Con un `css.postcss` en la configuración, Vite deja de buscar archivos `postcss.config.*`.

## Problemas y soluciones

- No había autocompletado para las variables de Open Props: con JIT no están definidas en ningún archivo CSS del proyecto, así que el editor no tenía nada que leer. Lo arreglé con el ajuste `lookupFiles` de la extensión.

## Enlaces

- [Open Props](https://open-props.style/)
- [postcss-jit-props](https://github.com/GoogleChromeLabs/postcss-jit-props)
- [Vite: css.postcss](https://vite.dev/config/shared-options#css-postcss)

## Siguiente

- Tokens semánticos en `tokens.css`.
