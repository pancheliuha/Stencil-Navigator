import { Project, SyntaxKind } from 'ts-morph';
import { JsxEmit } from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import { loadProjectConfig } from './loadProjectConfig';

export interface ComponentTag {
  name: string;
  path: string;
  description: { kind: 'markdown'; value: string };
  properties: Array<{ name: string; description: string }>;
  events: Array<{ name: string; description: string }>;
  methods: Array<{ name: string; description: string }>;
  slots: Array<{ name: string; description: string }>;
}

export async function parseStencilComponents(
  root: string
): Promise<{ json: { version: number; tags: ComponentTag[] }; tagMap: Map<string, string> }> {
  // Load include/exclude patterns from project config
  const { filePatterns, excludePatterns } = loadProjectConfig(root);

  // Determine tsconfig existence
  const tsconfigPath = path.join(root, 'tsconfig.json');
  const projectOptions: any = { skipAddingFilesFromTsConfig: true };
  if (fs.existsSync(tsconfigPath)) {
    projectOptions.tsConfigFilePath = tsconfigPath;
  } else {
    projectOptions.compilerOptions = { allowJs: true, jsx: JsxEmit.Preserve };
  }

  // Initialize ts-morph project
  const project = new Project(projectOptions);

  // Add source files according to patterns
  const globs = [
    ...filePatterns.map(p => path.join(root, p)),
    ...excludePatterns.map(p => '!' + path.join(root, p))
  ];
  project.addSourceFilesAtPaths(globs);

  const tags: ComponentTag[] = [];
  const tagMap = new Map<string, string>();

  // Iterate over all files and classes
  for (const file of project.getSourceFiles()) {
    for (const cls of file.getClasses()) {
      // Process only classes with @Component decorator
      const compDeco = cls.getDecorator('Component');
      if (!compDeco) continue;

      // Extract tag name
      const args = compDeco.getArguments()[0]?.asKind(SyntaxKind.ObjectLiteralExpression);
      const tagProp = args?.getProperty('tag')?.asKind(SyntaxKind.PropertyAssignment);
      const tagInit = tagProp?.getInitializer()?.getText();
      if (!tagInit) continue;
      const tagName = tagInit.replace(/['"`]/g, '').trim();

      // Collect class JSDoc
      const classDoc = cls
        .getJsDocs()
        .map(d => d.getInnerText().trim())
        .filter(Boolean)
        .join('\n');

      // Collect @Prop() properties
      const properties = cls
        .getProperties()
        .filter(p => !!p.getDecorator('Prop'))
        .map(p => ({
          name: p.getName(),
          description: p
            .getJsDocs()
            .map(d => d.getInnerText().trim())
            .filter(Boolean)
            .join('\n')
        }));

      // Collect @Event() events and prefix with "on"
      const events = cls
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
          return { name, description };
        });

      // Collect @Method() methods
      const methods = cls
        .getMethods()
        .filter(m => !!m.getDecorator('Method'))
        .map(m => ({
          name: m.getName(),
          description: m
            .getJsDocs()
            .map(d => d.getInnerText().trim())
            .filter(Boolean)
            .join('\n')
        }));

      // Collect @Slot() slots (with optional name property)
      const slots = cls
        .getProperties()
        .filter(p => !!p.getDecorator('Slot'))
        .map(p => {
          let slotName = p.getName();
          const deco = p.getDecorator('Slot')!;
          const decoArgs = deco.getArguments();
          if (decoArgs.length) {
            const obj = decoArgs[0].asKind(SyntaxKind.ObjectLiteralExpression);
            const nameProp = obj?.getProperty('name')?.asKind(SyntaxKind.PropertyAssignment);
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

      // Compute relative file path
      const relPath = path.relative(root, file.getFilePath());

      // Assemble ComponentTag
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
