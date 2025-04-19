import * as vscode from 'vscode';
import { stencilSelector } from '../utils/selectors';
import * as logger from '../utils/logger';

export function registerCompletionProvider(
  context: vscode.ExtensionContext,
  json: any,
  tagMap: Map<string, string>,
  triggers: string[],
  sortPrefix: string
) {
  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(document, position) {
      const openTag = getOpenTagText(document, position);
      if (!openTag) return;

      // detect inside a component tag
      const tagMatch = openTag.match(/<([\w-]+)/);
      if (!tagMatch) {
        return;
      }
      const tagName = tagMatch[1];
      const comp = json.tags.find((t: any) => t.name === tagName);
      if (!comp) {
        return;
      }

      // collect already used attrs
      const used = new Set<string>();
      for (const m of openTag.matchAll(/(\w+)=/g)) used.add(m[1]);

      const items: vscode.CompletionItem[] = [];

      // Props header
      const propsHeader = new vscode.CompletionItem('⸺ Props ⸺', vscode.CompletionItemKind.Text);
      propsHeader.sortText = sortPrefix + '1_0';
      propsHeader.insertText = new vscode.SnippetString('');
      propsHeader.filterText = '';
      items.push(propsHeader);

      // Props items
      for (const p of comp.properties) {
        if (used.has(p.name)) continue;
        const it = new vscode.CompletionItem(p.name, vscode.CompletionItemKind.Property);
        it.insertText = new vscode.SnippetString(`${p.name}="$1"`);
        if (p.type) it.detail = p.type;
        it.documentation = new vscode.MarkdownString(p.description);
        it.sortText = sortPrefix + '1_' + p.name;
        items.push(it);
      }

      // Events header
      const eventsHeader = new vscode.CompletionItem('⸺ Events ⸺', vscode.CompletionItemKind.Text);
      eventsHeader.sortText = sortPrefix + '2_0';
      eventsHeader.insertText = new vscode.SnippetString('');
      eventsHeader.filterText = '';
      items.push(eventsHeader);

      // Events items
      for (const e of comp.events) {
        if (used.has(e.name)) continue;
        const it = new vscode.CompletionItem(e.name, vscode.CompletionItemKind.Event);
        it.insertText = new vscode.SnippetString(`${e.name}="$1"`);
        if (e.type) it.detail = e.type;
        it.documentation = new vscode.MarkdownString(e.description);
        it.sortText = sortPrefix + '2_' + e.name;
        items.push(it);
      }

      // Slots header
      const slotsHeader = new vscode.CompletionItem('⸺ Slots ⸺', vscode.CompletionItemKind.Text);
      slotsHeader.sortText = sortPrefix + '3_0';
      slotsHeader.insertText = new vscode.SnippetString('');
      slotsHeader.filterText = '';
      items.push(slotsHeader);

      // Slots items
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
