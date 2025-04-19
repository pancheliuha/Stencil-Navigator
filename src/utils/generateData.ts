import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { parseStencilComponents } from './parseStencilComponents';

export async function generateDataFile(
  root: string,
  dataSaveLocation: 'projectRoot' | 'extensionStorage',
  globalStorageUri: vscode.Uri
) {
  const { json, tagMap } = await parseStencilComponents(root);
  let outUri: vscode.Uri;

  if (dataSaveLocation === 'projectRoot') {
    outUri = vscode.Uri.file(path.join(root, 'vscode-data.json'));
  } else {
    await vscode.workspace.fs.createDirectory(globalStorageUri);
    outUri = vscode.Uri.joinPath(globalStorageUri, 'vscode-data.json');
  }

  await vscode.workspace.fs.writeFile(outUri, Buffer.from(JSON.stringify(json, null, 2), 'utf8'));
  return { json, tagMap };
}
