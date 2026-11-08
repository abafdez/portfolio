---
title: Editar las habilidades del CV, por perfil
reviewed: false
---

## Qué hicimos

- Una sección "Habilidades" en el generador de CV: cada grupo como un `<details>` (cerrado), cada habilidad de cada perfil con una casilla ("en el CV") y su texto en un campo, luego mis propias habilidades con Añadir y Quitar, y "Restablecer las habilidades de `<perfil>`".
- Los cambios son por perfil (el CV de mainframe puede dejar fuera lo que conserva el CV web), en `SkillEdits` (`edits.svelte.ts`), guardados en su propia clave de `localStorage`, `cv-builder-skills`.
- Se guardan como cambios sobre el YAML, no como una copia: `on` y `off` (nombres de habilidades que difieren del YAML), `labels` (mi texto) y `added` (las mías, por grupo). Una habilidad que se añada más tarde al YAML sigue apareciendo, y Restablecer solo olvida los cambios. Volver a dejar una habilidad como dice el YAML la quita de `on`/`off`.
- Exportar mete los cambios en el archivo bajo `skills`, e importar los vuelve a leer.
- `storage.ts`: `loadJson`/`saveJson` y las comprobaciones (`isObject`, `strings`, `stringRecord`), compartidas por las dos clases. Las habilidades llevan su `name` del YAML como clave estable.

## Qué aprendí

- `a ??= b` se evalúa como `b`, el objeto normal que pasé, no como el proxy de `$state` en que se convirtió. Los cambios hechos a través del objeto normal no se ven. Así que: `this.all[profile] ??= {…}`, y luego volver a leer `this.all[profile]`.
- Leer nunca debe escribir: la página llama a `get(profile)` mientras se renderiza, así que devuelve un objeto vacío compartido para un perfil sin cambios; solo los métodos de escritura crean uno.
- Los enlaces de función (`bind:checked={() => get, (v) => set}`) dejan que una casilla lea y escriba algo calculado, aquí "¿está en el CV?", que es el YAML más mis cambios.
- `isObject(x): x is Record<string, unknown>` es un type guard: después del `if`, TypeScript conoce el tipo. `filter((entry): entry is [string, string] => …)` hace lo mismo con `filter`.
- Después de Añadir, el foco va al campo nuevo (tras `tick()`, cuando ya está en la página); después de Quitar, a "Añadir una habilidad", que está cerca, no a `<body>`.
- `:checkbox` es de jQuery, no de CSS. Así que `[type='checkbox']`.

## Enlaces

- [Svelte: enlaces de función](https://svelte.dev/docs/svelte/bind#Function-bindings)
- [Svelte: tick](https://svelte.dev/docs/svelte/lifecycle-hooks#tick)
- [MDN: asignación lógica nula (??=)](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_assignment)
- [TypeScript: type predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- [MDN: accent-color](https://developer.mozilla.org/es/docs/Web/CSS/accent-color)

## Siguiente

- Usarlo de verdad: editar las habilidades de cada perfil e imprimir los tres CV. Luego la PR de la fase 5.5.
