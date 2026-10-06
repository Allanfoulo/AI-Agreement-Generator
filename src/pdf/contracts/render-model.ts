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

export type PaymentMethod = 'none' | 'bank' | 'mobile_wallet' | 'bank_and_mobile_wallet';

export type PaymentDetails = {
  method: PaymentMethod;
  bank: { bankName: string; accountName: string; accountNumber: string; branchCode: string; accountType: string; swiftCode: string };
  mobileWallet: { provider: string; number: string; name: string };
};

export type DocumentRenderModel = {
  number: string;
  revision: number;
  type: 'quote' | 'invoice' | 'sla' | 'employee_letter';
  templateKey: string;
  title: string;
  issueDate: string;
  currency: string;
  totalMinor: number;
  company: { name: string; address: string; representative: string; representativeTitle: string };
  payment: PaymentDetails;
  recipient: { name: string; company: string; address: string };
  lines: RenderLine[];
  sections: RenderSection[];
};
