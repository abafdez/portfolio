---
title: Mi CMS desde npm, y tres trampas por el camino
description: Importar Sveltia CMS desde npm en lugar de servir sus archivos dejó mi configuración en la mitad. Por el camino, un bloqueo sin ningún error, un empaquetador que perdió las fuentes y un efecto de React que devolvía lo que no debía.
reviewed: false
---

El CMS de mi sitio, [Sveltia](https://sveltiacms.app/en/docs), solo funciona en desarrollo, en `/admin`. Hasta esta semana, un pequeño plugin de Vite mío servía todo lo que necesitaba: una página HTML, la configuración del CMS y el build del propio Sveltia, archivo a archivo, directamente desde `node_modules`. El código del CMS vivía en una carpeta `cms/` junto a `src/`, y había que decirle a Vite que podía servir esa carpeta.

Funcionaba, pero parecía una integración de segunda. Sveltia también se publica como módulo de npm, así que probé a importarlo como cualquier otra dependencia. El plugin pasó de 92 líneas a 46, el código del CMS pasó a `src/lib/cms/` y por el camino caí en tres trampas.

## La configuración

La página que sirve el plugin tiene ahora un solo script:

```ts
Object.assign(window, { CMS_MANUAL_INIT: true });
import('@sveltia/cms').then(setUp);
```

`CMS_MANUAL_INIT` le dice a Sveltia que no arranque solo, para que yo pueda registrar antes mis piezas: mi formato de archivo, mis componentes del editor, mi vista previa. Un `import` normal al principio no serviría: los imports se elevan y se ejecutan antes que cualquier otra línea del módulo, así que Sveltia se cargaría, y arrancaría, antes de poner la bandera. De ahí el `import()` dinámico.

La configuración también la lee mi código, y se la pasa como objeto:

```ts
const { fields: _anchors, ...config } = parse(source, { merge: true });
CMS.init({ config: { ...config, load_config_file: false } });
```

Mi `config.yml` comparte campos entre colecciones con anclas de YAML, guardadas bajo una clave `fields:` que Sveltia no conoce y por la que avisaba. Leyéndolo yo, puedo quitar esa clave. Y `merge: true`, porque las anclas se usan con claves de fusión (`<<: *title`), que el paquete `yaml` no resuelve por defecto.

## Trampa 1: un bloqueo sin ningún error

Mi primera versión esperaba al import:

```ts
const CMS = await import('@sveltia/cms');
```

La página nunca terminaba de cargar. Ningún error en la consola, todas las peticiones respondidas, nada pendiente. Simplemente se quedaba ahí.

Un script de módulo se ejecuta antes de que el navegador lance `DOMContentLoaded`, y con un `await` de nivel superior el navegador espera al módulo entero, `await` incluido. Sveltia, a su vez, espera a `DOMContentLoaded` antes de hacer su trabajo. Cada uno esperaba al otro.

`import(…).then(setUp)` deja que mi módulo termine enseguida. `DOMContentLoaded` se lanza, Sveltia sigue con lo suyo y `setUp` se ejecuta cuando termina el import.

## Trampa 2: el empaquetador perdió las fuentes

En desarrollo, Vite preempaqueta las dependencias: mete cada una en un solo archivo en `node_modules/.vite/deps/`. El build de Sveltia carga sus fuentes y unos cuantos archivos wasm con `new URL('./assets/…', import.meta.url)`, una ruta relativa a su propio código. Movido a la carpeta de Vite, ese código buscaba sus archivos en el sitio equivocado.

La solución es servir Sveltia tal como se publica: `optimizeDeps: { exclude: ['@sveltia/cms'] }`. Sus propias dependencias ya vienen empaquetadas dentro, así que Vite no gana nada.

## Trampa 3: un efecto que devolvía lo que no debía

Sveltia dibuja su panel de vista previa con React. El mío monta dentro un componente de Svelte, el mismo que renderiza mis posts en el sitio, y le pasa props nuevas a cada tecla:

```ts
update.current = (next) => (current = next);
React.useEffect(() => update.current?.(props), [props]);
```

La vista previa dibujaba la primera versión y luego se paraba, con `l is not a function` en react-dom a cada tecla.

Una función flecha sin llaves devuelve su expresión, y React trata lo que devuelve un efecto como su limpieza: lo llama antes de volver a ejecutar el efecto. Aquí eso era el objeto de las props. Con llaves se arregla:

```ts
React.useEffect(() => {
	update.current?.(props);
}, [props]);
```

Había probado la parte de Svelte en el navegador, pero no el envoltorio de React que la rodea. Ahora un test renderiza el envoltorio tres veces con unas pocas líneas de un React de pega que cumplen esa única regla. Con el código antiguo falla con el mismo error que daba react-dom.

## Lo que borré

La ganancia mayor no fue el import. En cuanto la vista previa la dibujaban los componentes de la propia página, otras partes se quedaron sin nada que hacer:

- una pestaña «Real page» que escribía los posts sin guardar en archivos ocultos para que los renderizara el servidor de desarrollo;
- una ruta solo de desarrollo que servía las portadas, ahora un glob de Vite con sus URL;
- una segunda copia del marcado de mis componentes en bloques de código, como cadenas de HTML, para las vistas previas del editor, que ahora son un resumen de una línea.

El CMS pasó de 977 líneas a 694. Casi todo lo que quité había sido, en su día, la parte ingeniosa.

## Enlaces

- [Sveltia CMS: API de JavaScript](https://sveltiacms.app/en/docs/api)
- [MDN: DOMContentLoaded](https://developer.mozilla.org/es/docs/Web/API/Document/DOMContentLoaded_event)
- [MDN: import() dinámico](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/import)
- [Vite: opciones de optimización de dependencias](https://vite.dev/config/dep-optimization-options)
- [React: useEffect](https://react.dev/reference/react/useEffect)
- [Una vista previa del CMS hecha con mi propio build](./2026-11-10-a-preview-built-from-my-own-build)
