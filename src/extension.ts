import * as vscode from 'vscode';
import { loadProjectConfig } from './utils/loadProjectConfig';
import { generateDataFile } from './utils/generateData';
import { registerDefinitionProvider } from './providers/definitionProvider';
import { registerLinkProvider } from './providers/linkProvider';
import { registerHoverProvider } from './providers/hoverProvider';
import { registerCompletionProvider } from './providers/completionProvider';
import { registerMethodCompletionProvider } from './providers/methodCompletionProvider';
import { registerUsageProvider } from './providers/usageProvider';
import { registerEnterTrigger } from './utils/enterTrigger';
import { registerCommands } from './commands/registerCommands';
import { showWelcomePanel } from './panels/welcomePanel';

export async function activate(context: vscode.ExtensionContext) {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
  const cfg = loadProjectConfig(root);

  // generate or reload JSON + tagMap
  const { json, tagMap } = await generateDataFile(
    root,
    cfg.dataSaveLocation,
    context.globalStorageUri
  );

  // Go to Definition
  if (cfg.features.definition) {
    registerDefinitionProvider(context, root, tagMap);
  }

  // DocumentLinks (underline & clickable)
  if (cfg.features.links) {
    registerLinkProvider(context, root, tagMap);
  }

  // Hover tooltips
  if (cfg.features.hover) {
    registerHoverProvider(context, root, json, tagMap);
  }

  // Completion: tags, props/events/slots grouping
  if (cfg.features.completion) {
    registerCompletionProvider(
      context,
      json,
      tagMap,
      cfg.completionTriggers,
      cfg.sortPrefix
    );
    registerMethodCompletionProvider(context, json, tagMap, cfg.sortPrefix);
  }

  // CodeLens “Find Usages”
  if (cfg.features.links) {
    registerUsageProvider(context, root, tagMap);
  }

  // Optional enter‐key trigger
  if (cfg.features.enterTrigger) {
    registerEnterTrigger(context);
  }

  // Commands (reload, generate, welcome, findUsages)
  registerCommands(context, root, tagMap);

  // Welcome panel once per install
  if (
    cfg.features.welcomePanel &&
    !context.globalState.get('stencilNav.welcomeShown')
  ) {
    showWelcomePanel(context.extensionUri);
    context.globalState.update('stencilNav.welcomeShown', true);
  }
}

export function deactivate() {}
