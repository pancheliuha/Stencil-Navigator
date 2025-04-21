import * as vscode from 'vscode';
import { loadProjectConfig } from './utils/loadProjectConfig';
import { generateDataFile } from './utils/generateData';
import { parseStencilComponents } from './utils/parseStencilComponents';
import * as logger from './utils/logger';

// providers
import { registerDefinitionProvider } from './providers/definitionProvider';
import { registerLinkProvider } from './providers/linkProvider';
import { registerHoverProvider } from './providers/hoverProvider';
import { registerCompletionProvider } from './providers/completionProvider';
import { registerUsageProvider } from './providers/usageProvider';

// commands & panels
import { registerCommands } from './commands/registerCommands';
import { showWelcomePanel } from './panels/welcomePanel';

export async function activate(context: vscode.ExtensionContext) {
  // 1) Determine workspace root and load config
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
  const cfg  = loadProjectConfig(root);
  logger.info('[StencilNav] Activating with config:', cfg);

  // 2) Generate or reload metadata (vscode-data.json, tagMap)
  let { json, tagMap } = await generateDataFile(
    root,
    cfg.dataSaveLocation,
    context.globalStorageUri
  );

  // 3) Watch for component file changes according to config.filePatterns
  const watchers = cfg.filePatterns.map(pattern =>
    vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(root, pattern)
    )
  );
  const reloadMetadata = async () => {
    const result = await parseStencilComponents(root);
    json.tags = result.json.tags;
    tagMap.clear();
    for (const [tag, rel] of result.tagMap) {
      tagMap.set(tag, rel);
    }
    logger.info('[StencilNav] Metadata reloaded');
  };
  for (const w of watchers) {
    w.onDidCreate(reloadMetadata);
    w.onDidChange(reloadMetadata);
    w.onDidDelete(reloadMetadata);
    context.subscriptions.push(w);
  }

  // 4) Register all feature providers
  registerDefinitionProvider(context, root, tagMap);
  registerLinkProvider(context, root, tagMap);
  registerHoverProvider(context, root, json, tagMap);
  registerCompletionProvider(
    context,
    json,
    tagMap,
    cfg.completionTriggers,
    cfg.sortPrefix
  );
  registerUsageProvider(context, root, tagMap);

  // 5) Register commands (reload, generate, findUsages, etc.)
  registerCommands(context, root, tagMap);
  logger.info('[StencilNav] Commands registered');

  // 6) Show welcome panel on first activation (if enabled)
  if (cfg.features.welcomePanel && !context.globalState.get('stencilNav.welcomeShown')) {
    showWelcomePanel(context.extensionUri);
    context.globalState.update('stencilNav.welcomeShown', true);
    logger.info('[StencilNav] Welcome panel shown');
  }
}

export function deactivate() {
  logger.info('[StencilNav] Deactivating extension');
}
