// The day an entry was last changed, if after the day it's dated: 'YYYY-MM-DD' from its
// git date (Entry.updated, content.ts), or undefined. A post committed the day it's dated
// wasn't updated. Its own file: ArticleHeader shows it in the browser, and content.ts
// imports every post's text, which must stay on the server.
export const updatedDay = (entry: { date: string; updated?: string }) => {
	const day = entry.updated?.slice(0, 10);
	return day && day > entry.date ? day : undefined;
};
