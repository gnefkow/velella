import type { FilingStatus } from "../types/scenario";
import type {
  FilingStatusAmountRange,
  SocialSecurityThreshold,
  TaxBracket,
  TaxEstimatorReferenceData,
  TaxReferenceData,
  TaxReferenceSource,
} from "../types/taxReferenceData";

const API_BASE = "/api";

type RawTaxReferenceSource = {
  label: string;
  url: string;
  "as-of-date": string;
};

type RawBracket = {
  rate: number;
  "lower-bound": number;
  "upper-bound"?: number | null;
};

type RawRange = {
  start: number;
  end: number;
};

type RawThresholdByStatus<T> = {
  single: T;
  "married-filing-jointly": T;
  "married-filing-separately": T;
};

export interface TaxReferenceDataYaml {
  metadata: {
    "dataset-label": string;
    "tax-year": number;
    "generated-on": string;
    "fallback-policy": string;
    notes?: string[];
  };
  "supported-filing-statuses": Array<{
    id: FilingStatus;
    label: string;
  }>;
  "standard-deduction": {
    values: RawThresholdByStatus<number>;
    source: RawTaxReferenceSource;
  };
  "ordinary-income-brackets": {
    values: RawThresholdByStatus<RawBracket[]>;
    source: RawTaxReferenceSource;
  };
  "preferential-income-brackets": {
    values: RawThresholdByStatus<RawBracket[]>;
    source: RawTaxReferenceSource;
  };
  "social-security-taxation": {
    "taxable-benefit-rates": number[];
    "provisional-income-thresholds": RawThresholdByStatus<{
      "base-amount": number;
      "adjusted-base-amount": number;
      note?: string;
    }>;
    source: RawTaxReferenceSource;
  };
  "child-tax-credit": {
    "amount-per-qualifying-child": number;
    "refundable-portion": number;
    "phaseout-starts": RawThresholdByStatus<number>;
    "phaseout-reduction-per-1000": number;
    "qualifying-child-must-be-under-age": number;
    notes?: string[];
    source: RawTaxReferenceSource;
  };
  "informational-thresholds": {
    "traditional-ira-deductibility": {
      "covered-by-workplace-plan-phaseouts": RawThresholdByStatus<RawRange>;
      "spouse-covered-phaseout-married-filing-jointly": RawRange;
      notes?: string[];
      source: RawTaxReferenceSource;
    };
    "traditional-ira-contribution-limits": {
      "annual-limit": number;
      "catch-up-50-plus": number;
      source: RawTaxReferenceSource;
    };
    "workplace-plan-contribution-limits": {
      "employee-elective-deferral-limit": number;
      "catch-up-50-plus": number;
      "catch-up-age-60-to-63": number;
      plans: string[];
      source: RawTaxReferenceSource;
    };
    "hsa-contribution-limits": {
      "self-only": number;
      family: number;
      "catch-up-55-plus": number;
      "hdhp-min-deductible": {
        "self-only": number;
        family: number;
      };
      "hdhp-max-out-of-pocket": {
        "self-only": number;
        family: number;
      };
      source: RawTaxReferenceSource;
    };
    "roth-ira-phaseouts": {
      single: RawRange;
      "married-filing-jointly": RawRange;
      "married-filing-separately": RawRange;
      source: RawTaxReferenceSource;
    };
    "net-investment-income-tax": {
      rate: number;
      thresholds: RawThresholdByStatus<number>;
      notes?: string[];
      source: RawTaxReferenceSource;
    };
    irmaa: {
      "part-b-and-part-d-thresholds": RawThresholdByStatus<number[]>;
      notes?: string[];
      source: RawTaxReferenceSource;
    };
    "rmd-reference": {
      "starting-age": {
        "born-1951-through-1959": number;
        "born-1960-or-later": number;
      };
      "first-distribution-deadline": string;
      "irs-life-expectancy-table-reference": {
        label: string;
        url: string;
      };
      notes?: string[];
      source: RawTaxReferenceSource;
    };
    "estate-and-gift": {
      "estate-basic-exclusion-amount": number;
      "annual-gift-exclusion": number;
      source: RawTaxReferenceSource;
    };
  };
}

