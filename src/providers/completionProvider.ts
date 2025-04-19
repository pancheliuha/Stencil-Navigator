// src/providers/completionProvider.ts

import * as vscode from 'vscode';

export function registerCompletionProvider(
  context: vscode.ExtensionContext,
  json: any,
  tagMap: Map<string, string>,
  triggers: string[],
  sortPrefix: string
) {
  const selector: vscode.DocumentSelector = [
    { language: 'html', scheme: 'file' },
    { language: 'javascriptreact', scheme: 'file' },
    { language: 'typescriptreact', scheme: 'file' }
  ];

  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(document, position) {
      // get the text of the open tag from its '<' to the cursor
      const openTag = getOpenTagText(document, position);
      if (!openTag) {
        return;
      }

      // detect slot="…" context first
      const slotMatch = openTag.match(/<slot\s+[^>]*\bname=["']([^"']*)$/);
      if (slotMatch) {
        const parentMatch = openTag.match(/<([\w-]+)/);
        if (!parentMatch) {
          return;
        }
        const parentTag = parentMatch[1];
        const comp = json.tags.find((t: any) => t.name === parentTag);
        if (!comp || !comp.slots) {
          return;
        }

        const prefix = slotMatch[1];
        return comp.slots
          .filter((s: any) => s.name.startsWith(prefix))
          .map((s: any) => {
            const item = new vscode.CompletionItem(
              s.name,
              vscode.CompletionItemKind.EnumMember
            );
            item.insertText = s.name + '"';
            item.documentation = new vscode.MarkdownString(s.description);
            item.sortText = sortPrefix + '2_' + s.name;
            return item;
          });
      }

      // detect typing tag name
      const isTypingTagName = /^[^>]*<[\w-]*$/.test(openTag);
      if (isTypingTagName) {
        return json.tags.map((t: any) => {
          const it = new vscode.CompletionItem(t.name, vscode.CompletionItemKind.Class);
          it.detail = t.path;
          it.documentation = new vscode.MarkdownString(t.description.value);
          it.sortText = sortPrefix + '0_' + t.name;
          return it;
        });
      }

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

      // collect already used attributes to avoid duplicates
      const used = new Set<string>();
      for (const m of openTag.matchAll(/(\w+)=/g)) {
        used.add(m[1]);
      }

      const items: vscode.CompletionItem[] = [];

      // --- Props Section Header ---
      const propsHeader = new vscode.CompletionItem('⸺ Props ⸺', vscode.CompletionItemKind.Text);
      propsHeader.sortText = sortPrefix + '1_0';
      // prevent accidental insertion
      propsHeader.insertText = new vscode.SnippetString('');
      propsHeader.filterText = '';
      items.push(propsHeader);

      // --- Props Items ---
      for (const p of comp.properties) {
        if (used.has(p.name)) {
          continue;
        }
        const it = new vscode.CompletionItem(p.name, vscode.CompletionItemKind.Property);
        it.insertText = new vscode.SnippetString(`${p.name}="$1"`);
        it.documentation = new vscode.MarkdownString(p.description);
        it.sortText = sortPrefix + '1_' + p.name;
        items.push(it);
      }

      // --- Events Section Header ---
      const eventsHeader = new vscode.CompletionItem('⸺ Events ⸺', vscode.CompletionItemKind.Text);
      eventsHeader.sortText = sortPrefix + '2_0';
      eventsHeader.insertText = new vscode.SnippetString('');
      eventsHeader.filterText = '';
      items.push(eventsHeader);

      // --- Events Items ---
      for (const e of comp.events) {
        if (used.has(e.name)) {
          continue;
        }
        const it = new vscode.CompletionItem(e.name, vscode.CompletionItemKind.Event);
        it.insertText = new vscode.SnippetString(`${e.name}="$1"`);
        it.documentation = new vscode.MarkdownString(e.description);
        it.sortText = sortPrefix + '2_' + e.name;
        items.push(it);
      }

      // --- Slots Section Header ---
      const slotsHeader = new vscode.CompletionItem('⸺ Slots ⸺', vscode.CompletionItemKind.Text);
      slotsHeader.sortText = sortPrefix + '3_0';
      slotsHeader.insertText = new vscode.SnippetString('');
      slotsHeader.filterText = '';
      items.push(slotsHeader);

      // --- Slots Items ---
      for (const s of comp.slots) {
        if (used.has('name')) {
          // if user already typed name="...", skip main slot attr
          continue;
        }
        const it = new vscode.CompletionItem('name', vscode.CompletionItemKind.Property);
        it.insertText = new vscode.SnippetString(`name="${s.name}"`);
        it.documentation = new vscode.MarkdownString(s.description);
        it.sortText = sortPrefix + '3_' + s.name;
        items.push(it);
      }

      return items;
    }
  };

  // register with given trigger characters
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(selector, provider, ...triggers)
  );
}

/**
 * Retrieves the text range from the start of the open tag '<' to the cursor.
 * Supports multi-line tags.
 */
function getOpenTagText(
  document: vscode.TextDocument,
  position: vscode.Position
): string | null {
  let line = position.line;
  let startChar: number | undefined;

  while (line >= 0) {
    const text = document.lineAt(line).text;
    const idx = text.indexOf('<');
    if (idx >= 0) {
      startChar = idx;
      break;
    }
    line--;
  }
  if (startChar === undefined) {
    return null;
  }

  const start = new vscode.Position(line, startChar);
  const range = new vscode.Range(start, position);
  return document.getText(range);
}
