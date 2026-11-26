---
title: Un selector de iconos y los ajustes del sitio en el CMS
reviewed: false
---

## Qué hicimos

- **Un selector de iconos** para el `icon` de las listas Awesome: un tipo de campo de Sveltia (`lucide`) cuyo control es un componente de Svelte (`IconPicker.svelte`), montado desde un pequeño envoltorio de React como el campo del punto focal de la portada. Busca por nombre, elige en una cuadrícula con los iconos de verdad, borra. Guarda el nombre tal como aparece en lucide.dev, que `glyph.server.ts` comprueba al construir.
- **Los nombres de Lucide** salen de los nombres de archivo del paquete: su objeto `icons` tiene claves en PascalCase y alias antiguos de los mismos iconos (2.288 claves para 2.015 iconos). Un plugin de Vite (`lucide-names.ts`) lee los archivos al construir y sirve la lista como `virtual:lucide-names`; los dibujos salen de `lucide`, que solo se carga cuando se abre un selector.
- **Las listas Awesome son una colección de carpeta**: aparece cada `.yaml` de `content/awesome/`, y Nuevo crea una lista con el nombre de su título en inglés (`slug: '{{title.en}}'`, editable al crearla). Ya no hace falta una entrada en la configuración por lista; la vista previa en desarrollo sigue a la lista abierta por su slug.
- **Ajustes del sitio**: el nombre, el lema, el puesto, los textos de contratación, el correo de contacto y los enlaces a los perfiles pasaron del código y de los archivos de mensajes a `content/site.yaml`, un singleton de Sveltia ("Site settings"). `src/lib/site.ts` importa `/content/site.yaml?data` a través de un plugin de Vite diminuto (`yaml-data.ts`) que lo analiza al construir, así que las páginas reciben JSON y ningún analizador de YAML; `checkSite()` hace fallar el build si falta una traducción, un enlace no es https o el correo no es válido.
- `writeList()` omite los campos vacíos del primer nivel, para que un icono o un correo sin poner no se guarden como `''`.
- Probé el CMS con el backend de pruebas de Sveltia en el navegador (de forma temporal, sin commit): la configuración carga, el selector busca y elige, y el formulario de ajustes muestra todos los campos.

## Qué aprendí

- Sveltia pinta los campos de más abajo de forma diferida: una consulta al DOM encontró dos de tres campos, y durante un momento culpé a una etiqueta y a un nombre de campo hasta que, al desplazarme, vi que el tercero estaba ahí.
- Una colección de archivos necesita cada archivo en la lista; una colección de carpeta con `extension: yaml` y `create: true` convierte una carpeta en una lista con botón de Nuevo.
- Existe el campo Color (el selector nativo del navegador, en hexadecimal), lo que hace posible una página de temas más adelante.

## Siguiente

- La página de temas (colores en YAML con campos Color), más adelante.
- Un guardado real desde el CMS, para confirmar que el singleton escribe con nuestro formato `list`.
