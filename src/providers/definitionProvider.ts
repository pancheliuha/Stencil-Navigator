import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { stencilSelector } from '../utils/selectors';
import * as logger from '../utils/logger';

/**
 * Factory: creates DefinitionProvider
 */
export function createDefinitionProvider(
  root: string,
  tagMap: Map<string, string>
): vscode.DefinitionProvider {
  return {
    provideDefinition(
      document: vscode.TextDocument,
      position: vscode.Position,
      token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition> {
      const wordRange = document.getWordRangeAtPosition(
        position,
        /(?<=<)\w[\w-]*/
      );
      if (!wordRange) return;

      const tag = document.getText(wordRange);
      const rel = tagMap.get(tag);
      if (!rel) return;

      const fullPath = path.resolve(root, rel);
      if (typeof fs.existsSync === 'function' && !fs.existsSync(fullPath)) {
        logger.warn(`Component file not found (but proceeding): ${rel}`);
      }

      logger.info(`GoToDef for <${tag}> → ${rel}`);
      // Return a proper Range, from (0,0) to (0,0)
      const targetRange = new vscode.Range(
        new vscode.Position(0, 0),
        new vscode.Position(0, 0)
      );
      return new vscode.Location(vscode.Uri.file(fullPath), targetRange);
    }
  };
}

/**
 * Registers DefinitionProvider in VS Code
 */
export function registerDefinitionProvider(
  context: vscode.ExtensionContext,
  root: string,
  tagMap: Map<string, string>
) {
  const provider = createDefinitionProvider(root, tagMap);
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(stencilSelector, provider)
  );
}
