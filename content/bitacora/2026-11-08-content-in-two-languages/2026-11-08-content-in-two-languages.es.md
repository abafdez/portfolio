---
title: Contenido en dos idiomas
reviewed: false
---

## Qué hicimos

- La versión en español de un artículo es `<slug>.es.md`, junto a `<slug>.md` en la misma carpeta, y comparte sus imágenes. Su frontmatter solo lleva palabras: `title`, `description`, el texto alternativo de la portada y `reviewed`. `date`, `tags` y `phase` salen del archivo en inglés, y escribirlos en la traducción hace fallar el build.
- `content.ts` lee los dos: las listas siguen en inglés, cada entrada sabe sus idiomas (`locales`) y su archivo (`path`), e `inLocale(entry, locale)` da la traducción o la entrada en inglés. Cada load que lista contenido pide cada entrada en el idioma de su página; las páginas `[slug]` renderizan el cuerpo a partir de `path`.
- Lo que aún no está traducido: la página en español muestra el texto en inglés con `lang="en"`, una etiqueta "en inglés" y un enlace canónico a la página en inglés. Los buscadores solo ven una página en español cuando existe.
- `reviewed: false` hasta que leo una traducción (las escribe Claude); en desarrollo, una etiqueta "sin revisar" lo indica.
- El texto de los YAML (habilidades, la lista Awesome) es simple (igual en todos los idiomas: Docker) o `{ en, es }`. Los loads les pasan a los componentes texto en su idioma, así que los componentes apenas cambiaron.
- Los títulos de los callouts siguen el idioma del archivo ("Sugerencia", "Advertencia").
- La primera traducción: "Un acordeón sin JavaScript".

## Qué aprendí

- **Se localiza donde se cargan los datos, no donde se muestran.** Una función load sabe el idioma de su página por su `url`; los componentes reciben texto y no tienen que preocuparse.
- **Las claves no son etiquetas.** El generador de CV guardaba mis cambios por el nombre de la habilidad. Traducir los nombres habría perdido todo lo guardado, así que cada habilidad tiene una `key` (su nombre en inglés) para guardar y un `name` para mostrar.
- **Una traducción que repite la fecha puede contradecirla.** Tomar la fecha y las etiquetas del archivo en inglés significa que no hay nada que mantener sincronizado.

## Problemas y soluciones

- `vite.config.ts` dejó de cargar: importa el plugin de callouts, que ahora importa `locales.ts`, que leía `import.meta.env.BASE_PATH` al principio. Mientras Vite carga su configuración todavía no existe `import.meta.env`. Ahora se lee con `?.`; nada de lo que se ejecuta en ese momento lo necesita.
- La etiqueta "en inglés" decía `lang="es"` en vez de `es-ES`: pasé el id del idioma, no su etiqueta.

## Enlaces

- [MDN: el atributo lang](https://developer.mozilla.org/es/docs/Web/HTML/Global_attributes/lang)
- [Google: versiones localizadas y canónicas](https://developers.google.com/search/docs/specialty/international/localized-versions)

## Siguiente

- Traducir el contenido por tandas: sobre mí, habilidades y CV; proyectos y Awesome; artículos; borradores; Bitácora.
