// src/__mocks__/vscode.ts

// --- Basic types ---
export class Range {
  constructor(public start: any, public end?: any) {}
}

export class Position {
  constructor(public line: number, public character: number) {}
}

export class Uri {
  fsPath: string;
  constructor(public value: string) { this.fsPath = value; }
  static file(path: string)  { return new Uri(path); }
  static parse(str: string) { return new Uri(str); }
}

export class CancellationToken {}

// --- Snippet & Markdown ---
export class SnippetString {
  constructor(public value?: string) {}
}

export class MarkdownString {
  public value: string;
  public isTrusted = true;
  constructor(value: string = '') {
    this.value = value;
  }
  appendCodeblock(code: string, lang?: string) {
    // add fenced code block
    this.value += `\`\`\`${lang}\n${code}\n\`\`\`\n`;
  }
  appendMarkdown(md: string) {
    // append raw markdown
    this.value += md;
  }
}
// --- Completion ---
export enum CompletionItemKind {
  Text = 0,
  Method, Function, Constructor, Property, Event
}
export class CompletionItem {
  label: string;
  kind?: CompletionItemKind;
  insertText?: any;
  documentation?: any;
  detail?: string;
  sortText?: string;
  constructor(label: string, kind?: CompletionItemKind) {
    this.label = label; this.kind = kind;
  }
}
export class CompletionList {
  constructor(public items: CompletionItem[]) {}
}

// --- Definition & Hover & Link ---
export class Location {
  constructor(public uri: Uri, public range: Range) {}
}


export class Hover {
  public contents: MarkdownString[];
  public range: Range;
  constructor(contents: MarkdownString, range: Range) {
    this.contents = Array.isArray(contents) ? contents : [contents];
    this.range = range;
  }
}

export class DocumentLink {
  constructor(public range: Range, public target: Uri) {}
}

// --- TextDocument & CompletionContext ---
export interface TextDocument {
  lineAt(line: number): { text: string };
  getText(range?: Range): string;
  positionAt(offset: number): Position;
  uri: Uri;
}

export interface CompletionContext {}

// --- window stub for logger ---
export namespace window {
  export function showWarningMessage(_msg: string) {}
}

// --- languages stubs ---
export namespace languages {
  export function registerCompletionItemProvider() {}
  export function registerDefinitionProvider()     {}
  export function registerHoverProvider()          {}
  export function registerDocumentLinkProvider()   {}
}
