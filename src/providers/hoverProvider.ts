import * as vscode from 'vscode';
import * as path from 'path';
import { stencilSelector } from '../utils/selectors';
import * as logger from '../utils/logger';

export function createHoverProvider(
  root: string,
  json: any,
  tagMap: Map<string, string>
): vscode.HoverProvider {
  return {
    provideHover(
      document: vscode.TextDocument,
      position: vscode.Position,
      token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
      const wordRange = document.getWordRangeAtPosition(
        position,
        /(?<=<)\w[\w-]*/
      );
      if (!wordRange) return;

      const tag = document.getText(wordRange);
      const rel = tagMap.get(tag);
      const comp = json.tags.find((t: any) => t.name === tag);
      if (!comp) return;

      const md = new vscode.MarkdownString();
      md.appendCodeblock(`<${tag}>`, 'html');
      if (comp.description.value) {
        md.appendMarkdown(`\n\n${comp.description.value}`);
      }
      md.appendMarkdown(`\n\n**Path:** \`${rel}\``);

      logger.info(`Hover for <${tag}>`);
      return new vscode.Hover(md, wordRange);
    }
  };
}

export function registerHoverProvider(
  context: vscode.ExtensionContext,
  root: string,
  json: any,
  tagMap: Map<string, string>
) {
  const provider = createHoverProvider(root, json, tagMap);
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(stencilSelector, provider)
  );
}
