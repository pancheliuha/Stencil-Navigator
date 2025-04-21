import * as vscode from 'vscode';
import * as path from 'path';
import { loadProjectConfig } from '../utils/loadProjectConfig';
import { generateDataFile } from '../utils/generateData';

/**
 * Registers all commands:
 *  - stencilNavigator.reloadTags
 *  - stencilNavigator.generateData
 *  - stencilNavigator.welcome
 *  - stencilNavigator.findUsages
 */
export function registerCommands(
  context: vscode.ExtensionContext,
  root: string,
  tagMap: Map<string, string>
) {
  const cfg = loadProjectConfig(root);

  // reloadTags
  context.subscriptions.push(
    vscode.commands.registerCommand('stencilNavigator.reloadTags', async () => {
      try {
        const { tagMap: newMap } = await generateDataFile(
          root,
          cfg.dataSaveLocation,
          context.globalStorageUri
        );
        tagMap.clear();
        for (const [k, v] of newMap.entries()) {
          tagMap.set(k, v);
        }
        vscode.window.showInformationMessage('Stencil tags reloaded!');
      } catch (err: any) {
        vscode.window.showErrorMessage('Failed to reload tags: ' + err.message);
      }
    })
  );

  // generateData
  context.subscriptions.push(
    vscode.commands.registerCommand('stencilNavigator.generateData', async () => {
      try {
        await generateDataFile(
          root,
          cfg.dataSaveLocation,
          context.globalStorageUri
        );
        vscode.window.showInformationMessage('vscode-data.json generated!');
      } catch (err: any) {
        vscode.window.showErrorMessage('Failed to generate data file: ' + err.message);
      }
    })
  );

  // welcome
  context.subscriptions.push(
    vscode.commands.registerCommand('stencilNavigator.welcome', () => {
      vscode.commands.executeCommand('workbench.action.showCommands');
    })
  );

  // findUsages — open every candidate file as TextDocument and search there
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'stencilNavigator.findUsages',
      async (tagName: string) => {
        // build regex for the tag
        const regex = new RegExp(`<${tagName}\\b`, 'g');
        const locations: vscode.Location[] = [];

        // wrap multiple globs in {} for brace expansion
        const includeGlob = `{${cfg.filePatterns.join(',')}}`;
        const excludeGlob = `{${cfg.excludePatterns.join(',')}}`;

        console.log(`[StencilNav] scanning ${includeGlob} excluding ${excludeGlob}`);

        // 1) find candidate files
        const uris = await vscode.workspace.findFiles(includeGlob, excludeGlob);
        console.log(`[StencilNav] found ${uris.length} files to scan`);

        // 2) scan each document for matches
        for (const uri of uris) {
          let doc: vscode.TextDocument;
          try {
            doc = await vscode.workspace.openTextDocument(uri);
          } catch {
            continue;
          }
          const text = doc.getText();
          let match: RegExpExecArray | null;
          let fileCount = 0;
          while ((match = regex.exec(text))) {
            const pos = doc.positionAt(match.index);
            locations.push(new vscode.Location(uri, pos));
            fileCount++;
          }
          if (fileCount) {
            console.log(
              `[StencilNav] → ${path.relative(root, uri.fsPath)}: ${fileCount} match(es)`
            );
          }
        }

        console.log(`[StencilNav] total usages found: ${locations.length}`);

        if (locations.length === 0) {
          vscode.window.showInformationMessage(`No usages of <${tagName}> found.`);
          return;
        }

        // 3) open the component file and set cursor at the tag declaration
        const relPath = tagMap.get(tagName)!;
        const compUri = vscode.Uri.file(path.join(root, relPath));
        const compDoc = await vscode.workspace.openTextDocument(compUri);
        const compEditor = await vscode.window.showTextDocument(compDoc);
        const declIdx = compDoc.getText().indexOf(`<${tagName}`);
        const declPos =
          declIdx >= 0 ? compDoc.positionAt(declIdx) : new vscode.Position(0, 0);
        compEditor.selection = new vscode.Selection(declPos, declPos);

        // 4) show the standard References UI with our locations
        await vscode.commands.executeCommand(
          'editor.action.showReferences',
          compUri,
          declPos,
          locations
        );
      }
    )
  );
}
