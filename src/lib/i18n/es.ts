// The UI's Spanish text (Spain's Spanish: tú, ordenador). `satisfies Messages` checks
// it against en.ts: a missing message, an extra one, or different parameters fail
// `pnpm check`. Wording that would need a gender (desarrollador/desarrolladora) is
// phrased around it. Decimals use a comma, as in Spain: 4,5:1.
import type { Messages } from './en.ts';
import { plural } from './locales.ts';

type Count = { count: number };
type Name = { name: string };

export const es = {
	languageShort: () => 'ES',
	languageSwitch: () => 'Leer en español',

	navLabel: () => 'Navegación principal',
	navHome: () => 'Inicio',
	navBlog: () => 'Blog',
	navAwesome: () => 'Awesome',
	navProjects: () => 'Proyectos',
	navAbout: () => 'Sobre mí',
	navBitacora: () => 'Bitácora',
	breadcrumbLabel: () => 'Ruta de navegación',
	sectionNavLabel: () => 'En esta página',
	footerRights: () => 'Todos los derechos reservados.',
	themeDark: () => 'Tema oscuro',
	themeLight: () => 'Tema claro',
	paletteLabel: () => 'Tema de color',
	paletteCredit: ({ name, by }: Name & { by: string }) => `${name}, de ${by}`,

	tagsLabel: () => 'Etiquetas',
	minutesRead: ({ minutes }: { minutes: number }) => `${minutes} min de lectura`,
	statusDraft: () => 'borrador',
	statusPublished: () => 'publicado',
	inEnglish: () => 'en inglés',
	unreviewed: () => 'sin revisar',
	codeCopy: () => 'copiar',
	codeCopied: () => 'copiado',
	codeCopyFailed: () => 'no se pudo copiar',

	homeTagline: () =>
		'Desarrollo web. Diseño sitios rápidos, accesibles y con un toque diferenciador.',
	homeAboutMe: () => 'Sobre mí',
	homeSeeProjects: () => 'Ver proyectos',
	homeReadBlog: () => 'Leer el blog',
	homeLatestPosts: () => 'Últimos artículos',
	homeNoPosts: () => 'Aún no hay artículos. Aparecerán aquí cuando el blog esté en marcha.',
	homeLogIntro: () => 'Notas breves de cómo construyo este sitio, paso a paso.',
	homeNoEntries: () => 'Aún no hay entradas.',
	homeFeaturedProjects: () => 'Proyectos destacados',
	homeNoProjects: () => 'Aún no hay proyectos. Los destacados aparecerán aquí.',

	blogTitle: () => 'Blog',
	blogDescription: () => 'Artículos más largos sobre lo que aprendo construyendo este sitio.',
	blogEmpty: () => 'Aún no hay artículos. Los primeros están en camino.',
	blogTagsTitle: () => 'Explorar por etiqueta',
	tagPostCount: ({ count }: Count) =>
		plural('es', count, { one: ' artículo', other: ' artículos' }),
	tagCloudMore: ({ count }: Count) => `Las ${count} etiquetas`,
	tagCloudLess: () => 'Menos etiquetas',
	tagDescription: ({ tag }: { tag: string }) =>
		`Mis artículos con la etiqueta #${tag}, los más recientes primero.`,
	tagAllPosts: () => '← Todos los artículos',
	tagIntro: ({ count }: Count) =>
		plural('es', count, {
			one: '1 artículo con esta etiqueta.',
			other: `${count} artículos con esta etiqueta.`
		}),

	bitacoraTitle: () => 'Bitácora',
	bitacoraDescription: () =>
		'Notas breves de cómo construyo este sitio, paso a paso, las más recientes primero.',
	bitacoraPhase: ({ phase }: { phase: string }) => `Fase ${phase}`,
	bitacoraOther: () => 'Otras',

	awesomeTitle: () => 'Awesome',
	awesomeDescription: () =>
		'Listas de enlaces a los que siempre vuelvo, cada una con búsqueda por etiqueta.',
	awesomeLists: () => 'Listas',
	awesomeLinkCount: ({ count }: Count) =>
		plural('es', count, { one: '1 enlace', other: `${count} enlaces` }),
	awesomeUpdated: () => 'actualizada el',
	awesomeSearch: () => 'Buscar',
	awesomeShown: ({ count, total }: Count & { total: number }) => `${count} de ${total} enlaces`,
	awesomeClear: () => 'Quitar filtros',
	awesomeEmpty: () => 'Ningún enlace coincide. Prueba con menos palabras o etiquetas.',

	projectsTitle: () => 'Proyectos',
	projectsDescription: () => 'Pequeñas herramientas, cada una una aplicación independiente.',
	projectsTools: () => 'Herramientas',

	aboutTitle: () => 'Sobre mí',
	aboutDescription: () =>
		'Con qué trabajo: lenguajes, frameworks, herramientas, formas de trabajar y flujos con IA.',
	aboutHeading: () => 'Sobre mí',
	aboutLead: () =>
		'Más de 15 años haciendo que la tecnología funcione para pequeñas empresas: redes, hardware, automatización y sitios web. Estudié desarrollo web, tengo certificación en Natural, Adabas y COBOL para mainframe, y ahora estoy profundizando en el front end moderno, aprendiendo en público en este sitio.',
	aboutCvOnRequest: () => '¿Quieres mi CV completo? Te lo envío si me lo pides.',
	aboutAskLinkedIn: () => 'Pídelo en LinkedIn',
	aboutShowSkillsFor: () => 'Mostrar habilidades para',
	aboutEverything: () => 'Todo',
	aboutSkillCount: ({ count, total }: Count & { total: number }) =>
		`${count} de ${total} habilidades`,
	aboutCvTitle: () => '¿Quieres mi CV completo?',
	aboutCvText: () =>
		'Tiene las fechas, las empresas y los detalles. Mándame un mensaje y te lo envío.',
	skillLevel: ({ level }: { level: 1 | 2 | 3 | 4 }) =>
		({ 1: 'Aprendiendo', 2: 'Con soltura', 3: 'A diario', 4: 'Podría enseñarlo' })[level],
	skillWindowCollapse: () => 'plegar',
	skillWindowExpand: () => 'desplegar',
	skillWindowMore: ({ count }: Count) => `+${count} más`,

	contrastText: () => 'Texto',
	contrastSurface: () => 'Superficie',
	contrastSample: () => 'El veloz murciélago hindú comía feliz cardillo y kiwi.',
	contrastAllPairs: () => 'Todos los pares',
	contrastNote: () =>
		'AA pide 4,5:1 para el texto normal y AAA, 7:1. «grande» solo vale para texto grande (3:1).',
	contrastLevel: ({ level }: { level: 'AAA' | 'AA' | 'large' | 'fail' }) =>
		({ AAA: 'AAA', AA: 'AA', large: 'grande', fail: 'no pasa' })[level],
	contrastNoJs: () =>
		'Los contrastes aparecen cuando el JavaScript de la página ha leído los tokens.',

	cvJob: () => 'Empleo',
	cvProfile: () => 'Perfil',
	cvAboutYou: () => 'Sobre ti',
	cvRequiredNote: () => '* obligatorio',
	cvLetter: () => 'Carta breve',
	cvSkills: () => 'Habilidades',
	cvSkillsOnCv: ({ count }: Count) => `${count} en el CV`,
	cvFieldsToFix: ({ count }: Count) =>
		plural('es', count, { one: '1 campo por corregir', other: `${count} campos por corregir` }),
	cvRequiredLeft: ({ count }: Count) =>
		plural('es', count, {
			one: 'Falta 1 campo obligatorio',
			other: `Faltan ${count} campos obligatorios`
		}),
	cvSavedNote: () =>
		'Se guarda solo en este navegador. Nada de lo que escribes aquí se envía a ningún sitio. Exporta tus datos para tener una copia: borrar los datos del navegador los elimina.',
	cvNeedsJs: () => 'El generador necesita JavaScript.',
	cvYourCv: () => 'Tu CV',
	cvPrint: () => 'Imprimir o guardar como PDF',
	cvExport: () => 'Exportar datos',
	cvImport: () => 'Importar datos',
	cvTip: () =>
		'Consejo: también puedes escribir directamente en el CV para un cambio de última hora antes de imprimir. No se guarda, y cualquier cambio en el formulario vuelve a generar el CV.',
	cvFixFirst: () => 'Antes hay que corregir algunos campos.',
	cvLoaded: ({ count, profiles, file }: Count & { profiles: number; file: string }) =>
		`Se han cargado ${plural('es', count, { one: '1 campo', other: `${count} campos` })} y los cambios de habilidades de ${plural('es', profiles, { one: '1 perfil', other: `${profiles} perfiles` })} desde ${file}.`,
	cvNoFields: ({ file }: { file: string }) => `${file} no tiene campos del CV.`,
	cvNotJson: ({ file }: { file: string }) => `${file} no es un archivo JSON.`,
	cvYourName: () => 'Tu nombre',
	cvSummary: () => 'Resumen',
	cvFieldName: () => 'Nombre',
	cvFieldSurnames: () => 'Apellidos',
	cvFieldPhone: () => 'Teléfono',
	cvFieldEmail: () => 'Correo electrónico',
	cvFieldCity: () => 'Ciudad',
	cvFieldState: () => 'Provincia',
	cvFieldPostalCode: () => 'Código postal',
	cvRequired: () => 'Obligatorio.',
	cvPhoneHint: () => 'Cifras, espacios y + ( ) -, al menos 9.',
	cvEmailHint: () => 'Una dirección como nombre@ejemplo.com.',
	cvPostalCodeHint: () => 'De 3 a 10 cifras o letras.',
	cvEditorIntro: () =>
		'Desmarca una habilidad para dejarla fuera de este CV, cambia su texto, muévela con ↑ ↓ o añade las tuyas.',
	cvEditorScope: ({ profile }: { profile: string }) =>
		`Solo para ${profile}, solo en este navegador.`,
	cvNewSkill: () => 'tu nueva habilidad',
	cvMoved: ({
		name,
		place,
		total,
		group
	}: Name & { place: number; total: number; group: string }) =>
		`${name}: ${place} de ${total} en ${group}.`,
	cvOnCv: ({ name }: Name) => `${name} en el CV`,
	cvWording: ({ name }: Name) => `Texto de ${name}`,
	cvOwnSkill: ({ group }: { group: string }) => `Tu habilidad en ${group}`,
	cvMoveUp: ({ name }: Name) => `Subir ${name}`,
	cvMoveDown: ({ name }: Name) => `Bajar ${name}`,
	cvRemove: ({ name }: Name) => `Quitar ${name}`,
	cvAddSkill: () => 'Añadir una habilidad',
	cvAddSkillTo: ({ group }: { group: string }) => ` a ${group}`,
	cvReset: ({ profile }: { profile: string }) => `Restablecer las habilidades de ${profile}`
} satisfies Messages;
