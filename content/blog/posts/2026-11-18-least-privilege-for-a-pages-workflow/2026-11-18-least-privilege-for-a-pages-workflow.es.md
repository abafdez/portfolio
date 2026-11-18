---
title: Mínimo privilegio para un workflow de GitHub Pages
description: Mi job de build podía hacer push a main, y ejecuta código de cientos de paquetes. Separar el único job que escribe de los que compilan, fijar las actions a commits y un test de humo más rápido con el Chrome del propio runner.
reviewed: false
---

Mi workflow de despliegue commitea una cosa de vuelta al repositorio: la caché de imágenes codificadas, para que el siguiente build no las vuelva a codificar. Para eso, todo el job de build tenía `contents: write`, y `actions/checkout` dejaba el token en `.git/config`.

Ese job también ejecuta `pnpm install`, la comprobación de tipos, los tests y el build, es decir, código de cientos de paquetes que no he escrito yo. Cualquiera de ellos, comprometido, podría haber hecho push a `main`. Los permisos de un job son lo que puede hacer cualquier script que corra en él, así que la solución es no darle nada de eso al build.

## Un job compila, otro escribe

El job de build ahora solo lee:

```yaml
permissions:
  contents: read

jobs:
  build:
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7
        with:
          persist-credentials: false
```

Después del build, un paso comprueba si `.image-cache` ha cambiado y, si es así, lo sube como artefacto. Un segundo job, el único con `contents: write`, hace checkout, vacía `.image-cache`, descarga el artefacto dentro y commitea. No ejecuta código del repositorio ni de sus paquetes: checkout, descarga y `git`.

Dos detalles me pillaron. `upload-artifact` se salta los archivos ocultos por defecto, y `.image-cache` empieza por punto, así que necesita `include-hidden-files: true`. Y los `pages: write` e `id-token: write` del despliegue estaban puestos para todo el workflow; ahora están solo en el job de despliegue.

## Fijar las actions a commits

`uses: actions/checkout@v7` apunta a una etiqueta, y una etiqueta se puede mover a otro código. Un SHA de commit no. Así que cada action está fijada a su commit, con la versión en un comentario para las personas. Los SHA nunca se actualizan solos, así que un pequeño `dependabot.yml` abre una PR a la semana cuando cambian, solo con versiones de al menos siete días (la misma idea que el `minimumReleaseAge` de pnpm para los paquetes).

## Sin carreras en main

Un grupo de `concurrency` por rama: un push nuevo a una pull request cancela la ejecución anterior, y las de `main` esperan en cola en lugar de correr a la vez, para que dos commits de la caché nunca choquen.

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

## Un test de humo más rápido

Ese mismo día aceleré los tests de Playwright. Se ejecutaba un archivo por worker; con `fullyParallel` cada test va por su cuenta, con un worker por núcleo del runner. Y los runners de Ubuntu de GitHub ya traen Google Chrome, así que `channel: 'chrome'` en CI se ahorra descargar Chromium, que tardaba 27 segundos en cada ejecución.
