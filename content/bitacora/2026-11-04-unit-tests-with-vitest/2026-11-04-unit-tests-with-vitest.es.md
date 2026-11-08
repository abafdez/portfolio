---
title: Mis primeros tests unitarios, y el bug que encontraron
reviewed: false
---

## Qué hicimos

- Añadí Vitest 5.1 (`pnpm add -D vitest`), con `pnpm test` (se ejecuta una vez) y `pnpm test:watch` (se vuelve a ejecutar cada vez que guardo).
- Sin archivo de configuración nuevo: Vitest lee `vite.config.ts`. Ahora importa `defineConfig` desde `vitest/config` (el de Vite, más los tipos de `test`) y tiene `test: { include: ['src/**/*.test.ts'] }`.
- `src/lib/content.test.ts`: 72 tests para `summary()`, `readingTime()` (que ahora se exporta) y `checkTags()`, más uno por cada entrada real de la Bitácora, que comprueba que cada una recibe una descripción de entre 1 y 160 caracteres.
- La primera ejecución falló en un test, y era un bug real: un cuerpo que empezaba con un bloque de código recibía como resumen la primera línea del código. Ahora `summary()` quita primero los bloques de código enteros.

## Qué aprendí

- Un **test unitario** llama a un trozo pequeño de código (una "unidad", aquí una función) con una entrada que elijo yo y comprueba la salida. Las funciones puras (misma entrada, misma salida, sin efectos secundarios) son las más fáciles de probar, y por eso `content.ts` fue el primero.
- La forma: `describe()` agrupa tests, `test()` es un caso, `expect(value).toBe(expected)` es la comprobación. Los matchers que usé: `toBe`, `toMatch` (una expresión regular), `toBeLessThanOrEqual` y `toThrow` / `not.toThrow`.
- `toThrow` necesita una **función** a la que llamar: `expect(() => checkTags(…)).toThrow()`. Con `expect(checkTags(…))`, el error ocurre antes de que `expect` llegue a ejecutarse.
- `test.each([...])` ejecuta el mismo test una vez por cada valor, y `%s` mete el valor en el nombre.
- Los casos límite son donde están los bugs: un archivo vacío, un corte justo después de una coma, un bloque de código al principio. El camino feliz ya funcionaba.
- Vitest se ejecuta con la misma configuración de Vite que el sitio, así que `import.meta.glob` y `#lib/…` también funcionan en los tests. Por eso el último test puede leer las entradas de verdad.
- Un test que falla dice exactamente qué esperaba y qué obtuvo: `expected 'const x = 1;' to be 'The text.'`.

## Problemas y soluciones

- `summary()` se saltaba la línea con la valla de apertura, pero no las líneas de dentro del bloque. La solución es una expresión regular, ``/^(`{3,})[^\n]*\n[\s\S]*?^\1/gm``: `\1` es "tantas comillas invertidas como la valla de apertura", así que un bloque de cuatro comillas con uno de tres dentro se va entero.

## Enlaces

- [Vitest: primeros pasos](https://vitest.dev/guide/)
- [Vitest: la API de expect](https://vitest.dev/api/expect.html)
- [Vitest: test.each](https://vitest.dev/api/#test-each)
- [Net Ninja: Unit Testing Crash Course (Vitest), YouTube](https://www.youtube.com/playlist?list=PL4cUxeGkcC9iyuClsf48SSgsJPBStHo7F)

## Siguiente

- Una prueba de humo con Playwright: cada enlace del menú carga en el sitio construido.
- Ejecutar `pnpm test` en la CI, en cada PR.
