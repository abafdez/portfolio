---
title: Revisión de accesibilidad con Lighthouse
reviewed: false
---

## Qué hicimos

- Pasé la auditoría de accesibilidad de Lighthouse sobre el build de previsualización (`BASE_PATH=/portfolio pnpm build && BASE_PATH=/portfolio pnpm preview`), no sobre desarrollo. Pasa.
- Arreglé lo que encontró: la portada no tenía `<title>`. Ahora tiene `Alfonso Baeza · Portfolio`. También corregí una errata en el título de Proyectos.

## Qué aprendí

- Hay que auditar el build de previsualización, no `pnpm dev`. Desarrollo no es lo que se publica: no usa ruta base, no minifica y sirve los módulos sin empaquetar.
- Cada página necesita su propio `<title>` en `<svelte:head>`. Es lo primero que anuncia un lector de pantalla, y es lo que se ve en las pestañas y los marcadores.
- Las extensiones del navegador afectan a los resultados de Lighthouse. Dark Reader aparecía en los diagnósticos aunque estuviera desactivado para mi sitio, porque su script se sigue cargando en todas las páginas. Hay que auditar sin extensiones:
  - una ventana de incógnito (las extensiones están desactivadas salvo que se permitan ahí),
  - un perfil de Chrome aparte o el modo invitado, sin extensiones,
  - o la CLI, que arranca un Chrome limpio: `pnpm dlx lighthouse <url> --only-categories=accessibility --view`. Desde WSL necesita `CHROME_PATH`.
- `<meta name="darkreader-lock">` le dice a Dark Reader que deje en paz un sitio. No lo añadí: se impone a lo que el visitante haya elegido en la extensión.

## Enlaces

- [La puntuación de accesibilidad de Lighthouse](https://developer.chrome.com/docs/lighthouse/accessibility/scoring)
- [Lighthouse CLI](https://github.com/GoogleChrome/lighthouse#using-the-node-cli)

## Siguiente

- Abrir la PR de la fase 3.
