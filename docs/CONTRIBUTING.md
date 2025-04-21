# Contributing

Thanks for your interest!  

## Setup

```bash
git clone https://github.com/your-org/stencil-navigator.git
cd stencil-navigator
npm install
npm run watch
```

## Development

- **F5** in VS Code to launch the Extension Development Host.  
- Edit code under `src/`, watch rebuilds via `npm run watch`.

## Testing

- **Unit tests**  
  ```bash
  npm run test:unit
  ```
- **End‑to‑end** (via `@vscode/test-electron`):  
  ```bash
  npm run test:e2e
  ```

## Publishing

1. Bump version in `package.json`.  
2. `vsce package` to create `.vsix`.  
3. `vsce publish` (ensure you have a Personal Access Token with publisher rights).  

For details, see [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension).

---

_Enjoy!_  
