export interface Attribute {
    name: string;
    description?: string;
    values?: Array<{ name: string; type?: string }>;
  }

  export interface ComponentTag {
    name: string;
    path: string;
    description: {
      kind: 'markdown';
      value: string;
    };
    attributes: Attribute[];
  }
