---
title: Desplegar SvelteKit 3 en GitHub Pages, paso a paso
description: Mi configuración de GitHub Actions para un proyecto de SvelteKit 3 en solitario. Las PR pasan comprobaciones, las fusiones a main despliegan y un artefacto conecta los dos jobs.
cover: Representación visual del pipeline de despliegue.
reviewed: false
---

Mi portfolio es un sitio estático con SvelteKit 3 alojado en GitHub Pages. Conseguir que el despliegue funcionara me costó una ristra de commits `fix:`, así que este artículo recorre el workflow final y explica para qué sirve cada pieza.

## La visión general

Trabajo solo, pero aun así uso ramas y pull requests. El workflow hace dos cosas distintas según lo que lo haya lanzado:

```
feature branch ──push──► open PR ──► check + lint + build        (no deploy)
                                       │
                                  green? merge
                                       ▼
                          push to main ──► check + lint + build + deploy
```

Nunca se despliega _desde_ una pull request. Desplegar en el evento `pull_request` publicaría código que nadie ha revisado. Se despliega cuando la PR se **fusiona**, y para GitHub una fusión no es más que un push a `main`.

Dentro de una misma ejecución, se ve así:

```
┌──────────── build job (VM 1) ────────────┐     ┌──── deploy job (VM 2) ────┐
│ checkout → install → check → lint →      │     │                           │
│ build → upload artifact (main only)      │ ──► │ deploy-pages (main only)  │
└──────────────────────────────────────────┘     └───────────────────────────┘
```

La idea clave es esta: **cada job se ejecuta en su propia máquina virtual recién creada.** Cuando `build` termina, su máquina y la carpeta `build/` desaparecen. Los jobs no comparten disco.

## Disparadores y permisos

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read # clone the repo
  pages: write # create a Pages deployment
  id-token: write # get an OIDC token so deploy-pages can prove who it is
```

`workflow_dispatch` añade un botón "Run workflow" en la pestaña Actions, que viene bien para volver a desplegar sin hacer un commit.

## El job de build

```yaml
- uses: actions/checkout@v7
- uses: pnpm/setup@v3.0.0
  with:
    cache: true
    runtime: node@22
- run: pnpm check
- run: pnpm lint
- run: pnpm run build
- uses: actions/upload-pages-artifact@v5
  with:
    path: build/
```

- **checkout**: la máquina empieza vacía, así que esto clona el repositorio en ella.
- **pnpm/setup**: instala Node 22 (SvelteKit 3 lo necesita) y pnpm, y luego instala las dependencias con caché.
- **check / lint**: `svelte-check` detecta errores de tipos y de Svelte, y Prettier los de formato. Si falla cualquiera de los dos, la ejecución se detiene antes de construir nada.
- **build**: `adapter-static` prerenderiza todas las páginas en `build/`.
- **upload-pages-artifact**: empaqueta `build/` en un archivo tar y lo guarda en GitHub como un artefacto llamado `github-pages`, asociado a esta ejecución.

## El job de deploy

```yaml
deploy:
  needs: build
  environment:
    name: github-pages
    url: ${{ steps.deployment.outputs.page_url }}
  steps:
    - id: deployment
      uses: actions/deploy-pages@v5
