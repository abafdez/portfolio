---
title: Un CMS en un sitio de GitHub Pages
description: Mi CMS solo funcionaba en desarrollo. Ahora está dentro del sitio publicado, en /admin, como una segunda compilación de Vite, y el acceso con GitHub pasa por un pequeño Worker de Cloudflare que guarda el único secreto que un sitio estático no puede guardar.
reviewed: false
---

El CMS de mi sitio, [Sveltia](https://sveltiacms.app/en/docs), edita los artículos, el Devlog y las listas Awesome. Hasta ahora solo funcionaba en desarrollo: `pnpm dev`, abrir `/admin` y elegir la carpeta del repositorio. Útil en mi mesa e inútil en cualquier otro sitio. Ahora forma parte del sitio publicado.

## Una segunda compilación

`/admin` no es una página de SvelteKit a propósito: el layout raíz y el CSS del sitio lo envolverían, y no tiene nada que ver con ellos. Así que `pnpm build` hace dos compilaciones:

```json
"build": "vite build && vite build -c src/lib/cms/vite.config.ts"
```

La segunda es una compilación de Vite normal con el plugin de Svelte y las imágenes mejoradas, con la carpeta del CMS como raíz, que escribe `build/admin/`. El despliegue sube `build/`, así que el CMS sale publicado sin cambiar el workflow. Son unos 23 MB de archivos, sobre todo lenguajes del resaltado de código que se cargan bajo demanda; la página del CMS solo carga una parte.

En esa compilación se cambia un archivo. En desarrollo la vista previa del CMS lee las portadas de los artículos del servidor de desarrollo. Volver a incluir las 57 portadas originales solo para la vista previa serían 23 MB de imágenes, así que un pequeño plugin `resolveId` sustituye ese módulo por otro que apunta a las portadas en `raw.githubusercontent.com`.

## El secreto que un sitio estático no puede guardar

Para entrar con GitHub, el sitio tiene que cambiar el código de un solo uso de GitHub por un token, y ese cambio necesita el secreto del cliente de la aplicación. Un secreto no puede vivir en un sitio estático, donde cualquiera puede leer el JavaScript, y GitHub Pages no ejecuta código. Así que el autenticador de Sveltia, un script de un solo archivo, funciona como un Worker de Cloudflare y es lo único que lo guarda.

El Worker hace cuatro cosas:

- `/auth` comprueba que el sitio que pregunta es uno que permito, guarda un token aleatorio en una cookie de vida corta y en el parámetro `state` (contra CSRF) y redirige a GitHub.
- `/callback` comprueba que `state` coincide con la cookie y cambia el código por un token de acceso y otro de renovación.
- Su respuesta es una página diminuta que pasa el token a la ventana del CMS con `postMessage`, pero solo a un origen permitido. El origen de un mensaje lo pone el navegador, así que otro sitio no puede falsearlo.
- El token de una GitHub App caduca a las ocho horas, y renovarlo también necesita el secreto, así que el Worker se encarga también de renovarlo.

Es una GitHub App, no una OAuth app, así que su token solo llega al repositorio donde está instalada, con los permisos que pidió: contenido y pull requests.

## Algo que tener presente

El CMS guarda su token en el almacenamiento del navegador de `abafdez.github.io`, y todos los sitios de GitHub Pages de mi cuenta comparten ese origen. Un script en otro de mis sitios de Pages podría leerlo, así que en esos sitios solo pongo código en el que confío.
