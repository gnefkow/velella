import { describe, expect, it } from "vitest";
import {
  applyEraFactsToYearInput,
  buildDefaultEraFacts,
} from "./eraFacts";
import {
  ESTIMATED_FEDERAL_TAX_EXPENSE,
  buildDefaultYearInput,
  calculateYearFacts,
  defaultFederalTaxSourceForYears,
  expensesWithSyncedTaxTotal,
  totalTaxExpenseFromParts,
} from "./yearFacts";
import type { YearInput } from "../types/scenario";

describe("tax expense sync", () => {
  it("computes total from federal and state/local parts", () => {
    expect(totalTaxExpenseFromParts(7_000, 3_000)).toBe(10_000);
  });

  it("uses the estimate when the federal tax source is use-estimate", () => {
    expect(totalTaxExpenseFromParts(123, 3_000, "use-estimate")).toBe(
      ESTIMATED_FEDERAL_TAX_EXPENSE + 3_000
    );
  });

  it("expensesWithSyncedTaxTotal sets taxes to the sum", () => {
    const e = expensesWithSyncedTaxTotal({
      householdExpenses: 0,
      selectedFederalTaxAmount: 1,
      stateLocalTaxLiability: 2,
      taxes: 999,
      otherExpenses: 0,
    });
    expect(e.taxes).toBe(3);
  });

  it("expensesWithSyncedTaxTotal stores and uses use-estimate mode", () => {
    const e = expensesWithSyncedTaxTotal({
      householdExpenses: 0,
      selectedFederalTaxAmount: 1,
      federalTaxSource: "use-estimate",
      stateLocalTaxLiability: 2,
      taxes: 999,
      otherExpenses: 0,
    });
    expect(e.federalTaxSource).toBe("use-estimate");
    expect(e.taxes).toBe(ESTIMATED_FEDERAL_TAX_EXPENSE + 2);
  });

  it("calculateYearFacts uses combined taxes for total expenses", () => {
    const yi: YearInput = buildDefaultYearInput(2026, ["m1"], {
      wageIncome: { m1: 100_000 },
      expenses: expensesWithSyncedTaxTotal({
        householdExpenses: 40_000,
        selectedFederalTaxAmount: 8_000,
        stateLocalTaxLiability: 2_000,
        taxes: 0,
        otherExpenses: 0,
      }),
    });
    expect(calculateYearFacts(yi).totalExpenses).toBe(50_000);
  });

  it("applyEraFactsToYearInput overrides federal and state/local independently", () => {
    const era = buildDefaultEraFacts(["m1"], {
      wageIncome: { m1: 0 },
      expenses: expensesWithSyncedTaxTotal({
        householdExpenses: 0,
        selectedFederalTaxAmount: 100,
        stateLocalTaxLiability: 200,
        taxes: 0,
        otherExpenses: 0,
      }),
    });
    const year = buildDefaultYearInput(2030, ["m1"], {
      eraMetadata: { eraId: "e1", overriddenFields: ["selected-federal-tax-amount"] },
      expenses: expensesWithSyncedTaxTotal({
        householdExpenses: 0,
        selectedFederalTaxAmount: 500,
        stateLocalTaxLiability: 0,
        taxes: 0,
        otherExpenses: 0,
      }),
    });
    const merged = applyEraFactsToYearInput(year, era, [
      "selected-federal-tax-amount",
    ]);
    expect(merged.expenses.selectedFederalTaxAmount).toBe(500);
    expect(merged.expenses.stateLocalTaxLiability).toBe(200);
    expect(merged.expenses.taxes).toBe(700);
  });

  it("applyEraFactsToYearInput respects filing-status override", () => {
    const era = buildDefaultEraFacts(["m1"], {
      filingStatus: "married-filing-jointly",
    });
    const year = buildDefaultYearInput(2030, ["m1"], {
      filingStatus: "married-filing-separately",
      eraMetadata: { eraId: "e1", overriddenFields: ["filing-status"] },
    });
    const merged = applyEraFactsToYearInput(year, era, ["filing-status"]);
    expect(merged.filingStatus).toBe("married-filing-separately");
  });

  it("applyEraFactsToYearInput inherits era filing status when not overridden", () => {
    const era = buildDefaultEraFacts(["m1"], {
      filingStatus: "married-filing-jointly",
    });
    const year = buildDefaultYearInput(2030, ["m1"], {
      filingStatus: "single",
      eraMetadata: { eraId: "e1", overriddenFields: [] },
    });
    const merged = applyEraFactsToYearInput(year, era, []);
    expect(merged.filingStatus).toBe("married-filing-jointly");
  });

  it("buildDefaultYearInput initializes socialSecurityBenefits per income earner", () => {
    const yi = buildDefaultYearInput(2026, ["a", "b"], {});
    expect(yi.socialSecurityBenefits).toEqual({ a: 0, b: 0 });
  });

  it("buildDefaultYearInput defaults federalTaxSource to manual", () => {
    const yi = buildDefaultYearInput(2026, ["a"], {});
    expect(yi.expenses.federalTaxSource).toBe("manual");
  });

  it("buildDefaultEraFacts defaults federalTaxSource to manual", () => {
    const era = buildDefaultEraFacts(["a"], {});
    expect(era.expenses.federalTaxSource).toBe("manual");
  });

  it("applyEraFactsToYearInput inherits the era federal tax source", () => {
    const era = buildDefaultEraFacts(["m1"], {
      expenses: expensesWithSyncedTaxTotal({
        householdExpenses: 0,
        selectedFederalTaxAmount: 0,
        federalTaxSource: "use-estimate",
        stateLocalTaxLiability: 500,
        taxes: 0,
        otherExpenses: 0,
      }),
    });
    const year = buildDefaultYearInput(2030, ["m1"], {
      expenses: expensesWithSyncedTaxTotal({
        householdExpenses: 0,
        selectedFederalTaxAmount: 123,
        federalTaxSource: "manual",
        stateLocalTaxLiability: 0,
        taxes: 0,
        otherExpenses: 0,
      }),
      eraMetadata: { eraId: "e1", overriddenFields: [] },
    });
    const merged = applyEraFactsToYearInput(year, era, []);
    expect(merged.expenses.federalTaxSource).toBe("use-estimate");
    expect(merged.expenses.taxes).toBe(ESTIMATED_FEDERAL_TAX_EXPENSE + 500);
  });

  it("defaults new era source to use-estimate when all included federal amounts are zero", () => {
    const yearA = buildDefaultYearInput(2026, ["a"], {});
    const yearB = buildDefaultYearInput(2027, ["a"], {});
    expect(defaultFederalTaxSourceForYears([yearA, yearB])).toBe("use-estimate");
  });

  it("defaults new era source to manual when any included federal amount is non-zero", () => {
    const yearA = buildDefaultYearInput(2026, ["a"], {});
    const yearB = buildDefaultYearInput(2027, ["a"], {
      expenses: expensesWithSyncedTaxTotal({
        householdExpenses: 0,
        selectedFederalTaxAmount: 1_000,
        stateLocalTaxLiability: 0,
        taxes: 0,
        otherExpenses: 0,
      }),
    });
    expect(defaultFederalTaxSourceForYears([yearA, yearB])).toBe("manual");
  });

  it("buildDefaultYearInput initializes preTaxDistributions to zero", () => {
    const yi = buildDefaultYearInput(2026, ["a"], {});
    expect(yi.otherIncome.preTaxDistributions).toBe(0);
  });

  it("buildDefaultYearInput initializes rothDistributions to zero", () => {
    const yi = buildDefaultYearInput(2026, ["a"], {});
    expect(yi.otherIncome.rothDistributions).toBe(0);
  });

  it("buildDefaultYearInput initializes misc.rothConversions to zero", () => {
    const yi = buildDefaultYearInput(2026, ["a"], {});
    expect(yi.misc.rothConversions).toBe(0);
  });

  it("applyEraFactsToYearInput respects pre-tax-distributions override", () => {
    const era = buildDefaultEraFacts(["m1"], {
      otherIncome: {
        preTaxDistributions: 12_000,
        rothDistributions: 0,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 0,
        shortTermCapitalGains: 0,
      },
    });
    const year = buildDefaultYearInput(2030, ["m1"], {
      otherIncome: {
        preTaxDistributions: 500,
        rothDistributions: 0,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 0,
        shortTermCapitalGains: 0,
      },
      eraMetadata: {
        eraId: "e1",
        overriddenFields: ["pre-tax-distributions"],
      },
    });
    const merged = applyEraFactsToYearInput(year, era, ["pre-tax-distributions"]);
    expect(merged.otherIncome.preTaxDistributions).toBe(500);
  });

  it("applyEraFactsToYearInput inherits era pre-tax distributions when not overridden", () => {
    const era = buildDefaultEraFacts(["m1"], {
      otherIncome: {
        preTaxDistributions: 24_000,
        rothDistributions: 0,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 0,
        shortTermCapitalGains: 0,
      },
    });
    const year = buildDefaultYearInput(2030, ["m1"], {
      otherIncome: {
        preTaxDistributions: 0,
        rothDistributions: 0,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 0,
        shortTermCapitalGains: 0,
      },
      eraMetadata: { eraId: "e1", overriddenFields: [] },
    });
    const merged = applyEraFactsToYearInput(year, era, []);
    expect(merged.otherIncome.preTaxDistributions).toBe(24_000);
  });

  it("applyEraFactsToYearInput respects roth-distributions override", () => {
    const era = buildDefaultEraFacts(["m1"], {
      otherIncome: {
        preTaxDistributions: 0,
        rothDistributions: 20_000,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 0,
        shortTermCapitalGains: 0,
      },
    });
    const year = buildDefaultYearInput(2030, ["m1"], {
      otherIncome: {
        preTaxDistributions: 0,
        rothDistributions: 1_000,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 0,
        shortTermCapitalGains: 0,
      },
      eraMetadata: {
        eraId: "e1",
        overriddenFields: ["roth-distributions"],
      },
    });
    const merged = applyEraFactsToYearInput(year, era, ["roth-distributions"]);
    expect(merged.otherIncome.rothDistributions).toBe(1_000);
  });

  it("applyEraFactsToYearInput inherits era roth distributions when not overridden", () => {
    const era = buildDefaultEraFacts(["m1"], {
      otherIncome: {
        preTaxDistributions: 0,
        rothDistributions: 18_000,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 0,
        shortTermCapitalGains: 0,
      },
    });
    const year = buildDefaultYearInput(2030, ["m1"], {
      otherIncome: {
        preTaxDistributions: 0,
        rothDistributions: 0,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 0,
        shortTermCapitalGains: 0,
      },
      eraMetadata: { eraId: "e1", overriddenFields: [] },
    });
    const merged = applyEraFactsToYearInput(year, era, []);
    expect(merged.otherIncome.rothDistributions).toBe(18_000);
  });

  it("applyEraFactsToYearInput respects roth-conversions override", () => {
    const era = buildDefaultEraFacts(["m1"], {
      misc: { rothConversions: 50_000 },
    });
    const year = buildDefaultYearInput(2030, ["m1"], {
      misc: { rothConversions: 5_000 },
      eraMetadata: {
        eraId: "e1",
        overriddenFields: ["roth-conversions"],
      },
    });
    const merged = applyEraFactsToYearInput(year, era, ["roth-conversions"]);
    expect(merged.misc.rothConversions).toBe(5_000);
  });

  it("applyEraFactsToYearInput inherits era roth conversions when not overridden", () => {
    const era = buildDefaultEraFacts(["m1"], {
      misc: { rothConversions: 40_000 },
    });
    const year = buildDefaultYearInput(2030, ["m1"], {
      misc: { rothConversions: 0 },
      eraMetadata: { eraId: "e1", overriddenFields: [] },
    });
    const merged = applyEraFactsToYearInput(year, era, []);
    expect(merged.misc.rothConversions).toBe(40_000);
  });

  it("applyEraFactsToYearInput respects social-security-benefits override", () => {
    const era = buildDefaultEraFacts(["m1"], {
      socialSecurityBenefits: { m1: 12_000 },
    });
    const year = buildDefaultYearInput(2030, ["m1"], {
      socialSecurityBenefits: { m1: 500 },
      eraMetadata: {
        eraId: "e1",
        overriddenFields: ["social-security-benefits-m1"],
      },
    });
    const merged = applyEraFactsToYearInput(year, era, [
      "social-security-benefits-m1",
    ]);
    expect(merged.socialSecurityBenefits.m1).toBe(500);
  });

  it("applyEraFactsToYearInput inherits era social security when not overridden", () => {
    const era = buildDefaultEraFacts(["m1"], {
      socialSecurityBenefits: { m1: 24_000 },
    });
    const year = buildDefaultYearInput(2030, ["m1"], {
      socialSecurityBenefits: { m1: 0 },
      eraMetadata: { eraId: "e1", overriddenFields: [] },
    });
    const merged = applyEraFactsToYearInput(year, era, []);
    expect(merged.socialSecurityBenefits.m1).toBe(24_000);
  });

  it("calculateYearFacts includes socialSecurityBenefits in ordinary and total income", () => {
    const yi = buildDefaultYearInput(2026, ["m1"], {
      wageIncome: { m1: 50_000 },
      socialSecurityBenefits: { m1: 30_000 },
    });
    const facts = calculateYearFacts(yi);
    expect(facts.ordinaryIncome).toBe(80_000);
    expect(facts.totalIncome).toBe(80_000);
  });

  it("calculateYearFacts includes qualified and ordinary dividends in ordinary income", () => {
    const yi = buildDefaultYearInput(2026, ["m1"], {
      otherIncome: {
        preTaxDistributions: 0,
        rothDistributions: 0,
        qualifiedDividends: 1_000,
        ordinaryDividends: 2_000,
        interestIncome: 0,
        longTermCapitalGains: 0,
        shortTermCapitalGains: 0,
      },
    });
    expect(calculateYearFacts(yi).ordinaryIncome).toBe(3_000);
  });

  it("calculateYearFacts includes pre-tax distributions in ordinary and total income", () => {
    const yi = buildDefaultYearInput(2026, ["m1"], {
      otherIncome: {
        preTaxDistributions: 7_500,
        rothDistributions: 0,
        qualifiedDividends: 1_000,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 2_500,
        shortTermCapitalGains: 0,
      },
    });
    const facts = calculateYearFacts(yi);
    expect(facts.ordinaryIncome).toBe(8_500);
    expect(facts.totalIncome).toBe(11_000);
  });

  it("calculateYearFacts adds Roth distributions to total income but not ordinary income", () => {
    const yi = buildDefaultYearInput(2026, ["m1"], {
      wageIncome: { m1: 40_000 },
      otherIncome: {
        preTaxDistributions: 0,
        rothDistributions: 15_000,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 0,
        shortTermCapitalGains: 0,
      },
    });
    const facts = calculateYearFacts(yi);
    expect(facts.ordinaryIncome).toBe(40_000);
    expect(facts.totalIncome).toBe(55_000);
  });

  it("calculateYearFacts does not include Roth conversions in ordinary or total income", () => {
    const yi = buildDefaultYearInput(2026, ["m1"], {
      wageIncome: { m1: 30_000 },
      misc: { rothConversions: 100_000 },
    });
    const facts = calculateYearFacts(yi);
    expect(facts.ordinaryIncome).toBe(30_000);
    expect(facts.totalIncome).toBe(30_000);
  });
});