```

Este job **no tiene checkout ni build**. Nunca ve mi código. Usa el token OIDC para decirle a la API de Pages que publique el artefacto `github-pages` de esta ejecución. Por eso el artefacto no es opcional: es la única forma de que los archivos lleguen de la máquina 1 a GitHub Pages.

`needs: build` hace que espere a que termine el build, y `environment` hace que la URL publicada aparezca en la página de la ejecución.

## Comprobar en las PR, desplegar solo desde main

Un solo archivo de workflow sirve para los dos casos. El job `build` siempre se ejecuta, y las partes del despliegue están condicionadas con un `if:`.

Mi primera idea fue `github.event_name != 'pull_request'`, que significa "despliega salvo que sea una PR". Eso tiene un agujero: el botón manual **Run workflow** te deja elegir _cualquier_ rama, así que desplegaría una rama a medio hacer. La pregunta correcta es **¿qué rama es esta?**, y `github.ref` la responde:

| Disparador                         | `github.ref`           | ¿Despliega? |
| ---------------------------------- | ---------------------- | ----------- |
| Push / PR fusionada en `main`      | `refs/heads/main`      | ✅          |
| Ejecución manual desde `main`      | `refs/heads/main`      | ✅          |
| Ejecución manual desde `feature-x` | `refs/heads/feature-x` | ❌          |
| Pull request #12                   | `refs/pull/12/merge`   | ❌          |

Así que las dos barreras usan la misma condición:

```yaml
      - name: Upload GitHub Pages artifact
        if: github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v5
        with:
          path: "build/"

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
```

El paso de subida también lleva el `if:`. Sin él, cada PR subiría un artefacto que nunca se despliega.

Dos detalles pequeños:

- **No hace falta `${{ }}`:** dentro de `if:`, GitHub evalúa el texto como una expresión automáticamente.
- **Comillas simples:** las cadenas de las expresiones tienen que ir entre `'comillas simples'`. Las dobles son un error de sintaxis.

También separé `pnpm check`, `pnpm lint` y `pnpm build` en pasos distintos. Cuando uno falla, la interfaz de Actions muestra exactamente cuál, en vez de una sola caja roja de "check, lint, and build".

Preferí un archivo con condiciones a dos archivos separados (`ci.yml` + `deploy.yml`) porque si no el checkout, la preparación y el build estarían duplicados en los dos, y tendría que mantenerlos sincronizados.

En una PR, la página de la ejecución muestra `build` ✅ y `deploy` como **skipped**, y así compruebo que las condiciones funcionan.

## Concurrencia: solo los despliegues deberían esperar

Las plantillas ponen esto en el nivel superior del workflow:

```yaml
concurrency:
  group: 'pages'
  cancel-in-progress: false
```

En el nivel superior se aplica a _todas_ las ejecuciones, así que la comprobación de una PR esperaría en la cola detrás de un despliegue en curso. Solo importa en los despliegues, donde dos a la vez podrían terminar en el orden equivocado, así que lo moví dentro del job `deploy`.

```yaml
deploy:
  needs: build
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  concurrency:
    group: 'pages'
    cancel-in-progress: false
```

`cancel-in-progress: false` significa que un despliegue nuevo espera al que está en marcha en vez de cortarlo a medias.

## Proteger main

La CI solo ayuda si no puedo saltármela. En GitHub, en **Settings → Rules → Rulesets**, añadí un conjunto de reglas para `main` con:

- **Require a pull request before merging**, así que nada de pushes directos a `main`, ni siquiera míos.
- **Require status checks to pass**, con el job `build` seleccionado, así que una PR en rojo no se puede fusionar.

Una trampa: la lista de comprobaciones estaba **vacía** la primera vez que abrí el conjunto de reglas. GitHub solo ofrece comprobaciones que ya se han ejecutado en el repositorio, así que primero tuve que abrir una PR, dejar que `build` informara y luego exigirlo. Si cambias el nombre del job más adelante, actualiza también el conjunto de reglas. Si no, las PR esperarán para siempre una comprobación que nunca llega.

Además, pon **Required approvals a 0** si trabajas solo, porque no puedes aprobar tu propia PR.

Ahora `main` siempre coincide con el sitio publicado, y el sitio publicado siempre ha pasado check, lint y build.

## El paso que quité: configure-pages

Casi todas las plantillas incluyen `actions/configure-pages`. Lee la configuración de Pages del repositorio y devuelve valores como `base_path`. Si le pasas `static_site_generator: sveltekit`, también intenta modificar tu archivo de configuración. Esa modificación espera un `svelte.config.js`, pero SvelteKit 3 guarda su configuración en `vite.config.js`. No usaba sus valores, así que lo quité.

## Trampa: la ruta base

Un repositorio de proyecto se despliega en `https://<usuario>.github.io/<repo>/`, no en la raíz del dominio. SvelteKit tiene que saberlo mediante `paths.base`, y los enlaces tienen que usar `resolve()` de `$app/paths` en vez de URLs escritas a mano como `/about/`. Si no, el CSS carga (las rutas de los recursos son relativas por defecto), pero los enlaces internos dan 404. [Lee más](/devlog/2026-10-21-layout-routing-base-path/) sobre cómo funciona esta configuración en la [devlog](/devlog/).

## Lo siguiente

- Arreglar la ruta base para que los enlaces internos funcionen bajo `/portfolio/`.
- Añadir tests (Vitest, Playwright) al mismo job `build` cuando haya algo que merezca la pena probar.
