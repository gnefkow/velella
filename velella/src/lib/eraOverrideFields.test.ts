import { describe, expect, it } from "vitest";
import type { EraFacts } from "../types/era";
import { buildEraOverrideFieldDescriptors } from "./eraOverrideFields";

const baseEraFacts: EraFacts = {
  wageIncome: { jack: 100_000 },
  otherIncome: {
    dividendIncome: 1,
    interestIncome: 2,
    shortTermCapitalGains: 3,
    longTermCapitalGains: 4,
  },
  expenses: {
    householdExpenses: 5,
    taxes: 6,
    otherExpenses: 7,
  },
  modifyInvestmentDetails: true,
  investmentBreakdown: {
    traditionalRetirement: 8,
    rothRetirement: 9,
    taxableInvestments: 10,
  },
};

describe("buildEraOverrideFieldDescriptors writeEraValue", () => {
  it("round-trips wage and dividend fields", () => {
    const descriptors = buildEraOverrideFieldDescriptors([
      {
        id: "jack",
        nickname: "Jack",
        birthday: "01/01/1990",
        incomeEarner: true,
      },
    ]);
    const wage = descriptors.find((d) => d.fieldKey === "wage-income-jack");
    const dividend = descriptors.find((d) => d.fieldKey === "dividend-income");

    expect(wage).toBeDefined();
    expect(dividend).toBeDefined();

    const nextWage = wage!.writeEraValue(baseEraFacts, 55_000);
    expect(nextWage.wageIncome.jack).toBe(55_000);
    expect(wage!.readEraValue(nextWage)).toBe(55_000);

    const nextDiv = dividend!.writeEraValue(baseEraFacts, 99);
    expect(nextDiv.otherIncome.dividendIncome).toBe(99);
    expect(dividend!.readEraValue(nextDiv)).toBe(99);
  });

  it("does not mutate the previous era facts object", () => {
    const [taxes] = buildEraOverrideFieldDescriptors([]).filter(
      (d) => d.fieldKey === "taxes"
    );
    const snapshot = JSON.stringify(baseEraFacts);
    taxes!.writeEraValue(baseEraFacts, 42_000);
    expect(JSON.stringify(baseEraFacts)).toBe(snapshot);
  });
});
