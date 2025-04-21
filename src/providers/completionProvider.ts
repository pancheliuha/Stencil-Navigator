// src/providers/completionProvider.ts
import * as vscode from 'vscode';
import { stencilSelector } from '../utils/selectors';
import * as logger from '../utils/logger';

/**
 * Create a CompletionItemProvider for Stencil components:
 *  - suggests component tags on '<'
 *  - groups Props, Events, Methods, Slots inside an open tag
 */
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
    ): vscode.ProviderResult<vscode.CompletionItem[]> {
      const lineText = document.lineAt(position).text.substr(0, position.character);

      // ─── Tag suggestions on '<' ───
      if (completionContext.triggerCharacter === '<') {
        const tagItems: vscode.CompletionItem[] = [];
        for (const comp of json.tags) {
          const item = new vscode.CompletionItem(
            comp.name,
            vscode.CompletionItemKind.Class
          );
          item.insertText    = comp.name;
          item.detail        = tagMap.get(comp.name);
          item.documentation = new vscode.MarkdownString(comp.description.value);
          // force tags to the top and preselect the first one
          item.sortText = '\0' + comp.name;
          if (tagItems.length === 0) {
            item.preselect = true;
          }
          tagItems.push(item);
        }
        logger.info(`Tag completion: ${tagItems.length} items`);
        return tagItems;
      }

      // ─── Inside open tag: Props, Events, Methods, Slots ───
      const openTag = getOpenTagText(document, position);
      if (!openTag) {
        return;
      }
      const tagMatch = openTag.match(/<([\w-]+)/);
      if (!tagMatch) {
        return;
      }
      const tagName = tagMatch[1];
      const comp = json.tags.find((t: any) => t.name === tagName);
      if (!comp) {
        return;
      }

      // already used attributes
      const used = new Set<string>();
      for (const m of openTag.matchAll(/(\w+)=/g)) {
        used.add(m[1]);
      }

      const items: vscode.CompletionItem[] = [];

      // ─── Props ───
      const propsHeader = new vscode.CompletionItem('─── Props ───', vscode.CompletionItemKind.Text);
      propsHeader.sortText   = sortPrefix + '1_0';
      propsHeader.insertText = new vscode.SnippetString('');
      propsHeader.filterText = '';
      items.push(propsHeader);
      for (const p of comp.properties) {
        if (used.has(p.name)) continue;
        const it = new vscode.CompletionItem(p.name, vscode.CompletionItemKind.Property);
        it.insertText    = new vscode.SnippetString(`${p.name}="$1"$0`);
        if (p.type) it.detail = p.type;
        it.documentation = new vscode.MarkdownString(p.description);
        it.sortText      = sortPrefix + '1_' + p.name;
        items.push(it);
      }

      // ─── Events ───
      const eventsHeader = new vscode.CompletionItem('─── Events ───', vscode.CompletionItemKind.Text);
      eventsHeader.sortText   = sortPrefix + '2_0';
      eventsHeader.insertText = new vscode.SnippetString('');
      eventsHeader.filterText = '';
      items.push(eventsHeader);
      for (const e of comp.events) {
        if (used.has(e.name)) continue;
        const it = new vscode.CompletionItem(e.name, vscode.CompletionItemKind.Event);
        it.insertText    = new vscode.SnippetString(`${e.name}="$1"$0`);
        if (e.type) it.detail = e.type;
        it.documentation = new vscode.MarkdownString(e.description);
        it.sortText      = sortPrefix + '2_' + e.name;
        items.push(it);
      }

      // ─── Methods ───
      const methodsHeader = new vscode.CompletionItem('─── Methods ───', vscode.CompletionItemKind.Text);
      methodsHeader.sortText   = sortPrefix + '3_0';
      methodsHeader.insertText = new vscode.SnippetString('');
      methodsHeader.filterText = '';
      items.push(methodsHeader);
      for (const m of comp.methods) {
        const it = new vscode.CompletionItem(m.name + '()', vscode.CompletionItemKind.Method);
        it.insertText    = new vscode.SnippetString(`${m.name}($1)$0`);
        if (m.signature) it.detail = m.signature;
        it.documentation = new vscode.MarkdownString(m.description);
        it.sortText      = sortPrefix + '3_' + m.name;
        items.push(it);
      }

      // ─── Slots ───
      const slotsHeader = new vscode.CompletionItem('─── Slots ───', vscode.CompletionItemKind.Text);
      slotsHeader.sortText   = sortPrefix + '4_0';
      slotsHeader.insertText = new vscode.SnippetString('');
      slotsHeader.filterText = '';
      items.push(slotsHeader);
      for (const s of comp.slots) {
        if (used.has('slot')) continue;
        const label   = s.name === '' ? `slot=""` : `slot="${s.name}"`;
        const snippet = s.name === '' ? `slot="\${1}"$0` : `slot="${s.name}"$0`;
        const it = new vscode.CompletionItem(label, vscode.CompletionItemKind.Property);
        it.insertText    = new vscode.SnippetString(snippet);
        it.documentation = new vscode.MarkdownString(
          s.name === '' ? 'Default slot' : `Named slot \`${s.name}\``
        );
        it.sortText      = sortPrefix + '4_' + (s.name || '_default');
        items.push(it);
      }

      // ─── force the very first attribute/item to be visible ───
      if (items.length > 0) {
        items[0].preselect = true;
      }

      logger.info(`Completion for <${tagName}>: ${items.length} items`);
      return items;
    }
  };
}

/**
 * Register the CompletionItemProvider on the configured selector(s).
 */
export function registerCompletionProvider(
  context: vscode.ExtensionContext,
  json: any,
  tagMap: Map<string, string>,
  triggers: string[],
  sortPrefix: string
) {
  const provider = createCompletionProvider(json, tagMap, triggers, sortPrefix);
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      stencilSelector,
      provider,
      '<',
      ...triggers
    )
  );
}

/**
 * Helper: extract the current opening tag text from '<' up to the cursor.
 */
function getOpenTagText(
  document: vscode.TextDocument,
  position: vscode.Position
): string | null {
  let lineNum = position.line;
  let startChar: number | undefined;

  while (lineNum >= 0) {
    const text = document.lineAt(lineNum).text;
    const idx = text.indexOf('<');
    if (idx >= 0) {
      startChar = idx;
      break;
    }
    lineNum--;
  }

  if (startChar === undefined) {
    return null;
  }

  const startPos = new vscode.Position(lineNum, startChar);
  return document.getText(new vscode.Range(startPos, position));
}
