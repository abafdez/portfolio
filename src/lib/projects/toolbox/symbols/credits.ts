// The symbols tool ships data from two sources (scripts/symbols.ts downloads it), and
// both licences ask for a notice:
// - Unicode License v3: its copyright and permission notice must "appear with all
//   copies of the Data Files", so its full text is on the page (licences/unicode.txt,
//   verbatim, ?raw: the file's text as a string).
// - WHATWG standards are CC BY 4.0 (https://whatwg.org/ipr-policy): name the source and
//   its holder, link the licence, and say what changed.
import type { Credit } from '../credits.ts';
import { unicodeVersion } from './symbols.ts';
import unicode from './licences/unicode.txt?raw';

export const credits: Credit[] = [
	{
		what: { en: 'Character names and blocks', es: 'Nombres y bloques de caracteres' },
		source: `Unicode Character Database ${unicodeVersion}`,
		url: 'https://www.unicode.org/ucd/',
		by: unicode.match(/Copyright © [\d-]+ Unicode, Inc\./)![0],
		licence: { name: 'Unicode License v3', url: 'https://www.unicode.org/license.txt' },
		notice: unicode
	},
	{
		what: { en: 'HTML entity names', es: 'Nombres de entidades HTML' },
		source: 'HTML Living Standard',
		url: 'https://html.spec.whatwg.org/multipage/named-characters.html',
		by: '© WHATWG (Apple, Google, Mozilla, Microsoft)',
		licence: { name: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
		changes: {
			en: 'Only names with one code point, kept with the character they name.',
			es: 'Solo los nombres de un único punto de código, junto al carácter que nombran.'
		}
	}
];
