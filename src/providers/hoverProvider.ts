import * as vscode from 'vscode';
import * as path from 'path';
import { stencilSelector } from '../utils/selectors';
import * as logger from '../utils/logger';

export function registerHoverProvider(
  context: vscode.ExtensionContext,
  root: string,
  json: any,
  tagMap: Map<string, string>
) {
  const provider: vscode.HoverProvider = {
    provideHover(document, position) {
      const wordRange = document.getWordRangeAtPosition(
        position,
        /(?<=<)\w[\w-]*/  // tag hover
      );
      if (!wordRange) return;

      const tag = document.getText(wordRange);
      const rel = tagMap.get(tag);
      const comp = json.tags.find((t: any) => t.name === tag);
      if (!comp) return;

      const fullPath = path.resolve(root, rel || '');
      const md = new vscode.MarkdownString();
      md.appendCodeblock(`<${tag}>`, 'html');
      if (comp.description.value) {
        md.appendMarkdown(`\n\n${comp.description.value}`);
      }
      md.appendMarkdown(`\n\n**Path:** \`${rel}\``);

      logger.info(`Hover for <${tag}> from ${path.basename(document.uri.fsPath)}`);
      return new vscode.Hover(md, wordRange);
    }
  };

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(stencilSelector, provider)
  );
}
