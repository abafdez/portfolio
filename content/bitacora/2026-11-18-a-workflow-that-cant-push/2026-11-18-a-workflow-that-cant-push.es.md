---
title: Un workflow que no puede hacer push
reviewed: false
---

## Qué hicimos

- Tests e2e más rápidos en CI: `fullyParallel` con un worker por núcleo, y el Google Chrome que ya trae el runner (`channel: 'chrome'`) en lugar de descargar Chromium (ese paso tardaba 27 s).
- El job de build ahora solo lee el repositorio (`contents: read`) y hace checkout con `persist-credentials: false`, así que el token no se queda en `.git/config` para que lo encuentren los scripts del build.
- Un job nuevo, `image-cache`, es el único que puede hacer push: hace checkout, descarga el artefacto `.image-cache` del build y lo commitea. No ejecuta código del repositorio ni de sus paquetes.
- `pages: write` e `id-token: write` pasaron de todo el workflow al job de despliegue.
- Cada action está fijada a un SHA de commit con la versión en un comentario, y `.github/dependabot.yml` abre una PR semanal cuando cambian (solo versiones con al menos 7 días).
- `concurrency` por rama: un push nuevo a una PR cancela la ejecución anterior; en `main` esperan en cola, para que dos commits de la caché nunca se pisen.
- Quité el `minimumReleaseAgeExclude` de `@sveltia/cms`: la 0.268.0 ya tiene edad suficiente.

## Qué aprendí

- Los permisos de un job son lo que puede hacer cualquier script que corra en él. El build ejecuta código de cientos de paquetes, así que no debería tener un token que pueda hacer push.
- Una etiqueta como `v7` se puede mover a otro código; un SHA de commit no. Dependabot es lo que evita que esos SHA se queden viejos.
- `upload-artifact` se salta los archivos ocultos por defecto, y `.image-cache` empieza por punto: `include-hidden-files: true`.

## Siguiente

- Ver cómo la primera ejecución en `main` commitea la caché desde el job nuevo.
