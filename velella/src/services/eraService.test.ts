import { describe, expect, it } from "vitest";
import { buildDefaultEraFacts } from "../lib/eraFacts";
import { buildDefaultYearInput, expensesWithSyncedTaxTotal } from "../lib/yearFacts";
import type { Scenario } from "../types/scenario";
import { updateEra } from "./eraService";

describe("updateEra", () => {
  it("applies era facts to an existing year newly added to the era range", () => {
    const householdMemberId = "p1";
    const eraFacts = buildDefaultEraFacts([householdMemberId], {
      filingStatus: "married-filing-jointly",
      wageIncome: { [householdMemberId]: 100_000 },
      expenses: expensesWithSyncedTaxTotal({
        householdExpenses: 80_000,
        selectedFederalTaxAmount: 0,
        stateLocalTaxLiability: 0,
        taxes: 0,
        otherExpenses: 0,
      }),
    });

    const scenario: Scenario = {
      scenarioInfo: {
        scenarioTitle: "Test",
        scenarioDescription: "",
        yearStart: 2029,
        yearEnd: 2031,
      },
      assumptions: {
        inflationRate: 0.03,
        initialPortfolio: 1,
        marketReturn: 0.06,
        safeWithdrawalRate: 0.04,
      },
      householdMembers: [
        {
          id: householdMemberId,
          nickname: "Pat",
          birthday: "01/01/1980",
          incomeEarner: true,
        },
      ],
      years: [
        buildDefaultYearInput(2029, [householdMemberId], {
          filingStatus: "married-filing-jointly",
          wageIncome: { [householdMemberId]: 100_000 },
          expenses: expensesWithSyncedTaxTotal({
            householdExpenses: 80_000,
            selectedFederalTaxAmount: 0,
            stateLocalTaxLiability: 0,
            taxes: 0,
            otherExpenses: 0,
          }),
          eraMetadata: { eraId: "e1", overriddenFields: [] },
        }),
        buildDefaultYearInput(2030, [householdMemberId], {
          filingStatus: "married-filing-jointly",
          wageIncome: { [householdMemberId]: 100_000 },
          expenses: expensesWithSyncedTaxTotal({
            householdExpenses: 80_000,
            selectedFederalTaxAmount: 0,
            stateLocalTaxLiability: 0,
            taxes: 0,
            otherExpenses: 0,
          }),
          eraMetadata: { eraId: "e1", overriddenFields: [] },
        }),
        buildDefaultYearInput(2031, [householdMemberId], {
          filingStatus: "single",
          wageIncome: { [householdMemberId]: 35_000 },
          expenses: expensesWithSyncedTaxTotal({
            householdExpenses: 120_000,
            selectedFederalTaxAmount: 0,
            stateLocalTaxLiability: 0,
            taxes: 0,
            otherExpenses: 0,
          }),
        }),
      ],
      eras: [
        {
          id: "e1",
          nickname: "Philly",
          description: "",
          startYear: 2029,
          endYear: 2030,
          eraFacts,
        },
      ],
    };

    const updatedScenario = updateEra(scenario, "e1", {
      nickname: "Philly",
      description: "",
      startYear: 2029,
      endYear: 2031,
      eraFacts,
    });

    const addedYear = updatedScenario.years.find((yearInput) => yearInput.year === 2031);

    expect(addedYear).toBeDefined();
    expect(addedYear?.filingStatus).toBe("married-filing-jointly");
    expect(addedYear?.wageIncome[householdMemberId]).toBe(100_000);
    expect(addedYear?.expenses.householdExpenses).toBe(80_000);
    expect(addedYear?.eraMetadata).toEqual({
      eraId: "e1",
      overriddenFields: [],
    });
  });
});
