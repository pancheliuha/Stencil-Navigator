import * as vscode from 'vscode';
import * as path from 'path';

export function registerUsageProvider(
  context: vscode.ExtensionContext,
  root: string,
  tagMap: Map<string, string>
) {
  const provider: vscode.CodeLensProvider = {
    provideCodeLenses(document) {
      // Searching for a line in the file with @Component({ tag: '…' })
      const text = document.getText();
      const match = /@Component\(\s*\{\s*tag\s*:\s*['"]([^'"]+)['"]/m.exec(text);
      if (!match) {
        return [];
      }
      const tagName = match[1];
      // Find the position of the decorator
      const offset = match.index;
      const position = document.positionAt(offset);
      const range = new vscode.Range(position, position);

      const cmd: vscode.Command = {
        title: `🔍 Find <${tagName}> usages`,
        command: 'stencilNavigator.findUsages',
        arguments: [tagName]
      };
      return [new vscode.CodeLens(range, cmd)];
    }
  };

  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { scheme: 'file', pattern: '**/*.tsx' },
      provider
    )
  );
}
