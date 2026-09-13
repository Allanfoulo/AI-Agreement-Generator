export type DocumentType = "quote" | "invoice" | "sla" | "employee_letter";

export type DocumentStatus =
  | "draft"
  | "issued"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted"
  | "partially_paid"
  | "paid"
  | "overdue"
  | "void"
  | "awaiting_signature"
  | "active"
  | "terminated"
  | "acknowledged"
  | "archived";

const transitions: Record<DocumentType, Partial<Record<DocumentStatus, readonly DocumentStatus[]>>> = {
  quote: {
    draft: ["issued"],
    issued: ["sent", "viewed", "accepted", "rejected", "expired", "void"],
    sent: ["viewed", "accepted", "rejected", "expired", "void"],
    viewed: ["accepted", "rejected", "expired", "void"],
    accepted: ["converted", "void"],
    rejected: ["void"],
    expired: ["void"],
    converted: ["void"],
  },
  invoice: {
    draft: ["issued"],
    issued: ["sent", "viewed", "partially_paid", "paid", "overdue", "void"],
    sent: ["viewed", "partially_paid", "paid", "overdue", "void"],
    viewed: ["partially_paid", "paid", "overdue", "void"],
    partially_paid: ["paid", "overdue", "void"],
    overdue: ["partially_paid", "paid", "void"],
    paid: ["void"],
  },
  sla: {
    draft: ["awaiting_signature", "active"],
    awaiting_signature: ["active", "terminated"],
    active: ["expired", "terminated"],
    expired: ["terminated"],
  },
  employee_letter: {
    draft: ["issued"],
    issued: ["acknowledged", "archived"],
    acknowledged: ["archived"],
  },
};

export function canTransition(
  type: DocumentType,
  from: DocumentStatus,
  to: DocumentStatus,
): boolean {
  return transitions[type][from]?.includes(to) ?? false;
}

export function assertTransition(
  type: DocumentType,
  from: DocumentStatus,
  to: DocumentStatus,
): void {
  if (!canTransition(type, from, to)) {
    throw new Error(`Invalid ${type} transition: ${from} → ${to}`);
  }
}
