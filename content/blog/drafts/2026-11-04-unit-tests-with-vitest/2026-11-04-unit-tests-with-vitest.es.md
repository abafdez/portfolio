---
title: 'Mis primeros tests unitarios encontraron un bug a la primera'
description: Nunca había escrito un test. Añadir Vitest a mi sitio con SvelteKit, probar tres funciones pequeñas y el caso límite que resultó ser un bug de verdad.
reviewed: false
---

Nunca había escrito un test. Mi sitio tenía comprobación de tipos (`pnpm check`) y un formateador (`pnpm lint`), y miraba cada cambio en el navegador. Eso detecta mucho, pero no todo: una función puede estar bien tipada, bien formateada, verse bien en cada página que abro y aun así fallar con una entrada que nunca probé.

Un **test unitario** prueba esas entradas por mí. Llama a un trozo pequeño de código (una unidad, normalmente una función) con una entrada que elijo yo y comprueba que la salida es la que espero. Y lo hace cada vez que ejecuto los tests, así que un cambio que lo rompa no puede colarse.

<!-- TODO: qué vi primero, y qué me hizo entenderlo (el curso intensivo de Net Ninja, abajo) -->

## Qué probar primero

El código más fácil de probar es una **función pura**: misma entrada, misma salida, y no cambia nada fuera de sí misma. Mi `content.ts` tiene tres:

- `summary(text)`: una descripción de una línea sacada de un archivo markdown (el primer párrafo, como texto sin formato, cortado a 160 caracteres para los resultados de búsqueda);
- `readingTime(text)`: los minutos de lectura, a 200 palabras por minuto;
- `checkTags(path, tags)`: lanza un error si una etiqueta no está en minúsculas y kebab-case.

Sin navegador, sin red, sin página: entra texto y sale un valor. Los primeros tests perfectos.

## Preparar Vitest

[Vitest](https://vitest.dev/) es el ejecutor de tests hecho para Vite, y mi sitio se construye con Vite. Para instalarlo:

```sh
pnpm add -D vitest
```

No hay archivo de configuración nuevo. Vitest lee `vite.config.ts`, así que solo le dije dónde están mis tests:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
	// …plugins, as before
	test: {
		include: ['src/**/*.test.ts']
	}
});
```

`vitest/config` exporta el mismo `defineConfig` que Vite, más los tipos de `test`. Y como los tests se ejecutan con mi configuración real, importan los archivos exactamente como el sitio: funcionan las rutas `#lib/…` y también `import.meta.glob`.

Dos scripts en `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

`vitest run` lo ejecuta todo una vez (lo que hará la CI). `vitest` a secas se queda abierto y vuelve a ejecutar los tests cada vez que guardo un archivo.

## La forma de un test

Un archivo de test va junto al archivo que prueba: `content.ts`, `content.test.ts`.

```ts
import { describe, expect, test } from 'vitest';
import { summary } from './content.ts';

describe('summary', () => {
	test('takes the first list item, without its marker', () => {
		expect(summary(file('## What we did\n\n- First bullet.\n- Second bullet.'))).toBe(
			'First bullet.'
		);
	});
});
```

- `describe()` agrupa tests bajo un nombre.
- `test()` es un caso: un nombre que dice qué debería pasar, y una función.
- `expect(value)` más un **matcher** es la comprobación. `toBe` es "es exactamente esto". Si no lo es, el test falla.

`file()` es una pequeña ayuda mía que envuelve un cuerpo en un frontmatter, para que cada test solo escriba la parte que le importa.

Otros matchers que necesité:

```ts
expect(result.length).toBeLessThanOrEqual(160);
expect(result).toMatch(/word…$/); // a regular expression
expect(() => checkTags('post.md', ['CSS'])).toThrow('tags must be lowercase');
```

El último me hizo tropezar. `toThrow` necesita una **función** a la que llamar y vigilar. Si escribo `expect(checkTags(…))`, `checkTags` lanza el error antes de que `expect` llegue a empezar, y el test se rompe en vez de pasar.

## Un test, muchas entradas

Para las etiquetas, quería probar muchas buenas y malas. `test.each` ejecuta el mismo test una vez por cada valor:

```ts
test.each(['CSS', 'design tokens', 'design--tokens', '-css', 'css-'])('rejects "%s"', (tag) => {
	expect(() => checkTags('post.md', [tag])).toThrow('post.md: tags must be lowercase');
});
```

`%s` mete el valor en el nombre del test, así que el informe dice exactamente cuál falló.

## Los casos límite son donde están los bugs

El primer test (un punto normal) pasó a la primera, claro: es el caso que llevaba todo el tiempo mirando en el navegador. Los tests útiles son las entradas raras:

- un archivo vacío;
- un texto con la longitud justa para cortarse justo después de una coma (`uno dos,…` parece roto, así que debería ser `uno dos…`);
- un enlace, que debería quedarse solo en su texto;
- un nombre con un guion bajo, como `page_data`, que tiene que conservarlo;
- un cuerpo que **empieza con un bloque de código**.

Ese último falló:

```text
FAIL  summary > skips a code block at the start, not just its fence
AssertionError: expected 'const x = 1;' to be 'The text.'
```

`summary()` se saltaba las líneas que empiezan por tres comillas invertidas, así que se saltaba la valla y luego cogía la primera línea de código como descripción. Ninguna entrada de la Bitácora empieza todavía con código, así que nada en el sitio lo mostraba. La primera que lo hiciera habría tenido `const x = 1;` como resultado de búsqueda.

El arreglo quita los bloques de código enteros antes de buscar la primera línea:

```ts
const codeBlock = /^(`{3,})[^\n]*\n[\s\S]*?^\1/gm;
```

``(`{3,})`` captura la valla de apertura (tres comillas invertidas o más), y `\1` significa "lo mismo otra vez", así que el bloque termina en una valla con tantas comillas como la de apertura. Un bloque de cuatro comillas que muestra dentro uno de tres también se va entero. Y eso tuvo su propio test.

<!-- TODO: probarlo: romper summary() a propósito (borrar la línea de codeBlock) y ejecutar pnpm test:watch. ¿Qué dice el informe? -->

## Un test sobre el contenido real

El último test no usa entradas inventadas. Lee mis entradas reales de la Bitácora y comprueba que cada una recibe una descripción de entre 1 y 160 caracteres:

```ts
test.each(allLog.map((entry) => [entry.slug, entry.description]))(
	'%s has a description of 1 to 160 characters',
	(_slug, description) => {
		expect(description.length).toBeGreaterThan(0);
		expect(description.length).toBeLessThanOrEqual(160);
	}
);
```

Si algún día escribo una entrada que empiece solo con un encabezado, este test nombra el archivo.

## Enlaces

- [Vitest: primeros pasos](https://vitest.dev/guide/)
- [Vitest: la API de expect](https://vitest.dev/api/expect.html)
- [Vitest: test.each](https://vitest.dev/api/#test-each)
- [Net Ninja: Unit Testing Crash Course (Vitest)](https://www.youtube.com/playlist?list=PL4cUxeGkcC9iyuClsf48SSgsJPBStHo7F)
