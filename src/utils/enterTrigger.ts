import * as vscode from 'vscode';

export function registerEnterTrigger(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document !== event.document) return;

      for (const change of event.contentChanges) {
        // Triggers on any input of '\n'
        if (change.text.includes('\n')) {
          const pos = change.range.end;
          const openTag = getOpenTagText(editor.document, pos);
          // inside an unclosed opening tag?
          if (openTag && openTag.startsWith('<') && !openTag.includes('>')) {
            // Allow time for VSCode to insert indentation
            setTimeout(() => {
              vscode.commands.executeCommand('editor.action.triggerSuggest');
            }, 100);
          }
        }
      }
    })
  );
}

function getOpenTagText(document: vscode.TextDocument, position: vscode.Position): string | null {
  let line = position.line;
  let charIndex: number | undefined;

  while (line >= 0) {
    const text = document.lineAt(line).text;
    const idx = text.indexOf('<');
    if (idx !== -1) {
      charIndex = idx;
      break;
    }
    line--;
  }
  if (charIndex === undefined) return null;

  const start = new vscode.Position(line, charIndex);
  const range = new vscode.Range(start, position);
  return document.getText(range);
}
