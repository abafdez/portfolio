---
title: 'Iconos como datos, y un sprite SVG desde un endpoint de SvelteKit'
description: Mis habilidades pasaron de TypeScript a un archivo YAML. Los iconos vinieron con ellas como datos, las librerías de iconos dejaron de llegar al navegador y la página perdió la mitad de su peso.
cover: Iconos de aplicaciones que fluyen hacia un sprite SVG y de ahí a una página web.
reviewed: false
---

Mi página sobre mí lista unas setenta habilidades, cada una con un icono: un logo de marca de Simple Icons, o uno genérico de Lucide. Al principio la lista era un archivo TypeScript que importaba todos los iconos. Funcionaba, pero tenía dos problemas:

- **Editarla significaba editar código.** Añadir una habilidad era un import arriba y un objeto abajo, y quiero cambiar la lista a menudo (y filtrarla por el tipo de empleo al que me presento).
- **Pesaba mucho.** El JavaScript de la página llevaba todos los objetos de icono (cada Simple Icon tiene su trazado _y_ el SVG completo como texto), unos 44 KB comprimidos, y el HTML tenía el trazado de cada logo, dos veces. Lighthouse le daba un 91.

Este artículo cuenta cómo desaparecieron los dos.

## Las habilidades son un archivo YAML

Como mis [listas Awesome](./2026-11-02-filters-in-a-svelte-class), las habilidades ahora son datos, en `content/skills.yaml`:

```yaml
profiles:
  - id: web
    name: Web development
  - id: support
    name: IT support and systems

groups:
  - name: Web development
    id: web
    icon: globe
    skills:
      - name: Svelte and SvelteKit
        logo: svelte
        level: 2
        profiles: [web]
        note: 'This site: Svelte 5 runes, prerendered SvelteKit on GitHub Pages.'
```

Los iconos son nombres: `logo` es un slug de Simple Icons e `icon` un nombre de Lucide, los dos tal como aparecen en las webs de las librerías. `profiles` son los tipos de empleo para los que importa una habilidad, para que una página pueda mostrar solo las habilidades de, por ejemplo, los empleos de soporte.

## Un cargador que hace fallar el build

`skills.server.ts` lee el archivo al construir el sitio y comprueba todo lo que podría escribir mal: un logo o un icono que no existe, un nivel que no está entre 1 y 4, un perfil que no está declarado arriba, dos habilidades con el mismo nombre, un enlace de prueba que no es `https://`. Un error detiene el build y dice dónde está:

```
Error: content/skills.yaml, "Python" (Languages): "suport" isn't one of the profiles at the top
```

El `.server` del nombre del archivo importa. SvelteKit se niega a empaquetar un módulo `.server.ts` en el código del navegador, así que solo pueden importarlo los archivos `+page.server.ts`. Ahí es donde se importan las librerías de iconos, miles de iconos, y esa garantía los mantiene en la máquina del build.

## Los iconos como datos

Un load de servidor solo puede enviarle datos a la página: ni componentes ni funciones. Así que el cargador convierte cada icono en datos:

```ts
export type IconData = { logo: string } | { node: [string, Record<string, string>][] };
```

- **Un icono de Lucide** son unos pocos elementos SVG. El paquete `lucide` sin más (no el de Svelte) tiene cada icono como una lista de pares `[etiqueta, atributos]`: un icono de base de datos es una `ellipse` y dos `path`. Un componente los dibuja con `<svelte:element this={tag} {...attributes} />`. Dentro de un `<svg>`, Svelte sabe que tiene que crear elementos SVG.
- **Un logo de marca** es solo su slug. Su trazado está en otro sitio: en el sprite.

El JavaScript propio de la página pasó de unos 44 KB a 5 KB comprimidos.

## El sprite es un endpoint

Un sprite es un archivo SVG con muchas formas, cada una con un id. Una página dibuja una con `<use>`:

```svelte
<svg viewBox="0 0 24 24" fill="currentColor">
	<use href="{resolve('/logos.svg')}#svelte" />
</svg>
```

Ese archivo no lo escribo a mano. Un endpoint de SvelteKit lo construye a partir de las habilidades, y como el sitio está prerenderizado, se convierte en un archivo estático en el build:

```ts
// src/routes/logos.svg/+server.ts
import { logoPaths } from '#lib/skills/skills.server.ts';

export const prerender = true;

const paths = logoPaths.map(({ slug, path }) => `<path id="${slug}" d="${path}"/>`).join('');

export const GET = () =>
	new Response(`<svg xmlns="http://www.w3.org/2000/svg"><defs>${paths}</defs></svg>`, {
		headers: { 'content-type': 'image/svg+xml' }
	});
```

El nombre de la carpeta es la URL: `src/routes/logos.svg/` sirve `/logos.svg`. Necesitó dos cosas:

- **`export const prerender = true` en el propio endpoint.** Mi layout raíz ya dice `prerender = true`, pero los layouts solo se aplican a las páginas, no a los endpoints.
- **Una entrada en `prerender.entries`.** SvelteKit encuentra las páginas que prerenderizar rastreando los enlaces desde la portada, y `<use href>` no es un enlace. Sin la entrada, el build terminaba tan contento y `logos.svg` simplemente no estaba.

Los trazados se quedan en el archivo, nunca en la página: ni en el HTML ni en los datos que SvelteKit incrusta en la página para la hidratación. (Mi primer intento tenía el sprite en línea, y los trazados acababan dos veces en el HTML: una dibujados y otra en esos datos.) `fill="currentColor"` sigue funcionando a través de `<use>`, así que cada logo sigue tomando su color del CSS.

## El resultado

|                                    | Antes  | Después |
| ---------------------------------- | ------ | ------- |
| `about.html`                       | 351 KB | 152 KB  |
| El JS de la página (comprimido)    | ~44 KB | ~5 KB   |
| `logos.svg` (comprimido, en caché) | nada   | 31 KB   |
| Rendimiento en Lighthouse          | 91     | 96      |
