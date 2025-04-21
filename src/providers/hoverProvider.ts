import * as vscode from 'vscode';
import * as path from 'path';
import { stencilSelector } from '../utils/selectors';
import * as logger from '../utils/logger';

/**
 * Creates a HoverProvider for Stencil components:
 *  - shows <tag> in a codeblock
 *  - shows JSDoc description
 *  - shows relative path
 */
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
      // 1) find any word under the cursor
      const wordRange = document.getWordRangeAtPosition(
        position,
        /[A-Za-z0-9-]+/
      );
      if (!wordRange) {
        return;
      }

      // 2) ensure it's really a tag: preceded by '<'
      const start = wordRange.start;
      if (start.character === 0) {
        return;
      }
      const prevChar = document.getText(
        new vscode.Range(
          new vscode.Position(start.line, start.character - 1),
          start
        )
      );
      if (prevChar !== '<') {
        return;
      }

      const tag = document.getText(wordRange);
      const rel = tagMap.get(tag);
      const comp = json.tags.find((t: any) => t.name === tag);
      if (!comp) {
        return;
      }

      // 3) build markdown
      const md = new vscode.MarkdownString();
      md.appendCodeblock(`<${tag}>`, 'html');
      const desc = comp.description?.value?.trim();
      if (desc) {
        md.appendMarkdown(`\n\n${desc}`);
      }
      if (rel) {
        md.appendMarkdown(`\n\n**Path:** \`${rel}\``);
      }

      logger.info(`Hover for <${tag}>`);
      return new vscode.Hover(md, wordRange);
    }
  };
}

/**
 * Registers the HoverProvider on the configured selector(s).
 */
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
