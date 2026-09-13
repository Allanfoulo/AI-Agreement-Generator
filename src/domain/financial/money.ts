export type Money = {
  readonly currency: string;
  readonly amountMinor: number;
};

export type FinancialLineInput = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly quantityMilli: number;
  readonly unitPriceMinor: number;
  readonly discountBasisPoints?: number;
  readonly taxRateBasisPoints?: number;
};

export type CalculatedLine = FinancialLineInput & {
  readonly grossMinor: number;
  readonly discountMinor: number;
  readonly netMinor: number;
  readonly taxMinor: number;
  readonly totalMinor: number;
};

export type CalculationResult = {
  readonly currency: string;
  readonly lines: readonly CalculatedLine[];
  readonly subtotalMinor: number;
  readonly discountMinor: number;
  readonly taxMinor: number;
  readonly totalMinor: number;
  readonly depositMinor?: number;
  readonly balanceMinor?: number;
};

const BASIS_POINTS = 10_000;
const QUANTITY_SCALE = 1_000;

function assertSafeInteger(value: number, field: string): void {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${field} must be a safe integer`);
  }
}

function assertBasisPoints(value: number, field: string): void {
  assertSafeInteger(value, field);
  if (value < 0 || value > BASIS_POINTS) {
    throw new Error(`${field} must be between 0 and 10000 basis points`);
  }
}

/** Round a non-negative decimal result using the policy required by the PRD. */
export function roundHalfUp(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Amount must be a finite, non-negative number");
  }
  return Math.floor(value + 0.5);
}

export function money(currency: string, amountMinor: number): Money {
  if (!currency.trim()) {
    throw new Error("Currency is required");
  }
  assertSafeInteger(amountMinor, "amountMinor");
  if (amountMinor < 0) {
    throw new Error("Money cannot be negative");
  }
  return { currency, amountMinor };
}

export function calculateFinancialDocument(input: {
  readonly currency: string;
  readonly lines: readonly FinancialLineInput[];
  readonly depositBasisPoints?: number;
}): CalculationResult {
  if (!input.lines.length) {
    throw new Error("At least one line item is required");
  }
  if (!input.currency.trim()) {
    throw new Error("Currency is required");
  }
  if (input.depositBasisPoints !== undefined) {
    assertBasisPoints(input.depositBasisPoints, "depositBasisPoints");
  }

  const lines = input.lines.map((line) => {
    assertSafeInteger(line.quantityMilli, `quantityMilli for ${line.id}`);
    assertSafeInteger(line.unitPriceMinor, `unitPriceMinor for ${line.id}`);
    if (line.quantityMilli <= 0) {
      throw new Error(`Quantity must be positive for ${line.id}`);
    }
    if (line.unitPriceMinor < 0) {
      throw new Error(`Unit price cannot be negative for ${line.id}`);
    }
    assertBasisPoints(line.discountBasisPoints ?? 0, `discountBasisPoints for ${line.id}`);
    assertBasisPoints(line.taxRateBasisPoints ?? 0, `taxRateBasisPoints for ${line.id}`);

    const grossMinor = roundHalfUp((line.unitPriceMinor * line.quantityMilli) / QUANTITY_SCALE);
    const discountMinor = roundHalfUp(
      (grossMinor * (line.discountBasisPoints ?? 0)) / BASIS_POINTS,
    );
    const netMinor = grossMinor - discountMinor;
    const taxMinor = roundHalfUp((netMinor * (line.taxRateBasisPoints ?? 0)) / BASIS_POINTS);

    return {
      ...line,
      discountBasisPoints: line.discountBasisPoints ?? 0,
      taxRateBasisPoints: line.taxRateBasisPoints ?? 0,
      grossMinor,
      discountMinor,
      netMinor,
      taxMinor,
      totalMinor: netMinor + taxMinor,
    };
  });

  const subtotalMinor = lines.reduce((sum, line) => sum + line.grossMinor, 0);
  const discountMinor = lines.reduce((sum, line) => sum + line.discountMinor, 0);
  const taxMinor = lines.reduce((sum, line) => sum + line.taxMinor, 0);
  const totalMinor = lines.reduce((sum, line) => sum + line.totalMinor, 0);
  const depositMinor = input.depositBasisPoints === undefined
    ? undefined
    : roundHalfUp((totalMinor * input.depositBasisPoints) / BASIS_POINTS);

  return {
    currency: input.currency,
    lines,
    subtotalMinor,
    discountMinor,
    taxMinor,
    totalMinor,
    depositMinor,
    balanceMinor: depositMinor === undefined ? undefined : totalMinor - depositMinor,
  };
}

export function formatMoney(value: Money, locale = "en-ZA"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: value.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value.amountMinor / 100);
}
