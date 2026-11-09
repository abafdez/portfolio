import type { Translated } from '#lib/i18n/index.ts';

// The blocks' names in both languages. English keeps Unicode's own names, so they match
// the charts on unicode.org. Character names stay as Unicode writes them (in English):
// they're the standard's names, the ones to search the web with.
// A test checks every block in symbols.json has one.
export const blockNames: Record<string, Translated> = {
	'Basic Latin': { en: 'Basic Latin (ASCII)', es: 'Latín básico (ASCII)' },
	'Latin-1 Supplement': { en: 'Latin-1 Supplement', es: 'Suplemento Latín-1' },
	'Greek and Coptic': { en: 'Greek and Coptic', es: 'Griego y copto' },
	'General Punctuation': { en: 'General Punctuation', es: 'Puntuación general' },
	'Superscripts and Subscripts': {
		en: 'Superscripts and Subscripts',
		es: 'Superíndices y subíndices'
	},
	'Currency Symbols': { en: 'Currency Symbols', es: 'Símbolos de moneda' },
	'Letterlike Symbols': { en: 'Letterlike Symbols', es: 'Símbolos con forma de letra' },
	'Number Forms': { en: 'Number Forms', es: 'Formas numéricas' },
	Arrows: { en: 'Arrows', es: 'Flechas' },
	'Mathematical Operators': { en: 'Mathematical Operators', es: 'Operadores matemáticos' },
	'Miscellaneous Technical': { en: 'Miscellaneous Technical', es: 'Técnicos varios' },
	'Enclosed Alphanumerics': { en: 'Enclosed Alphanumerics', es: 'Alfanuméricos en círculo' },
	'Box Drawing': { en: 'Box Drawing', es: 'Dibujo de recuadros' },
	'Block Elements': { en: 'Block Elements', es: 'Elementos de bloque' },
	'Geometric Shapes': { en: 'Geometric Shapes', es: 'Formas geométricas' },
	'Miscellaneous Symbols': { en: 'Miscellaneous Symbols', es: 'Símbolos varios' },
	Dingbats: { en: 'Dingbats', es: 'Ornamentos (dingbats)' },
	'Miscellaneous Symbols and Arrows': {
		en: 'Miscellaneous Symbols and Arrows',
		es: 'Símbolos y flechas varios'
	},
	Emoticons: { en: 'Emoticons', es: 'Emoticonos' }
};

// Each group's icon on the tool: one of its own characters, so the row of icons is a
// preview of what's inside. A test checks each one is in its block.
export const blockIcons: Record<string, string> = {
	'Basic Latin': '@',
	'Latin-1 Supplement': '©',
	'Greek and Coptic': 'Ω',
	'General Punctuation': '†',
	'Superscripts and Subscripts': 'ⁿ',
	'Currency Symbols': '€',
	'Letterlike Symbols': '™',
	'Number Forms': '⅓',
	Arrows: '→',
	'Mathematical Operators': '∑',
	'Miscellaneous Technical': '⌘',
	'Enclosed Alphanumerics': '①',
	'Box Drawing': '┼',
	'Block Elements': '▓',
	'Geometric Shapes': '◆',
	'Miscellaneous Symbols': '♣',
	Dingbats: '✂',
	'Miscellaneous Symbols and Arrows': '⬈',
	Emoticons: '😀'
};
