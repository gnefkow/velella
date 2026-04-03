export const FEDERAL_TAX_SOURCE_VALUES = [
  "manual",
  "use-estimate",
] as const;

export type FederalTaxSource = (typeof FEDERAL_TAX_SOURCE_VALUES)[number];
