import * as vscode from 'vscode';

export function registerMethodCompletionProvider(
  context: vscode.ExtensionContext,
  json: any,
  tagMap: Map<string,string>,
  sortPrefix: string
) {
  const selector: vscode.DocumentSelector = [
    { language: 'typescriptreact', scheme: 'file' },
    { language: 'javascriptreact', scheme: 'file' },
    { language: 'typescript', scheme: 'file' },
    { language: 'javascript', scheme: 'file' },
  ];

  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(document, position) {
      const line = document.lineAt(position).text.substring(0, position.character);
      // Looking for something like `<my-tag>.` or `tagRef.current.`
      // For simplicity — take the word before the dot
      const m = line.match(/([\w-]+)\.$/);
      if (!m) return;
      const tagOrRef = m[1];

      // If this is our tag name
      let comp = json.tags.find((t:any) => t.name === tagOrRef);
      // Or if this is a variable from querySelector('my-tag')
      if (!comp) {
        const q = tagOrRef.match(/querySelector<.*>\('([\w-]+)'\)/);
        if (q) comp = json.tags.find((t:any) => t.name === q[1]);
      }
      if (!comp || !comp.methods) return;

      const items: vscode.CompletionItem[] = [];
      for (const method of comp.methods) {
        const it = new vscode.CompletionItem(method.name, vscode.CompletionItemKind.Method);
        it.insertText = new vscode.SnippetString(`${method.name}($1)`);
        it.documentation = new vscode.MarkdownString(method.description);
        it.sortText = sortPrefix + method.name;
        items.push(it);
      }
      return items;
    }
  };

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(selector, provider, '.')
  );
}
