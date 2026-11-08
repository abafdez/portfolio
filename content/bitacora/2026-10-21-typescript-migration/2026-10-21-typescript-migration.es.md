---
title: La migración de JS + JSDoc a TypeScript
reviewed: false
---

## Qué hicimos

- Renombré `jsconfig.json` → `tsconfig.json` y apunté a él los scripts de `check`.
- Renombré `vite.config.js`, `src/routes/+layout.js` y `src/lib/index.js` a `.ts`. Actualicé la entrada `#lib` del mapa `imports` en `package.json`.
- Pasé `+layout.svelte` a `<script lang="ts">` y tipé `$props()` con `Snippet`.
- Documenté las interfaces `App` en `app.d.ts`.

## Qué aprendí

- **0 errores no significa tipado.** Después de quitar el JSDoc, `children` era `any` en silencio y svelte-check seguía pasando.
- `import type` desaparece al construir. Solo existe para el comprobador de tipos.
- `app.d.ts` contiene los tipos globales. `export {}` convierte el archivo en un módulo, así que hace falta `declare global` para que `App.*` se vea en todas partes.
- En un sitio estático, `Locals` y `Platform` prácticamente no se usan porque no hay servidor en tiempo de ejecución. `PageData`, `PageState` y `Error` sí pueden importar en el cliente.
- Git muestra los renombrados como borrado + añadido hasta que los archivos están en el stage. `git mv` los registra directamente.

## Problemas y soluciones

- `pnpm lint` fallaba porque `package.json` perdió el salto de línea final tras la edición. Lo arreglé con `pnpm format`.

## Siguiente

- Fase 2: layout, rutas y ruta base (`resolve()` de `$app/paths`).
