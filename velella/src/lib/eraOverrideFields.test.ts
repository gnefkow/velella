import { describe, expect, it } from "vitest";
import type { EraFacts } from "../types/era";
import { buildEraOverrideFieldDescriptors } from "./eraOverrideFields";

const baseEraFacts: EraFacts = {
  filingStatus: "single",
  wageIncome: { jack: 100_000 },
  socialSecurityBenefits: { jack: 0 },
  otherIncome: {
    preTaxDistributions: 0,
    rothDistributions: 0,
    qualifiedDividends: 1,
    ordinaryDividends: 2,
    interestIncome: 2,
    shortTermCapitalGains: 3,
    longTermCapitalGains: 4,
  },
  expenses: {
    householdExpenses: 5,
    selectedFederalTaxAmount: 4,
    federalTaxSource: "manual",
    stateLocalTaxLiability: 2,
    taxes: 6,
    otherExpenses: 7,
  },
  modifyInvestmentDetails: true,
  investmentBreakdown: {
    preTax401kContribution: 5,
    preTaxIraContribution: 3,
    hsaContribution: 2,
    rothRetirement: 9,
    taxableInvestments: 10,
  },
  misc: { rothConversions: 0 },
};

describe("buildEraOverrideFieldDescriptors writeEraValue", () => {
  it("round-trips wage and qualified-dividend fields", () => {
    const descriptors = buildEraOverrideFieldDescriptors([
      {
        id: "jack",
        nickname: "Jack",
        birthday: "01/01/1990",
        incomeEarner: true,
      },
    ]);
    const wage = descriptors.find((d) => d.fieldKey === "wage-income-jack");
    const dividend = descriptors.find(
      (d) => d.fieldKey === "qualified-dividends"
    );

    expect(wage).toBeDefined();
    expect(dividend).toBeDefined();

    const nextWage = wage!.writeEraValue(baseEraFacts, 55_000);
    expect(nextWage.wageIncome.jack).toBe(55_000);
    expect(wage!.readEraValue(nextWage)).toBe(55_000);

    const nextDiv = dividend!.writeEraValue(baseEraFacts, 99);
    expect(nextDiv.otherIncome.qualifiedDividends).toBe(99);
    expect(dividend!.readEraValue(nextDiv)).toBe(99);
  });

  it("round-trips ordinary-dividend field", () => {
    const descriptors = buildEraOverrideFieldDescriptors([]);
    const ordinary = descriptors.find((d) => d.fieldKey === "ordinary-dividends");
    expect(ordinary).toBeDefined();
    const next = ordinary!.writeEraValue(baseEraFacts, 77);
    expect(next.otherIncome.ordinaryDividends).toBe(77);
    expect(ordinary!.readEraValue(next)).toBe(77);
  });

  it("round-trips pre-tax-distributions field", () => {
    const descriptors = buildEraOverrideFieldDescriptors([]);
    const preTax = descriptors.find(
      (d) => d.fieldKey === "pre-tax-distributions"
    );
    expect(preTax).toBeDefined();
    const next = preTax!.writeEraValue(baseEraFacts, 12_345);
    expect(next.otherIncome.preTaxDistributions).toBe(12_345);
    expect(preTax!.readEraValue(next)).toBe(12_345);
  });

  it("round-trips roth-distributions field", () => {
    const descriptors = buildEraOverrideFieldDescriptors([]);
    const roth = descriptors.find((d) => d.fieldKey === "roth-distributions");
    expect(roth).toBeDefined();
    const next = roth!.writeEraValue(baseEraFacts, 9_999);
    expect(next.otherIncome.rothDistributions).toBe(9_999);
    expect(roth!.readEraValue(next)).toBe(9_999);
  });

  it("round-trips pre-tax-401k-contribution field", () => {
    const descriptors = buildEraOverrideFieldDescriptors([]);
    const k = descriptors.find(
      (d) => d.fieldKey === "pre-tax-401k-contribution"
    );
    expect(k).toBeDefined();
    const next = k!.writeEraValue(baseEraFacts, 22_000);
    expect(next.investmentBreakdown.preTax401kContribution).toBe(22_000);
    expect(k!.readEraValue(next)).toBe(22_000);
  });

  it("round-trips pre-tax-ira-contribution field", () => {
    const descriptors = buildEraOverrideFieldDescriptors([]);
    const k = descriptors.find(
      (d) => d.fieldKey === "pre-tax-ira-contribution"
    );
    expect(k).toBeDefined();
    const next = k!.writeEraValue(baseEraFacts, 6_500);
    expect(next.investmentBreakdown.preTaxIraContribution).toBe(6_500);
    expect(k!.readEraValue(next)).toBe(6_500);
  });

  it("round-trips hsa-contribution field", () => {
    const descriptors = buildEraOverrideFieldDescriptors([]);
    const k = descriptors.find((d) => d.fieldKey === "hsa-contribution");
    expect(k).toBeDefined();
    const next = k!.writeEraValue(baseEraFacts, 4_150);
    expect(next.investmentBreakdown.hsaContribution).toBe(4_150);
    expect(k!.readEraValue(next)).toBe(4_150);
  });

  it("round-trips roth-conversions field", () => {
    const descriptors = buildEraOverrideFieldDescriptors([]);
    const conv = descriptors.find((d) => d.fieldKey === "roth-conversions");
    expect(conv).toBeDefined();
    const next = conv!.writeEraValue(baseEraFacts, 25_000);
    expect(next.misc.rothConversions).toBe(25_000);
    expect(conv!.readEraValue(next)).toBe(25_000);
  });

  it("does not mutate the previous era facts object", () => {
    const [federal] = buildEraOverrideFieldDescriptors([]).filter(
      (d) => d.fieldKey === "selected-federal-tax-amount"
    );
    const snapshot = JSON.stringify(baseEraFacts);
    federal!.writeEraValue(baseEraFacts, 42_000);
    expect(JSON.stringify(baseEraFacts)).toBe(snapshot);
  });

  it("round-trips social security benefits per member", () => {
    const descriptors = buildEraOverrideFieldDescriptors([
      {
        id: "jack",
        nickname: "Jack",
        birthday: "01/01/1990",
        incomeEarner: true,
      },
    ]);
    const ss = descriptors.find(
      (d) => d.fieldKey === "social-security-benefits-jack"
    );
    expect(ss).toBeDefined();
    const next = ss!.writeEraValue(baseEraFacts, 18_000);
    expect(next.socialSecurityBenefits.jack).toBe(18_000);
    expect(ss!.readEraValue(next)).toBe(18_000);
  });

  it("maps filing status through era override indices", () => {
    const descriptors = buildEraOverrideFieldDescriptors([]);
    const fs = descriptors.find((d) => d.fieldKey === "filing-status");
    expect(fs).toBeDefined();
    const next = fs!.writeEraValue(baseEraFacts, 1);
    expect(next.filingStatus).toBe("married-filing-jointly");
    expect(fs!.readEraValue(next)).toBe(1);
  });

  it("keeps expenses.taxes synced when writing federal tax", () => {
    const descriptors = buildEraOverrideFieldDescriptors([]);
    const federal = descriptors.find(
      (d) => d.fieldKey === "selected-federal-tax-amount"
    );
    const stateLocal = descriptors.find(
      (d) => d.fieldKey === "state-local-tax-liability"
    );
    expect(federal).toBeDefined();
    expect(stateLocal).toBeDefined();

    const next = federal!.writeEraValue(baseEraFacts, 10_000);
    expect(next.expenses.selectedFederalTaxAmount).toBe(10_000);
    expect(next.expenses.stateLocalTaxLiability).toBe(2);
    expect(next.expenses.taxes).toBe(10_002);
  });
});
