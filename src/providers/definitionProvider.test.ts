import { expect } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as path from 'path';
import { createDefinitionProvider } from './definitionProvider';
import { CancellationToken, Position, Range, Uri, Location } from 'vscode';

describe('DefinitionProvider', () => {
  const root = '/project';
  const tagMap = new Map<string, string>([['my-tag', 'components/my-tag.tsx']]);
  let sandbox: sinon.SinonSandbox;
  let provider = createDefinitionProvider(root, tagMap);

  before(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(fs, 'existsSync').returns(true);
  });
  after(() => sandbox.restore());

  it('should return correct Location', async () => {
    const fakeDoc = {
      getWordRangeAtPosition: () => new Range(0, 1, 0, 6),
      getText: () => 'my-tag',
      uri: Uri.file(path.join(root, 'usage.html'))
    } as any;

    const pos = new Position(0, 2);
    const token = {} as CancellationToken;
    const result = await provider.provideDefinition(fakeDoc, pos, token);

    expect(result).to.be.instanceOf(Location);
    const loc = result as Location;
    expect(loc.uri.fsPath).to.equal(path.join(root, 'components', 'my-tag.tsx'));
    expect(loc.range.start.line).to.equal(0);
    expect(loc.range.start.character).to.equal(0);
  });
});
