export type RenderLine = {
  id: string;
  name: string;
  description?: string;
  quantityMilli: number;
  unitPriceMinor: number;
  totalMinor: number;
};

export type RenderSection = {
  heading: string;
  body: string;
};

export type DocumentRenderModel = {
  number: string;
  revision: number;
  type: 'quote' | 'invoice' | 'sla' | 'employee_letter';
  title: string;
  issueDate: string;
  currency: string;
  totalMinor: number;
  company: { name: string; address: string; representative: string; representativeTitle: string };
  recipient: { name: string; company: string; address: string };
  lines: RenderLine[];
  sections: RenderSection[];
};
