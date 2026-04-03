import { labelForFilingStatus } from "./filingStatus";
import type {
  FilingStatusAmountRange,
  TaxBracket,
  TaxReferenceData,
  TaxReferenceDisplaySection,
} from "../types/taxReferenceData";
import type { FilingStatus } from "../types/scenario";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(value === 0 ? 0 : value < 0.1 ? 1 : 0)}%`;
}

function formatRange(range: FilingStatusAmountRange): string {
  return `${formatCurrency(range.start)} to ${formatCurrency(range.end)}`;
}

function formatBracketTable(brackets: TaxBracket[]): string {
  return brackets
    .map((bracket) => {
      if (bracket.upperBound === null) {
        return `${formatPercent(bracket.rate)} on ${formatCurrency(bracket.lowerBound)} and up`;
      }
      if (bracket.lowerBound === 0) {
        return `${formatPercent(bracket.rate)} up to ${formatCurrency(bracket.upperBound)}`;
      }
      return `${formatPercent(bracket.rate)} from ${formatCurrency(bracket.lowerBound)} to ${formatCurrency(bracket.upperBound)}`;
    })
    .join("; ");
}

function filingStatusRows<T>(
  valuesByFilingStatus: Record<FilingStatus, T>,
  formatValue: (value: T) => string
): Array<{ label: string; value: string }> {
  return (Object.keys(valuesByFilingStatus) as FilingStatus[]).map((status) => ({
    label: labelForFilingStatus(status),
    value: formatValue(valuesByFilingStatus[status]),
  }));
}

export function buildTaxReferenceDisplaySections(
  data: TaxReferenceData
): TaxReferenceDisplaySection[] {
  return [
    {
      title: "Dataset",
      rows: [
        { label: "Label", value: data.metadata.datasetLabel },
        { label: "Tax year", value: String(data.metadata.taxYear) },
        { label: "Generated on", value: data.metadata.generatedOn },
        { label: "Fallback policy", value: data.metadata.fallbackPolicy },
        {
          label: "Supported filing statuses",
          value: data.supportedFilingStatuses.map((status) => status.label).join(", "),
        },
      ],
      notes: data.metadata.notes,
    },
    {
      title: "Standard Deduction",
      rows: filingStatusRows(
        data.standardDeduction.valuesByFilingStatus,
        formatCurrency
      ),
      source: data.standardDeduction.source,
    },
    {
      title: "Ordinary Income Brackets",
      rows: filingStatusRows(
        data.ordinaryIncomeBrackets.valuesByFilingStatus,
        formatBracketTable
      ),
      source: data.ordinaryIncomeBrackets.source,
    },
    {
      title: "LTCG / Qualified Dividend Brackets",
      rows: filingStatusRows(
        data.preferentialIncomeBrackets.valuesByFilingStatus,
        formatBracketTable
      ),
      source: data.preferentialIncomeBrackets.source,
    },
    {
      title: "Social Security Taxation",
      description:
        "Velella estimates taxable Social Security using provisional income plus the standard 0% / 50% / 85% structure.",
      rows: [
        {
          label: "Taxable benefit rates",
          value: data.socialSecurityTaxation.taxableBenefitRates
            .map((rate) => formatPercent(rate))
            .join(", "),
        },
        ...filingStatusRows(
          data.socialSecurityTaxation.thresholdsByFilingStatus,
          (threshold) =>
            `${formatCurrency(threshold.baseAmount)} base / ${formatCurrency(threshold.adjustedBaseAmount)} adjusted${
              threshold.note ? ` (${threshold.note})` : ""
            }`
        ),
      ],
      source: data.socialSecurityTaxation.source,
    },
    {
      title: "Child Tax Credit",
      rows: [
        {
          label: "Amount per qualifying child",
          value: formatCurrency(data.childTaxCredit.amountPerQualifyingChild),
        },
        {
          label: "Refundable portion",
          value: formatCurrency(data.childTaxCredit.refundablePortion),
        },
        {
          label: "Phaseout reduction",
          value: `${formatCurrency(data.childTaxCredit.phaseoutReductionPer1000)} per ${formatCurrency(1000)} over the threshold`,
        },
        {
          label: "Age rule",
          value: `Qualifying child must be under age ${data.childTaxCredit.qualifyingChildMustBeUnderAge}`,
        },
        ...filingStatusRows(
          data.childTaxCredit.phaseoutStartsByFilingStatus,
          formatCurrency
        ),
      ],
      notes: data.childTaxCredit.notes,
      source: data.childTaxCredit.source,
    },
    {
      title: "Traditional IRA Deductibility",
      rows: [
        ...filingStatusRows(
          data.informationalThresholds.traditionalIraDeductibility
            .coveredByWorkplacePlanPhaseouts,
          formatRange
        ),
        {
          label: "MFJ spouse-covered special phaseout",
          value: formatRange(
            data.informationalThresholds.traditionalIraDeductibility
              .spouseCoveredPhaseoutMarriedFilingJointly
          ),
        },
      ],
      notes: data.informationalThresholds.traditionalIraDeductibility.notes,
      source: data.informationalThresholds.traditionalIraDeductibility.source,
    },
    {
      title: "IRA Contribution Limits",
      rows: [
        {
          label: "Annual limit",
          value: formatCurrency(
            data.informationalThresholds.traditionalIraContributionLimits
              .annualLimit
          ),
        },
        {
          label: "Catch-up 50+",
          value: formatCurrency(
            data.informationalThresholds.traditionalIraContributionLimits
              .catchUp50Plus
          ),
        },
      ],
      source: data.informationalThresholds.traditionalIraContributionLimits.source,
    },
    {
      title: "Workplace Plan Contribution Limits",
      rows: [
        {
          label: "Employee elective deferral",
          value: formatCurrency(
            data.informationalThresholds.workplacePlanContributionLimits
              .employeeElectiveDeferralLimit
          ),
        },
        {
          label: "Catch-up 50+",
          value: formatCurrency(
            data.informationalThresholds.workplacePlanContributionLimits
              .catchUp50Plus
          ),
        },
        {
          label: "Catch-up age 60-63",
          value: formatCurrency(
            data.informationalThresholds.workplacePlanContributionLimits
              .catchUpAge60To63
          ),
        },
        {
          label: "Plans",
          value: data.informationalThresholds.workplacePlanContributionLimits.plans.join(
            ", "
          ),
        },
      ],
      source: data.informationalThresholds.workplacePlanContributionLimits.source,
    },
    {
      title: "HSA Contribution Limits",
      rows: [
        {
          label: "Self-only coverage",
          value: formatCurrency(
            data.informationalThresholds.hsaContributionLimits.selfOnly
          ),
        },
        {
          label: "Family coverage",
          value: formatCurrency(
            data.informationalThresholds.hsaContributionLimits.family
          ),
        },
        {
          label: "Catch-up 55+",
          value: formatCurrency(
            data.informationalThresholds.hsaContributionLimits.catchUp55Plus
          ),
        },
        {
          label: "HDHP minimum deductible",
          value: `Self-only ${formatCurrency(
            data.informationalThresholds.hsaContributionLimits.hdhpMinDeductible.selfOnly
          )}; family ${formatCurrency(
            data.informationalThresholds.hsaContributionLimits.hdhpMinDeductible.family
          )}`,
        },
        {
          label: "HDHP max out-of-pocket",
          value: `Self-only ${formatCurrency(
            data.informationalThresholds.hsaContributionLimits.hdhpMaxOutOfPocket.selfOnly
          )}; family ${formatCurrency(
            data.informationalThresholds.hsaContributionLimits.hdhpMaxOutOfPocket.family
          )}`,
        },
      ],
      source: data.informationalThresholds.hsaContributionLimits.source,
    },
    {
      title: "Roth IRA Phaseouts",
      rows: filingStatusRows(
        data.informationalThresholds.rothIraPhaseouts.byFilingStatus,
        formatRange
      ),
      source: data.informationalThresholds.rothIraPhaseouts.source,
    },
    {
      title: "Net Investment Income Tax",
      rows: [
        {
          label: "Rate",
          value: formatPercent(
            data.informationalThresholds.netInvestmentIncomeTax.rate
          ),
        },
        ...filingStatusRows(
          data.informationalThresholds.netInvestmentIncomeTax
            .thresholdsByFilingStatus,
          formatCurrency
        ),
      ],
      notes: data.informationalThresholds.netInvestmentIncomeTax.notes,
      source: data.informationalThresholds.netInvestmentIncomeTax.source,
    },
    {
      title: "IRMAA Thresholds",
      rows: filingStatusRows(
        data.informationalThresholds.irmaa.partBAndPartDThresholds,
        (thresholds) => thresholds.map(formatCurrency).join(", ")
      ),
      notes: data.informationalThresholds.irmaa.notes,
      source: data.informationalThresholds.irmaa.source,
    },
    {
      title: "RMD Reference",
      rows: [
        {
          label: "Born 1951 through 1959",
          value: `RMD age ${data.informationalThresholds.rmdReference.startingAge.born1951Through1959}`,
        },
        {
          label: "Born 1960 or later",
          value: `RMD age ${data.informationalThresholds.rmdReference.startingAge.born1960OrLater}`,
        },
        {
          label: "First distribution deadline",
          value: data.informationalThresholds.rmdReference.firstDistributionDeadline,
        },
        {
          label: "Life expectancy tables",
          value:
            data.informationalThresholds.rmdReference.irsLifeExpectancyTableReference.label,
        },
      ],
      notes: data.informationalThresholds.rmdReference.notes,
      source: data.informationalThresholds.rmdReference.source,
    },
    {
      title: "Estate and Gift Thresholds",
      rows: [
        {
          label: "Estate basic exclusion amount",
          value: formatCurrency(
            data.informationalThresholds.estateAndGift.estateBasicExclusionAmount
          ),
        },
        {
          label: "Annual gift exclusion",
          value: formatCurrency(
            data.informationalThresholds.estateAndGift.annualGiftExclusion
          ),
        },
      ],
      source: data.informationalThresholds.estateAndGift.source,
    },
  ];
}
