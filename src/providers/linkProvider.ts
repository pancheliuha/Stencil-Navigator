import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Registers DocumentLinkProvider so that <my-tag> is underlined and clickable.
 */
export function registerLinkProvider(
  context: vscode.ExtensionContext,
  root: string,
  tagMap: Map<string, string>
) {
  const selector: vscode.DocumentSelector = [
    { language: 'html', scheme: 'file' },
    { language: 'javascriptreact', scheme: 'file' },
    { language: 'typescriptreact', scheme: 'file' }
  ];

  const provider: vscode.DocumentLinkProvider = {
    provideDocumentLinks(document) {
      const text = document.getText();
      const links: vscode.DocumentLink[] = [];
      const regex = /<(\w[\w-]*)/g;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(text))) {
        const tag = m[1];
        const rel = tagMap.get(tag);
        if (!rel) continue;
        const fullPath = path.resolve(root, rel);
        const start = document.positionAt(m.index + 1);  // after '<'
        const end = document.positionAt(m.index + 1 + tag.length);
        links.push(
          new vscode.DocumentLink(
            new vscode.Range(start, end),
            vscode.Uri.file(fullPath)
          )
        );
      }
      return links;
    }
  };

  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(selector, provider)
  );
}
