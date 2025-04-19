import * as vscode from 'vscode';

export function showWelcomePanel(extensionUri: vscode.Uri) {
  const panel = vscode.window.createWebviewPanel('stencilNavWelcome', 'Stencil Navigator', vscode.ViewColumn.One, {});
  panel.webview.html = `
    <!DOCTYPE html>
    <html lang="en">
    <body style="font-family: sans-serif; padding: 2rem;">
      <h1>👋 Welcome to Stencil Navigator</h1>
      <p>This extension provides:</p>
      <ul>
        <li>Go to Definition for your custom elements</li>
        <li>Hover info with descriptions</li>
        <li>Attribute autocomplete</li>
      </ul>
      <p>Use the command palette to reload tags or show this welcome panel again.</p>
    </body>
    </html>`;
}
