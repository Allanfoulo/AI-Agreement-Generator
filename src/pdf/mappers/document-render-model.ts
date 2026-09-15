import type { DocumentRenderModel } from '../contracts/render-model';
import { calculateFinancialDocument } from '../../domain/financial/money.ts';

type SnapshotLine = {
  id: string;
  name: string;
  description?: string;
  quantityMilli: number;
  unitPriceMinor: number;
  discountBasisPoints?: number;
  taxRateBasisPoints?: number;
};

type IssuedVersion = {
  number: string;
  revision: number;
  totalMinor: number;
  snapshot: {
    title: string;
    issueDate: string;
    currency: string;
    lines: SnapshotLine[];
    sections: Array<{ heading: string; body: string }>;
  };
  company: { companyName: string; address: string; repName: string; repTitle: string };
  recipient: { name: string; company: string; address: string };
  type: DocumentRenderModel['type'];
};

export function toDocumentRenderModel(version: IssuedVersion): DocumentRenderModel {
  const calculation = (version.type === 'quote' || version.type === 'invoice')
    ? calculateFinancialDocument({
      currency: version.snapshot.currency,
      lines: version.snapshot.lines,
      depositBasisPoints: 0,
    })
    : undefined;

  return {
    number: version.number,
    revision: version.revision,
    type: version.type,
    title: version.snapshot.title,
    issueDate: version.snapshot.issueDate,
    currency: version.snapshot.currency,
    totalMinor: version.totalMinor,
    company: {
      name: version.company.companyName,
      address: version.company.address,
      representative: version.company.repName,
      representativeTitle: version.company.repTitle,
    },
    recipient: version.recipient,
    lines: version.snapshot.lines.map((line, index) => ({
      ...line,
      totalMinor: calculation?.lines[index]?.totalMinor ?? Math.round(line.quantityMilli * line.unitPriceMinor / 1000),
    })),
    sections: version.snapshot.sections,
  };
}
