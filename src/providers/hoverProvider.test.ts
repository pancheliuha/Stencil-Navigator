import { expect } from 'chai';
import { createHoverProvider } from './hoverProvider';
import {
  Position,
  Range,
  MarkdownString,
  TextDocument,
  Uri,
  CancellationToken,
  Hover
} from 'vscode';

describe('HoverProvider', () => {
  const root = '/project';
  const json = {
    tags: [
      {
        name: 'my-tag',
        description: { value: 'My tag docs' },
      }
    ]
  };
  const tagMap = new Map<string, string>([['my-tag','components/my-tag.tsx']]);
  const provider = createHoverProvider(root, json, tagMap);

  it('returns hover with codeblock and description', async () => {
    // fake document
    const text = '<my-tag>';
    const fakeDoc = {
      getWordRangeAtPosition: (_: Position) => new Range(0,1,0,6),
      getText: (_r?: Range) => 'my-tag',
      uri: Uri.parse('untitled:test.html')
    } as unknown as TextDocument;

    const pos = new Position(0,2);
    const token = {} as CancellationToken;
    const hover = await provider.provideHover(fakeDoc, pos, token) as Hover;

    expect(hover).to.be.instanceOf(Hover);
    const md = hover.contents[0] as MarkdownString;
    const rendered = (md as any).value as string;
    expect(rendered).to.include('<my-tag>');
    expect(rendered).to.include('My tag docs');
    expect(rendered).to.include('components/my-tag.tsx');
  });
});
