// The gallery. To share a skill, add an entry and open a pull request.
//
// kind: 'link' points to a skill published elsewhere; 'builder' opens the builder on this site.
// source: 'official' (published by the tool or platform maker) or 'community'.
// scripts: true when the skill bundles scripts or fetches remote content, so people know to read
// it before installing.

export const SKILLS = [
	{
		kind: 'builder',
		name: 'WCAG 2.2 AA baseline',
		author: 'This site',
		source: 'official',
		description: 'All 55 Level A and AA success criteria, each with what to check in code. The starting point of every skill made here.',
		tags: ['WCAG 2.2', 'Baseline'],
	},
	{
		kind: 'link',
		name: 'Design: accessibility review',
		author: 'Anthropic',
		source: 'official',
		url: 'https://github.com/anthropics/knowledge-work-plugins/tree/main/design',
		description: 'Part of Anthropic\'s Design plugin. Reviews a design or a page against WCAG 2.1 AA, alongside design critique and handoff skills.',
		tags: ['Review', 'Design'],
	},
	{
		kind: 'link',
		name: 'fixing-accessibility',
		author: 'ibelick',
		source: 'community',
		url: 'https://github.com/ibelick/ui-skills',
		description: 'Fixes common problems in UI code: ARIA, keyboard support, focus, contrast and form errors.',
		tags: ['Fix', 'Code'],
	},
];
