import {CRITERIA, PRINCIPLES} from './data/wcag.js';
import {SKILLS} from './data/skills.js';

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------- gallery

const SOURCE_LABEL = {community: 'Community', official: 'Official'};

let activeTag = 'All';

function renderGallery() {
	const list = $('gallery-list');

	for (const skill of SKILLS) {
		const item = document.createElement('li');
		const heading = document.createElement('h3');
		const by = document.createElement('p');
		const description = document.createElement('p');
		const tags = document.createElement('ul');
		const action = document.createElement('p');

		item.className = 'card';
		item.dataset.tags = skill.tags.join('|');
		item.dataset.search = [skill.name, skill.author, skill.description, ...skill.tags].join(' ').toLowerCase();
		heading.textContent = skill.name;

		const source = document.createElement('span');

		by.className = 'by';
		by.textContent = `By ${skill.author} · `;
		source.className = 'source';
		source.textContent = SOURCE_LABEL[skill.source];
		by.append(source);

		if (skill.license) {
			by.append(` · ${skill.license === 'None' ? 'No license' : `${skill.license} license`}`);
		}
		description.textContent = skill.description;
		tags.className = 'tags';
		tags.setAttribute('aria-label', 'Tags');

		for (const tag of skill.tags) {
			const li = document.createElement('li');

			li.textContent = tag;
			tags.append(li);
		}

		item.append(heading, by, description, tags);

		if (skill.scripts) {
			const warning = document.createElement('p');

			warning.className = 'scripts';
			warning.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17.5v.01"/></svg>';
			warning.append('Includes scripts or fetches remote content. Read it before you install it.');
			item.append(warning);
		}

		action.className = 'card-action';

		const link = document.createElement('a');

		link.className = 'button';

		if (skill.kind === 'builder') {
			link.href = '#build';
			link.textContent = 'Start from it';
		}
		else {
			link.href = skill.url;
			link.textContent = 'View source';
			link.setAttribute('aria-label', `View source of ${skill.name}`);
		}

		action.append(link);
		item.append(action);
		list.append(item);
	}

	renderFilters();
}

// One tag at a time; "All" shows everything.

function renderFilters() {
	const counts = new Map();

	for (const skill of SKILLS) {
		for (const tag of skill.tags) {
			counts.set(tag, (counts.get(tag) || 0) + 1);
		}
	}

	const tags = ['All', ...[...counts.keys()].filter((tag) => counts.get(tag) > 1).sort()];
	const bar = $('gallery-filters');

	bar.parentElement.hidden = tags.length < 2;

	for (const tag of tags) {
		const button = document.createElement('button');

		button.type = 'button';
		button.className = 'chip';
		button.textContent = tag;
		button.setAttribute('aria-pressed', String(tag === activeTag));
		button.addEventListener('click', () => {
			activeTag = tag;

			for (const other of bar.querySelectorAll('button')) {
				other.setAttribute('aria-pressed', String(other === button));
			}

			filterGallery();
		});
		bar.append(button);
	}

	filterGallery();
}

function filterGallery() {
	const query = $('gallery-search').value.trim().toLowerCase();
	let shown = 0;

	for (const card of document.querySelectorAll('#gallery-list .card')) {
		const words = query.split(/\s+/).filter(Boolean);
		const match = (activeTag === 'All' || card.dataset.tags.split('|').includes(activeTag)) && words.every((word) => card.dataset.search.includes(word));

		card.hidden = !match;
		shown += match ? 1 : 0;
	}

	const what = `${shown} skill${shown === 1 ? '' : 's'}`;
	const tagged = activeTag === 'All' ? '' : ` tagged ${activeTag}`;
	const matching = query ? ` matching "${$('gallery-search').value.trim()}"` : '';

	$('gallery-count').textContent = shown || query || activeTag !== 'All' ? `${what}${tagged}${matching}.` : 'No skills yet.';
}

// ---------------------------------------------------------------- criteria

const selected = new Set();

function renderCriteria() {
	const host = $('criteria');

	for (const principle of PRINCIPLES) {
		const group = document.createElement('details');
		const summary = document.createElement('summary');
		const list = document.createElement('ul');
		const count = document.createElement('small');

		group.className = 'principle';
		group.dataset.principle = principle.id;
		summary.textContent = `${principle.id}. ${principle.name}`;
		count.dataset.count = principle.id;
		summary.append(count);
		group.append(summary, list);

		for (const criterion of CRITERIA.filter((c) => c.id.startsWith(`${principle.id}.`))) {
			const item = document.createElement('li');
			const box = document.createElement('input');
			const label = document.createElement('label');
			const means = document.createElement('p');
			const id = `sc-${criterion.id.replaceAll('.', '-')}`;

			item.className = 'criterion';
			item.dataset.search = `${criterion.id} ${criterion.title} ${criterion.means}`.toLowerCase();
			box.type = 'checkbox';
			box.id = id;
			box.value = criterion.id;
			box.setAttribute('aria-describedby', `${id}-means`);
			label.htmlFor = id;
			label.innerHTML = `<span class="num">${criterion.id}</span> ${criterion.title}<span class="level">${criterion.level}</span>`;
			means.id = `${id}-means`;
			means.textContent = criterion.means;
			item.append(box, label, means);
			list.append(item);
		}

		host.append(group);
	}

	host.addEventListener('change', (event) => {
		if (event.target.type !== 'checkbox') {
			return;
		}

		if (event.target.checked) {
			selected.add(event.target.value);
		}
		else {
			selected.delete(event.target.value);
		}

		update();
	});
}

