import * as vscode from 'vscode';
import * as path from 'path';

export function registerUsageProvider(
  context: vscode.ExtensionContext,
  root: string,
  tagMap: Map<string, string>
) {
  // Provides a CodeLens at the top of component files for "Find Usages"
  const codeLensProvider: vscode.CodeLensProvider = {
    provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
      // compute relative path of current document
      const rel = path.relative(root, document.uri.fsPath);
      // find the tag that corresponds to this file
      const entry = Array.from(tagMap.entries()).find(([, p]) => p === rel);
      if (!entry) {
        return [];
      }
      const [tagName] = entry;
      // place the CodeLens at line 0
      const range = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
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
      codeLensProvider
    )
  );
}
