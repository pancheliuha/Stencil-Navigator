import * as vscode from 'vscode';
import { stencilSelector } from '../utils/selectors';
import * as logger from '../utils/logger';

export function createCompletionProvider(
  json: any,
  tagMap: Map<string, string>,
  triggers: string[],
  sortPrefix: string
): vscode.CompletionItemProvider {
  return {
    provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position,
      token: vscode.CancellationToken,
      completionContext: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
      // (ваша існуюча логіка)
      const openTag = getOpenTagText(document, position);
      if (!openTag) return;

      const tagMatch = openTag.match(/<([\w-]+)/);
      if (!tagMatch) return;

      const tagName = tagMatch[1];
      const comp = json.tags.find((t: any) => t.name === tagName);
      if (!comp) return;

      const used = new Set<string>();
      for (const m of openTag.matchAll(/(\w+)=/g)) used.add(m[1]);

      const items: vscode.CompletionItem[] = [];

      // Props section …
      const ph = new vscode.CompletionItem('⸺ Props ⸺', vscode.CompletionItemKind.Text);
      ph.sortText = sortPrefix + '1_0';
      ph.insertText = new vscode.SnippetString('');
      ph.filterText = '';
      items.push(ph);
      for (const p of comp.properties) {
        if (used.has(p.name)) continue;
        const it = new vscode.CompletionItem(p.name, vscode.CompletionItemKind.Property);
        it.insertText = new vscode.SnippetString(`${p.name}="$1"`);
        if (p.type) it.detail = p.type;
        it.documentation = new vscode.MarkdownString(p.description);
        it.sortText = sortPrefix + '1_' + p.name;
        items.push(it);
      }

      // Events section …
      const eh = new vscode.CompletionItem('⸺ Events ⸺', vscode.CompletionItemKind.Text);
      eh.sortText = sortPrefix + '2_0';
      eh.insertText = new vscode.SnippetString('');
      eh.filterText = '';
      items.push(eh);
      for (const e of comp.events) {
        if (used.has(e.name)) continue;
        const it = new vscode.CompletionItem(e.name, vscode.CompletionItemKind.Event);
        it.insertText = new vscode.SnippetString(`${e.name}="$1"`);
        if (e.type) it.detail = e.type;
        it.documentation = new vscode.MarkdownString(e.description);
        it.sortText = sortPrefix + '2_' + e.name;
        items.push(it);
      }

      // Slots section …
      const sh = new vscode.CompletionItem('⸺ Slots ⸺', vscode.CompletionItemKind.Text);
      sh.sortText = sortPrefix + '3_0';
      sh.insertText = new vscode.SnippetString('');
      sh.filterText = '';
      items.push(sh);
      for (const s of comp.slots) {
        if (used.has('name')) continue;
        const it = new vscode.CompletionItem('name', vscode.CompletionItemKind.Property);
        it.insertText = new vscode.SnippetString(`name="${s.name}"`);
        it.documentation = new vscode.MarkdownString(s.description);
        it.sortText = sortPrefix + '3_' + s.name;
        items.push(it);
      }

      logger.info(`Completion for <${tagName}>: ${items.length} items`);
      return items;
    }
  };
}

export function registerCompletionProvider(
  context: vscode.ExtensionContext,
  json: any,
  tagMap: Map<string, string>,
  triggers: string[],
  sortPrefix: string
) {
  const provider = createCompletionProvider(json, tagMap, triggers, sortPrefix);
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(stencilSelector, provider, ...triggers)
  );
}

/** Retrieves the open tag text */
function getOpenTagText(
  document: vscode.TextDocument,
  position: vscode.Position
): string | null {
  let line = position.line;
  let startChar: number | undefined;
  while (line >= 0) {
    const text = document.lineAt(line).text;
    const idx = text.indexOf('<');
    if (idx >= 0) { startChar = idx; break; }
    line--;
  }
  if (startChar === undefined) return null;
  const start = new vscode.Position(line, startChar);
  return document.getText(new vscode.Range(start, position));
}
