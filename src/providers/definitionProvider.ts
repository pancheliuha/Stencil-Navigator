import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Registers Go To Definition for Stencil tags.
 */
export function registerDefinitionProvider(
  context: vscode.ExtensionContext,
  root: string,
  tagMap: Map<string, string>
) {
  const selector: vscode.DocumentSelector = [
    { language: 'html', scheme: 'file' },
    { language: 'javascriptreact', scheme: 'file' },
    { language: 'typescriptreact', scheme: 'file' }
  ];

  const provider: vscode.DefinitionProvider = {
    provideDefinition(document, position) {
      // match tag name under cursor: "<my-tag"
      const wordRange = document.getWordRangeAtPosition(
        position,
        /(?<=<)\w[\w-]*/  // lookbehind for '<', then tag chars
      );
      if (!wordRange) {
        return;
      }
      const tag = document.getText(wordRange);
      const rel = tagMap.get(tag);
      if (!rel) {
        return;
      }
      const fullPath = path.resolve(root, rel);
      if (!fs.existsSync(fullPath)) {
        vscode.window.showWarningMessage(`[StencilNav] File not found: ${rel}`);
        return;
      }
      return new vscode.Location(vscode.Uri.file(fullPath), new vscode.Position(0, 0));
    }
  };

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(selector, provider)
  );
}
