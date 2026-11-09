---
title: Una caja de herramientas, y cuándo dar crédito a una fuente
reviewed: false
---

## Qué hicimos

- Empezamos la fase 8.5: un panel de pequeñas herramientas que funcionan solo en el navegador, en `/projects/toolbox`, cada una en `/projects/toolbox/<tool>`. La primera es Base64. Las ideas salen de varias colecciones (Omatsuri, it-tools, DevToys, tiny-helpers), escogiendo de cada una.
- Antes de tomar nada, comprobamos la licencia de cada proyecto candidato con la API de GitHub. MIT (Omatsuri, color-color, huetone, svgomg, transform…): se puede portar el código. Apache-2.0 (CyberChef, Squoosh, Leonardo): también, con su archivo NOTICE. GPL-3.0 (it-tools) y repositorios sin licencia (Clippy): solo ideas.
- Hicimos una línea de crédito para Omatsuri al pie del panel, con su licencia MIT plegada en un `<details>`, y la quitamos el mismo día: Base64 no copia nada de Omatsuri. La regla ahora: una herramienta da crédito a un proyecto solo cuando lleva código o datos de ese proyecto, en esa herramienta.
- Quitamos los generadores de CSS del plan, y los símbolos HTML tendrán datos propios y más completos en vez de las listas de Omatsuri.
- El panel dibuja cada herramienta como una pequeña ventana de terminal (`ToolWindow.svelte`), como las ventanas de habilidades de `/about`. Toda la ventana es un enlace, y sus partes se transforman en la cabecera de la herramienta.
- Las migas de pan ganaron un cuarto nivel (`crumbParent` en los datos de la página): Inicio / Proyectos / Caja de herramientas / Base64.
- Un test e2e lee las herramientas del panel y abre cada una, así que una herramienta nueva queda probada sin tocarlo.

## Qué aprendí

- La MIT pide una sola cosa: "The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software." Un sitio construido también es una copia, así que el aviso del código que lleva tiene que estar en la página, no solo en el repositorio.
- Una licencia cubre código y datos, no ideas. Un conversor de Base64 es una idea de todos, y un crédito por código que no copié diría algo falso.
- La GPL-3.0 es distinta: copiar su código en el sitio pondría el código propio del sitio bajo la GPL. Leerlo para sacar ideas está bien.
- Sin licencia no significa libre: significa todos los derechos reservados.
- Los datos también tienen licencia: la lista de caracteres con nombre de la especificación de HTML es CC BY 4.0, que pide atribución. Si la herramienta de símbolos la usa, esa herramienta llevará un crédito.

## Problemas y soluciones

- Lighthouse daba 96 en buenas prácticas por "errores en la consola" en todas las páginas, incluso en las que no habíamos tocado: 404 en `_app/immutable/*`. El test e2e había reconstruido el sitio, pero el `pnpm preview` antiguo seguía en marcha y el nuevo no podía usar el puerto. Pararlo por su puerto (`ss -ltnp`) lo arregló: 100.

## Enlaces

- [Choose a License: MIT](https://choosealicense.com/licenses/mit/)
- [GitHub Docs: licenciar un repositorio](https://docs.github.com/es/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
- [Creative Commons: CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.es)

## Siguiente

- Paso 2: eventos de teclado (`key`, `code`, modificadores y un fragmento de código generado).
