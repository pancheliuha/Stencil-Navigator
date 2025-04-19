import * as vscode from 'vscode';

// simple logger with VSCode notifications
export function info(message: string, ...args: any[]) {
  console.log(`[StencilNav] ${message}`, ...args);
}

export function warn(message: string, ...args: any[]) {
  vscode.window.showWarningMessage(message);
  console.warn(`[StencilNav] ${message}`, ...args);
}

export function error(message: string, ...args: any[]) {
  vscode.window.showErrorMessage(message);
  console.error(`[StencilNav] ${message}`, ...args);
}
