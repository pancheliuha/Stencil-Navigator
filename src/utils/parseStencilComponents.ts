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
  // Load include/exclude patterns
  const { filePatterns, excludePatterns } = loadProjectConfig(root);

  // Prepare ts-morph project options
  const tsconfigPath = path.join(root, 'tsconfig.json');
  const projectOptions: any = { skipAddingFilesFromTsConfig: true };
  if (fs.existsSync(tsconfigPath)) {
    projectOptions.tsConfigFilePath = tsconfigPath;
  } else {
    projectOptions.compilerOptions = { allowJs: true, jsx: JsxEmit.Preserve };
  }
  const project = new Project(projectOptions);

  // Add source files according to patterns
  const globs = [
    ...filePatterns.map(p => path.join(root, p)),
    ...excludePatterns.map(p => '!' + path.join(root, p))
  ];
  project.addSourceFilesAtPaths(globs);

  const tags: ComponentTag[] = [];
  const tagMap = new Map<string, string>();

  for (const file of project.getSourceFiles()) {
    for (const cls of file.getClasses()) {
      // Only classes decorated with @Component
      const compDeco = cls.getDecorator('Component');
      if (!compDeco) continue;

      // Extract tag name literal
      const obj = compDeco.getArguments()[0]?.asKind(SyntaxKind.ObjectLiteralExpression);
      const tagProp = obj?.getProperty('tag')?.asKind(SyntaxKind.PropertyAssignment);
      const tagInit = tagProp?.getInitializer()?.getText();
      if (!tagInit) continue;
      const tagName = tagInit.replace(/['"`]/g, '').trim();

      // Class JSDoc description
      const classDoc = cls
        .getJsDocs()
        .map(d => d.getInnerText().trim())
        .filter(Boolean)
        .join('\n');

      // @Prop() properties
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
          // try to read TS type
          const typeNode = p.getTypeNode();
          const type = typeNode ? typeNode.getText() : p.getType().getText();
          return { name, description, type };
        });

      // @Event() events
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
          // extract generic payload type if present
          const deco = p.getDecorator('Event')!;
          const args = deco.getArguments();
          let type: string | undefined;
          if (args.length) {
            // e.g. @Event<MyPayload>()
            const call = deco.getCallExpression();
            const typeArgs = call?.getTypeArguments();
            if (typeArgs && typeArgs.length) {
              type = typeArgs[0].getText();
            }
          }
          return { name, description, type };
        });

      // @Method() methods
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
          // method signature with parameters and return type
          const signature = m.getText().match(/^[^{]*/)?.[0].trim();
          return { name, description, signature };
        });

      // @Slot() slots
      const slots: ComponentSlot[] = cls
        .getProperties()
        .filter(p => !!p.getDecorator('Slot'))
        .map(p => {
          let slotName = p.getName();
          const deco = p.getDecorator('Slot')!;
          const args = deco.getArguments();
          if (args.length) {
            const objLit = args[0].asKind(SyntaxKind.ObjectLiteralExpression);
            const nameProp = objLit?.getProperty('name')?.asKind(SyntaxKind.PropertyAssignment);
            const init = nameProp?.getInitializer()?.getText();
            if (init) {
              slotName = init.replace(/['"`]/g, '').trim();
            }
          }
          const description = p
            .getJsDocs()
            .map(d => d.getInnerText().trim())
            .filter(Boolean)
            .join('\n');
          return { name: slotName, description };
        });

      const relPath = path.relative(root, file.getFilePath());
      tags.push({
        name: tagName,
        path: relPath,
        description: { kind: 'markdown', value: classDoc },
        properties,
        events,
        methods,
        slots
      });
      tagMap.set(tagName, relPath);
    }
  }

  return {
    json: { version: 1.1, tags },
    tagMap
  };
}
