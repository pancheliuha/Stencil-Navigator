import * as vscode from 'vscode';

export function registerHoverProvider(
  context: vscode.ExtensionContext,
  root: string,
  json: any,
  tagMap: Map<string, string>
) {
  const provider = vscode.languages.registerHoverProvider(
    [{ language: 'html', scheme: 'file' }, { language: 'javascriptreact', scheme: 'file' }, { language: 'typescriptreact', scheme: 'file' }],
    {
      provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position, /(?<=<)\w[\w-]*/);
        if (!range) return;
        const tag = document.getText(range);
        const component = json.tags.find((t: any) => t.name === tag);
        if (!component) return;
        const md = new vscode.MarkdownString();
        md.appendCodeblock(`<${tag}>`, 'html');
        if (component.description.value) {
          md.appendMarkdown('\n\n' + component.description.value);
        }
        return new vscode.Hover(md, range);
      }
    }
  );
  context.subscriptions.push(provider);
}
