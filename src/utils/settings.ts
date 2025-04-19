import * as vscode from 'vscode';

export function getExtensionSettings(): { dataSaveLocation: 'projectRoot' | 'extensionStorage' } {
  const config = vscode.workspace.getConfiguration('stencilNavigator');
  return {
    dataSaveLocation: config.get<'projectRoot' | 'extensionStorage'>('dataSaveLocation', 'projectRoot')
  };
}
