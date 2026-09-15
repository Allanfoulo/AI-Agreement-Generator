import type { DocumentType } from '../../domain/documents/lifecycle';

export type TemplateFamily = 'modern' | 'corporate' | 'minimal';

export type TemplateOption = {
  family: TemplateFamily;
  label: string;
  description: string;
};

const options: TemplateOption[] = [
  { family: 'modern', label: 'Modern', description: 'Warm hierarchy with a confident accent.' },
  { family: 'corporate', label: 'Corporate', description: 'Formal structure for established teams.' },
  { family: 'minimal', label: 'Minimal', description: 'Quiet typography with room to breathe.' },
];

export const templateOptions = options;

export function templateKeyFor(type: DocumentType, family: TemplateFamily) {
  return `${type}/${family}@1`;
}

export function templateFamilyFromKey(type: DocumentType, key?: string): TemplateFamily {
  const match = key?.match(new RegExp(`^${type}/(modern|corporate|minimal)@\\d+$`));
  return (match?.[1] as TemplateFamily | undefined) ?? 'modern';
}

export function templateLabel(type: DocumentType, key?: string) {
  if (type === 'sla') return 'General';
  if (type === 'employee_letter') return 'Standard';
  const family = templateFamilyFromKey(type, key);
  return options.find(option => option.family === family)?.label ?? 'Modern';
}

export function normalizeTemplateKey(type: DocumentType, key?: string) {
  if (type === 'sla') return key ?? 'sla/general@1';
  if (type === 'employee_letter') return key ?? 'employee-letter/standard@1';
  return templateKeyFor(type, templateFamilyFromKey(type, key));
}
