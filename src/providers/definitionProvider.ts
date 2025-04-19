import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { stencilSelector } from '../utils/selectors';
import * as logger from '../utils/logger';

/**
 * Registers Go To Definition for Stencil tags.
 */
export function registerDefinitionProvider(
  context: vscode.ExtensionContext,
  root: string,
  tagMap: Map<string, string>
) {
  const provider: vscode.DefinitionProvider = {
    provideDefinition(document, position) {
      const wordRange = document.getWordRangeAtPosition(
        position,
        /(?<=<)\w[\w-]*/  // lookbehind for '<'
      );
      if (!wordRange) {
        return;
      }
      const tag = document.getText(wordRange);
      const rel = tagMap.get(tag);
      if (!rel) {
        return;
      }
      const fullPath = path.resolve(root, rel);
      if (!fs.existsSync(fullPath)) {
        logger.warn(`Component file not found: ${rel}`);
        return;
      }
      logger.info(`GoToDef requested for <${tag}>, opening ${rel}`);
      return new vscode.Location(vscode.Uri.file(fullPath), new vscode.Position(0, 0));
    }
  };

  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(stencilSelector, provider)
  );
}
