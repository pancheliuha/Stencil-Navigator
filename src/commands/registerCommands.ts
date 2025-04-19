// src/commands/registerCommands.ts

import * as vscode from 'vscode';
import * as path from 'path';
import { generateDataFile } from '../utils/generateData';
import { loadProjectConfig } from '../utils/loadProjectConfig';
import { showWelcomePanel } from '../panels/welcomePanel';

export function registerCommands(
  context: vscode.ExtensionContext,
  root: string,
  tagMap: Map<string, string>
) {
  // Reload stencil-data.json
  const reloadCommand = vscode.commands.registerCommand(
    'stencilNavigator.reloadTags',
    async () => {
      const cfg = loadProjectConfig(root);
      try {
        await generateDataFile(root, cfg.dataSaveLocation, context.globalStorageUri);
        vscode.window.showInformationMessage('🔁 Stencil tags reloaded!');
      } catch (e) {
        vscode.window.showErrorMessage('Failed to reload stencil tags.');
        console.error(e);
      }
    }
  );
  context.subscriptions.push(reloadCommand);

  // Generate stencil-data.json manually
  const generateCommand = vscode.commands.registerCommand(
    'stencilNavigator.generateData',
    async () => {
      const cfg = loadProjectConfig(root);
      try {
        await generateDataFile(root, cfg.dataSaveLocation, context.globalStorageUri);
        vscode.window.showInformationMessage('Stencil data file generated.');
      } catch (e) {
        vscode.window.showErrorMessage('Failed to generate stencil data file.');
        console.error(e);
      }
    }
  );
  context.subscriptions.push(generateCommand);

  // Show welcome panel on demand
  const welcomeCommand = vscode.commands.registerCommand(
    'stencilNavigator.welcome',
    () => {
      showWelcomePanel(context.extensionUri);
    }
  );
  context.subscriptions.push(welcomeCommand);

  // Find usages of a component tag (manual search)
  const findUsagesCommand = vscode.commands.registerCommand(
    'stencilNavigator.findUsages',
    async (tagName: string) => {
      // build regex to match "<tagName " or "<tagName>"
      const pattern = new RegExp(`<${tagName}(\\s|>)`, 'gi');
      const results: vscode.Location[] = [];

      // find candidate files
      const files = await vscode.workspace.findFiles(
        '**/*.{tsx,jsx,html}',
        '**/node_modules/**'
      );

      // scan each file for the first occurrence
      for (const uri of files) {
        try {
          const doc = await vscode.workspace.openTextDocument(uri);
          const text = doc.getText();
          const match = pattern.exec(text);
          if (match) {
            const pos = doc.positionAt(match.index);
            results.push(new vscode.Location(uri, pos));
          }
        } catch (e) {
          console.error('[StencilNav] Error scanning file for usages:', uri.fsPath, e);
        }
      }

      if (results.length === 0) {
        vscode.window.showInformationMessage(`No usages found for <${tagName}>`);
        return;
      }

      // prepare QuickPick items
      const items = results.map(loc => ({
        label: `${path.relative(root, loc.uri.fsPath)}:${loc.range.start.line + 1}`,
        location: loc
      }));

      const pick = await vscode.window.showQuickPick(items, {
        placeHolder: `Select a usage of <${tagName}>`
      });
      if (pick) {
        await vscode.window.showTextDocument(pick.location.uri, {
          selection: pick.location.range
        });
      }
    }
  );
  context.subscriptions.push(findUsagesCommand);
}
