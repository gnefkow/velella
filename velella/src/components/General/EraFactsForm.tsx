import { Button, Text } from "../../../../../counterfoil-kit/src/index.ts";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import type { EraFacts, YearFactsFieldKey } from "../../types/era";
import type { HouseholdMember } from "../../types/scenario";
import {
  availableToInvestFromYearInput,
  effectiveInvestFromYearInput,
  investmentBreakdownTotal,
  investmentDifferenceFromYearInput,
  yearInputFromEraFacts,
} from "../../lib/invest";
import type { EraOverrideDraft } from "../../lib/eraOverrideDraft";
import type { EraOverrideFieldDescriptor } from "../../lib/eraOverrideFields";
import { calculateYearFacts } from "../../lib/yearFacts";
import EraInvestmentBreakdownModal from "./EraInvestmentBreakdownModal";
import EraOverridesModal, {
  type EraOverridesModalSaveResult,
} from "./EraOverridesModal";
import EraPaneAmountInput from "./EraPaneAmountInput";
import EraPaneHelpButton from "./EraPaneHelpButton";
import EraPaneOverrideSummary from "./EraPaneOverrideSummary";

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
}: EraFactsFormProps) {
  const [isMoreIncomeOpen, setIsMoreIncomeOpen] = useState(false);
  const [showRemoveBreakdownModal, setShowRemoveBreakdownModal] = useState(false);
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
  const effectiveInvest = useMemo(
    () => effectiveInvestFromYearInput(eraAsYearInput),
    [eraAsYearInput]
  );
  const investmentDifference =
    investmentDifferenceFromYearInput(eraAsYearInput);
  const moreIncomeTotal =
    eraFacts.otherIncome.dividendIncome +
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

  return (
    <>
      <div className="flex min-w-0 w-full flex-col">
        <section className="mx-[4px] flex min-w-0 self-stretch flex-col gap-0 border-b border-border-secondary bg-bg-primary py-[24px]">
          <EraPaneSectionHeader
            title="Income"
            total={totalIncome}
            description="The sum of wages and all other income sources in this era."
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
                description="The combined total of dividend income, interest income, and capital gains."
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
              <EraPaneFactRow
                label="Dividend Income"
                description="Income from dividends."
              >
                {renderOverrideAwareValue(
                  "dividend-income",
                  "Dividend Income",
                  eraFacts.otherIncome.dividendIncome,
                  (value) =>
                    onUpdateEraFacts((prev) => ({
                      ...prev,
                      otherIncome: {
                        ...prev.otherIncome,
                        dividendIncome: value,
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
              <EraPaneFactRow
                label="Capital Gains (Short Term)"
                description="Capital gains income for assets sold that were held for less than one year."
              >
                {renderOverrideAwareValue(
                  "short-term-capital-gains",
                  "Capital Gains (Short Term)",
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
                label="Capital Gains (Long Term)"
                description="Capital gains income for assets sold that were held for more than one year."
              >
                {renderOverrideAwareValue(
                  "long-term-capital-gains",
                  "Capital Gains (Long Term)",
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
            label="Taxes"
            description="Estimated tax expenses."
          >
            {renderOverrideAwareValue(
              "taxes",
              "Taxes",
              eraFacts.expenses.taxes,
              (value) =>
                onUpdateEraFacts((prev) => ({
                  ...prev,
                  expenses: {
                    ...prev.expenses,
                    taxes: value,
                  },
                }))
            )}
          </EraPaneFactRow>
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

        <section className="mx-[4px] flex min-w-0 self-stretch flex-col gap-0 bg-bg-primary py-[24px]">
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
                label="Traditional Retirement"
                description="Pre-tax retirement contributions."
              >
                {renderOverrideAwareValue(
                  "traditional-retirement",
                  "Traditional Retirement",
                  eraFacts.investmentBreakdown.traditionalRetirement,
                  (value) =>
                    onUpdateEraFacts((prev) => ({
                      ...prev,
                      investmentBreakdown: {
                        ...prev.investmentBreakdown,
                        traditionalRetirement: value,
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
      </div>

      <EraInvestmentBreakdownModal
        isOpen={showRemoveBreakdownModal}
        onCancel={() => setShowRemoveBreakdownModal(false)}
        onConfirm={() => {
          onUpdateEraFacts((prev) => ({
            ...prev,
            modifyInvestmentDetails: false,
            investmentBreakdown: {
              traditionalRetirement: 0,
              rothRetirement: 0,
              taxableInvestments: 0,
            },
          }));
          setShowRemoveBreakdownModal(false);
        }}
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
          onSave={handleOverridesSave}
          onCancel={closeOverridesModal}
        />
      ) : null}
    </>
  );
}
