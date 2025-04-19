import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export function setupWatcherAndReload(context: vscode.ExtensionContext, root: string) {
  const storageUri = context.globalStorageUri;
  const filePath = path.join(storageUri.fsPath, 'vscode-data.json');

  if (!fs.existsSync(filePath)) return;
  const watcher = fs.watch(filePath, () => {
    vscode.window.showInformationMessage('🔁 Stencil tags updated');
  });

  context.subscriptions.push({ dispose: () => watcher.close() });
}