function syncBoxes() {
	for (const box of document.querySelectorAll('#criteria input')) {
		box.checked = selected.has(box.value);
	}

	for (const principle of PRINCIPLES) {
		const n = [...selected].filter((id) => id.startsWith(`${principle.id}.`)).length;

		document.querySelector(`[data-count="${principle.id}"]`).textContent = n ? `${n} selected` : '';
	}

	$('picked').textContent = selected.size
		? `${selected.size} weak spot${selected.size === 1 ? '' : 's'} selected: ${sortIds([...selected]).join(', ')}.`
		: 'No weak spots selected.';
}

function sortIds(ids) {
	const key = (id) => id.split('.').map(Number);

	return ids.sort((a, b) => {
		const [x, y] = [key(a), key(b)];

		return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
	});
}

// Filter: by number prefix ("1.4") or by words in the title and meaning.

function applyFilter() {
	const query = $('filter').value.trim().toLowerCase();
	let shown = 0;

	for (const item of document.querySelectorAll('.criterion')) {
		const match = !query || item.dataset.search.includes(query);

		item.hidden = !match;
		shown += match ? 1 : 0;
	}

	for (const group of document.querySelectorAll('.principle')) {
		const any = group.querySelector('.criterion:not([hidden])');

		group.hidden = !any;

		if (query && any) {
			group.open = true;
		}
	}

	let empty = $('criteria-empty');

	if (!shown) {
		if (!empty) {
			empty = document.createElement('p');
			empty.id = 'criteria-empty';
			empty.className = 'empty';
			$('criteria').append(empty);
		}

		empty.textContent = `No criteria match "${$('filter').value.trim()}".`;
	}
	else {
		empty?.remove();
	}
}

// Paste: pick out every known criterion number in the text.

function applyPaste() {
	const known = new Set(CRITERIA.map((c) => c.id));
	const found = ($('paste').value.match(/\b\d\.\d{1,2}\.\d{1,2}\b/g) || []).filter((id) => known.has(id));

	for (const id of found) {
		selected.add(id);
	}

	update();
	toast(found.length ? `Selected ${new Set(found).size} criteria from your text.` : 'No WCAG 2.2 A or AA criteria found in that text.');
}

// ---------------------------------------------------------------- the skill

function slugify(text) {
	return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
}

let slugTouched = false;

function skillName() {
	const team = $('team').value.trim();
	const fallback = slugify(team ? `${team}-accessibility` : 'accessibility');

	return (slugTouched && slugify($('slug').value)) || fallback;
}

function lines(id) {
	return $(id).value.split('\n').map((line) => line.trim()).filter(Boolean);
}

function parseLinks() {
	return lines('links').map((line) => {
		const [title, url] = line.includes('|') ? line.split('|').map((part) => part.trim()) : [line, line];

		return {title: title || url, url};
	});
}

