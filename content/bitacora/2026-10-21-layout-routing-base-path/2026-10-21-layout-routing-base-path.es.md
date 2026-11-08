---
title: Layout, rutas y la ruta base de GitHub Pages
reviewed: false
---

## Qué hicimos

- Puse `paths.base` a partir de `BASE_PATH`, que la CI fija como `/${{ github.event.repository.name }}`. El valor se valida en `vite.config.ts`, y el build lanza un error si está mal formado.
- Creé rutas vacías: `/cv`, `/projects`, `/awesome`, `/blog`, `/bitacora`. Moví el contenido de `/dev` a `/bitacora`.
- Construí `Header`, `Nav` y `Footer` en `src/lib/components/` y envolví las páginas en `<main>`.
- El menú se construye a partir de un array tipado (`href: RouteId`) con un `{#each}` con clave, y el enlace activo recibe `aria-current="page"`.

## Qué aprendí

- `process` necesita `@types/node`. El `include` de `tsconfig` recibe rutas de archivos, no nombres de paquetes.
- `as` no comprueba nada. Primero se validan los valores en tiempo de ejecución (variables de entorno) y luego se hace el cast. Un cast justo después de una comprobación es honesto.
- Los tipos protegen los valores escritos en el código. Las comprobaciones en tiempo de ejecución protegen los que llegan de fuera, como las variables de entorno, lo que escribe el usuario y el frontmatter.
- `resolve()` solo acepta rutas reales. Tipar `href` como `RouteId` convirtió las erratas y las rutas inexistentes en errores de tipos.
- `href="resolve('/')"` es un texto. `href={resolve('/')}` es código, y svelte-check no distingue uno de otro.
- En GitHub Pages, `page.url.pathname` incluye la base, así que hay que compararlo con `resolve(href)`.
- Svelte quita los atributos cuyo valor es `undefined`, lo que deja limpio `aria-current={active ? 'page' : undefined}`.
- Los enlaces prerenderizados son relativos (`./blog`), así que `/portfolio` no aparece en el HTML.
- `VAR=x a && b` solo fija `VAR` para `a`. Para previsualizar como en GitHub Pages: `BASE_PATH=/portfolio pnpm build && BASE_PATH=/portfolio pnpm preview`.
- Un solo `<h1>` por página. El nombre del sitio en la cabecera no es un encabezado.

## Problemas y soluciones

- `pnpm lint` fallaba en el workflow por las comillas dobles. Hay que leer qué archivo nombra la herramienta antes de culpar al entorno (Node 24 frente a 22 no era la causa).
- Los href del menú eran `'home'` y `'about'` (sin `/`, y rutas que no existen). El tipo `RouteId` los detectó.

## Siguiente

- Fase 3: sistema de diseño con Open Props.
