import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { describe, expect, it } from "vitest";
import {
  normalizeTaxReferenceDataYaml,
  toTaxEstimatorReferenceData,
  type TaxReferenceDataYaml,
} from "../services/taxReferenceDataService";
import { buildDefaultYearInput } from "../lib/yearFacts";
import { estimateTax } from "./estimateTax";

function loadEstimatorRef() {
  const path = new URL("../../data/tax-reference-data.yaml", import.meta.url);
  const raw = yaml.load(readFileSync(path, "utf-8")) as TaxReferenceDataYaml;
  return toTaxEstimatorReferenceData(normalizeTaxReferenceDataYaml(raw));
}

describe("estimateTax", () => {
  const ref = loadEstimatorRef();

  it("returns zero federal tax for a year with only modest wages covered by standard deduction", () => {
    const yi = buildDefaultYearInput(2026, ["m1"], {
      wageIncome: { m1: 10_000 },
      filingStatus: "single",
    });
    const r = estimateTax(yi, ref);
    expect(r.estimatedFederalTaxExpense).toBe(0);
    expect(r.ordinaryTax + r.preferentialTax).toBe(0);
  });

  it("increases tax when wages exceed standard deduction (single)", () => {
    const yi = buildDefaultYearInput(2026, ["m1"], {
      wageIncome: { m1: 120_000 },
      filingStatus: "single",
    });
    const r = estimateTax(yi, ref);
    expect(r.estimatedFederalTaxExpense).toBeGreaterThan(5_000);
    expect(r.taxableIncome).toBeGreaterThan(0);
  });

  it("treats half of realized long-term gains as taxable preferential income", () => {
    const yi = buildDefaultYearInput(2026, ["m1"], {
      wageIncome: { m1: 0 },
      filingStatus: "single",
      otherIncome: {
        preTaxDistributions: 0,
        rothDistributions: 0,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 100_000,
        shortTermCapitalGains: 0,
      },
    });
    const r = estimateTax(yi, ref);
    expect(r.preferentialIncome).toBe(50_000);
  });

  it("does not add Roth distributions to taxable income", () => {
    const yi = buildDefaultYearInput(2026, ["m1"], {
      wageIncome: { m1: 50_000 },
      filingStatus: "single",
      otherIncome: {
        preTaxDistributions: 0,
        rothDistributions: 40_000,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 0,
        shortTermCapitalGains: 0,
      },
    });
    const r = estimateTax(yi, ref);
    expect(r.adjustedGrossIncome).toBe(50_000);
  });

  it("reduces ordinary income when pre-tax contributions apply with breakdown on", () => {
    const yi = buildDefaultYearInput(2026, ["m1"], {
      wageIncome: { m1: 100_000 },
      filingStatus: "single",
      modifyInvestmentDetails: true,
      investmentBreakdown: {
        preTax401kContribution: 20_000,
        preTaxIraContribution: 0,
        hsaContribution: 0,
        rothRetirement: 0,
        taxableInvestments: 0,
      },
    });
    const without = buildDefaultYearInput(2026, ["m1"], {
      wageIncome: { m1: 100_000 },
      filingStatus: "single",
      modifyInvestmentDetails: false,
    });
    const tWith = estimateTax(yi, ref).estimatedFederalTaxExpense;
    const tWithout = estimateTax(without, ref).estimatedFederalTaxExpense;
    expect(tWith).toBeLessThan(tWithout);
  });
});
