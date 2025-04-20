# Configuration Reference

Stencil Navigator supports two ways to configure:

1. **Project‑level file**  
   Create `stencil-navigator.config.json` at your project root.

2. **VS Code Settings**  
   Under the `stencilNavigator` section in User or Workspace settings.

---

## `stencil-navigator.config.json`

```jsonc
{
  "dataSaveLocation": "projectRoot",    // or "extensionStorage"
  "completionTriggers": [" ", ":"],     // which chars trigger autocomplete
  "sortPrefix": "!",                    // prefix to order completion groups
  "features": {
    "definition": true,
    "completion": true,
    "hover": true,
    "links": true,
    "slots": true,
    "methods": true,
    "findUsages": true,
    "outline": false
  }
}
```

| Property               | Type                   | Default        | Description                                 |
| ---------------------- | ---------------------- | -------------- | ------------------------------------------- |
| `dataSaveLocation`     | `"projectRoot"|...`     | `"projectRoot"`| Where to save `vscode-data.json`.           |
| `completionTriggers`   | `string[]`             | `[" ", ":"]`   | Characters that invoke autocomplete.        |
| `sortPrefix`           | `string`               | `"!"`          | Prefix to force ordering in completion.     |
| `features`             | `object`               | (see above)    | Toggle each feature on/off.                 |

---

## VS Code Settings

```jsonc
{
  "stencilNavigator.dataSaveLocation": "extensionStorage",
  "stencilNavigator.completionTriggers": [" ", ":"],
  "stencilNavigator.features.slots": false
}
