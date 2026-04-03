import { Button, Text } from "../../../../../counterfoil-kit/src/index.ts";
import {
  ChevronDown,
  ChevronRight,
  Link2,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type { EraFacts, YearFactsFieldKey } from "../../types/era";
import type { FilingStatus, HouseholdMember } from "../../types/scenario";
import {
  FILING_STATUS_SELECT_OPTIONS,
  labelForFilingStatus,
  TAX_FILING_STATUS_SELECT_CLASSNAME,
} from "../../lib/filingStatus";
import {
  availableToInvestFromYearInput,
  effectiveInvestFromYearInput,
  investmentBreakdownTotal,
  investmentDifferenceFromYearInput,
  yearInputFromEraFacts,
} from "../../lib/invest";
import type { EraOverrideDraft } from "../../lib/eraOverrideDraft";
import type { EraOverrideFieldDescriptor } from "../../lib/eraOverrideFields";
import { cashflowSummaryFromYearInput } from "../../lib/cashflowSummary";
import {
  calculateYearFacts,
  ESTIMATED_FEDERAL_TAX_EXPENSE,
  expensesWithSyncedTaxTotal,
} from "../../lib/yearFacts";
import FilingStatusApplyModal from "./FilingStatusApplyModal";
import EraInvestmentBreakdownModal from "./EraInvestmentBreakdownModal";
import EraOverridesModal, {
  type EraOverridesModalSaveResult,
} from "./EraOverridesModal";
import EraCashflowSummarySection from "./EraCashflowSummarySection";
import EraPaneAmountInput from "./EraPaneAmountInput";
import EraPaneHelpButton from "./EraPaneHelpButton";
import EraPaneOverrideSummary from "./EraPaneOverrideSummary";
import TertiaryNativeSelect from "../ui/TertiaryNativeSelect";
import EraSocialSecurityEligibilityNotices from "./EraSocialSecurityEligibilityNotices";
import EraSocialSecurityFieldRows from "./EraSocialSecurityFieldRows";
import EraPreTaxDistributionEligibilityNotices from "./EraPreTaxDistributionEligibilityNotices";
import EraPreTaxDistributionFieldRow from "./EraPreTaxDistributionFieldRow";
import EraRothDistributionsFieldRow from "./EraRothDistributionsFieldRow";
import NoOverridesYetModal from "./NoOverridesYetModal";
import UseEstimatedFederalTaxControl from "./UseEstimatedFederalTaxControl";
import UseFederalTaxEstimateModal from "./UseFederalTaxEstimateModal";
import {
  eraIncludesPreTaxDistributionEligibleYearForMember,
} from "../../lib/preTaxDistributionEligibility";
import { ROTH_CONVERSIONS_DESCRIPTION } from "../../lib/rothConversions";
import {
  HSA_CONTRIBUTION_DESCRIPTION,
  PRE_TAX_401K_CONTRIBUTION_DESCRIPTION,
  PRE_TAX_IRA_CONTRIBUTION_DESCRIPTION,
} from "../../lib/investmentContributions";

interface EraFactsFormProps {
  eraFacts: EraFacts;
  incomeEarners: HouseholdMember[];
  onUpdateEraFacts: (updater: (prev: EraFacts) => EraFacts) => void;
  eraNickname: string;
  eraStartYear: number | null;
  eraEndYear: number | null;
  eraYears: number[];
  overrideFieldDescriptors: EraOverrideFieldDescriptor[];
  draftOverridesByField: EraOverrideDraft;
  overrideSummariesByField: Partial<Record<YearFactsFieldKey, string>>;
  onSaveFieldOverrides: (
    fieldKey: YearFactsFieldKey,
    nextValuesByYear: Record<number, number> | null
  ) => void;
  /** Batch-sets filing status on every year and era; optional for isolated previews. */
  onBulkApplyFilingStatus?: (status: FilingStatus) => void;
}

interface EraPaneSectionHeaderProps {
  title: string;
  total: number;
  description?: string;
}

interface EraPaneFactRowProps {
  label: string;
  description?: string;
  children: ReactNode;
}

interface EraPaneReadonlyRowProps {
  label: string;
  value: number;
  description?: string;
  isNegative?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function EraPaneSectionHeader({
  title,
  total,
  description = "explanation needed",
}: EraPaneSectionHeaderProps) {
  return (
    <div className="flex w-full min-w-0 max-w-full items-center justify-between gap-4">
      <Text
        size="h5"
        hierarchy="primary"
        weight="heavy"
        className="min-w-0 flex-1 text-left"
      >
        {title}
      </Text>
      <div className="flex shrink-0 items-center justify-end gap-2 text-right">
        <Text size="h5" hierarchy="primary" weight="heavy" as="span">
          {formatCurrency(total)}
        </Text>
        <EraPaneHelpButton
          label={`Show explanation for ${title}`}
          description={description}
        />
      </div>
    </div>
  );
}

function EraPaneFactRow({
  label,
  description = "explanation needed",
  children,
}: EraPaneFactRowProps) {
  return (
    <div className="flex w-full min-w-0 max-w-full items-center justify-between gap-4 bg-bg-primary py-[0.5em]">
      <div className="flex min-w-0 flex-1 items-center gap-1 text-left">
        <p
          className="min-w-0 text-body-1 text-text-primary"
          style={{ margin: 0 }}
        >
          {label}
        </p>
        <EraPaneHelpButton
          label={`Show explanation for ${label}`}
          description={description}
        />
      </div>
      <div className="flex shrink-0 justify-end">
        {typeof children === "number" ? (
          <p
            className="text-right text-body-1 text-text-primary"
            style={{ margin: 0 }}
          >
            {formatCurrency(children)}
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function EraPaneReadonlyRow({
  label,
  value,
  description = "explanation needed",
  isNegative = false,
}: EraPaneReadonlyRowProps) {
  return (
    <EraPaneFactRow
      label={label}
      description={description}
    >
      <p
        className={[
          "text-right text-body-1",
          isNegative ? "text-[var(--text-error)]" : "text-text-primary",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ margin: 0 }}
      >
        {formatCurrency(value)}
      </p>
    </EraPaneFactRow>
  );
}

export default function EraFactsForm({
  eraFacts,
  incomeEarners,
  onUpdateEraFacts,
  eraNickname,
  eraStartYear,
  eraEndYear,
  eraYears,
  overrideFieldDescriptors,
  draftOverridesByField,
  overrideSummariesByField,
  onSaveFieldOverrides,
  onBulkApplyFilingStatus,
}: EraFactsFormProps) {
  const [isMoreIncomeOpen, setIsMoreIncomeOpen] = useState(false);
  const [showRemoveBreakdownModal, setShowRemoveBreakdownModal] = useState(false);
  const [showFederalTaxEstimateModal, setShowFederalTaxEstimateModal] =
    useState(false);
  const [showNoOverridesYetModal, setShowNoOverridesYetModal] = useState(false);
  const [filingApplyTarget, setFilingApplyTarget] = useState<FilingStatus | null>(
    null
  );
  const [selectedOverrideFieldKey, setSelectedOverrideFieldKey] =
    useState<YearFactsFieldKey | null>(null);

  const overrideDescriptorByFieldKey = useMemo(
    () =>
      new Map(
        overrideFieldDescriptors.map((descriptor) => [
          descriptor.fieldKey,
          descriptor,
        ])
      ),
    [overrideFieldDescriptors]
  );

  const selectedOverrideField = selectedOverrideFieldKey
    ? overrideDescriptorByFieldKey.get(selectedOverrideFieldKey) ?? null
    : null;

  const openOverridesForField = (fieldKey: YearFactsFieldKey) => {
    setSelectedOverrideFieldKey(fieldKey);
  };

  const closeOverridesModal = () => {
    setSelectedOverrideFieldKey(null);
  };

  const handleOverridesSave = (result: EraOverridesModalSaveResult) => {
    if (!selectedOverrideFieldKey || !selectedOverrideField) {
      return;
    }

    if (result.enabled) {
      onSaveFieldOverrides(selectedOverrideFieldKey, result.valuesByYear);
    } else {
      onUpdateEraFacts((prev) =>
        selectedOverrideField.writeEraValue(prev, result.linkedValue)
      );
      onSaveFieldOverrides(selectedOverrideFieldKey, null);
    }
    closeOverridesModal();
  };
  const eraAsYearInput = yearInputFromEraFacts(eraFacts);
  const { totalIncome } = useMemo(
    () => calculateYearFacts(eraAsYearInput),
    [eraAsYearInput]
  );
  const availableToInvest = useMemo(
    () => availableToInvestFromYearInput(eraAsYearInput),
    [eraAsYearInput]
  );
  const cashflowSummary = useMemo(
    () => cashflowSummaryFromYearInput(eraAsYearInput),
    [eraAsYearInput]
  );
  const effectiveInvest = useMemo(
    () => effectiveInvestFromYearInput(eraAsYearInput),
    [eraAsYearInput]
  );
  const investmentDifference =
    investmentDifferenceFromYearInput(eraAsYearInput);
  const showPreTaxDistributionsOutsideAccordion =
    eraStartYear != null &&
    eraEndYear != null &&
    incomeEarners.some((member) =>
      eraIncludesPreTaxDistributionEligibleYearForMember(
        member.birthday,
        eraStartYear,
        eraEndYear
      )
    );
  const moreIncomeTotal =
    (showPreTaxDistributionsOutsideAccordion
      ? 0
      : eraFacts.otherIncome.preTaxDistributions) +
    eraFacts.otherIncome.rothDistributions +
    eraFacts.otherIncome.qualifiedDividends +
    eraFacts.otherIncome.ordinaryDividends +
    eraFacts.otherIncome.interestIncome +
    eraFacts.otherIncome.shortTermCapitalGains +
    eraFacts.otherIncome.longTermCapitalGains;
  const expenseTotal =
    eraFacts.expenses.householdExpenses +
    eraFacts.expenses.taxes +
    eraFacts.expenses.otherExpenses;
  const investmentTotal = eraFacts.modifyInvestmentDetails
    ? investmentBreakdownTotal(eraFacts)
    : effectiveInvest;
  const showMoreIncomeSummary = !isMoreIncomeOpen && moreIncomeTotal > 0;

  const renderOverrideAwareValue = (
    fieldKey: YearFactsFieldKey,
    label: string,
    value: number,
    onCommit: (value: number) => void
  ) => {
    const overrideSummary = overrideSummariesByField[fieldKey];
    if (overrideSummary) {
      return (
        <EraPaneOverrideSummary
          fieldLabel={label}
          summary={overrideSummary}
          onEdit={() => openOverridesForField(fieldKey)}
        />
      );
    }

    return (
      <EraPaneAmountInput
        label={label}
        value={value}
        onLinkClick={() => openOverridesForField(fieldKey)}
        onCommit={onCommit}
      />
    );
  };

  const usingFederalTaxEstimate =
    eraFacts.expenses.federalTaxSource === "use-estimate";

  const applyFederalTaxEstimate = () => {
    onUpdateEraFacts((prev) => ({
      ...prev,
      expenses: expensesWithSyncedTaxTotal({
        ...prev.expenses,
        federalTaxSource: "use-estimate",
        selectedFederalTaxAmount: 0,
      }),
    }));
  };

  const applyManualFederalTax = () => {
    onUpdateEraFacts((prev) => ({
      ...prev,
      expenses: expensesWithSyncedTaxTotal({
        ...prev.expenses,
        federalTaxSource: "manual",
        selectedFederalTaxAmount: ESTIMATED_FEDERAL_TAX_EXPENSE,
      }),
    }));
  };

  const handleFederalTaxEstimateToggle = (nextChecked: boolean) => {
    if (nextChecked) {
      if (eraFacts.expenses.selectedFederalTaxAmount !== 0) {
        setShowFederalTaxEstimateModal(true);
        return;
      }
      applyFederalTaxEstimate();
      return;
    }

    applyManualFederalTax();
  };

  return (
    <>
      <div className="flex min-w-0 w-full flex-col">
        <section className="mx-[4px] flex min-w-0 self-stretch flex-col gap-0 border-b border-border-secondary bg-bg-primary py-[24px]">
          <EraPaneSectionHeader
            title="Income"
            total={totalIncome}
            description="The sum of wages, Social Security benefits, and all other income sources in this era."
          />
          {incomeEarners.map((member) => {
            const label = `${member.nickname || "Member"} Wages`;
            const fieldKey = `wage-income-${member.id}` as YearFactsFieldKey;
            return (
              <EraPaneFactRow
                key={member.id}
                label={label}
                description="Income from working."
              >
                {renderOverrideAwareValue(
                  fieldKey,
                  label,
                  eraFacts.wageIncome[member.id] ?? 0,
                  (value) =>
                    onUpdateEraFacts((prev) => ({
                      ...prev,
                      wageIncome: { ...prev.wageIncome, [member.id]: value },
                    }))
                )}
              </EraPaneFactRow>
            );
          })}

          <EraSocialSecurityEligibilityNotices
            incomeEarners={incomeEarners}
            eraStartYear={eraStartYear}
            eraEndYear={eraEndYear}
          />

          <EraSocialSecurityFieldRows
            incomeEarners={incomeEarners}
            eraFacts={eraFacts}
            eraStartYear={eraStartYear}
            eraEndYear={eraEndYear}
            onUpdateEraFacts={onUpdateEraFacts}
            renderOverrideAwareValue={renderOverrideAwareValue}
          />

          <EraPreTaxDistributionEligibilityNotices
            incomeEarners={incomeEarners}
            eraStartYear={eraStartYear}
            eraEndYear={eraEndYear}
          />

          {showPreTaxDistributionsOutsideAccordion ? (
            <EraPreTaxDistributionFieldRow
              eraFacts={eraFacts}
              onUpdateEraFacts={onUpdateEraFacts}
              renderOverrideAwareValue={renderOverrideAwareValue}
            />
          ) : null}

          <div className="flex w-full min-w-0 items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMoreIncomeOpen((open) => !open)}
                className="inline-flex min-w-0 flex-1 items-center gap-1 rounded-md py-1 text-left text-body-1 text-text-primary transition-colors hover:bg-bg-primary-hover"
              >
                <span>
                  {showMoreIncomeSummary
                    ? "More income sources:"
                    : "More income sources."}
                </span>
                {showMoreIncomeSummary ? (
                  <ChevronRight size={18} />
                ) : isMoreIncomeOpen ? (
                  <ChevronDown size={18} />
                ) : null}
              </button>
              <EraPaneHelpButton
                label="Show explanation for more income sources"
                description={
                  showPreTaxDistributionsOutsideAccordion
                    ? "The combined total of Roth distributions, qualified dividends, ordinary dividends, interest income, and capital gains."
                    : "The combined total of pre-tax distributions, Roth distributions, qualified dividends, ordinary dividends, interest income, and capital gains."
                }
              />
            </div>

            {showMoreIncomeSummary ? (
              <p
                className="shrink-0 text-right text-body-1 text-text-primary"
                style={{ margin: 0 }}
              >
                {formatCurrency(moreIncomeTotal)}
              </p>
            ) : !isMoreIncomeOpen ? (
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => setIsMoreIncomeOpen(true)}
              >
                + Add
              </Button>
            ) : null}
          </div>

          {isMoreIncomeOpen ? (
            <div className="flex w-full min-w-0 flex-col gap-0 rounded-md bg-bg-secondary px-2 py-3">
              <Text
                as="h4"
                size="h5"
                hierarchy="primary"
                weight="heavy"
                className="w-full pb-1 pt-0"
              >
                Portfolio Withdrawals:
              </Text>
              {!showPreTaxDistributionsOutsideAccordion ? (
                <EraPreTaxDistributionFieldRow
                  eraFacts={eraFacts}
                  onUpdateEraFacts={onUpdateEraFacts}
                  renderOverrideAwareValue={renderOverrideAwareValue}
                />
              ) : null}
              <EraRothDistributionsFieldRow
                eraFacts={eraFacts}
                onUpdateEraFacts={onUpdateEraFacts}
                renderOverrideAwareValue={renderOverrideAwareValue}
              />
              <EraPaneFactRow
                label="Realized Taxable Gains (Short Term)"
                description="Capital gains income for assets sold that were held for less than one year."
              >
                {renderOverrideAwareValue(
                  "short-term-capital-gains",
                  "Realized Taxable Gains (Short Term)",
                  eraFacts.otherIncome.shortTermCapitalGains,
                  (value) =>
                    onUpdateEraFacts((prev) => ({
                      ...prev,
                      otherIncome: {
                        ...prev.otherIncome,
                        shortTermCapitalGains: value,
                      },
                    }))
                )}
              </EraPaneFactRow>
              <EraPaneFactRow
                label="Realized Taxable Gains (Long Term)"
                description="Capital gains income for assets sold that were held for more than one year."
              >
                {renderOverrideAwareValue(
                  "long-term-capital-gains",
                  "Realized Taxable Gains (Long Term)",
                  eraFacts.otherIncome.longTermCapitalGains,
                  (value) =>
                    onUpdateEraFacts((prev) => ({
                      ...prev,
                      otherIncome: {
                        ...prev.otherIncome,
                        longTermCapitalGains: value,
                      },
                    }))
                )}
              </EraPaneFactRow>
              <Text
                as="h4"
                size="h5"
                hierarchy="primary"
                weight="heavy"
                className="w-full pb-1 pt-3"
              >
                Other Portfolio Income
              </Text>
              <EraPaneFactRow
                label="Qualified Dividends"
                description="Dividend income eligible for preferential tax treatment."
              >
                {renderOverrideAwareValue(
                  "qualified-dividends",
                  "Qualified Dividends",
                  eraFacts.otherIncome.qualifiedDividends,
                  (value) =>
                    onUpdateEraFacts((prev) => ({
                      ...prev,
                      otherIncome: {
                        ...prev.otherIncome,
                        qualifiedDividends: value,
                      },
                    }))
                )}
              </EraPaneFactRow>
              <EraPaneFactRow
                label="Ordinary Dividends"
                description="Dividend income taxed at ordinary income rates."
              >
                {renderOverrideAwareValue(
                  "ordinary-dividends",
                  "Ordinary Dividends",
                  eraFacts.otherIncome.ordinaryDividends,
                  (value) =>
                    onUpdateEraFacts((prev) => ({
                      ...prev,
                      otherIncome: {
                        ...prev.otherIncome,
                        ordinaryDividends: value,
                      },
                    }))
                )}
              </EraPaneFactRow>
              <EraPaneFactRow
                label="Interest Income"
                description="Income from interest payments."
              >
                {renderOverrideAwareValue(
                  "interest-income",
                  "Interest Income",
                  eraFacts.otherIncome.interestIncome,
                  (value) =>
                    onUpdateEraFacts((prev) => ({
                      ...prev,
                      otherIncome: {
                        ...prev.otherIncome,
                        interestIncome: value,
                      },
                    }))
                )}
              </EraPaneFactRow>
            </div>
          ) : null}
        </section>

        <section className="mx-[4px] flex min-w-0 self-stretch flex-col gap-0 border-b border-border-secondary bg-bg-primary py-[24px]">
          <EraPaneSectionHeader
            title="Expenses"
            total={expenseTotal}
            description="The total expenses for this era."
          />
          <EraPaneFactRow
            label="Household Expenses"
            description="Normal expenses for the household."
          >
            {renderOverrideAwareValue(
              "household-expenses",
              "Household Expenses",
              eraFacts.expenses.householdExpenses,
              (value) =>
                onUpdateEraFacts((prev) => ({
                  ...prev,
                  expenses: {
                    ...prev.expenses,
                    householdExpenses: value,
                  },
                }))
            )}
          </EraPaneFactRow>
          <EraPaneFactRow
            label="Tax filing status"
            description="Federal income tax filing status used for tax estimates."
          >
            {overrideSummariesByField["filing-status"] ? (
              <EraPaneOverrideSummary
                fieldLabel="Tax filing status"
                summary={overrideSummariesByField["filing-status"]!}
                onEdit={() => openOverridesForField("filing-status")}
              />
            ) : (
              <div className="flex shrink-0 justify-end">
                <TertiaryNativeSelect
                  ariaLabel="Tax filing status for this era"
                  value={eraFacts.filingStatus}
                  placeholder="Status"
                  options={FILING_STATUS_SELECT_OPTIONS}
                  className={TAX_FILING_STATUS_SELECT_CLASSNAME}
                  onValueChange={(next) => {
                    if (next === eraFacts.filingStatus) return;
                    setFilingApplyTarget(next as FilingStatus);
                  }}
                />
              </div>
            )}
          </EraPaneFactRow>
          <div className="flex w-full min-w-0 max-w-full flex-col gap-2 bg-bg-primary py-[0.5em]">
            <div className="flex w-full min-w-0 max-w-full items-center justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-1 text-left">
                <p
                  className="min-w-0 whitespace-nowrap text-body-1 text-text-primary"
                  style={{ margin: 0 }}
                >
                  Taxes: Federal
                </p>
                <EraPaneHelpButton
                  label="Show explanation for Taxes: Federal"
                  description="Choose whether to use Velella's estimated federal tax expense for this era."
                />
              </div>
              <div className="flex shrink-0 justify-end">
                {usingFederalTaxEstimate ? (
                  <p
                    className="text-right text-body-1 text-text-primary"
                    style={{ margin: 0 }}
                  >
                    {formatCurrency(ESTIMATED_FEDERAL_TAX_EXPENSE)}
                  </p>
                ) : (
                  <EraPaneAmountInput
                    label="Taxes: Federal"
                    value={eraFacts.expenses.selectedFederalTaxAmount}
                    onCommit={(value) =>
                      onUpdateEraFacts((prev) => ({
                        ...prev,
                        expenses: expensesWithSyncedTaxTotal({
                          ...prev.expenses,
                          federalTaxSource: "manual",
                          selectedFederalTaxAmount: value,
                        }),
                      }))
                    }
                  />
                )}
              </div>
            </div>
            <div className="flex w-full justify-start gap-2">
              <UseEstimatedFederalTaxControl
                checked={usingFederalTaxEstimate}
                onChange={handleFederalTaxEstimateToggle}
              />
              <button
                type="button"
                aria-label="Year overrides for Taxes: Federal"
                onClick={(event) => {
                  event.preventDefault();
                  setShowNoOverridesYetModal(true);
                }}
                className={[
                  "inline-flex size-5 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 shadow-none appearance-none",
                  "text-text-secondary transition-colors hover:bg-bg-primary-hover hover:text-text-primary",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-input focus-visible:ring-offset-2",
                ].join(" ")}
              >
                <Link2 size={16} aria-hidden />
              </button>
            </div>
          </div>
          <EraPaneFactRow
            label="Taxes: State & Local"
            description="Estimated state and local tax liability for this era."
          >
            {renderOverrideAwareValue(
              "state-local-tax-liability",
              "Taxes: State & Local",
              eraFacts.expenses.stateLocalTaxLiability,
              (value) =>
                onUpdateEraFacts((prev) => ({
                  ...prev,
                  expenses: expensesWithSyncedTaxTotal({
                    ...prev.expenses,
                    stateLocalTaxLiability: value,
                  }),
                }))
            )}
          </EraPaneFactRow>
          <EraPaneReadonlyRow
            label="Total Tax"
            value={eraFacts.expenses.taxes}
            description="Federal plus state and local tax estimates."
          />
          <EraPaneFactRow
            label="Other Major Expenses"
            description="Major one-off expenses."
          >
            {renderOverrideAwareValue(
              "other-expenses",
              "Other Major Expenses",
              eraFacts.expenses.otherExpenses,
              (value) =>
                onUpdateEraFacts((prev) => ({
                  ...prev,
                  expenses: {
                    ...prev.expenses,
                    otherExpenses: value,
                  },
                }))
            )}
          </EraPaneFactRow>
        </section>

        <EraCashflowSummarySection summary={cashflowSummary} />

        <section className="mx-[4px] flex min-w-0 self-stretch flex-col gap-0 border-b border-border-secondary bg-bg-primary py-[24px]">
          <EraPaneSectionHeader
            title="Invest"
            total={investmentTotal}
            description="The amount invested in this era."
          />

          {eraFacts.modifyInvestmentDetails ? (
            <>
              <label className="inline-flex items-center gap-2 text-body-1 text-text-primary">
                <input
                  type="checkbox"
                  checked
                  onChange={() => setShowRemoveBreakdownModal(true)}
                  className="size-4 rounded border-border-secondary accent-accent-primary"
                />
                <span>Breakdown Investment</span>
              </label>
              <EraPaneReadonlyRow
                label="Available to Invest"
                value={availableToInvest}
                description="Income minus expenses."
              />
              <EraPaneFactRow
                label="Pre-Tax 401(k) / 403(b) Contributions"
                description={PRE_TAX_401K_CONTRIBUTION_DESCRIPTION}
              >
                {renderOverrideAwareValue(
                  "pre-tax-401k-contribution",
                  "Pre-Tax 401(k) / 403(b) Contributions",
                  eraFacts.investmentBreakdown.preTax401kContribution,
                  (value) =>
                    onUpdateEraFacts((prev) => ({
                      ...prev,
                      investmentBreakdown: {
                        ...prev.investmentBreakdown,
                        preTax401kContribution: value,
                      },
                    }))
                )}
              </EraPaneFactRow>
              <EraPaneFactRow
                label="Traditional IRA Contribution"
                description={PRE_TAX_IRA_CONTRIBUTION_DESCRIPTION}
              >
                {renderOverrideAwareValue(
                  "pre-tax-ira-contribution",
                  "Traditional IRA Contribution",
                  eraFacts.investmentBreakdown.preTaxIraContribution,
                  (value) =>
                    onUpdateEraFacts((prev) => ({
                      ...prev,
                      investmentBreakdown: {
                        ...prev.investmentBreakdown,
                        preTaxIraContribution: value,
                      },
                    }))
                )}
              </EraPaneFactRow>
              <EraPaneFactRow
                label="Health Savings Account (HSA) Contributions"
                description={HSA_CONTRIBUTION_DESCRIPTION}
              >
                {renderOverrideAwareValue(
                  "hsa-contribution",
                  "Health Savings Account (HSA) Contributions",
                  eraFacts.investmentBreakdown.hsaContribution,
                  (value) =>
                    onUpdateEraFacts((prev) => ({
                      ...prev,
                      investmentBreakdown: {
                        ...prev.investmentBreakdown,
                        hsaContribution: value,
                      },
                    }))
                )}
              </EraPaneFactRow>
              <EraPaneFactRow
                label="Roth Retirement"
                description="Post-tax retirement contributions."
              >
                {renderOverrideAwareValue(
                  "roth-retirement",
                  "Roth Retirement",
                  eraFacts.investmentBreakdown.rothRetirement,
                  (value) =>
                    onUpdateEraFacts((prev) => ({
                      ...prev,
                      investmentBreakdown: {
                        ...prev.investmentBreakdown,
                        rothRetirement: value,
                      },
                    }))
                )}
              </EraPaneFactRow>
              <EraPaneFactRow
                label="Taxable Investments"
                description="Investments made in taxable accounts."
              >
                {renderOverrideAwareValue(
                  "taxable-investments",
                  "Taxable Investments",
                  eraFacts.investmentBreakdown.taxableInvestments,
                  (value) =>
                    onUpdateEraFacts((prev) => ({
                      ...prev,
                      investmentBreakdown: {
                        ...prev.investmentBreakdown,
                        taxableInvestments: value,
                      },
                    }))
                )}
              </EraPaneFactRow>
              <EraPaneReadonlyRow
                label="Difference"
                value={investmentDifference}
                description="Available to invest minus the amount allocated across the investment categories."
                isNegative={investmentDifference < 0}
              />
            </>
          ) : (
            <Button
              variant="tertiary"
              size="sm"
              onClick={() =>
                onUpdateEraFacts((prev) => ({
                  ...prev,
                  modifyInvestmentDetails: true,
                }))
              }
            >
              Breakdown Investment
            </Button>
          )}
        </section>

        <section className="mx-[4px] flex min-w-0 self-stretch flex-col gap-0 bg-bg-primary py-[24px]">
          <EraPaneSectionHeader
            title="Misc."
            total={eraFacts.misc.rothConversions}
            description="Tax-relevant amounts that are not part of household income totals in this pane."
          />
          <EraPaneFactRow
            label="Roth Conversions"
            description={ROTH_CONVERSIONS_DESCRIPTION}
          >
            {renderOverrideAwareValue(
              "roth-conversions",
              "Roth Conversions",
              eraFacts.misc.rothConversions,
              (value) =>
                onUpdateEraFacts((prev) => ({
                  ...prev,
                  misc: { ...prev.misc, rothConversions: value },
                }))
            )}
          </EraPaneFactRow>
        </section>
      </div>

      <FilingStatusApplyModal
        isOpen={filingApplyTarget !== null}
        selectionLabel={
          filingApplyTarget ? labelForFilingStatus(filingApplyTarget) : ""
        }
        onApplyToAll={() => {
          if (!filingApplyTarget) return;
          onBulkApplyFilingStatus?.(filingApplyTarget);
          onUpdateEraFacts((prev) => ({
            ...prev,
            filingStatus: filingApplyTarget,
          }));
          setFilingApplyTarget(null);
        }}
        onApplyHereOnly={() => {
          if (!filingApplyTarget) return;
          onUpdateEraFacts((prev) => ({
            ...prev,
            filingStatus: filingApplyTarget,
          }));
          setFilingApplyTarget(null);
        }}
        onCancel={() => setFilingApplyTarget(null)}
      />
      <EraInvestmentBreakdownModal
        isOpen={showRemoveBreakdownModal}
        onCancel={() => setShowRemoveBreakdownModal(false)}
        onConfirm={() => {
          onUpdateEraFacts((prev) => ({
            ...prev,
            modifyInvestmentDetails: false,
            investmentBreakdown: {
              preTax401kContribution: 0,
              preTaxIraContribution: 0,
              hsaContribution: 0,
              rothRetirement: 0,
              taxableInvestments: 0,
            },
          }));
          setShowRemoveBreakdownModal(false);
        }}
      />
      <UseFederalTaxEstimateModal
        isOpen={showFederalTaxEstimateModal}
        currentManualAmountLabel={formatCurrency(
          eraFacts.expenses.selectedFederalTaxAmount
        )}
        onCancel={() => setShowFederalTaxEstimateModal(false)}
        onConfirm={() => {
          applyFederalTaxEstimate();
          setShowFederalTaxEstimateModal(false);
        }}
      />
      <NoOverridesYetModal
        isOpen={showNoOverridesYetModal}
        onClose={() => setShowNoOverridesYetModal(false)}
      />
      {selectedOverrideField !== null && selectedOverrideFieldKey !== null ? (
        <EraOverridesModal
          isOpen
          fieldLabel={selectedOverrideField.fieldLabel}
          yearRowLabel={selectedOverrideField.yearRowLabel}
          eraNickname={eraNickname}
          eraStartYear={eraStartYear}
          eraEndYear={eraEndYear}
          eraYears={eraYears}
          isInitiallyOverridden={
            draftOverridesByField[selectedOverrideFieldKey] !== undefined
          }
          initialYearValues={
            draftOverridesByField[selectedOverrideFieldKey] ?? {}
          }
          initialLinkedValue={selectedOverrideField.readEraValue(eraFacts)}
          valueKind={
            selectedOverrideFieldKey === "filing-status"
              ? "filing-status"
              : "currency"
          }
          onSave={handleOverridesSave}
          onCancel={closeOverridesModal}
        />
      ) : null}
    </>
  );
}
