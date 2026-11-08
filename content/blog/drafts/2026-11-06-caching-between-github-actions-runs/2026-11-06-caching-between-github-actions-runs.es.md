---
title: 'Caché entre ejecuciones de GitHub Actions: dónde vive y cuánto dura'
description: 'Mi build vuelve a procesar todas las imágenes en cada ejecución. Cómo guarda actions/cache el trabajo entre ejecuciones: dónde se almacena, cuándo desaparece, qué ramas pueden verlo y una clave que solo rehace las imágenes nuevas.'
reviewed: false
---

Las imágenes de mi sitio se procesan al construirlo: cada portada se convierte en 16 archivos (tres anchos en tres formatos, dos recortes cuadrados y un JPEG para las vistas previas de los enlaces), y cada imagen de un artículo en 6. En mi máquina, los resultados se guardan en `node_modules/.cache/imagetools`, así que el segundo build se los salta. Con una portada, un build tardaba 6,5 segundos con la caché vacía y 5,0 con la caché llena: más o menos un segundo por portada.

En GitHub Actions, en cambio, cada ejecución empieza en una **máquina virtual recién creada**. No hay nada de la ejecución anterior, así que cada imagen se vuelve a procesar, cada vez. Hoy eso no es nada: ningún artículo publicado tiene imágenes todavía. Con docenas de artículos sería un minuto por ejecución.

