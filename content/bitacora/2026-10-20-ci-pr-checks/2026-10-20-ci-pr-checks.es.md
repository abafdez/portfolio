---
title: Una CI que comprueba las PR y solo despliega desde main
reviewed: false
---

## Qué hicimos

- Quité `actions/configure-pages`. Nada usaba sus valores.
- Separé `check`, `lint` y `build` en pasos distintos de la CI.
- Condicioné la subida del artefacto y el job `deploy` con `if: github.ref == 'refs/heads/main'`, para que las PR solo construyan y comprueben.
- Moví `concurrency: pages` del nivel superior al job `deploy`, para que las comprobaciones de las PR no esperen en la cola detrás de los despliegues.
- Pasé `pnpm format` por el repositorio y activé el formateo al guardar en `.vscode/settings.json`. Recomendé la extensión de Prettier.
- Empecé un artículo del blog que explica el workflow (`content/blog/`, todavía en borrador).

## Qué aprendí

- Cada job se ejecuta en su propia máquina virtual recién creada. El artefacto de Pages es la forma de que `build/` pase del job de build al de deploy.
- No se despliega _desde_ una PR. Una PR fusionada es un push a `main`.
- `github.ref` es más seguro que `github.event_name`: una ejecución manual desde una rama de funcionalidad tiene `event_name == workflow_dispatch`, pero la referencia equivocada.
- Dentro de `if:` no hay `${{ }}`, y las cadenas van entre comillas simples.
- `pnpm lint` (`prettier --check`) solo informa. `pnpm format` (`prettier --write`) arregla. Aquí "lint" solo es formato; todavía no hay ESLint.
- Los ajustes de `.vscode/` para todo el proyecto se suben al repositorio, y las preferencias personales van en los ajustes de usuario.

## Problemas y soluciones

- El conjunto de reglas no tenía comprobaciones de estado para elegir. Una comprobación solo aparece después de ejecutarse al menos una vez, así que primero hay que abrir una PR y luego crear el conjunto de reglas.

## Siguiente

- Escribir el README, abrir la PR, confirmar que `deploy` se salta, añadir el conjunto de reglas y fusionar.
- Fase 1: la migración a TypeScript.
