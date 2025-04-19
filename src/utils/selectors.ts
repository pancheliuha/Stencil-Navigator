import { DocumentSelector } from 'vscode';

// shared selector for HTML/TSX files
export const stencilSelector: DocumentSelector = [
  { language: 'html', scheme: 'file' },
  { language: 'javascriptreact', scheme: 'file' },
  { language: 'typescriptreact', scheme: 'file' },
];
