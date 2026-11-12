---
title: Un CMS que solo cambia lo que editas
description: Añadí Sveltia CMS al servidor de desarrollo de mi sitio. Su primer guardado reescribió líneas que no había tocado, así que le di mi propio formato de archivo y una prueba que guarda cada archivo y compara los bytes.
reviewed: false
---

Mis artículos son archivos markdown en un repositorio de Git. Los escribo en Obsidian y los publica un build. Quería un formulario para el frontmatter, un selector de imágenes y un diálogo para mis componentes en bloques de código, sin mover el contenido a ningún sitio. Un CMS basado en Git hace justo eso: edita los archivos del repositorio y deja el resto a Git.

Elegí [Sveltia CMS](https://sveltiacms.app/en/docs), y el primer guardado me enseñó algo sobre todos los CMS de este tipo.

## Por qué Sveltia

Comparé tres opciones: hacer el mío, Sveltia y TinaCMS. Lo que decidió fue la forma de mi contenido:

- cada artículo es una carpeta con sus imágenes al lado (`./diagram.png`);
- la versión en español es un segundo archivo en la misma carpeta, `<slug>.es.md`, solo con las palabras;
- los borradores son una carpeta que el build no lee.

Sveltia resuelve las tres con configuración. Tina quería las imágenes en `static/` y no tiene traducciones. Hacer el mío encajaría a la perfección, pero sería el trabajo más grande del sitio hasta ahora, y luego tendría que mantenerlo.

Sveltia funciona en el navegador y edita una carpeta local con la [File System Access API](https://developer.mozilla.org/es/docs/Web/API/File_System_API), así que no necesita servidor. Lo sirvo desde un pequeño plugin de Vite con `apply: 'serve'`: existe en `pnpm dev` y nunca llega al build.

## El primer guardado

Añadí un carácter a un título y guardé. Git mostró esto:

```diff
-title: 'Callouts that read well everywhere'
+title: Callouts that read well everywhere!
-tags: [markdown, accessibility, sveltekit]
+tags:
+  - markdown
+  - accessibility
+  - sveltekit
```

Las comillas desaparecieron, las etiquetas pasaron a ser una lista en bloque, y el archivo en español, que ni había abierto, también se reescribió. Cada guardado traería líneas así al diff, y cada edición a mano en Obsidian las devolvería.

La razón es cómo funciona un CMS. No edita texto: lee el archivo y lo convierte en datos, yo cambio los datos, y escribe un archivo nuevo a partir de ellos. Las comillas y el `[a, b]` no son datos, así que son lo que prefiera quien escribe. La salida no es configurar más el CMS, sino darle un escritor que escriba como yo.

## Mi propio formato de archivo

Sveltia permite registrar un formato de archivo: una función que lee un archivo y lo convierte en datos, y otra que convierte los datos en un archivo. El mío vive en `src/lib/content-files.ts`, y el escritor son unas pocas líneas del [paquete `yaml`](https://eemeli.org/yaml/):

```ts
function yaml(data: Record<string, unknown>) {
	const doc = new Document(data);
	// A list of plain values (tags) on one line: [css, dark-mode]
	visit(doc, {
		Seq(_, seq) {
			if (seq.items.every(isScalar)) seq.flow = true;
		}
	});
	// Quotes only where YAML needs them, single ones; long lines never folded
	return doc.toString({ singleQuote: true, lineWidth: 0, flowCollectionPadding: false });
}
```

Después el CMS pasa Prettier al resultado, con la misma configuración que comprueba `pnpm lint`. Así, escriba lo que escriba el CMS, el linter no tiene nada que decir, tablas incluidas.

```ts
CMS.registerCustomFormat('entry', 'md', {
	fromFile: readEntry,
	toFile: (data) => prettier.format(writeEntry(data), { ...options, parser: 'markdown' })
});
```

## La prueba: guardarlo todo sin cambiar nada

¿Cómo sé que el escritor escribe como yo? Guardo cada archivo sin editarlo y comparo los bytes:

```ts
test.each(entries)('%s', async (file) => {
	const text = readFileSync(file, 'utf8');
	expect(await pretty(writeEntry(readEntry(text)), 'markdown')).toBe(text);
});
```

Son más de 270 archivos en menos de tres segundos. La primera vez fallaron 74, todos por lo mismo: títulos entre comillas que no necesitaban. La mayoría de los títulos del blog las tenían y la mayoría de los del Devlog no. No había una regla que copiar, así que dejé decidir al escritor (comillas solo donde hacen falta) y reescribí esas 74 líneas una vez, con un script que hace exactamente lo mismo que el CMS: `pnpm content:format`.

Ahora la prueba pasa, y es lo que mantiene la promesa: **un guardado solo cambia lo que he editado.** Si edito el frontmatter a mano y lo escribo de otra forma, `pnpm test` me avisa, y `pnpm content:format` lo arregla.

## Lo que un CMS no puede conservar

Algunas cosas no son datos en absoluto, y ningún escritor puede recuperarlas. Mi lista Awesome tenía un bloque de comentarios al principio que explicaba sus reglas. Un guardado lo borra, porque el CMS nunca lo ve. Los comentarios pasaron a un `README.md` junto a la lista.

Lo mismo pasa con las formas. El nombre de una categoría era texto simple (`Color`) y los demás eran `{ en, es }`. Un campo del CMS tiene una sola forma, así que ese pasó a ser `{ en: Color, es: Color }`.

## La vista previa

El panel de vista previa de Sveltia dibuja el markdown con su propio renderizador, sin los estilos, los callouts ni los componentes de mi sitio. Ahora ejecuta los mismos plugins de markdown que mi build, en el navegador, mientras escribo. Me costó tres intentos, así que tiene un artículo propio: [Una vista previa del CMS hecha con mi propio build](./2026-11-10-a-preview-built-from-my-own-build).

## Enlaces

- [Sveltia CMS: formatos de archivo propios](https://sveltiacms.app/en/docs/api/file-formats)
- [Sveltia CMS: flujo de trabajo local](https://sveltiacms.app/en/docs/workflows/local)
- [El paquete `yaml`: documentos y opciones](https://eemeli.org/yaml/#documents)
- [La versión standalone de Prettier, para el navegador](https://prettier.io/docs/browser)
