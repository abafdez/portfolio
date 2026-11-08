---
title: Una prueba de humo en un navegador de verdad, y tests en la CI
reviewed: false
---

## Qué hicimos

- Añadí Playwright 1.64.1 (`@playwright/test`) y una prueba de humo, `e2e/navigation.test.ts`: lee los enlaces del menú principal y luego pulsa cada uno (el router) y abre cada uno directamente (una carga completa de página), comprobando la URL, un `h1`, `aria-current="page"`, un 200, el título y que no haya errores en la página.
- `playwright.config.ts`: Playwright arranca `pnpm preview` en el puerto 4174 con `BASE_PATH=/portfolio`, así que los tests se ejecutan sobre el sitio construido con su ruta base. `pnpm test:e2e` construye primero y luego los ejecuta.
- La CI ejecuta `pnpm test` después del lint, y la prueba de humo después del build. Cuando falla, las trazas se suben como artefacto.
- `tsconfig.json` ahora incluye `e2e/` y `playwright.config.ts`, así que `pnpm check` también les comprueba los tipos.
- Dos etiquetas rechazadas más en los tests unitarios: `bitácora` (una tilde) y `css_grid` (un guion bajo).

## Qué aprendí

- Una **prueba de humo** solo comprueba que no hay nada gordo roto: cada página del menú carga. Un test **de extremo a extremo (e2e)** maneja un navegador de verdad por el sitio construido, como un visitante. Los tests unitarios llaman a funciones; los e2e hacen clic.
- El rastreador del prerenderizado ya hace fallar el build con un enlace roto, así que la prueba de humo comprueba lo que un build no puede ver: el JS. Un error de hidratación deja el HTML en pantalla sin nada funcionando detrás. Escuchar los errores de `pageerror` y de `console` lo detecta.
- Rompí la página de Proyectos a propósito (un error en `onMount`): el build pasó, y los dos tests fallaron, nombrando la página.
- El test lee los enlaces del menú (`getByRole('navigation', { name: 'Main navigation' })`), así que una sección nueva se prueba sin tocar el test. Los localizadores por rol y nombre son como encuentra las cosas un lector de pantalla, así que también comprueban que la página está bien etiquetada.
- `expect(page).toHaveURL()` y `expect(locator).toBeVisible()` **esperan** (hasta 5 s) a que se cumplan. Un clic inicia una navegación que tarda un momento, y estos esperan por ella, sin ningún `sleep`.
- `test.step()` le pone nombre a una parte de un test, así que el informe dice qué enlace falló.
- pnpm rechaza las versiones de paquetes publicadas hace muy poco (`minimumReleaseAge`): una versión comprometida suele detectarse en pocos días. Playwright 1.65.0 tenía un día, así que usé la 1.64.1 en vez de añadir una excepción.

## Problemas y soluciones

- `npm pkg set` se negaba a ejecutarse: el campo `devEngines` pide Node 22 y esta terminal tiene la 24. Edité `package.json` a mano.
- La primera versión de la lista de errores no decía de qué página venía un error. Ahora cada error empieza con la ruta de la página.

## Enlaces

- [Playwright: escribir tests](https://playwright.dev/docs/writing-tests)
- [Playwright: localizadores](https://playwright.dev/docs/locators)
- [Playwright: servidor web](https://playwright.dev/docs/test-webserver)
- [Playwright: integración continua](https://playwright.dev/docs/ci)
- [pnpm: minimumReleaseAge](https://pnpm.io/settings#minimumreleaseage)

## Siguiente

- Lighthouse ≥ 90 en todas las páginas (el último "terminado cuando" de la fase 9).
