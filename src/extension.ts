import * as vscode from "vscode";
import { loadProjectConfig } from "./utils/loadProjectConfig";
import { generateDataFile } from "./utils/generateData";
import { parseStencilComponents } from "./utils/parseStencilComponents";
import * as logger from "./utils/logger";

// providers
import { registerDefinitionProvider } from "./providers/definitionProvider";
import { registerLinkProvider } from "./providers/linkProvider";
import { registerHoverProvider } from "./providers/hoverProvider";
import { registerCompletionProvider } from "./providers/completionProvider";
import { registerUsageProvider } from "./providers/usageProvider";

// commands & panels
import { registerCommands } from "./commands/registerCommands";
import { showWelcomePanel } from "./panels/welcomePanel";

export async function activate(context: vscode.ExtensionContext) {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || "";
  const cfg = loadProjectConfig(root);
  logger.info("[StencilNav] Activating with config:", cfg);

  // 1) attempt to load/generate our metadata
  let json = { version: 1.1, tags: [] as any[] };
  let tagMap = new Map<string, string>();
  try {
    const result = await generateDataFile(
      root,
      cfg.dataSaveLocation,
      context.globalStorageUri
    );
    json = result.json;
    tagMap = result.tagMap;
  } catch (err: any) {
    vscode.window.showWarningMessage(
      "Stencil Navigator: failed to load tags — continuing with empty set."
    );
    console.error("[StencilNav] generateDataFile error:", err);
  }

  // 2) watch for changes (optional)
  for (const pat of cfg.filePatterns) {
    const watcher = vscode.workspace.createFileSystemWatcher(
      new vscode.RelativePattern(root, pat)
    );
    const reload = async () => {
      const parsed = await parseStencilComponents(root);
      json.tags = parsed.json.tags;
      tagMap.clear();
      for (const [t, p] of parsed.tagMap) {
        tagMap.set(t, p);
      }
      logger.info("[StencilNav] Metadata reloaded");
    };
    watcher.onDidCreate(reload);
    watcher.onDidChange(reload);
    watcher.onDidDelete(reload);
    context.subscriptions.push(watcher);
  }

  // 3) register feature providers based on config
  if (cfg.features.definition) {
    registerDefinitionProvider(context, root, tagMap);
  }
  if (cfg.features.links) {
    registerLinkProvider(context, root, tagMap);
  }
  if (cfg.features.hover) {
    registerHoverProvider(context, root, json, tagMap);
  }
  if (cfg.features.completion) {
    registerCompletionProvider(
      context,
      json,
      tagMap,
      cfg.completionTriggers,
      cfg.sortPrefix
    );
  }
  if (cfg.features.findUsages) {
    registerUsageProvider(context, root, tagMap);
  }

  // 4) register your commands (always on)
  registerCommands(context, root, tagMap);

  // 5) welcome panel (once)
  if (
    cfg.features.welcomePanel &&
    !context.globalState.get("stencilNav.welcomeShown")
  ) {
    showWelcomePanel(context.extensionUri);
    context.globalState.update("stencilNav.welcomeShown", true);
  }

  logger.info("[StencilNav] Activation complete");
}

export function deactivate() {
  logger.info("[StencilNav] Deactivated");
}
