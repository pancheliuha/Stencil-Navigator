import * as vscode from 'vscode';

// utils
import { loadProjectConfig } from './utils/loadProjectConfig';
import { generateDataFile }  from './utils/generateData';
import { stencilSelector }   from './utils/selectors';
import * as logger           from './utils/logger';

// providers
import * as providers from './providers';

// commands & panels
import { registerCommands }  from './commands/registerCommands';
import { showWelcomePanel }  from './panels/welcomePanel';

// optional utilities
import { registerEnterTrigger } from './utils/enterTrigger';

export async function activate(context: vscode.ExtensionContext) {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
  const cfg  = loadProjectConfig(root);

  logger.info('Activating with config:', cfg);

  // generate or reload JSON + tagMap
  const { json, tagMap } = await generateDataFile(
    root,
    cfg.dataSaveLocation,
    context.globalStorageUri
  );

  // Go to Definition
  if (cfg.features.definition) {
    providers.registerDefinitionProvider(context, root, tagMap);
    logger.info('DefinitionProvider registered');
  }

  // Document Links (underline & click)
  if (cfg.features.links) {
    providers.registerLinkProvider(context, root, tagMap);
    logger.info('LinkProvider registered');
  }

  // Hover tooltips
  if (cfg.features.hover) {
    providers.registerHoverProvider(context, root, json, tagMap);
    logger.info('HoverProvider registered');
  }

  // IntelliSense: tags, props/events/slots
  if (cfg.features.completion) {
    providers.registerCompletionProvider(
      context,
      json,
      tagMap,
      cfg.completionTriggers,
      cfg.sortPrefix
    );
    providers.registerMethodCompletionProvider(
      context,
      json,
      tagMap,
      cfg.sortPrefix
    );
    logger.info('CompletionProviders registered');
  }

  // CodeLens: Find Usages
  if (cfg.features.links) {
    providers.registerUsageProvider(context, root, tagMap);
    logger.info('UsageProvider registered');
  }

  // optional “Enter”‑key trigger for completions
  if (cfg.features.enterTrigger) {
    registerEnterTrigger(context);
    logger.info('EnterTrigger registered');
  }

  // Commands (reload, generate, welcome, findUsages)
  registerCommands(context, root, tagMap);
  logger.info('Commands registered');

  // One‑time welcome panel
  if (
    cfg.features.welcomePanel &&
    !context.globalState.get('stencilNav.welcomeShown')
  ) {
    showWelcomePanel(context.extensionUri);
    context.globalState.update('stencilNav.welcomeShown', true);
    logger.info('WelcomePanel shown');
  }
}

export function deactivate() {
  logger.info('Deactivating');
}
