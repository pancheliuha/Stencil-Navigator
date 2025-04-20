import { expect } from 'chai';
import { createCompletionProvider } from './completionProvider';
import { CancellationToken, Position, CompletionContext } from 'vscode';

describe('CompletionProvider', () => {
  const json = {
    tags: [{
      name: 'my-tag',
      properties: [{ name: 'propA', description: 'Property A', type: 'string' }],
      events:     [{ name: 'onEvent', description: 'Event E', type: 'EventPayload' }],
      slots:      [{ name: 'slotName', description: 'Slot S' }]
    }]
  };
  const tagMap = new Map<string,string>([['my-tag','']]);
  const triggers = [' '];
  const sortPrefix = '!';

  const provider = createCompletionProvider(json, tagMap, triggers, sortPrefix);

  it('suggests grouped Props, Events, Slots', async () => {
    const text = '<my-tag ';
    const fakeDoc = {
      lineAt: () => ({ text }),
      getText: () => text,
      uri: undefined
    } as any;

    const pos: Position = new Position(0, text.length);
    const token = {} as CancellationToken;
    const cctx  = {} as CompletionContext;

    const result = await provider.provideCompletionItems(fakeDoc, pos, token, cctx);

    const items = Array.isArray(result) ? result : (result as any).items;
    const labels = items.map((i: any) => i.label);

    expect(labels).to.eql([
      '⸺ Props ⸺',
      'propA',
      '⸺ Events ⸺',
      'onEvent',
      '⸺ Slots ⸺',
      'name'
    ]);
  });
});
