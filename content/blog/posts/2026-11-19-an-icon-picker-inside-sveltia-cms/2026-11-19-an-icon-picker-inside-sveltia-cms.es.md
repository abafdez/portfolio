---
title: Un selector de iconos dentro de Sveltia CMS
description: Cada una de mis listas Awesome tiene un icono de Lucide, elegido por su nombre. Escribir nombres sacados de una web no es forma de elegir un icono, así que el CMS tiene ahora un campo propio, un componente de Svelte dentro de una aplicación de React, con los nombres de los iconos leídos del paquete al construir.
reviewed: false
---

Cada una de mis listas Awesome tiene un icono en su tarjeta: `icon: sparkles` en su YAML, un icono de Lucide elegido por su nombre. El build comprueba que el nombre existe, pero en el CMS era una caja de texto con un enlace a lucide.dev. Nadie elige un icono escribiendo su nombre de memoria, así que el CMS tiene ahora un campo propio: buscar, una cuadrícula con los iconos de verdad, clic.

![El campo de icono en Sveltia CMS: el icono de cohete elegido con su nombre y un botón Clear, una caja de búsqueda con "rocket" y una cuadrícula con el resultado](./icon-picker.png 'Buscar, ver los iconos, elegir uno')

## Un componente de Svelte en una aplicación de React

Sveltia CMS permite registrar tipos de campo propios con `CMS.registerFieldType(name, control)`, donde el control es un componente de React que recibe el `value` del campo y un `onChange`. Sveltia trae su propio React para eso, pero yo prefiero escribir Svelte. El truco, el mismo que usa el campo del punto focal de mis portadas: un componente de React diminuto que pinta un `div` vacío, monta dentro un componente de Svelte y pasa las props de React a un objeto `$state`, para que Svelte vuelva a pintar cuando cambian:

```ts
export function iconControl(React) {
	return function IconControl({ forID, value, onChange }) {
		const target = React.useRef(null);
		const props = React.useRef(null);

		React.useEffect(() => {
			const state = $state({ id: forID, value, onchange: onChange });
			props.current = state;
			const app = mount(IconPicker, { target: target.current, props: state });
			return () => void unmount(app);
		}, []);

		React.useEffect(() => {
			if (!props.current) return;
			props.current.value = value;
			props.current.onchange = onChange;
		}, [value, onChange]);

		return React.createElement('div', { ref: target });
	};
}
```

Después, `CMS.registerFieldType('lucide', iconControl(CMS.React))` y `widget: lucide` en el campo de la configuración.

## De dónde salen los nombres

El selector necesita los nombres tal como los escribe lucide.dev, `arrow-up-right`. El paquete `lucide` exporta un objeto `icons`, pero sus claves están en PascalCase (`ArrowUpRight`) e incluyen alias antiguos: 2.288 claves para 2.015 iconos, y convertir `Grid2x2` en `grid-2x2` con una regla falla en algunos. Los archivos del paquete son la lista real, uno por icono y con el nombre exacto. Un navegador no puede listar archivos, así que un pequeño plugin de Vite lo hace al construir y sirve el resultado como un módulo virtual:

```ts
export function lucideNames(): Plugin {
	return {
		name: 'lucide-names',
		resolveId: (id) => (id === 'virtual:lucide-names' ? '\0virtual:lucide-names' : undefined),
		load(id) {
			if (id !== '\0virtual:lucide-names') return;
			const folder = join(dirname(require.resolve('lucide')), '..', 'esm', 'icons');
			const names = readdirSync(folder)
				.filter((f) => f.endsWith('.mjs'))
				.map((f) => f.slice(0, -4));
			return `export default ${JSON.stringify(names)};`;
		}
	};
}
```

El selector importa `names from 'virtual:lucide-names'` (30 KB de texto) y carga los dibujos, el paquete `lucide` entero, solo cuando de verdad se muestra un selector. Cada palabra escrita tiene que estar en el nombre, así que "arrow up" encuentra `arrow-up-right`, y la cuadrícula muestra las primeras 96 coincidencias.

## Los mismos iconos en todas partes

El selector dibuja cada icono con el componente `Glyph` del propio sitio, el mismo que usan las tarjetas. Lo que eliges es lo que muestra la página, y el build sigue comprobando el nombre por si alguien edita el YAML a mano.
