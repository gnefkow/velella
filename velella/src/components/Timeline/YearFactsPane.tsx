import { useCallback, useMemo, useRef, useState } from "react";
import { Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import {
  calculateYearFacts,
  expensesWithSyncedTaxTotal,
  federalTaxAmountForYearInput,
  federalTaxEstimateBreakdown,
} from "../../lib/yearFacts";
import { REALIZED_GAIN_BASIS_UI_NOTE } from "../../engine/tax/gainsBasis";
import {
  availableToInvestFromYearInput,
  effectiveInvestFromYearInput,
  investmentDifferenceFromYearInput,
} from "../../lib/invest";
import { isFieldOverridden } from "../../lib/eraHelpers";
import type { FilingStatus, Scenario, YearInput } from "../../types/scenario";
import type { TaxEstimatorReferenceData } from "../../types/taxReferenceData";
import FilingStatusApplyModal from "../General/FilingStatusApplyModal";
import NoOverridesYetModal from "../General/NoOverridesYetModal";
import UseFederalTaxEstimateModal from "../General/UseFederalTaxEstimateModal";
import { labelForFilingStatus } from "../../lib/filingStatus";
import type { YearFactsFieldKey } from "../../types/era";
import type { FocusAndEditHandle } from "./EditableAmountCell";
import YearFactsFederalTaxField from "./YearFactsFederalTaxField";
import YearFactsField from "./YearFactsField";
import YearFactsFilingStatusField from "./YearFactsFilingStatusField";
import YearFactsPreTaxDistributionField from "./YearFactsPreTaxDistributionField";
import YearFactsRothDistributionsField from "./YearFactsRothDistributionsField";
import YearFactsRothConversionsField from "./YearFactsRothConversionsField";
import YearFactsSocialSecurityFields from "./YearFactsSocialSecurityFields";
import { memberIsSocialSecurityEligibleAge } from "../../lib/socialSecurityEligibility";
import { memberIsPreTaxDistributionEligibleAge } from "../../lib/preTaxDistributionEligibility";
import InvestFactsSection from "./InvestFactsSection";
import TaxEstimateBreakdownModal from "../General/TaxEstimateBreakdownModal";

interface YearFactsPaneProps {
  scenario: Scenario;
  selectedYearInput: YearInput | null;
  taxEstimatorRef?: TaxEstimatorReferenceData | null;
  onUpdateYearInput: (
    year: number,
    updater: (yearInput: YearInput) => YearInput
  ) => void;
  onOverrideField?: (year: number, fieldKey: string) => void;
  onRelinkField?: (year: number, fieldKey: string) => void;
  onOverrideInvestBlock?: (year: number) => void;
  onRelinkInvestBlock?: (year: number) => void;
  onBulkApplyFilingStatus?: (status: FilingStatus) => void;
}

export default function YearFactsPane({
  scenario,
  selectedYearInput,
  taxEstimatorRef = null,
  onUpdateYearInput,
  onOverrideField,
  onRelinkField,
  onOverrideInvestBlock,
  onRelinkInvestBlock,
  onBulkApplyFilingStatus,
}: YearFactsPaneProps) {
  const cellRefs = useRef<Map<string, FocusAndEditHandle>>(new Map());
  const [filingApplyTarget, setFilingApplyTarget] = useState<FilingStatus | null>(
    null
  );
  const [showFederalTaxEstimateModal, setShowFederalTaxEstimateModal] =
    useState(false);
  const [showNoTaxOverridesYetModal, setShowNoTaxOverridesYetModal] =
    useState(false);
  const [showTaxEstimateBreakdownModal, setShowTaxEstimateBreakdownModal] =
    useState(false);

  const incomeEarners = useMemo(
    () => scenario.householdMembers.filter((member) => member.incomeEarner),
    [scenario.householdMembers]
  );

  const isYearInEra = Boolean(selectedYearInput?.eraMetadata?.eraId);
  const investBlockOverridden = Boolean(
    selectedYearInput &&
      isYearInEra &&
      (isFieldOverridden(selectedYearInput, "modify-investment-details") ||
        isFieldOverridden(selectedYearInput, "pre-tax-401k-contribution") ||
        isFieldOverridden(selectedYearInput, "pre-tax-ira-contribution") ||
        isFieldOverridden(selectedYearInput, "hsa-contribution") ||
        isFieldOverridden(selectedYearInput, "roth-retirement") ||
        isFieldOverridden(selectedYearInput, "taxable-investments"))
  );
  const getEraState = useCallback(
    (fieldKey: YearFactsFieldKey) => {
      if (!selectedYearInput || !isYearInEra) return { eraLocked: false, eraOverride: false };
      const overridden = isFieldOverridden(selectedYearInput, fieldKey);
      return { eraLocked: !overridden, eraOverride: overridden };
    },
    [selectedYearInput, isYearInEra]
  );

  const editableFieldKeys = useMemo(() => {
    const wageKeys = incomeEarners.map((member) => `wage-income-${member.id}`);
    const ssKeys =
      selectedYearInput == null
        ? []
        : incomeEarners
            .filter((m) =>
              memberIsSocialSecurityEligibleAge(
                m.birthday,
                selectedYearInput.year
              )
            )
            .map((m) => `social-security-benefits-${m.id}`);
    const prominentPreTaxDistribution =
      selectedYearInput != null &&
      incomeEarners.some((m) =>
        memberIsPreTaxDistributionEligibleAge(m.birthday, selectedYearInput.year)
      );
    const preTaxKey = ["pre-tax-distributions"];
    const rothKey = ["roth-distributions"];
    const advancedIncomeKeys = [
      "qualified-dividends",
      "ordinary-dividends",
      "interest-income",
      "short-term-capital-gains",
      "long-term-capital-gains",
    ];
    return [
      ...wageKeys,
      ...ssKeys,
      ...(prominentPreTaxDistribution ? [...preTaxKey, ...rothKey] : []),
      ...advancedIncomeKeys,
      ...(prominentPreTaxDistribution ? [] : [...preTaxKey, ...rothKey]),
      "household-expenses",
      ...(selectedYearInput?.expenses.federalTaxSource === "manual"
        ? ["selected-federal-tax-amount"]
        : []),
      "state-local-tax-liability",
      "other-expenses",
      "roth-conversions",
    ];
  }, [incomeEarners, selectedYearInput?.expenses.federalTaxSource, selectedYearInput?.year]);

  const registerCell = useCallback(
    (key: string, handle: FocusAndEditHandle | null) => {
      if (handle) {
        cellRefs.current.set(key, handle);
        return;
      }

      cellRefs.current.delete(key);
    },
    []
  );

  const focusNextField = useCallback(
    (fieldKey: string) => {
      const currentIndex = editableFieldKeys.indexOf(fieldKey);
      if (currentIndex < 0 || currentIndex >= editableFieldKeys.length - 1) {
        return false;
      }

      const nextFieldKey = editableFieldKeys[currentIndex + 1];
      cellRefs.current.get(nextFieldKey)?.focusAndEdit();
      return true;
    },
    [editableFieldKeys]
  );

  const updateYearInput = useCallback(
    (updater: (yearInput: YearInput) => YearInput) => {
      if (!selectedYearInput) {
        return;
      }

      onUpdateYearInput(selectedYearInput.year, updater);
    },
    [onUpdateYearInput, selectedYearInput]
  );

  const handleToggleModifyInvest = useCallback(
    (next: boolean) => {
      if (!selectedYearInput) return;
      const y = selectedYearInput.year;
      if (!next) {
        if (isYearInEra) {
          onRelinkInvestBlock?.(y);
        } else {
          updateYearInput((yi) => ({
            ...yi,
            modifyInvestmentDetails: false,
            investmentBreakdown: {
              preTax401kContribution: 0,
              preTaxIraContribution: 0,
              hsaContribution: 0,
              rothRetirement: 0,
              taxableInvestments: 0,
            },
          }));
        }
        return;
      }
      updateYearInput((yi) => ({
        ...yi,
        modifyInvestmentDetails: true,
        investmentBreakdown: yi.investmentBreakdown,
      }));
    },
    [
      isYearInEra,
      onRelinkInvestBlock,
      selectedYearInput,
      updateYearInput,
    ]
  );

  if (!selectedYearInput) {
    return (
      <aside className="flex h-full min-h-0 w-[22em] shrink-0 flex-col border-l border-border-secondary bg-bg-primary overflow-hidden">
        <div className="overflow-y-auto overscroll-contain p-[1em]">
          <Text size="body1" hierarchy="secondary">
            Select a year to edit its facts.
          </Text>
        </div>
      </aside>
    );
  }

  const federalEstimateForYear = federalTaxAmountForYearInput(
    selectedYearInput,
    taxEstimatorRef
  );
  const taxEstimateBreakdown = federalTaxEstimateBreakdown(
    selectedYearInput,
    taxEstimatorRef
  );

  const { ordinaryIncome, totalIncome, totalExpenses, totalTaxExpense } =
    calculateYearFacts(selectedYearInput, taxEstimatorRef);
  const showProminentPreTaxDistribution = incomeEarners.some((member) =>
    memberIsPreTaxDistributionEligibleAge(member.birthday, selectedYearInput.year)
  );

  const availableToInvest = availableToInvestFromYearInput(
    selectedYearInput,
    taxEstimatorRef
  );
  const effectiveInvest = effectiveInvestFromYearInput(
    selectedYearInput,
    taxEstimatorRef
  );
  const investmentDifference = investmentDifferenceFromYearInput(
    selectedYearInput,
    taxEstimatorRef
  );
  const usingFederalTaxEstimate =
    selectedYearInput.expenses.federalTaxSource === "use-estimate";
  const federalTaxFieldState = getEraState("selected-federal-tax-amount");

  const applyFederalTaxEstimate = () => {
    updateYearInput((yearInput) => ({
      ...yearInput,
      expenses: expensesWithSyncedTaxTotal({
        ...yearInput.expenses,
        federalTaxSource: "use-estimate",
        selectedFederalTaxAmount: 0,
      }),
    }));
  };

  const applyManualFederalTax = () => {
    const seed = federalTaxAmountForYearInput(
      selectedYearInput,
      taxEstimatorRef
    );
    updateYearInput((yearInput) => ({
      ...yearInput,
      expenses: expensesWithSyncedTaxTotal({
        ...yearInput.expenses,
        federalTaxSource: "manual",
        selectedFederalTaxAmount: seed,
      }),
    }));
  };

  const handleFederalTaxEstimateToggle = (nextChecked: boolean) => {
    if (federalTaxFieldState.eraLocked) {
      setShowNoTaxOverridesYetModal(true);
      return;
    }

    if (nextChecked) {
      if (selectedYearInput.expenses.selectedFederalTaxAmount !== 0) {
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
      <aside className="flex h-full min-h-0 w-[22em] shrink-0 flex-col border-l border-border-secondary bg-bg-primary overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-[1em]">
          <Stack gap="lg">
          <Stack gap="xs">
            <Text size="h3" hierarchy="primary">
              Year Facts
            </Text>
            <Text size="body1" hierarchy="secondary">
              {selectedYearInput.year}
            </Text>
          </Stack>

          <Stack gap="sm">
            {incomeEarners.map((member) => {
              const fieldKey = `wage-income-${member.id}` as YearFactsFieldKey;
              const { eraLocked, eraOverride } = getEraState(fieldKey);

              return (
                <YearFactsField
                  key={fieldKey}
                  title={`${member.nickname || "Member"}'s Wages`}
                  description="Income from working."
                  value={selectedYearInput.wageIncome[member.id] ?? 0}
                  onCommit={(value) =>
                    updateYearInput((yearInput) => ({
                      ...yearInput,
                      wageIncome: {
                        ...yearInput.wageIncome,
                        [member.id]: value,
                      },
                    }))
                  }
                  cellKey={fieldKey}
                  registerCell={registerCell}
                  onFocusNext={() => focusNextField(fieldKey)}
                  eraLocked={eraLocked}
                  eraOverride={eraOverride}
                  onOverride={() => onOverrideField?.(selectedYearInput.year, fieldKey)}
                  onRelink={() => onRelinkField?.(selectedYearInput.year, fieldKey)}
                />
              );
            })}

            <YearFactsSocialSecurityFields
              calendarYear={selectedYearInput.year}
              incomeEarners={incomeEarners}
              yearInput={selectedYearInput}
              registerCell={registerCell}
              getEraState={getEraState}
              focusNextField={focusNextField}
              onUpdateYearInput={updateYearInput}
              onOverrideField={onOverrideField}
              onRelinkField={onRelinkField}
            />

            {showProminentPreTaxDistribution ? (
              <YearFactsPreTaxDistributionField
                yearInput={selectedYearInput}
                registerCell={registerCell}
                getEraState={getEraState}
                focusNextField={focusNextField}
                onUpdateYearInput={updateYearInput}
                onOverrideField={onOverrideField}
                onRelinkField={onRelinkField}
              />
            ) : null}

            {showProminentPreTaxDistribution ? (
              <YearFactsRothDistributionsField
                yearInput={selectedYearInput}
                registerCell={registerCell}
                getEraState={getEraState}
                focusNextField={focusNextField}
                onUpdateYearInput={updateYearInput}
                onOverrideField={onOverrideField}
                onRelinkField={onRelinkField}
              />
            ) : null}

            <YearFactsField
              title="Qualified Dividends"
              description="Dividend income eligible for preferential tax treatment."
              value={selectedYearInput.otherIncome.qualifiedDividends}
              onCommit={(value) =>
                updateYearInput((yearInput) => ({
                  ...yearInput,
                  otherIncome: {
                    ...yearInput.otherIncome,
                    qualifiedDividends: value,
                  },
                }))
              }
              cellKey="qualified-dividends"
              registerCell={registerCell}
              onFocusNext={() => focusNextField("qualified-dividends")}
              eraLocked={getEraState("qualified-dividends").eraLocked}
              eraOverride={getEraState("qualified-dividends").eraOverride}
              onOverride={() =>
                onOverrideField?.(selectedYearInput.year, "qualified-dividends")
              }
              onRelink={() =>
                onRelinkField?.(selectedYearInput.year, "qualified-dividends")
              }
            />

            <YearFactsField
              title="Ordinary Dividends"
              description="Dividend income taxed at ordinary income rates."
              value={selectedYearInput.otherIncome.ordinaryDividends}
              onCommit={(value) =>
                updateYearInput((yearInput) => ({
                  ...yearInput,
                  otherIncome: {
                    ...yearInput.otherIncome,
                    ordinaryDividends: value,
                  },
                }))
              }
              cellKey="ordinary-dividends"
              registerCell={registerCell}
              onFocusNext={() => focusNextField("ordinary-dividends")}
              eraLocked={getEraState("ordinary-dividends").eraLocked}
              eraOverride={getEraState("ordinary-dividends").eraOverride}
              onOverride={() =>
                onOverrideField?.(selectedYearInput.year, "ordinary-dividends")
              }
              onRelink={() =>
                onRelinkField?.(selectedYearInput.year, "ordinary-dividends")
              }
            />

            <YearFactsField
              title="Interest Income"
              description="Income from interest payments on bonds, etc..."
              value={selectedYearInput.otherIncome.interestIncome}
              onCommit={(value) =>
                updateYearInput((yearInput) => ({
                  ...yearInput,
                  otherIncome: {
                    ...yearInput.otherIncome,
                    interestIncome: value,
                  },
                }))
              }
              cellKey="interest-income"
              registerCell={registerCell}
              onFocusNext={() => focusNextField("interest-income")}
              eraLocked={getEraState("interest-income").eraLocked}
              eraOverride={getEraState("interest-income").eraOverride}
              onOverride={() => onOverrideField?.(selectedYearInput.year, "interest-income")}
              onRelink={() => onRelinkField?.(selectedYearInput.year, "interest-income")}
            />

            <YearFactsField
              title="Realized Taxable Gains (Short Term)"
              description="Capital gains income for assets sold that have been held for less than one year."
              value={selectedYearInput.otherIncome.shortTermCapitalGains}
              onCommit={(value) =>
                updateYearInput((yearInput) => ({
                  ...yearInput,
                  otherIncome: {
                    ...yearInput.otherIncome,
                    shortTermCapitalGains: value,
                  },
                }))
              }
              cellKey="short-term-capital-gains"
              registerCell={registerCell}
              onFocusNext={() => focusNextField("short-term-capital-gains")}
              eraLocked={getEraState("short-term-capital-gains").eraLocked}
              eraOverride={getEraState("short-term-capital-gains").eraOverride}
              onOverride={() => onOverrideField?.(selectedYearInput.year, "short-term-capital-gains")}
              onRelink={() => onRelinkField?.(selectedYearInput.year, "short-term-capital-gains")}
            />
            <Text size="body2" hierarchy="secondary" className="-mt-2 pb-1">
              {REALIZED_GAIN_BASIS_UI_NOTE}
            </Text>

            <YearFactsField
              title="Ordinary Income"
              description="Tax-relevant ordinary items: wages, Social Security benefits, pre-tax distributions, dividends, interest, and short-term capital gains. Roth distributions are excluded (non-taxable in V1)."
              value={ordinaryIncome}
            />

            <YearFactsField
              title="Realized Taxable Gains (Long Term)"
              description="Capital gains income for assets sold that have been held for more than one year."
              value={selectedYearInput.otherIncome.longTermCapitalGains}
              onCommit={(value) =>
                updateYearInput((yearInput) => ({
                  ...yearInput,
                  otherIncome: {
                    ...yearInput.otherIncome,
                    longTermCapitalGains: value,
                  },
                }))
              }
              cellKey="long-term-capital-gains"
              registerCell={registerCell}
              onFocusNext={() => focusNextField("long-term-capital-gains")}
              eraLocked={getEraState("long-term-capital-gains").eraLocked}
              eraOverride={getEraState("long-term-capital-gains").eraOverride}
              onOverride={() => onOverrideField?.(selectedYearInput.year, "long-term-capital-gains")}
              onRelink={() => onRelinkField?.(selectedYearInput.year, "long-term-capital-gains")}
            />
            <Text size="body2" hierarchy="secondary" className="-mt-2 pb-1">
              {REALIZED_GAIN_BASIS_UI_NOTE}
            </Text>

            {!showProminentPreTaxDistribution ? (
              <YearFactsPreTaxDistributionField
                yearInput={selectedYearInput}
                registerCell={registerCell}
                getEraState={getEraState}
                focusNextField={focusNextField}
                onUpdateYearInput={updateYearInput}
                onOverrideField={onOverrideField}
                onRelinkField={onRelinkField}
              />
            ) : null}

            {!showProminentPreTaxDistribution ? (
              <YearFactsRothDistributionsField
                yearInput={selectedYearInput}
                registerCell={registerCell}
                getEraState={getEraState}
                focusNextField={focusNextField}
                onUpdateYearInput={updateYearInput}
                onOverrideField={onOverrideField}
                onRelinkField={onRelinkField}
              />
            ) : null}

            <YearFactsField
              title="Total Income"
              description="Ordinary income (including wages and Social Security) plus long-term capital gains plus Roth distributions (household cash inflow)."
              value={totalIncome}
            />

            <YearFactsField
              title="Household Expenses"
              description="Normal expenses for the household."
              value={selectedYearInput.expenses.householdExpenses}
              onCommit={(value) =>
                updateYearInput((yearInput) => ({
                  ...yearInput,
                  expenses: {
                    ...yearInput.expenses,
                    householdExpenses: value,
                  },
                }))
              }
              cellKey="household-expenses"
              registerCell={registerCell}
              onFocusNext={() => focusNextField("household-expenses")}
              eraLocked={getEraState("household-expenses").eraLocked}
              eraOverride={getEraState("household-expenses").eraOverride}
              onOverride={() => onOverrideField?.(selectedYearInput.year, "household-expenses")}
              onRelink={() => onRelinkField?.(selectedYearInput.year, "household-expenses")}
            />

            <YearFactsFilingStatusField
              title="Tax filing status"
              description="Federal income tax filing status used for tax estimates."
              value={selectedYearInput.filingStatus}
              eraLocked={getEraState("filing-status").eraLocked}
              eraOverride={getEraState("filing-status").eraOverride}
              onOverride={() =>
                onOverrideField?.(selectedYearInput.year, "filing-status")
              }
              onRelink={() =>
                onRelinkField?.(selectedYearInput.year, "filing-status")
              }
              onRequestChange={(next) => setFilingApplyTarget(next)}
            />

            <YearFactsFederalTaxField
              title="Taxes: Federal"
              description="Manual federal income tax liability for this year."
              value={
                usingFederalTaxEstimate
                  ? federalEstimateForYear
                  : selectedYearInput.expenses.selectedFederalTaxAmount
              }
              estimatedFederalAmount={federalEstimateForYear}
              useEstimate={usingFederalTaxEstimate}
              onToggleEstimate={handleFederalTaxEstimateToggle}
              showEstimateBreakdown={Boolean(taxEstimatorRef)}
              onOpenEstimateBreakdown={() =>
                setShowTaxEstimateBreakdownModal(true)
              }
              onCommit={(value) =>
                updateYearInput((yearInput) => ({
                  ...yearInput,
                  expenses: expensesWithSyncedTaxTotal({
                    ...yearInput.expenses,
                    federalTaxSource: "manual",
                    selectedFederalTaxAmount: value,
                  }),
                }))
              }
              cellKey="selected-federal-tax-amount"
              registerCell={registerCell}
              onFocusNext={() => focusNextField("selected-federal-tax-amount")}
              eraLocked={federalTaxFieldState.eraLocked}
              eraOverride={federalTaxFieldState.eraOverride}
              onOverride={() => setShowNoTaxOverridesYetModal(true)}
              onRelink={() =>
                onRelinkField?.(
                  selectedYearInput.year,
                  "selected-federal-tax-amount"
                )
              }
            />

            <YearFactsField
              title="Taxes: State & Local"
              description="Estimated state and local tax liability for this year."
              value={selectedYearInput.expenses.stateLocalTaxLiability}
              onCommit={(value) =>
                updateYearInput((yearInput) => ({
                  ...yearInput,
                  expenses: expensesWithSyncedTaxTotal({
                    ...yearInput.expenses,
                    stateLocalTaxLiability: value,
                  }),
                }))
              }
              cellKey="state-local-tax-liability"
              registerCell={registerCell}
              onFocusNext={() =>
                focusNextField("state-local-tax-liability")
              }
              eraLocked={
                getEraState("state-local-tax-liability").eraLocked
              }
              eraOverride={
                getEraState("state-local-tax-liability").eraOverride
              }
              onOverride={() =>
                onOverrideField?.(
                  selectedYearInput.year,
                  "state-local-tax-liability"
                )
              }
              onRelink={() =>
                onRelinkField?.(
                  selectedYearInput.year,
                  "state-local-tax-liability"
                )
              }
            />

            <YearFactsField
              title="Total Tax"
              description="Federal plus state and local tax estimates."
              value={totalTaxExpense}
            />

            <YearFactsField
              title="Other Major Expenses"
              description="Major one-off expenses that might occur in this year."
              value={selectedYearInput.expenses.otherExpenses}
              onCommit={(value) =>
                updateYearInput((yearInput) => ({
                  ...yearInput,
                  expenses: {
                    ...yearInput.expenses,
                    otherExpenses: value,
                  },
                }))
              }
              cellKey="other-expenses"
              registerCell={registerCell}
              onFocusNext={() => focusNextField("other-expenses")}
              eraLocked={getEraState("other-expenses").eraLocked}
              eraOverride={getEraState("other-expenses").eraOverride}
              onOverride={() => onOverrideField?.(selectedYearInput.year, "other-expenses")}
              onRelink={() => onRelinkField?.(selectedYearInput.year, "other-expenses")}
            />

            <YearFactsField
              title="Expenses"
              description="Household expenses, total tax, and other major expenses."
              value={totalExpenses}
            />

            <FilingStatusApplyModal
              isOpen={filingApplyTarget !== null}
              selectionLabel={
                filingApplyTarget
                  ? labelForFilingStatus(filingApplyTarget)
                  : ""
              }
              onApplyToAll={() => {
                if (!filingApplyTarget) return;
                onBulkApplyFilingStatus?.(filingApplyTarget);
                setFilingApplyTarget(null);
              }}
              onApplyHereOnly={() => {
                if (!filingApplyTarget) return;
                updateYearInput((yearInput) => ({
                  ...yearInput,
                  filingStatus: filingApplyTarget,
                }));
                setFilingApplyTarget(null);
              }}
              onCancel={() => setFilingApplyTarget(null)}
            />

            <InvestFactsSection
              availableToInvest={availableToInvest}
              effectiveInvest={effectiveInvest}
              investmentDifference={investmentDifference}
              modifyInvestmentDetails={
                selectedYearInput.modifyInvestmentDetails
              }
              investmentBreakdown={selectedYearInput.investmentBreakdown}
              onToggleModify={handleToggleModifyInvest}
              onCommitBreakdown={(field, value) =>
                updateYearInput((yi) => ({
                  ...yi,
                  investmentBreakdown: {
                    ...yi.investmentBreakdown,
                    [field]: value,
                  },
                }))
              }
              registerCell={registerCell}
              isYearInEra={isYearInEra}
              investBlockOverridden={investBlockOverridden}
              onOverrideInvestBlock={
                onOverrideInvestBlock
                  ? () => onOverrideInvestBlock(selectedYearInput.year)
                  : undefined
              }
              onRelinkInvestBlock={
                onRelinkInvestBlock
                  ? () => onRelinkInvestBlock(selectedYearInput.year)
                  : undefined
              }
            />

            <Stack gap="xs" className="min-w-0 pt-2">
              <Text size="h3" hierarchy="primary">
                Misc.
              </Text>
              <Text size="body2" hierarchy="secondary">
                Tax-relevant items that are not part of income totals above.
              </Text>
              <YearFactsRothConversionsField
                yearInput={selectedYearInput}
                registerCell={registerCell}
                getEraState={getEraState}
                focusNextField={focusNextField}
                onUpdateYearInput={updateYearInput}
                onOverrideField={onOverrideField}
                onRelinkField={onRelinkField}
              />
            </Stack>
          </Stack>
          </Stack>
        </div>
      </aside>
      <UseFederalTaxEstimateModal
        isOpen={showFederalTaxEstimateModal}
        currentManualAmountLabel={new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(selectedYearInput.expenses.selectedFederalTaxAmount)}
        federalEstimateAmount={federalEstimateForYear}
        onCancel={() => setShowFederalTaxEstimateModal(false)}
        onConfirm={() => {
          applyFederalTaxEstimate();
          setShowFederalTaxEstimateModal(false);
        }}
      />
      <TaxEstimateBreakdownModal
        isOpen={showTaxEstimateBreakdownModal}
        onClose={() => setShowTaxEstimateBreakdownModal(false)}
        yearLabel={`Year ${selectedYearInput.year}`}
        result={taxEstimateBreakdown}
      />
      <NoOverridesYetModal
        isOpen={showNoTaxOverridesYetModal}
        onClose={() => setShowNoTaxOverridesYetModal(false)}
      />
    </>
  );
}
