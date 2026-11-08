---
title: Habilidades en YAML, iconos como datos y un sprite SVG
reviewed: false
---

## Qué hicimos

- Planifiqué lo siguiente: me presento a distintos tipos de empleo y necesito un CV para cada uno. La fase 5.5 será un generador de CV (una herramienta de `/projects`: eliges un perfil de empleo y obtienes un CV que lea bien un ATS), con mis datos personales guardados en mi navegador, nunca en el repositorio. Primero, las habilidades tenían que ser fáciles de editar y saber para qué empleos importan.
- Las habilidades pasaron de `skills.ts` a `content/skills.yaml`. Los iconos son nombres (un slug de Simple Icons o un nombre de Lucide), y cada habilidad lista sus perfiles de empleo: `web`, `support`, `mainframe`.
- `skills.server.ts` lee y comprueba el archivo al construir el sitio. `/about` recibe las habilidades de un load en `+page.server.ts`.
- Los logos de marca salen de `/logos.svg`, un sprite que escribe al construir el sitio un endpoint `+server.ts`. Las páginas los dibujan con `<use href>`.

## Qué aprendí

- Un módulo `.server.ts` solo puede importarlo código de servidor; SvelteKit se niega a empaquetarlo para el navegador. Las librerías de iconos se importan ahí, así que no pueden llegar a la página por accidente.
- Un load de servidor solo puede enviar datos. Los iconos de Lucide viajan como pares `[etiqueta, atributos]` (del paquete `lucide` sin más) y `<svelte:element>` los dibuja; dentro de un `<svg>` crea elementos SVG.
- Los datos de un load de servidor van incrustados en la página para la hidratación. Un sprite dibujado en la página ponía cada trazado dos veces en el HTML: una dibujado y otra en esos datos. Un archivo aparte los deja fuera de la página.
- Una carpeta llamada `logos.svg` en `src/routes/` sirve `/logos.svg`. Un endpoint necesita su propio `export const prerender = true` (el del layout solo llega a las páginas) y una entrada en `prerender.entries` (el rastreador sigue enlaces, y `<use href>` no es uno).
- TypeScript solo estrecha después de `if (!x) fail()` cuando `fail` es una declaración de función (o un const con una anotación de tipo) que devuelve `never`, no una función flecha sin tipo.

## Problemas y soluciones

- El primer build no tenía `logos.svg` ni ningún error: el endpoint no se prerenderizaba y nada lo enlazaba.
- Mi comparación de tamaños usaba `git stash`, que deja atrás los archivos nuevos (sin seguimiento), así que el build del "antes" era medio código nuevo. Hay que comparar con un commit.

## Enlaces

- [SvelteKit: `+server`](https://svelte.dev/docs/kit/routing#server)
- [SvelteKit: módulos solo de servidor](https://svelte.dev/docs/kit/server-only-modules)
- [SvelteKit: entradas del prerender](https://svelte.dev/docs/kit/configuration#prerender)
- [Svelte: `<svelte:element>`](https://svelte.dev/docs/svelte/svelte-element)
- [MDN: `<use>`](https://developer.mozilla.org/es/docs/Web/SVG/Element/use)
- [Lucide: el paquete `lucide`](https://lucide.dev/guide/packages/lucide)

## Siguiente

- Editar `content/skills.yaml`: mis niveles, los perfiles, lo que falta.
- Un filtro por perfil en `/about`, y luego la fase 5.5, el generador de CV.