Para eso está [`actions/cache`](https://github.com/actions/cache).

## Qué hace

```yaml
- name: Restore processed images
  uses: actions/cache@v6
  with:
    path: node_modules/.cache/imagetools
    key: images-${{ hashFiles('content/**/*.png', 'content/**/*.jpg', 'content/**/*.webp') }}
    restore-keys: images-
```

Funciona en dos mitades:

1. **En su paso, restaura.** Busca una caché guardada cuyo nombre sea exactamente `key`. Si la hay (un _acierto de caché_), la descarga y la descomprime en `path`. Si no, prueba cada línea de `restore-keys` como un **prefijo**: `images-` coincide con cualquier clave que empiece por `images-`, y gana la más reciente.
2. **Al final del job, guarda.** Si no hubo un acierto exacto, y solo si el job fue bien, empaqueta `path` y lo sube bajo `key`. Si hubo un acierto exacto, no se guarda nada: esa caché ya existe.

Una caché guardada no se puede cambiar nunca. Un contenido nuevo siempre necesita una clave nueva. Por eso la clave incluye un hash de los archivos de los que depende la caché: `hashFiles()` convierte todas mis imágenes en una huella corta, y añadir o cambiar una imagen la cambia.

## Dónde vive

No en el repositorio. Una caché se guarda en el servicio de caché de GitHub, junto al repositorio pero no dentro: no está en git, ni en el historial, ni en un clon, y no cuenta para el tamaño del repositorio. La página **Actions → Caches** del repositorio las lista, con su tamaño y cuándo se usaron por última vez, y tiene un botón para borrar cada una. Borrar una siempre es seguro: la siguiente ejecución simplemente vuelve a hacer el trabajo.

<!-- TODO: una captura de la página de Caches cuando haya alguna -->

Tampoco es lo mismo que un **artefacto**. Mi workflow ya usa uno: el job de build sube `build/` como artefacto, y el job de deploy lo publica. Un artefacto pasa archivos **dentro de una ejecución**, de un job a otro, y se conserva durante un tiempo fijo. Una caché pasa archivos **entre ejecuciones**, y puede desaparecer cuando GitHub necesite el espacio.

## Cuánto dura

- Una caché que **nadie usa en 7 días** se borra.
- Un repositorio tiene **10 GB** de cachés. Por encima de eso, se borran primero las que se usaron hace más tiempo.

Así que es una forma de ir más rápido, nunca un almacenamiento. El build tiene que funcionar sin ella, y funciona: sin caché, simplemente lo procesa todo.

## Quién puede verla

Esta fue la parte que no esperaba. Una caché pertenece a la **rama** que la creó:

- Una ejecución puede restaurar las cachés de **su propia rama** y las de la **rama por defecto** (`main`).
- Una ejecución de una **pull request** también puede restaurar las cachés de la rama base de la PR. Pero una caché que _guarda_ pertenece a la referencia de fusión de la PR (`refs/pull/12/merge`): solo pueden usarla las nuevas ejecuciones de esa misma PR. Ni `main` ni otras PR.
- Las ramas hermanas no pueden ver las cachés de las demás.

Para mi workflow encaja bien. Un push a `main` (cada fusión) guarda una caché en el ámbito de `main`. Cada PR la restaura, así que solo procesa las imágenes que añade esa PR. Después de la fusión, `main` restaura su caché anterior con `restore-keys`, procesa las imágenes nuevas y guarda una caché nueva.

Una cosa más: cualquiera que pueda abrir una pull request puede leer las cachés de la rama a la que apunta. En un repositorio público, eso es cualquiera. Nunca guardes en caché nada secreto. Las versiones procesadas de imágenes que de todas formas están en mi sitio público no son ningún problema.

## La clave, con más cuidado

La clave de arriba tiene un problema. Imagina que actualizo `sharp`, la librería que procesa las imágenes, y empieza a generar archivos algo distintos (mejores). Mis imágenes no han cambiado, así que la clave es la misma, y se restaura la caché antigua: código nuevo, resultados antiguos.

La solución: que la versión de la librería de imágenes forme parte de la clave y del prefijo de restauración. Su versión está en `pnpm-lock.yaml`:

```yaml
- name: Restore processed images
  uses: actions/cache@v6
  with:
    path: node_modules/.cache/imagetools
    key: images-${{ hashFiles('pnpm-lock.yaml') }}-${{ hashFiles('content/**/*.png', 'content/**/*.jpg', 'content/**/*.webp') }}
    restore-keys: images-${{ hashFiles('pnpm-lock.yaml') }}-
```

- Mismas dependencias, imagen nueva: la clave exacta falla, el prefijo coincide con la última caché con las mismas dependencias y solo se procesa la imagen nueva.
- Dependencias nuevas: nada coincide con el prefijo, así que todo se vuelve a procesar, una vez, con las versiones nuevas.

(Cualquier cambio en el lockfile empieza de cero, no solo el de `sharp`. Para un sitio de este tamaño está bien.)

La carpeta de la caché solo crece: imagetools guarda cada resultado para siempre por defecto, así que los archivos de una imagen borrada se quedan en ella. Para empezar de cero, cambia el nombre del prefijo (`images-v2-`) o borra las cachés en la página de Caches.

El paso va después del que instala las dependencias y antes del build.

<!-- TODO: cuando haya imágenes: añadir el paso y comparar el tiempo del paso Build con y sin la caché -->

## ¿Volver a procesar cambia los archivos?

Una preocupación: si la CI vuelve a procesar una imagen, ¿los visitantes reciben un archivo "nuevo" y lo vuelven a descargar? Lo probé:

- Construí con la caché de imágenes y luego con la carpeta de la caché borrada, y comparé los archivos de imagen: mismos nombres, mismos bytes.
- Comparé los nombres de archivo de mi build local con los del sitio publicado, que construyó la máquina de GitHub: los mismos seis nombres para mi avatar.

El procesado de imágenes es **determinista**: la misma imagen, los mismos ajustes y las mismas versiones de las librerías dan exactamente los mismos bytes, en cualquier máquina. Y como el nombre es un hash del contenido, los mismos bytes significan el mismo nombre, así que el navegador de un visitante ve el archivo que ya tiene.

Los archivos solo cambian cuando cambia algo de verdad: edito la imagen, cambio los ajustes (los anchos, los formatos, el recorte) o actualizo la librería que los codifica. Entonces el nombre también cambia, y los visitantes descargan la versión nueva una vez.

Así que la caché de la CI solo ahorra **tiempo de build**. En caché o recién hechos, los visitantes reciben los mismos archivos.

## La caché que ya tenía

Mi paso de preparación tiene `cache: true`:

```yaml
- uses: pnpm/setup@v3.0.0
  with:
    cache: true
    runtime: node@22
```

Es el mismo mecanismo para mis dependencias: guarda en caché el almacén de paquetes de pnpm, con el lockfile en la clave. Por eso instalar tarda segundos en vez de un minuto. Lo que no cubre es nada de lo que genera mi build.

## Enlaces

- [Documentación de GitHub: referencia de la caché de dependencias](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)
- [actions/cache](https://github.com/actions/cache)
- [Documentación de GitHub: gestionar las cachés](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manage-caches)
- [¿Cada despliegue invalida la caché de mis visitantes?](./2026-11-06-does-a-deploy-bust-the-cache)
- [Desplegar SvelteKit 3 en GitHub Pages](./2026-10-20-sveltekit-3-github-pages-workflow)
