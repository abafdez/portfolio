---
title: Planificar el portfolio como una ruta de aprendizaje
reviewed: false
---

## Qué hicimos

- Revisamos la base de SvelteKit 3: adapter-static, runes obligatorias y CI hacia GitHub Pages.
- Planificamos 10 fases (0–9): workflow → TypeScript → layout y rutas → Open Props → Hero → CV → Bitácora (mdsvex) → Blog → Subproyectos y Awesome-X → calidad y SEO.
- Decidido: mdsvex para el markdown, pasar a TypeScript, Bitácora = diario de desarrollo breve (separado del Blog), yo escribo el código y Claude lo revisa.
- Creé las carpetas del proyecto: `.claude/` (skills, agentes, guía del proyecto) y `content/{bitacora,blog,awesome}`.

## Qué aprendí

- Enlaces como `/dev/` pueden romperse en GitHub Pages por culpa de la ruta base. Hay que usar `resolve()` de `$app/paths`.
- Mi CI también desplegaba en las pull requests, así que podía publicarse código sin revisar.
- Git no sigue las carpetas vacías, y por eso existen los archivos `.gitkeep`.

## Siguiente

- Fase 0: separar la CI para que las PR solo construyan y comprueben, arreglar el enlace de Open Props, añadir `pnpm check`/`lint` a la CI y escribir el README.
