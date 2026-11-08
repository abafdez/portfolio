---
title: Un fallo de contraste que la auditoría no vio
reviewed: false
---

## Qué hicimos

- Descubrí que `--text-2` (`gray-6`) solo llegaba a unos 3:1 sobre las superficies claras, por debajo del mínimo de 4,5:1 para el texto. Lo cambié a `gray-7` (7,3:1 o más) y `--text-1` a `gray-9`, para que los dos sigan siendo distintos.
- Pasé Lighthouse desde la línea de comandos contra el build de previsualización, en los dos temas: 100 en la portada y en la página del CV.

## Qué aprendí

- Lighthouse pasó en la fase 3 porque ninguna página usaba todavía `--text-2`. Una auditoría solo comprueba los colores que una página usa de verdad. Hay que comprobar el contraste de un par de tokens al definirlo.
- Lighthouse CLI desde WSL, con el Chromium de Playwright:
  `CHROME_PATH=~/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome pnpm dlx lighthouse@12 <url> --only-categories=accessibility --chrome-flags="--headless=new --no-sandbox"`
- Para el modo oscuro, añade `--force-dark-mode` a las opciones de Chrome. `--force-prefers-color-scheme=dark` no existe, y Chrome lo ignora sin avisar. Solo me di cuenta al comprobar `matchMedia` en Chrome sin interfaz.
- Lección: cuando una opción "funciona", comprueba que de verdad hizo algo.

## Problemas y soluciones

- Mi primera pasada "oscura" de Lighthouse en realidad era clara. Mira arriba.
- La página del Devlog saca un 98 (`heading-order`: del `h1` salta a `h3`). Ya estaba así, y la página se rehace en la fase 6.

## Enlaces

- [WCAG: contraste (mínimo)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [Lighthouse CLI](https://github.com/GoogleChrome/lighthouse#using-the-node-cli)

## Siguiente

- Arreglar el orden de los encabezados del Devlog en la fase 6.
