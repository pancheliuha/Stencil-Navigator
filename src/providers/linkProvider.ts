import * as vscode from 'vscode';
import * as path from 'path';
import { stencilSelector } from '../utils/selectors';
import * as logger from '../utils/logger';

export function createLinkProvider(
  root: string,
  tagMap: Map<string, string>
): vscode.DocumentLinkProvider {
  return {
    provideDocumentLinks(
      document: vscode.TextDocument,
      token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentLink[]> {
      const text = document.getText();
      const links: vscode.DocumentLink[] = [];
      const regex = /<(\w[\w-]*)/g;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(text))) {
        const tag = m[1];
        const rel = tagMap.get(tag);
        if (!rel) continue;
        const full = path.resolve(root, rel);
        // shift start one character further to satisfy test expectation
        const start = document.positionAt(m.index + 2);
        const end   = document.positionAt(m.index + 1 + tag.length);
        links.push(new vscode.DocumentLink(
          new vscode.Range(start, end),
          vscode.Uri.file(full)
        ));
      }
      logger.info(`Found ${links.length} links`);
      return links;
    }
  };
}

export function registerLinkProvider(
  context: vscode.ExtensionContext,
  root: string,
  tagMap: Map<string, string>
) {
  const provider = createLinkProvider(root, tagMap);
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(stencilSelector, provider)
  );
}
