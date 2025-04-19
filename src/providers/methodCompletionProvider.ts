import * as vscode from 'vscode';
import { stencilSelector } from '../utils/selectors';
import * as logger from '../utils/logger';

/**
 * Suggests @Method() methods in TS/JS code
 */
export function registerMethodCompletionProvider(
  context: vscode.ExtensionContext,
  json: any,
  tagMap: Map<string, string>,
  sortPrefix: string
) {
  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(document, position) {
      // only in TS/JS files
      if (!['typescriptreact', 'javascriptreact'].includes(document.languageId)) {
        return;
      }
      const word = document.getText(document.getWordRangeAtPosition(position));
      // find methods that start with current word
      const suggestions: vscode.CompletionItem[] = [];
      for (const comp of json.tags) {
        for (const m of comp.methods) {
          if (m.name.startsWith(word)) {
            const it = new vscode.CompletionItem(
              m.name + '()', vscode.CompletionItemKind.Method
            );
            it.insertText = new vscode.SnippetString(`${m.name}($0)`);
            it.documentation = new vscode.MarkdownString(m.description);
            if (m.signature) it.detail = m.signature;
            it.sortText = sortPrefix + m.name;
            suggestions.push(it);
          }
        }
      }
      logger.info(`MethodCompletion: ${suggestions.length} items`);
      return suggestions;
    }
  };

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      stencilSelector,
      provider,
      '.'  // trigger on dot
    )
  );
}
