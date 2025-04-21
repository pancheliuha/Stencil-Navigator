# Configuration Reference

You can override defaults by adding `stencil-navigator.config.json` to your project root:

```jsonc
{
  "filePatterns": [
    "src/components/**/*.tsx",
    "src/pages/**/*.{tsx,jsx,html}"
  ],
  "excludePatterns": [
    "node_modules/**",
    "dist/**"
  ],
  "dataSaveLocation": "extensionStorage",
  "completionTriggers": [" ", "<", "/"],
  "sortPrefix": "0",
  "features": {
    "definition": true,
    "hover": true,
    "completion": true,
    "links": true,
    "findUsages": true,
    "welcomePanel": true,
    "enterTrigger": false
  }
}
```

| Property                  | Type                               | Default                                  | Description                                                                     |
|---------------------------|------------------------------------|------------------------------------------|---------------------------------------------------------------------------------|
| `filePatterns`            | `string[]`                         | `["src/components/**/*.tsx"]`            | Glob(s) for files to include when scanning.                                     |
| `excludePatterns`         | `string[]`                         | `["node_modules/**","dist/**"]`          | Glob(s) for files to exclude from scanning.                                     |
| `dataSaveLocation`        | `"projectRoot" \| "extensionStorage"` | `"projectRoot"`                          | Where to write `vscode-data.json`.                                              |
| `completionTriggers`      | `string[]`                         | `[" ", "<", "/"]`                        | Characters that trigger attribute completion.                                   |
| `sortPrefix`              | `string`                           | `"0"`                                    | Prefix used to sort tag suggestions before props.                               |
| `features`.<br>`definition` | `boolean`                       | `true`                                   | Enable Go to Definition.                                                        |
| `features`.<br>`hover`      | `boolean`                         | `true`                                   | Enable Hover tooltips.                                                          |
| `features`.<br>`completion` | `boolean`                       | `true`                                   | Enable IntelliSense for tags/props/events/methods/slots.                        |
| `features`.<br>`links`      | `boolean`                         | `true`                                   | Enable clickable Document Links in markup.                                      |
| `features`.<br>`findUsages` | `boolean`                       | `true`                                   | Enable CodeLens “Find Usages” feature.                                          |
| `features`.<br>`welcomePanel` | `boolean`                     | `true`                                   | Show welcome panel on first activation.                                         |
| `features`.<br>`enterTrigger` | `boolean`                      | `false`                                  | Trigger attribute completion when pressing Enter.                               |
