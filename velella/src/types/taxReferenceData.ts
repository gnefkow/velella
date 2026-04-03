import type { FilingStatus } from "./scenario";

export interface TaxReferenceSource {
  label: string;
  url: string;
  asOfDate: string;
}

export interface TaxBracket {
  rate: number;
  lowerBound: number;
  upperBound: number | null;
}

export interface FilingStatusAmountRange {
  start: number;
  end: number;
}

export interface SocialSecurityThreshold {
  baseAmount: number;
  adjustedBaseAmount: number;
  note?: string;
}

export interface TaxReferenceData {
  metadata: {
    datasetLabel: string;
    taxYear: number;
    generatedOn: string;
    fallbackPolicy: string;
    notes: string[];
  };
  supportedFilingStatuses: Array<{
    id: FilingStatus;
    label: string;
  }>;
  standardDeduction: {
    valuesByFilingStatus: Record<FilingStatus, number>;
    source: TaxReferenceSource;
  };
  ordinaryIncomeBrackets: {
    valuesByFilingStatus: Record<FilingStatus, TaxBracket[]>;
    source: TaxReferenceSource;
  };
  preferentialIncomeBrackets: {
    valuesByFilingStatus: Record<FilingStatus, TaxBracket[]>;
    source: TaxReferenceSource;
  };
  socialSecurityTaxation: {
    taxableBenefitRates: number[];
    thresholdsByFilingStatus: Record<FilingStatus, SocialSecurityThreshold>;
    source: TaxReferenceSource;
  };
  childTaxCredit: {
    amountPerQualifyingChild: number;
    refundablePortion: number;
    phaseoutStartsByFilingStatus: Record<FilingStatus, number>;
    phaseoutReductionPer1000: number;
    qualifyingChildMustBeUnderAge: number;
    notes: string[];
    source: TaxReferenceSource;
  };
  informationalThresholds: {
    traditionalIraDeductibility: {
      coveredByWorkplacePlanPhaseouts: Record<
        FilingStatus,
        FilingStatusAmountRange
      >;
      spouseCoveredPhaseoutMarriedFilingJointly: FilingStatusAmountRange;
      notes: string[];
      source: TaxReferenceSource;
    };
    traditionalIraContributionLimits: {
      annualLimit: number;
      catchUp50Plus: number;
      source: TaxReferenceSource;
    };
    workplacePlanContributionLimits: {
      employeeElectiveDeferralLimit: number;
      catchUp50Plus: number;
      catchUpAge60To63: number;
      plans: string[];
      source: TaxReferenceSource;
    };
    hsaContributionLimits: {
      selfOnly: number;
      family: number;
      catchUp55Plus: number;
      hdhpMinDeductible: {
        selfOnly: number;
        family: number;
      };
      hdhpMaxOutOfPocket: {
        selfOnly: number;
        family: number;
      };
      source: TaxReferenceSource;
    };
    rothIraPhaseouts: {
      byFilingStatus: Record<FilingStatus, FilingStatusAmountRange>;
      source: TaxReferenceSource;
    };
    netInvestmentIncomeTax: {
      rate: number;
      thresholdsByFilingStatus: Record<FilingStatus, number>;
      notes: string[];
      source: TaxReferenceSource;
    };
    irmaa: {
      partBAndPartDThresholds: Record<FilingStatus, number[]>;
      notes: string[];
      source: TaxReferenceSource;
    };
    rmdReference: {
      startingAge: {
        born1951Through1959: number;
        born1960OrLater: number;
      };
      firstDistributionDeadline: string;
      irsLifeExpectancyTableReference: {
        label: string;
        url: string;
      };
      notes: string[];
      source: TaxReferenceSource;
    };
    estateAndGift: {
      estateBasicExclusionAmount: number;
      annualGiftExclusion: number;
      source: TaxReferenceSource;
    };
  };
}

export interface TaxEstimatorReferenceData {
  supportedFilingStatuses: FilingStatus[];
  standardDeductionByFilingStatus: Record<FilingStatus, number>;
  ordinaryIncomeBracketsByFilingStatus: Record<FilingStatus, TaxBracket[]>;
  preferentialIncomeBracketsByFilingStatus: Record<FilingStatus, TaxBracket[]>;
  socialSecurityTaxation: TaxReferenceData["socialSecurityTaxation"];
  childTaxCredit: TaxReferenceData["childTaxCredit"];
}

export interface TaxReferenceDisplaySection {
  title: string;
  description?: string;
  rows: Array<{
    label: string;
    value: string;
  }>;
  notes?: string[];
  source?: TaxReferenceSource;
}