function buildSkill() {
	const team = $('team').value.trim() || 'our team';
	const teamName = $('team').value.trim();
	const name = skillName();
	const weak = sortIds([...selected]).map((id) => CRITERIA.find((c) => c.id === id));
	const patterns = lines('patterns');
	const links = parseLinks();

	const weakNames = weak.map((c) => `${c.id} ${c.title}`);
	const focus = weak.length ? ` Pays extra attention to ${team}'s known weak spots: ${weakNames.join(', ')}.` : '';

	const out = [];

	out.push('---');
	out.push(`name: ${name}`);
	out.push(`description: Accessibility rules for ${team}. Use when writing, reviewing or fixing UI code (HTML, CSS, JavaScript, components, templates) so every screen meets WCAG 2.2 Level AA and follows ${team}'s own accessibility patterns.${focus}`);
	out.push('---');
	out.push('');
	out.push($('team').value.trim() ? `# ${teamName} accessibility` : '# Accessibility');
	out.push('');
	let n = 1;

	if (!patterns.length && !weak.length) {
		out.push('Build to WCAG 2.2 Level AA, following the baseline below.');
	}
	else {
		out.push('Build to WCAG 2.2 Level AA. Apply these layers in order:');
		out.push('');
	}

	if (patterns.length) {
		out.push(`${n++}. **Our patterns.** The agreed way ${team} solves each case.`);
	}

	if (weak.length) {
		out.push(`${n++}. **Our weak spots.** The criteria our audits fail most. Check every one before you finish.`);
	}

	if (patterns.length || weak.length) {
		out.push(`${n++}. **The WCAG 2.2 AA baseline.** Everything else.`);
	}

	out.push('');
	out.push('Prefer native HTML elements over ARIA. When unsure, say what you could not verify instead of guessing.');

	if (patterns.length) {
		out.push('');
		out.push('## Our patterns');
		out.push('');
		out.push('When a pattern covers a case, use it exactly, even if another solution would also pass WCAG. Being consistent across the product is the goal.');
		out.push('');

		for (const pattern of patterns) {
			out.push(`- ${pattern}`);
		}
	}

	if (weak.length) {
		out.push('');
		out.push('## Our weak spots');
		out.push('');
		out.push('Check each of these on every change you make, even when the task does not mention accessibility.');

		for (const c of weak) {
			out.push('');
			out.push(`### ${c.id} ${c.title} (${c.level})`);
			out.push('');
			out.push(`- **What it means:** ${c.means}`);
			out.push(`- **Check:** ${c.check}`);
		}
	}

	if (links.length) {
		out.push('');
		out.push('## Our documentation');
		out.push('');
		out.push('Read the relevant page before building or changing a component it covers.');
		out.push('');

		for (const link of links) {
			out.push(`- [${link.title}](${link.url})`);
		}
	}

	out.push('');
	out.push('## WCAG 2.2 AA baseline');
	out.push('');
	out.push('Every change must also meet these.');

	for (const principle of PRINCIPLES) {
		out.push('');
		out.push(`### ${principle.id}. ${principle.name}`);
		out.push('');

		for (const c of CRITERIA.filter((x) => x.id.startsWith(`${principle.id}.`) && !selected.has(x.id))) {
			out.push(`- **${c.id} ${c.title}** (${c.level}): ${c.check}`);
		}

		if (CRITERIA.filter((x) => x.id.startsWith(`${principle.id}.`)).every((x) => selected.has(x.id))) {
			out.push('- All covered under "Our weak spots".');
		}
	}

	out.push('');
	out.push('## Before you finish');
	out.push('');

	if (patterns.length) {
		out.push('- [ ] The changed code follows our patterns.');
	}

	if (weak.length) {
		out.push(`- [ ] Each weak spot checked: ${weak.map((c) => c.id).join(', ')}.`);
	}

	out.push('- [ ] Everything works with the keyboard alone, with a visible focus.');
	out.push('- [ ] Every control and image has an accessible name.');
	out.push('- [ ] Text and controls meet contrast in every theme.');
	out.push('');
	out.push('In your reply, list what you checked and anything you could not verify, such as screen reader output.');
	out.push('');

	return out.join('\n');
}

// ---------------------------------------------------------------- output

let toastTimer;

function toast(message) {
	clearTimeout(toastTimer);
	$('toast').textContent = message;
	toastTimer = setTimeout(() => {
		$('toast').textContent = '';
	}, 5000);
}

function update() {
	if (!slugTouched) {
		$('slug').value = skillName();
	}

	syncBoxes();

	const path = `.claude/skills/${skillName()}/SKILL.md`;

	$('preview').textContent = buildSkill();
	$('file-path').textContent = path;
	$('install-path').textContent = path;
}

function download() {
	const blob = new Blob([buildSkill()], {type: 'text/markdown'});
	const link = document.createElement('a');

	link.href = URL.createObjectURL(blob);
	link.download = 'SKILL.md';
	link.click();
	URL.revokeObjectURL(link.href);
	toast(`Downloaded SKILL.md. Save it in a folder named ${skillName()}.`);
}

async function copy() {
	try {
		await navigator.clipboard.writeText(buildSkill());
		toast('Copied to the clipboard.');
	}
	catch {
		toast('Could not copy. Select the text in the preview and copy it.');
	}
}

// ---------------------------------------------------------------- start

renderGallery();
renderCriteria();

$('team').addEventListener('input', update);
$('slug').addEventListener('input', () => {
	slugTouched = $('slug').value.trim() !== '';
	update();
});
$('slug').addEventListener('change', () => {
	$('slug').value = skillName();
});
$('patterns').addEventListener('input', update);
$('links').addEventListener('input', update);
$('filter').addEventListener('input', applyFilter);
$('gallery-search').addEventListener('input', filterGallery);
$('paste-apply').addEventListener('click', applyPaste);
$('paste').addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		event.preventDefault();
		applyPaste();
	}
});
$('download').addEventListener('click', download);
$('copy').addEventListener('click', copy);
$('builder').addEventListener('submit', (event) => event.preventDefault());

// Arriving at the builder from a link moves focus to its heading.

for (const link of document.querySelectorAll('a[href="#build"]')) {
	link.addEventListener('click', () => requestAnimationFrame(() => $('build-title').focus({preventScroll: true})));
}

// The menu marks the section on screen.

const navLinks = [...document.querySelectorAll('nav a')];
const spy = new IntersectionObserver((entries) => {
	for (const entry of entries.filter((e) => e.isIntersecting)) {
		for (const link of navLinks) {
			if (link.getAttribute('href') === `#${entry.target.id}`) {
				link.setAttribute('aria-current', 'location');
			}
			else {
				link.removeAttribute('aria-current');
			}
		}
	}
}, {rootMargin: '-45% 0px -50% 0px'});

// The hero is watched too, so scrolling back up clears the mark.

for (const section of [$('top'), ...navLinks.map((link) => document.querySelector(link.getAttribute('href')))]) {
	spy.observe(section);
}

update();
