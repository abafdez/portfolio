---
title: Un CMS que guarda los archivos como yo los escribo
reviewed: false
---

## Qué hicimos

- Comparé tres formas de tener un CMS: hacer el nuestro, Sveltia CMS o TinaCMS (`design/cms-study.md`). Tina quedó fuera: sus imágenes tienen que vivir en `static/`, no tiene traducciones y su editor borra el markdown que no conoce. Sveltia encajaba con el contenido tal como está, así que primero lo probamos en una rama.
- **Sveltia CMS solo en desarrollo**: `cms/plugin.ts` lo sirve en `/admin/index.html` (`apply: 'serve'`, así que el build nunca lo incluye). Edita los archivos del repo con la File System Access API del navegador; desde WSL funciona eligiendo "Linux" en el selector de carpetas de Chrome.
- `cms/config.yml`: artículos, borradores, el Devlog y la lista Awesome; `<slug>.md` y `<slug>.es.md` uno al lado del otro; una entrada nueva empieza solo en inglés.
- **Nuestro propio formato de archivo** (`src/lib/content-files.ts` + Prettier en `cms/formats.ts`): el de Sveltia convertía `tags: [a, b]` en una lista en bloque y reescribía las comillas, en cada archivo que guardaba. Con el nuestro, guardar solo cambia las líneas que he editado. `content-files.test.ts` pasa cada archivo de `content/` por leer → escribir → Prettier y espera los mismos bytes.
- Una limpieza, una sola vez: 74 títulos perdieron comillas que YAML no necesitaba (`pnpm content:format`, que puedo volver a ejecutar después de editar a mano en Obsidian).
- **Los bloques como componentes del editor**, generados desde `blocks.ts` (`cms/components.ts`): ` ```yt ` y ` ```video ` se rellenan en un diálogo y se previsualizan con su propio `render()`.
- **Imágenes junto al artículo**: `media_folder: /content/blog/published/{{slug}}` con `public_folder: .` da `![alt](./file.png)`, lo que espera el build.
- **La vista previa ejecuta los plugins del build en el navegador** (`cms/render.ts`: unified + callouts, tablas, enlaces en los encabezados, nuestros bloques y Shiki), con el CSS del sitio, y se redibuja mientras escribo. Funciona sin servidor de desarrollo, así que servirá cuando el CMS trabaje contra GitHub. La vista previa propia de Sveltia no tenía estilos, ni callouts, ni portadas.
- **Una pestaña "Real page" en desarrollo**: el CMS manda la entrada sin guardar al servidor de desarrollo, que la escribe en un `.preview.md` oculto junto al artículo (ignorado por git); la página del artículo, abierta con `?preview`, muestra esa copia.
- **Un campo para el punto focal de la portada** escrito en Svelte, montado desde el pequeño componente de React que pide Sveltia (`cms/focal.svelte.ts`). Guarda `focus: x% y%`; el sitio todavía no lo usa. La portada sale de una ruta solo de desarrollo, `/admin/cover/<carpeta>`.
- Los comentarios de la lista Awesome pasaron a `content/awesome/README.md` (un guardado del CMS no puede conservarlos), y la categoría "Color" pasó a `{ en, es }` como las demás.

## Qué aprendí

- Un CMS solo ve datos, no mi archivo. Lo que no son datos (comentarios, estilo de comillas, cómo se escribe una lista) lo decide quien escribe el archivo, así que eso era lo que necesitaba controlar.
- La mejor prueba de que "guardar no cambia nada" es guardar cada archivo sin editarlo y comparar los bytes. Encontró los 74 títulos en segundos.
- El panel de vista previa de Sveltia es un iframe aislado: el CSS de mi sitio no entra. Mostrar la página real desde el servidor de desarrollo es más sencillo que copiar los estilos del sitio dentro, y una copia oculta de la entrada sin guardar la hace en vivo.
- Un archivo cuyo nombre empieza por un punto no encaja con ninguno de mis globs de contenido (`*/*.md`), así que la copia de la vista previa nunca se convierte en un artículo.
- En Sveltia, `media_folder: ''` con una ruta que acaba en `{{slug}}` guarda las subidas en una subcarpeta `<slug>/`. Indicar la propia carpeta de la entrada lo arregla.
- Un interruptor siempre escribe `true` o `false`; un desplegable puede quedarse vacío. Por eso `reviewed` es un desplegable: el archivo en inglés no debe tenerlo.

## Problemas y soluciones

- Un `pattern` en un campo de lista comprueba la lista entera, así que todas las etiquetas fallaban. El build ya comprueba las etiquetas, así que la lista no tiene regla.
- Subir la misma imagen dos veces daba el nombre del primer archivo: Sveltia se salta los archivos que ya tiene.
- La primera vista previa en vivo recargaba el CMS entero, perdiendo lo editado, una y otra vez: el componente del punto focal traía el cliente de recarga de Vite a la página del CMS, y Vite recarga todas las páginas que lo tienen cuando cambia un archivo markdown. Compilar los componentes de `cms/` sin recarga en caliente y con su CSS incrustado (`dynamicCompileOptions`) deja el cliente fuera.
- SvelteKit no permite `url.searchParams` en una página prerenderizada, ni siquiera en desarrollo, así que las páginas de los artículos solo se prerenderizan en el build (`prerender = !import.meta.env.DEV`).
- Playwright no puede pulsar el selector de carpetas nativo, así que las pruebas se hicieron sobre una copia exacta de `content/` en el almacenamiento privado del navegador (OPFS), comparada byte a byte con los originales.

## Enlaces

- [Documentación de Sveltia CMS](https://sveltiacms.app/en/docs)
- [Sveltia: flujo de trabajo local](https://sveltiacms.app/en/docs/workflows/local)
- [Sveltia: formatos de archivo propios](https://sveltiacms.app/en/docs/api/file-formats)
- [Sveltia: plantillas de vista previa](https://sveltiacms.app/en/docs/api/preview-templates)
- [MDN: File System Access API](https://developer.mozilla.org/es/docs/Web/API/File_System_API)

## Siguiente

- Usar `focus` en el build, para que las miniaturas de las tarjetas recorten alrededor de él en vez de por el centro.
- Más adelante: el CMS como sitio independiente, con inicio de sesión en GitHub.
