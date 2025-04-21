import { Project, SyntaxKind } from 'ts-morph';
import { JsxEmit } from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import { loadProjectConfig } from './loadProjectConfig';

export interface ComponentProp {
  name: string;
  description: string;
  type?: string;
}

export interface ComponentEvent {
  name: string;
  description: string;
  type?: string;
}

export interface ComponentMethod {
  name: string;
  description: string;
  signature?: string;
}

export interface ComponentSlot {
  name: string;
  description: string;
}

export interface ComponentTag {
  name: string;
  path: string;
  description: { kind: 'markdown'; value: string };
  properties: ComponentProp[];
  events: ComponentEvent[];
  methods: ComponentMethod[];
  slots: ComponentSlot[];
}

export async function parseStencilComponents(
  root: string
): Promise<{ json: { version: number; tags: ComponentTag[] }; tagMap: Map<string, string> }> {
  const { filePatterns, excludePatterns } = loadProjectConfig(root);

  const tsconfigPath = path.join(root, 'tsconfig.json');
  const projectOptions: any = { skipAddingFilesFromTsConfig: true };
  if (fs.existsSync(tsconfigPath)) {
    projectOptions.tsConfigFilePath = tsconfigPath;
  } else {
    projectOptions.compilerOptions = { allowJs: true, jsx: JsxEmit.Preserve };
  }
  const project = new Project(projectOptions);

  // add according to globs in config
  const globs = [
    ...filePatterns.map(p => path.join(root, p)),
    ...excludePatterns.map(p => '!' + path.join(root, p))
  ];
  project.addSourceFilesAtPaths(globs);

  const tags: ComponentTag[] = [];
  const tagMap = new Map<string, string>();

  for (const file of project.getSourceFiles()) {
    for (const cls of file.getClasses()) {
      const compDeco = cls.getDecorator('Component');
      if (!compDeco) continue;

      const obj = compDeco.getArguments()[0]?.asKind(SyntaxKind.ObjectLiteralExpression);
      const tagProp = obj?.getProperty('tag')?.asKind(SyntaxKind.PropertyAssignment);
      const tagInit = tagProp?.getInitializer()?.getText();
      if (!tagInit) continue;
      const tagName = tagInit.replace(/['"`]/g, '').trim();

      const classDoc = cls
        .getJsDocs()
        .map(d => d.getInnerText().trim())
        .filter(Boolean)
        .join('\n');

      // props
      const properties: ComponentProp[] = cls
        .getProperties()
        .filter(p => !!p.getDecorator('Prop'))
        .map(p => {
          const name = p.getName();
          const description = p
            .getJsDocs()
            .map(d => d.getInnerText().trim())
            .filter(Boolean)
            .join('\n');
          const typeNode = p.getTypeNode();
          const type = typeNode ? typeNode.getText() : p.getType().getText();
          return { name, description, type };
        });

      // events
      const events: ComponentEvent[] = cls
        .getProperties()
        .filter(p => !!p.getDecorator('Event'))
        .map(p => {
          const raw = p.getName();
          const name = 'on' + raw.charAt(0).toUpperCase() + raw.slice(1);
          const description = p
            .getJsDocs()
            .map(d => d.getInnerText().trim())
            .filter(Boolean)
            .join('\n');
          let type: string|undefined;
          const deco = p.getDecorator('Event')!;
          const call = deco.getCallExpression();
          const typeArgs = call?.getTypeArguments();
          if (typeArgs && typeArgs.length) {
            type = typeArgs[0].getText();
          }
          return { name, description, type };
        });

      // methods
      const methods: ComponentMethod[] = cls
        .getMethods()
        .filter(m => !!m.getDecorator('Method'))
        .map(m => {
          const name = m.getName();
          const description = m
            .getJsDocs()
            .map(d => d.getInnerText().trim())
            .filter(Boolean)
            .join('\n');
          const signature = m.getText().match(/^[^{]*/)?.[0].trim();
          return { name, description, signature };
        });

      // slots via JSX <slot> tags
      const slots: ComponentSlot[] = [];
      const slotEls = [
        ...file.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
        ...file.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
      ].filter(el => el.getTagNameNode().getText() === 'slot');
      for (const el of slotEls) {
        let slotName = '';
        const nameAttr = el.getAttribute('name');
        if (nameAttr) {
          const lit = nameAttr.getFirstChildByKind(SyntaxKind.StringLiteral);
          if (lit) slotName = lit.getLiteralValue();
        }
        slots.push({ name: slotName, description: '' });
      }
      // dedupe
      const uniqueSlots = Array.from(
        new Map(slots.map(s => [s.name, s])).values()
      );

      const relPath = path.relative(root, file.getFilePath());
      tags.push({
        name: tagName,
        path: relPath,
        description: { kind: 'markdown', value: classDoc },
        properties,
        events,
        methods,
        slots: uniqueSlots
      });
      tagMap.set(tagName, relPath);
    }
  }

  return { json: { version: 1.1, tags }, tagMap };
}
