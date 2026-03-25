import { useCallback, useMemo, useRef } from "react";
import { Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { calculateYearFacts } from "../../lib/yearFacts";
import {
  availableToInvestFromYearInput,
  investmentDifferenceFromYearInput,
} from "../../lib/invest";
import { isFieldOverridden } from "../../lib/eraHelpers";
import type { Scenario, YearInput } from "../../types/scenario";
import type { YearFactsFieldKey } from "../../types/era";
import type { FocusAndEditHandle } from "./EditableAmountCell";
import YearFactsField from "./YearFactsField";
import InvestFactsSection from "./InvestFactsSection";

interface YearFactsPaneProps {
  scenario: Scenario;
  selectedYearInput: YearInput | null;
  onUpdateYearInput: (
    year: number,
    updater: (yearInput: YearInput) => YearInput
  ) => void;
  onOverrideField?: (year: number, fieldKey: string) => void;
  onRelinkField?: (year: number, fieldKey: string) => void;
  onOverrideInvestBlock?: (year: number) => void;
  onRelinkInvestBlock?: (year: number) => void;
}

export default function YearFactsPane({
  scenario,
  selectedYearInput,
  onUpdateYearInput,
  onOverrideField,
  onRelinkField,
  onOverrideInvestBlock,
  onRelinkInvestBlock,
}: YearFactsPaneProps) {
  const cellRefs = useRef<Map<string, FocusAndEditHandle>>(new Map());

  const incomeEarners = useMemo(
    () => scenario.householdMembers.filter((member) => member.incomeEarner),
    [scenario.householdMembers]
  );

  const isYearInEra = Boolean(selectedYearInput?.eraMetadata?.eraId);
  const investBlockOverridden = Boolean(
    selectedYearInput &&
      isYearInEra &&
      (isFieldOverridden(selectedYearInput, "modify-investment-details") ||
        isFieldOverridden(selectedYearInput, "traditional-retirement") ||
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

  const editableFieldKeys = useMemo(
    () => [
      ...incomeEarners.map((member) => `wage-income-${member.id}`),
      "dividend-income",
      "interest-income",
      "short-term-capital-gains",
      "long-term-capital-gains",
      "household-expenses",
      "taxes",
      "other-expenses",
    ],
    [incomeEarners]
  );

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
              traditionalRetirement: 0,
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

  const { ordinaryIncome, totalIncome, totalExpenses } =
    calculateYearFacts(selectedYearInput);

  const availableToInvest = availableToInvestFromYearInput(selectedYearInput);
  const investmentDifference =
    investmentDifferenceFromYearInput(selectedYearInput);

  return (
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

            <YearFactsField
              title="Dividend Income"
              description="Income from dividends."
              value={selectedYearInput.otherIncome.dividendIncome}
              onCommit={(value) =>
                updateYearInput((yearInput) => ({
                  ...yearInput,
                  otherIncome: {
                    ...yearInput.otherIncome,
                    dividendIncome: value,
                  },
                }))
              }
              cellKey="dividend-income"
              registerCell={registerCell}
              onFocusNext={() => focusNextField("dividend-income")}
              eraLocked={getEraState("dividend-income").eraLocked}
              eraOverride={getEraState("dividend-income").eraOverride}
              onOverride={() => onOverrideField?.(selectedYearInput.year, "dividend-income")}
              onRelink={() => onRelinkField?.(selectedYearInput.year, "dividend-income")}
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
              title="Capital Gains (Short Term)"
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

            <YearFactsField
              title="Ordinary Income"
              description="Income from wages, dividends, interest, and short-term capital gains."
              value={ordinaryIncome}
            />

            <YearFactsField
              title="Capital Gains (Long Term)"
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

            <YearFactsField
              title="Total Income"
              description="Ordinary income plus long-term capital gains."
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

            <YearFactsField
              title="Taxes"
              description="Estimated tax expenses for this year."
              value={selectedYearInput.expenses.taxes}
              onCommit={(value) =>
                updateYearInput((yearInput) => ({
                  ...yearInput,
                  expenses: {
                    ...yearInput.expenses,
                    taxes: value,
                  },
                }))
              }
              cellKey="taxes"
              registerCell={registerCell}
              onFocusNext={() => focusNextField("taxes")}
              eraLocked={getEraState("taxes").eraLocked}
              eraOverride={getEraState("taxes").eraOverride}
              onOverride={() => onOverrideField?.(selectedYearInput.year, "taxes")}
              onRelink={() => onRelinkField?.(selectedYearInput.year, "taxes")}
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
              description="Household expenses, taxes, and other major expenses."
              value={totalExpenses}
            />

            <InvestFactsSection
              availableToInvest={availableToInvest}
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
          </Stack>
        </Stack>
      </div>
    </aside>
  );
}
