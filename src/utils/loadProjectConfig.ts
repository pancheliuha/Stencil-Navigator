import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface ExtensionFeatures {
  definition: boolean;
  links: boolean;
  hover: boolean;
  completion: boolean;
  methods: boolean;
  slots: boolean;
  findUsages: boolean;
  welcomePanel: boolean;
  enterTrigger: boolean;
}

export interface ProjectConfig {
  dataSaveLocation: 'projectRoot' | 'extensionStorage';
  filePatterns: string[];
  excludePatterns: string[];
  completionTriggers: string[];
  sortPrefix: string;
  features: ExtensionFeatures;
}

const DEFAULT_CONFIG: ProjectConfig = {
  dataSaveLocation: 'projectRoot',
  filePatterns: ['src/components/**/*.tsx', 'src/**/*.tsx'],
  excludePatterns: ['node_modules/**', 'dist/**'],
  completionTriggers: [' ', ':'],
  sortPrefix: '!',
  features: {
    definition: true,
    links: true,
    hover: true,
    completion: true,
    methods: true,
    slots: true,
    findUsages: true,
    welcomePanel: true,
    enterTrigger: false
  }
};

export function loadProjectConfig(root: string): ProjectConfig {
  const configFile = path.join(root, 'stencil-navigator.config.json');
  if (!fs.existsSync(configFile)) {
    return DEFAULT_CONFIG;
  }

  try {
    const raw = fs.readFileSync(configFile, 'utf-8');
    const userCfg = JSON.parse(raw) as Partial<ProjectConfig>;
    return mergeConfig(DEFAULT_CONFIG, userCfg);
  } catch (e) {
    vscode.window.showWarningMessage(
      'Failed to parse stencil-navigator.config.json, using defaults.'
    );
    return DEFAULT_CONFIG;
  }
}

function mergeConfig(
  base: ProjectConfig,
  override: Partial<ProjectConfig>
): ProjectConfig {
  const merged: any = { ...base };

  if (override.dataSaveLocation) {
    merged.dataSaveLocation = override.dataSaveLocation;
  }
  if (Array.isArray(override.filePatterns)) {
    merged.filePatterns = override.filePatterns;
  }
  if (Array.isArray(override.excludePatterns)) {
    merged.excludePatterns = override.excludePatterns;
  }
  if (Array.isArray(override.completionTriggers)) {
    merged.completionTriggers = override.completionTriggers;
  }
  if (typeof override.sortPrefix === 'string') {
    merged.sortPrefix = override.sortPrefix;
  }
  if (override.features) {
    merged.features = { ...base.features, ...override.features };
  }

  return merged as ProjectConfig;
}
