# Stencil Navigator

[![Version](https://img.shields.io/npm/v/stencil-navigator.svg)](https://npmjs.org/package/stencil-navigator)  
[![Downloads/week](https://img.shields.io/npm/dw/stencil-navigator.svg)](https://npmjs.org/package/stencil-navigator)  
![VSCode Marketplace](https://img.shields.io/vscode-marketplace/v/your-name-or-org.stencil-navigator)

> A VS Code extension that supercharges Stencil.js development with Go to Definition, autocomplete (props/events/slots/methods), hover‑docs, document‑links, slots support, Find Usages, and more.

---

## Features

- **Go to Definition** on any `<my-component>` tag  
- **Autocomplete**:
  - Component tags  
  - Props, Events, Slots, Methods (`@Method()`)  
- **Hover** tooltips showing signature & JSDoc of components  
- **Document Links**: click a tag to open its `.tsx` file  
- **Slots & Named Slots**: suggest `<slot name="…">` entries for `@Slot()`  
- **Find Usages (CodeLens)**: see where a component is used  
- **Outline Integration**: view component API (props/events/slots) in the Outline pane  
- **Configurable** via `stencil-navigator.config.json` or workspace settings  

---

## Installation

1. Install from the VS Code Marketplace.  
2. Reload VS Code.

---

## Getting Started

Once installed, open any Stencil.js project and edit a `.tsx` or `.html` file:

- **Go to Definition**: Ctrl+Click or F12 on `<my-component>`.  
- **Autocomplete**:
  - Type `<` and select a component.  
  - Inside `<my-component ` hit **Space** or **Ctrl+Space** to see Props/Events/Slots/Methods.  
- **Hover**: Hover over a tag to see signature and docs.  
- **Document Links**: Hover near `<my-component>` and click the link icon.  
- **Find Usages**: Click the CodeLens above a component class:
  ```tsx
  @Component({ tag: 'my-component' })
  // 🔍 Find <my-component> usages
  export class MyComponent { … }
  ```  
- **Outline**: In the Outline view, expand your component to see Props, Events, Slots.

---

## Configuration

Stencil Navigator can be configured via:

- **Project file**: `stencil-navigator.config.json` at project root  
- **VS Code settings**: under `stencilNavigator`

See [`docs/CONFIGURATION.md`](./docs/CONFIGURATION.md) for details.

---

## Keyboard Shortcuts & Commands

| Command                        | Keybinding                           |
| ------------------------------ | ------------------------------------ |
| Reload Tags                    | Command Palette → Reload Tags        |
| Generate `vscode-data.json`    | Command Palette → Generate Data      |
| Welcome Panel                  | Command Palette → Welcome            |
| Find Usages (CodeLens)         | Click CodeLens link                  |

---

## Contributing

1. Fork & clone this repo  
2. `npm install`  
3. `npm run watch`  
4. F5 to launch Extension Host  
5. Submit PR; ensure `npm run test:unit` passes

---

## License

MIT © [Your Name or Org](https://your-website.example.com)
