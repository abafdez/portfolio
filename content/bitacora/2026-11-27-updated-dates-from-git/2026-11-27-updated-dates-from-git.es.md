---
title: Fechas de actualización desde git, y page-data explorado
reviewed: false
---

## Qué hicimos

- **Exploré el plugin page-data de mdsvex** con todos los artículos: su tiempo de lectura coincidió con el nuestro en 121 de 175 archivos (se salta el código, el nuestro lo cuenta a propósito), y su extracto no encontró nada en las 94 entradas del Devlog (empiezan con un título y una lista; él solo toma un primer párrafo). Así que nuestro tiempo de lectura y nuestros resúmenes se quedan.
- Lo que aporta es **cuándo cambió un artículo por última vez**. Elegí git como fuente en lugar de un campo `updated:` escrito a mano.
- Con `last_modified: 'git'` de page-data activado, un artículo con `:::steps` no se construía: `"steps" is not exported`, un choque entre una directiva estática y un plugin que aplaza trabajo, arreglado en la rama principal de mdsvex y aún sin publicar. Así que leemos git nosotros: `src/lib/git-dates.server.ts`, un solo `git log` al empezar la construcción.
- Cada artículo y entrada tiene una fecha `updated` (cada archivo de idioma la suya). La cabecera enseña "actualizado 2026-11-27" cuando es posterior a la fecha del artículo, la página recibe `article:modified_time`, y el `<lastmod>` del sitemap es la más reciente de los dos idiomas. CI descarga todo el historial (`fetch-depth: 0`).

## Qué aprendí

- `git log --name-status -M` dice cómo cambió cada archivo: `R100` es un renombrado que no cambió nada. El primer recuento fechaba 48 artículos en 2026-11-18, el día en que todos se movieron a una carpeta; no contar los renombrados puros y llevar las fechas a través de ellos lo arregló.
- Las fechas de git cuentan cada commit: 27 artículos enseñan ahora 2026-11-10, una pasada de formato. Una lista de commits que saltar (como `.git-blame-ignore-revs`) los dejaría fuera.

## Problemas y soluciones

- `ArticleHeader` se ejecuta en el navegador, así que la función de la fecha vive en su propio archivo (`content-dates.ts`) en lugar de en `content.ts`, que importa el texto de todos los artículos.

## Siguiente

- Un feed RSS, con estas fechas como hora de actualización de cada elemento.