function normalizeSource(raw: RawTaxReferenceSource): TaxReferenceSource {
  return {
    label: raw.label,
    url: raw.url,
    asOfDate: raw["as-of-date"],
  };
}

function normalizeBracket(raw: RawBracket): TaxBracket {
  return {
    rate: raw.rate,
    lowerBound: raw["lower-bound"],
    upperBound: raw["upper-bound"] ?? null,
  };
}

function normalizeRange(raw: RawRange): FilingStatusAmountRange {
  return {
    start: raw.start,
    end: raw.end,
  };
}

function normalizeThreshold(
  raw: TaxReferenceDataYaml["social-security-taxation"]["provisional-income-thresholds"][FilingStatus]
): SocialSecurityThreshold {
  return {
    baseAmount: raw["base-amount"],
    adjustedBaseAmount: raw["adjusted-base-amount"],
    note: raw.note,
  };
}

export function normalizeTaxReferenceDataYaml(
  raw: TaxReferenceDataYaml
): TaxReferenceData {
  return {
    metadata: {
      datasetLabel: raw.metadata["dataset-label"],
      taxYear: raw.metadata["tax-year"],
      generatedOn: raw.metadata["generated-on"],
      fallbackPolicy: raw.metadata["fallback-policy"],
      notes: raw.metadata.notes ?? [],
    },
    supportedFilingStatuses: raw["supported-filing-statuses"].map((status) => ({
      id: status.id,
      label: status.label,
    })),
    standardDeduction: {
      valuesByFilingStatus: {
        single: raw["standard-deduction"].values.single,
        "married-filing-jointly":
          raw["standard-deduction"].values["married-filing-jointly"],
        "married-filing-separately":
          raw["standard-deduction"].values["married-filing-separately"],
      },
      source: normalizeSource(raw["standard-deduction"].source),
    },
    ordinaryIncomeBrackets: {
      valuesByFilingStatus: {
        single: raw["ordinary-income-brackets"].values.single.map(normalizeBracket),
        "married-filing-jointly":
          raw["ordinary-income-brackets"].values[
            "married-filing-jointly"
          ].map(normalizeBracket),
        "married-filing-separately":
          raw["ordinary-income-brackets"].values[
            "married-filing-separately"
          ].map(normalizeBracket),
      },
      source: normalizeSource(raw["ordinary-income-brackets"].source),
    },
    preferentialIncomeBrackets: {
      valuesByFilingStatus: {
        single: raw["preferential-income-brackets"].values.single.map(
          normalizeBracket
        ),
        "married-filing-jointly":
          raw["preferential-income-brackets"].values[
            "married-filing-jointly"
          ].map(normalizeBracket),
        "married-filing-separately":
          raw["preferential-income-brackets"].values[
            "married-filing-separately"
          ].map(normalizeBracket),
      },
      source: normalizeSource(raw["preferential-income-brackets"].source),
    },
    socialSecurityTaxation: {
      taxableBenefitRates:
        raw["social-security-taxation"]["taxable-benefit-rates"],
      thresholdsByFilingStatus: {
        single: normalizeThreshold(
          raw["social-security-taxation"]["provisional-income-thresholds"].single
        ),
        "married-filing-jointly": normalizeThreshold(
          raw["social-security-taxation"]["provisional-income-thresholds"][
            "married-filing-jointly"
          ]
        ),
        "married-filing-separately": normalizeThreshold(
          raw["social-security-taxation"]["provisional-income-thresholds"][
            "married-filing-separately"
          ]
        ),
      },
      source: normalizeSource(raw["social-security-taxation"].source),
    },
    childTaxCredit: {
      amountPerQualifyingChild:
        raw["child-tax-credit"]["amount-per-qualifying-child"],
      refundablePortion: raw["child-tax-credit"]["refundable-portion"],
      phaseoutStartsByFilingStatus: {
        single: raw["child-tax-credit"]["phaseout-starts"].single,
        "married-filing-jointly":
          raw["child-tax-credit"]["phaseout-starts"][
            "married-filing-jointly"
          ],
        "married-filing-separately":
          raw["child-tax-credit"]["phaseout-starts"][
            "married-filing-separately"
          ],
      },
      phaseoutReductionPer1000:
        raw["child-tax-credit"]["phaseout-reduction-per-1000"],
      qualifyingChildMustBeUnderAge:
        raw["child-tax-credit"]["qualifying-child-must-be-under-age"],
      notes: raw["child-tax-credit"].notes ?? [],
      source: normalizeSource(raw["child-tax-credit"].source),
    },
    informationalThresholds: {
      traditionalIraDeductibility: {
        coveredByWorkplacePlanPhaseouts: {
          single: normalizeRange(
            raw["informational-thresholds"]["traditional-ira-deductibility"][
              "covered-by-workplace-plan-phaseouts"
            ].single
          ),
          "married-filing-jointly": normalizeRange(
            raw["informational-thresholds"]["traditional-ira-deductibility"][
              "covered-by-workplace-plan-phaseouts"
            ]["married-filing-jointly"]
          ),
          "married-filing-separately": normalizeRange(
            raw["informational-thresholds"]["traditional-ira-deductibility"][
              "covered-by-workplace-plan-phaseouts"
            ]["married-filing-separately"]
          ),
        },
        spouseCoveredPhaseoutMarriedFilingJointly: normalizeRange(
          raw["informational-thresholds"]["traditional-ira-deductibility"][
            "spouse-covered-phaseout-married-filing-jointly"
          ]
        ),
        notes:
          raw["informational-thresholds"]["traditional-ira-deductibility"]
            .notes ?? [],
        source: normalizeSource(
          raw["informational-thresholds"]["traditional-ira-deductibility"].source
        ),
      },
      traditionalIraContributionLimits: {
        annualLimit:
          raw["informational-thresholds"]["traditional-ira-contribution-limits"][
            "annual-limit"
          ],
        catchUp50Plus:
          raw["informational-thresholds"]["traditional-ira-contribution-limits"][
            "catch-up-50-plus"
          ],
        source: normalizeSource(
          raw["informational-thresholds"]["traditional-ira-contribution-limits"]
            .source
        ),
      },
      workplacePlanContributionLimits: {
        employeeElectiveDeferralLimit:
          raw["informational-thresholds"]["workplace-plan-contribution-limits"][
            "employee-elective-deferral-limit"
          ],
        catchUp50Plus:
          raw["informational-thresholds"]["workplace-plan-contribution-limits"][
            "catch-up-50-plus"
          ],
        catchUpAge60To63:
          raw["informational-thresholds"]["workplace-plan-contribution-limits"][
            "catch-up-age-60-to-63"
          ],
        plans:
          raw["informational-thresholds"]["workplace-plan-contribution-limits"]
            .plans,
        source: normalizeSource(
          raw["informational-thresholds"]["workplace-plan-contribution-limits"]
            .source
        ),
      },
      hsaContributionLimits: {
        selfOnly:
          raw["informational-thresholds"]["hsa-contribution-limits"]["self-only"],
        family: raw["informational-thresholds"]["hsa-contribution-limits"].family,
        catchUp55Plus:
          raw["informational-thresholds"]["hsa-contribution-limits"][
            "catch-up-55-plus"
          ],
        hdhpMinDeductible: {
          selfOnly:
            raw["informational-thresholds"]["hsa-contribution-limits"][
              "hdhp-min-deductible"
            ]["self-only"],
          family:
            raw["informational-thresholds"]["hsa-contribution-limits"][
              "hdhp-min-deductible"
            ].family,
        },
        hdhpMaxOutOfPocket: {
          selfOnly:
            raw["informational-thresholds"]["hsa-contribution-limits"][
              "hdhp-max-out-of-pocket"
            ]["self-only"],
          family:
            raw["informational-thresholds"]["hsa-contribution-limits"][
              "hdhp-max-out-of-pocket"
            ].family,
        },
        source: normalizeSource(
          raw["informational-thresholds"]["hsa-contribution-limits"].source
        ),
      },
      rothIraPhaseouts: {
        byFilingStatus: {
          single: normalizeRange(
            raw["informational-thresholds"]["roth-ira-phaseouts"].single
          ),
          "married-filing-jointly": normalizeRange(
            raw["informational-thresholds"]["roth-ira-phaseouts"][
              "married-filing-jointly"
            ]
          ),
          "married-filing-separately": normalizeRange(
            raw["informational-thresholds"]["roth-ira-phaseouts"][
              "married-filing-separately"
            ]
          ),
        },
        source: normalizeSource(
          raw["informational-thresholds"]["roth-ira-phaseouts"].source
        ),
      },
      netInvestmentIncomeTax: {
        rate: raw["informational-thresholds"]["net-investment-income-tax"].rate,
        thresholdsByFilingStatus: {
          single:
            raw["informational-thresholds"]["net-investment-income-tax"]
              .thresholds.single,
          "married-filing-jointly":
            raw["informational-thresholds"]["net-investment-income-tax"]
              .thresholds["married-filing-jointly"],
          "married-filing-separately":
            raw["informational-thresholds"]["net-investment-income-tax"]
              .thresholds["married-filing-separately"],
        },
        notes:
          raw["informational-thresholds"]["net-investment-income-tax"].notes ?? [],
        source: normalizeSource(
          raw["informational-thresholds"]["net-investment-income-tax"].source
        ),
      },
      irmaa: {
        partBAndPartDThresholds: {
          single: raw["informational-thresholds"].irmaa[
            "part-b-and-part-d-thresholds"
          ].single,
          "married-filing-jointly":
            raw["informational-thresholds"].irmaa[
              "part-b-and-part-d-thresholds"
            ]["married-filing-jointly"],
          "married-filing-separately":
            raw["informational-thresholds"].irmaa[
              "part-b-and-part-d-thresholds"
            ]["married-filing-separately"],
        },
        notes: raw["informational-thresholds"].irmaa.notes ?? [],
        source: normalizeSource(raw["informational-thresholds"].irmaa.source),
      },
      rmdReference: {
        startingAge: {
          born1951Through1959:
            raw["informational-thresholds"]["rmd-reference"]["starting-age"][
              "born-1951-through-1959"
            ],
          born1960OrLater:
            raw["informational-thresholds"]["rmd-reference"]["starting-age"][
              "born-1960-or-later"
            ],
        },
        firstDistributionDeadline:
          raw["informational-thresholds"]["rmd-reference"][
            "first-distribution-deadline"
          ],
        irsLifeExpectancyTableReference:
          raw["informational-thresholds"]["rmd-reference"][
            "irs-life-expectancy-table-reference"
          ],
        notes: raw["informational-thresholds"]["rmd-reference"].notes ?? [],
        source: normalizeSource(
          raw["informational-thresholds"]["rmd-reference"].source
        ),
      },
      estateAndGift: {
        estateBasicExclusionAmount:
          raw["informational-thresholds"]["estate-and-gift"][
            "estate-basic-exclusion-amount"
          ],
        annualGiftExclusion:
          raw["informational-thresholds"]["estate-and-gift"][
            "annual-gift-exclusion"
          ],
        source: normalizeSource(
          raw["informational-thresholds"]["estate-and-gift"].source
        ),
      },
    },
  };
}

export function toTaxEstimatorReferenceData(
  data: TaxReferenceData
): TaxEstimatorReferenceData {
  return {
    supportedFilingStatuses: data.supportedFilingStatuses.map((status) => status.id),
    standardDeductionByFilingStatus: data.standardDeduction.valuesByFilingStatus,
    ordinaryIncomeBracketsByFilingStatus:
      data.ordinaryIncomeBrackets.valuesByFilingStatus,
    preferentialIncomeBracketsByFilingStatus:
      data.preferentialIncomeBrackets.valuesByFilingStatus,
    socialSecurityTaxation: data.socialSecurityTaxation,
    childTaxCredit: data.childTaxCredit,
  };
}

export async function loadTaxReferenceData(): Promise<TaxReferenceData> {
  const res = await fetch(`${API_BASE}/tax-reference-data`);
  if (!res.ok) {
    throw new Error(`Failed to load tax reference data: ${res.status}`);
  }
  const raw = (await res.json()) as TaxReferenceDataYaml;
  return normalizeTaxReferenceDataYaml(raw);
}
