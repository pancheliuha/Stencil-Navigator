import { expect } from 'chai';
import { createLinkProvider } from './linkProvider';
import {
  TextDocument,
  Position,
  Range,
  DocumentLink,
  CancellationToken,
  Uri
} from 'vscode';

describe('LinkProvider', () => {
  const root = '/proj';
  const tagMap = new Map<string, string>([['x-comp','components/x-comp.tsx']]);
  const provider = createLinkProvider(root, tagMap);

  it('finds one link for <x-comp>', async () => {
    const text = `<div><x-comp></x-comp></div>`;
    const fakeDoc = {
      getText: () => text,
      positionAt: (i: number) => new Position(0, i),
      uri: Uri.parse('untitled:test.html')
    } as unknown as TextDocument;

    const token = {} as CancellationToken;
    const links = await provider.provideDocumentLinks(fakeDoc, token) as DocumentLink[];

    expect(links).to.have.lengthOf(1);
    const link = links[0];
    expect(link.target?.fsPath).to.equal('/proj/components/x-comp.tsx');
    expect((link.range as Range).start.character).to.equal(text.indexOf('x-comp') + 1);
  });
});
