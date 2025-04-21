# Changelog

All notable changes to **Stencil Navigator**.

## [0.2.0] - 2025-04-21

### 🚀 Added
- **Slot support**: now parses `<slot>` tags in JSX and offers `slot=""` (default) and `slot="name"` completions under a dedicated “Slots” section.
- **Method completions**: lists `@Method()`‐decorated methods in their own “Methods” section with signature snippets.
- **Usage CodeLens**: shows a “🔍 Find \<component\> usages” link at the top of component files, triggering a workspace search.
- **Welcome panel**: one‑time welcome HTML panel on first install.
- **Feature toggles**: enable/disable definitions, hovers, links, completions, enter‑key trigger, welcome panel via config.

### ♻️ Changed
- **Slot parsing**: removed the (nonexistent) `@Slot` decorator approach; switched to AST‑based detection of `<slot>` elements.
- **Completion ordering**: tag suggestions and attribute sections now set `preselect = true` and use `sortText = '\0...'` to ensure they appear at the top of the list.
- **Split triggers**: tag‐only provider triggers on `<`, attribute provider on space/`=` to avoid conflicts with other HTML providers.

### 🐛 Fixed
- **Scrolling glitch**: suggestion widget now consistently opens scrolled to your items.
- **TypeScript & API fixes**: corrected missing `insertTextFormat`, adjusted provider signatures to include cancellation tokens, removed outdated VS Code API proposals.
- **DefinitionProvider**: improved fallback when component file is missing and silenced spurious warnings.

## [0.1.0] - 2025-03-15
- Initial release
  - Go‑to‑definition for Stencil tags via `vscode-data.json` mapping
  - Hover tooltips showing `<tag>` snippet + description
  - Basic props/events completions
  - `stencilNavigator.reloadTags` command and status‐bar widget

---

_For full history and contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md)_
