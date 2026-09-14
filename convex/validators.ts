import { v } from 'convex/values';

export const client = v.object({ id: v.string(), name: v.string(), company: v.string(), address: v.string(), notes: v.string() });
export const itemPackage = v.object({ id: v.string(), name: v.string(), items: v.array(v.object({ name: v.string(), description: v.string(), price: v.number() })) });
export const profile = v.object({ repName: v.string(), repTitle: v.string(), companyName: v.string(), address: v.string(), phone: v.string(), email: v.string(), bankName: v.string(), accountName: v.string(), accountNumber: v.string(), branchCode: v.string(), accountType: v.string(), swiftCode: v.string() });
export const recipient = v.object({ name: v.string(), company: v.string(), address: v.string() });
export const legacySet = v.object({ id: v.string(), savedAt: v.string(), clientCompany: v.string(), documents: v.array(v.object({ type: v.string(), html: v.string() })) });
export const documentType = v.union(v.literal('quote'), v.literal('invoice'), v.literal('sla'), v.literal('employee_letter'));
export const line = v.object({ id: v.string(), name: v.string(), description: v.optional(v.string()), quantityMilli: v.number(), unitPriceMinor: v.number(), discountBasisPoints: v.optional(v.number()), taxRateBasisPoints: v.optional(v.number()) });
export const content = v.object({ title: v.string(), recipientId: v.string(), currency: v.string(), lines: v.array(line), sections: v.array(v.object({ heading: v.string(), body: v.string() })), depositBasisPoints: v.number(), issueDate: v.string(), dueDate: v.optional(v.string()), validUntil: v.optional(v.string()), templateKey: v.string() });
