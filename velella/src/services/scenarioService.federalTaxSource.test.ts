import { describe, expect, it } from "vitest";
import { ESTIMATED_FEDERAL_TAX_EXPENSE } from "../lib/yearFacts";
import { scenarioToYaml, yamlToScenario } from "./scenarioService";

describe("federal tax source YAML", () => {
  it("defaults missing federal-tax-source to manual for backward compatibility", () => {
    const scenario = yamlToScenario({
      "scenario-info": { "year-start": 2026, "year-end": 2026 },
      "household-members": [{ id: "p1", "income-earner": true }],
      years: [
        {
          year: 2026,
          expenses: {
            "selected-federal-tax-amount": 4_000,
            "state-local-tax-liability": 1_000,
          },
        },
      ],
    });

    expect(scenario.years[0]?.expenses.federalTaxSource).toBe("manual");
    expect(scenario.years[0]?.expenses.taxes).toBe(5_000);
  });

  it("round-trips federal-tax-source for years and eras", () => {
    const scenario = yamlToScenario({
      "scenario-info": { "year-start": 2026, "year-end": 2026 },
      "household-members": [{ id: "p1", "income-earner": true }],
      eras: [
        {
          id: "e1",
          nickname: "Estimate Era",
          "start-year": 2026,
          "end-year": 2026,
          "era-facts": {
            expenses: {
              "selected-federal-tax-amount": 0,
              "federal-tax-source": "use-estimate",
              "state-local-tax-liability": 2_000,
            },
          },
        },
      ],
      years: [
        {
          year: 2026,
          expenses: {
            "selected-federal-tax-amount": 0,
            "federal-tax-source": "use-estimate",
            "state-local-tax-liability": 1_000,
          },
        },
      ],
    });

    expect(scenario.years[0]?.expenses.federalTaxSource).toBe("use-estimate");
    expect(scenario.years[0]?.expenses.taxes).toBe(
      ESTIMATED_FEDERAL_TAX_EXPENSE + 1_000
    );

    const yaml = scenarioToYaml(scenario);
    expect(yaml.years?.[0]?.expenses?.["federal-tax-source"]).toBe("use-estimate");
    expect(yaml.eras?.[0]?.["era-facts"]?.expenses?.["federal-tax-source"]).toBe(
      "use-estimate"
    );
  });
});
