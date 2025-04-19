import * as fs from 'fs';
import * as path from 'path';

export interface ProjectConfig {
  features: {
    definition: boolean;
    hover: boolean;
    completion: boolean;
    links: boolean;
    enterTrigger: boolean;
    welcomePanel: boolean;
  };
  filePatterns: string[];
  excludePatterns: string[];
  completionTriggers: string[];
  sortPrefix: string;
  dataSaveLocation: 'projectRoot' | 'extensionStorage';
}

const DEFAULT_CONFIG: ProjectConfig = {
  features: {
    definition: true,
    hover: true,
    completion: true,
    links: true,
    enterTrigger: true,
    welcomePanel: true
  },
  filePatterns: ['**/*.{tsx,jsx,ts,js}'],
  excludePatterns: ['node_modules/**', 'dist/**', 'build/**', 'out/**'],
  completionTriggers: ['<', ' ', '='],
  sortPrefix: '\u0000',
  dataSaveLocation: 'projectRoot'
};

export function loadProjectConfig(root: string): ProjectConfig {
  const jsonPath = path.join(root, 'stencil-navigator.config.json');
  if (!fs.existsSync(jsonPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const raw = fs.readFileSync(jsonPath, { encoding: 'utf8' });
    const user = JSON.parse(raw);
    return {
      ...DEFAULT_CONFIG,
      ...user,
      features: { ...DEFAULT_CONFIG.features, ...user.features }
    };
  } catch (e) {
    console.warn('[StencilNav] Failed to load stencil-navigator.config.json:', e);
    return DEFAULT_CONFIG;
  }
}
