# Accessibility Skills

Accessibility skills for AI coding assistants, and a builder to make your own.

A generic accessibility skill makes your AI meet the minimum. A skill that knows your weak spots and your patterns makes every team build the same, better way. Every skill made here joins three layers:

1. **The base:** all 55 WCAG 2.2 Level A and AA success criteria, each with what to check in code.
2. **Your weak spots:** the criteria your audits fail most, put first and checked on every change.
3. **Your patterns:** how your team solves each case, plus links to your documentation.

The builder runs entirely in the browser. Nothing is sent anywhere, and the skills it makes are plain text that run no code.

## Share a skill

Add an entry to `data/skills.js` and open a pull request. Each entry has a `kind` (`link`, `builder` or `case`), a `name`, an `author`, a `source` (`official`, `community` or `internal`), a `description` and `tags`. Links point to the skill's source so people can read it before installing.

## Run it locally

It is a static site with no build step:

```bash
python3 -m http.server 8778
```

Then open http://localhost:8778.

## Publish

Enable GitHub Pages for the repository (Settings, Pages, deploy from the `main` branch, root folder).
