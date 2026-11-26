---
title: Ajustes del sitio sin un analizador de YAML en el navegador
description: 'Mi nombre, mi lema, los textos de contratación y los enlaces a mis perfiles estaban repartidos entre el código y los archivos de mensajes. Ahora son un solo archivo YAML que edita el CMS, y el navegador los recibe como JSON: un plugin de Vite de nueve líneas analiza el archivo al construir.'
reviewed: false
---

Algunas palabras de mi sitio no eran contenido, pero tampoco código: mi nombre en la cabecera, el pie y el título de cada página; el lema de la portada; los textos de contratación del panel del pie; los enlaces a GitHub y LinkedIn. Estaban repartidos entre un archivo de TypeScript, dos archivos de mensajes y media docena de componentes. Cambiar el lema obligaba a encontrarlos todos. Ahora son un solo archivo, `content/site.yaml`, con su propia página en el CMS.

## Un singleton en el CMS

Sveltia CMS llama [singleton](https://sveltiacms.app/en/docs/collections/singletons) a un archivo de ajustes suelto: tiene su propia entrada en la barra lateral, "Site settings", y se abre directamente en su formulario. Cada texto que cambia según el idioma es un objeto con `en` y `es`, como en el resto del sitio, y el correo y los enlaces tienen patrones, así que el formulario no acepta un enlace que no empiece por `https://`.

## Datos, no un analizador

La cabecera y el pie están en todas las páginas y funcionan en el navegador, así que los ajustes tienen que llegar al navegador. Importar el YAML y analizarlo allí enviaría un analizador de YAML a cada visitante por seis campos. En su lugar, un plugin de Vite analiza el archivo al construir:

```ts
export function yamlData(): Plugin {
	return {
		name: 'yaml-data',
		load(id) {
			if (!id.endsWith('.yaml?data')) return;
			const file = id.slice(0, -'?data'.length);
			this.addWatchFile(file);
			return `export default ${JSON.stringify(parse(readFileSync(file, 'utf8')))};`;
		}
	};
}
```

Así, `import data from '/content/site.yaml?data'` devuelve un objeto normal, compilado como JSON dentro del JavaScript de la página. Editar el archivo en desarrollo recarga lo que lo usa (`addWatchFile`). Una declaración de una línea le dice a TypeScript qué son las importaciones `*.yaml?data`.

## Comprobado al construir

Los datos salen de un archivo que cualquiera puede editar, en el CMS o a mano, así que `src/lib/site.ts` los comprueba antes de que nada los use: cada texto necesita los dos idiomas, los enlaces tienen que ser `https://` y un correo tiene que parecerlo. Cualquier error hace fallar el build con el nombre del campo (`content/site.yaml: tagline.es must be some text`), así que un fallo hecho en el CMS se queda en las comprobaciones de ese cambio en lugar de llegar al sitio publicado.

## Un pequeño arreglo por el camino

El CMS le pasa al escritor de archivos un campo opcional vacío como una cadena vacía. Ahora el escritor omite los campos vacíos del primer nivel, así que un correo sin poner no acaba como `email: ''`, y "sin correo, no hay botón de Escríbeme" funciona sin más.
