import { Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import type { EraFacts } from "../../types/era";
import type { HouseholdMember } from "../../types/scenario";
import YearFactsField from "../Timeline/YearFactsField";

interface EraFactsFormProps {
  eraFacts: EraFacts;
  incomeEarners: HouseholdMember[];
  onUpdateEraFacts: (updater: (prev: EraFacts) => EraFacts) => void;
}

export default function EraFactsForm({
  eraFacts,
  incomeEarners,
  onUpdateEraFacts,
}: EraFactsFormProps) {
  return (
    <Stack gap="sm">
      <Text size="body2" hierarchy="primary">
        Era Facts
      </Text>
      {incomeEarners.map((member) => {
        const fieldKey = `wage-income-${member.id}`;
        return (
          <YearFactsField
            key={fieldKey}
            title={`${member.nickname || "Member"}'s Wages`}
            description="Income from working."
            value={eraFacts.wageIncome[member.id] ?? 0}
            onCommit={(value) =>
              onUpdateEraFacts((prev) => ({
                ...prev,
                wageIncome: { ...prev.wageIncome, [member.id]: value },
              }))
            }
          />
        );
      })}
      <YearFactsField
        title="Dividend Income"
        description="Income from dividends."
        value={eraFacts.otherIncome.dividendIncome}
        onCommit={(value) =>
          onUpdateEraFacts((prev) => ({
            ...prev,
            otherIncome: { ...prev.otherIncome, dividendIncome: value },
          }))
        }
      />
      <YearFactsField
        title="Interest Income"
        description="Income from interest payments."
        value={eraFacts.otherIncome.interestIncome}
        onCommit={(value) =>
          onUpdateEraFacts((prev) => ({
            ...prev,
            otherIncome: { ...prev.otherIncome, interestIncome: value },
          }))
        }
      />
      <YearFactsField
        title="Capital Gains (Short Term)"
        description="Short-term capital gains."
        value={eraFacts.otherIncome.shortTermCapitalGains}
        onCommit={(value) =>
          onUpdateEraFacts((prev) => ({
            ...prev,
            otherIncome: { ...prev.otherIncome, shortTermCapitalGains: value },
          }))
        }
      />
      <YearFactsField
        title="Capital Gains (Long Term)"
        description="Long-term capital gains."
        value={eraFacts.otherIncome.longTermCapitalGains}
        onCommit={(value) =>
          onUpdateEraFacts((prev) => ({
            ...prev,
            otherIncome: { ...prev.otherIncome, longTermCapitalGains: value },
          }))
        }
      />
      <YearFactsField
        title="Household Expenses"
        description="Normal expenses for the household."
        value={eraFacts.expenses.householdExpenses}
        onCommit={(value) =>
          onUpdateEraFacts((prev) => ({
            ...prev,
            expenses: { ...prev.expenses, householdExpenses: value },
          }))
        }
      />
      <YearFactsField
        title="Taxes"
        description="Estimated tax expenses."
        value={eraFacts.expenses.taxes}
        onCommit={(value) =>
          onUpdateEraFacts((prev) => ({
            ...prev,
            expenses: { ...prev.expenses, taxes: value },
          }))
        }
      />
      <YearFactsField
        title="Other Major Expenses"
        description="Major one-off expenses."
        value={eraFacts.expenses.otherExpenses}
        onCommit={(value) =>
          onUpdateEraFacts((prev) => ({
            ...prev,
            expenses: { ...prev.expenses, otherExpenses: value },
          }))
        }
      />
    </Stack>
  );
}
