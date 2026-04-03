import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { Unlink, RotateCcw } from "lucide-react";
import EditableAmountCell, {
  type FocusAndEditHandle,
} from "./EditableAmountCell";
import type { InvestmentBreakdown } from "../../types/investment";
import { investmentBreakdownTotal } from "../../lib/invest";
import {
  HSA_CONTRIBUTION_DESCRIPTION,
  PRE_TAX_401K_CONTRIBUTION_DESCRIPTION,
  PRE_TAX_IRA_CONTRIBUTION_DESCRIPTION,
} from "../../lib/investmentContributions";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export interface InvestFactsSectionProps {
  availableToInvest: number;
  /** Portfolio contribution in automatic mode (cash-flow shortfall clamped to 0). */
  effectiveInvest: number;
  investmentDifference: number;
  modifyInvestmentDetails: boolean;
  investmentBreakdown: InvestmentBreakdown;
  onToggleModify: (next: boolean) => void;
  onCommitBreakdown: (
    field: keyof InvestmentBreakdown,
    value: number
  ) => void;
  registerCell?: (key: string, handle: FocusAndEditHandle | null) => void;
  /** Year pane: row follows an era until the invest block is overridden. */
  isYearInEra?: boolean;
  investBlockOverridden?: boolean;
  onOverrideInvestBlock?: () => void;
  onRelinkInvestBlock?: () => void;
}

export default function InvestFactsSection({
  availableToInvest,
  effectiveInvest,
  investmentDifference,
  modifyInvestmentDetails,
  investmentBreakdown,
  onToggleModify,
  onCommitBreakdown,
  registerCell,
  isYearInEra = false,
  investBlockOverridden = false,
  onOverrideInvestBlock,
  onRelinkInvestBlock,
}: InvestFactsSectionProps) {
  const investBlockEraLocked = isYearInEra && !investBlockOverridden;
  const canCustomizeInvest = !isYearInEra || investBlockOverridden;
  const canEditInvestAmount =
    modifyInvestmentDetails && canCustomizeInvest;
  const toggleDisabled = investBlockEraLocked;
  const showOverrideButton = investBlockEraLocked && onOverrideInvestBlock;
  const showRelinkButton = investBlockOverridden && onRelinkInvestBlock;

  const differenceClass =
    investmentDifference < 0 ? "text-[var(--text-error)]" : "";
  const investmentTotal = modifyInvestmentDetails
    ? investmentBreakdownTotal({ investmentBreakdown })
    : effectiveInvest;

  return (
    <Stack gap="sm" className="min-w-0">
      <div className="min-w-0 rounded border border-border-secondary bg-bg-primary px-4 py-4">
        <Stack gap="sm" className="min-w-0">
          <Text size="body1" hierarchy="primary" className="leading-tight">
            Available to invest
          </Text>
          <div className="rounded border border-border-secondary bg-bg-secondary px-3 py-2">
            <Text size="body1" hierarchy="primary">
              {formatCurrency(availableToInvest)}
            </Text>
          </div>
        </Stack>
      </div>

      <div className="min-w-0 rounded border border-border-secondary bg-bg-primary px-4 py-4">
        <Stack gap="sm" className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Text size="body1" hierarchy="primary" className="leading-tight">
              Invest
            </Text>
            <div className="flex items-center gap-1 shrink-0">
              {showOverrideButton && (
                <Button
                  variant="tertiary"
                  size="md"
                  icon={<Unlink size={16} />}
                  aria-label="Override invest block from era"
                  onClick={onOverrideInvestBlock}
                />
              )}
              {showRelinkButton && (
                <Button
                  variant="tertiary"
                  size="md"
                  icon={<RotateCcw size={16} />}
                  aria-label="Re-link invest block to era"
                  onClick={onRelinkInvestBlock}
                />
              )}
            </div>
          </div>

          <div className="rounded border border-border-secondary bg-bg-secondary px-3 py-2">
            <Text size="body1" hierarchy="primary">
              {formatCurrency(investmentTotal)}
            </Text>
          </div>

          {modifyInvestmentDetails ? (
            <>
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="modify-investment-details"
                  type="checkbox"
                  className="size-4 shrink-0 rounded border-border-secondary accent-accent-primary"
                  checked
                  disabled={toggleDisabled}
                  onChange={() => onToggleModify(false)}
                />
                <label
                  htmlFor="modify-investment-details"
                  className={`select-none ${toggleDisabled ? "cursor-default opacity-70" : "cursor-pointer"}`}
                >
                  <Text
                    size="body2"
                    hierarchy="secondary"
                    className="leading-tight"
                  >
                    Breakdown Investment
                  </Text>
                </label>
              </div>

              <Stack gap="xs" className="min-w-0">
                <Text size="body2" hierarchy="primary" className="leading-tight">
                  Pre-Tax 401(k) / 403(b) Contributions
                </Text>
                <Text size="body2" hierarchy="secondary" className="leading-tight">
                  {PRE_TAX_401K_CONTRIBUTION_DESCRIPTION}
                </Text>
                {canEditInvestAmount ? (
                  <EditableAmountCell
                    value={investmentBreakdown.preTax401kContribution}
                    onCommit={(value) =>
                      onCommitBreakdown("preTax401kContribution", value)
                    }
                    cellKey="preTax401kContribution"
                    registerCell={registerCell}
                  />
                ) : (
                  <div className="rounded border border-border-secondary bg-bg-secondary px-3 py-2">
                    <Text size="body1" hierarchy="primary">
                      {formatCurrency(
                        investmentBreakdown.preTax401kContribution
                      )}
                    </Text>
                  </div>
                )}
              </Stack>
              <Stack gap="xs" className="min-w-0">
                <Text size="body2" hierarchy="primary" className="leading-tight">
                  Traditional IRA Contribution
                </Text>
                <Text size="body2" hierarchy="secondary" className="leading-tight">
                  {PRE_TAX_IRA_CONTRIBUTION_DESCRIPTION}
                </Text>
                {canEditInvestAmount ? (
                  <EditableAmountCell
                    value={investmentBreakdown.preTaxIraContribution}
                    onCommit={(value) =>
                      onCommitBreakdown("preTaxIraContribution", value)
                    }
                    cellKey="preTaxIraContribution"
                    registerCell={registerCell}
                  />
                ) : (
                  <div className="rounded border border-border-secondary bg-bg-secondary px-3 py-2">
                    <Text size="body1" hierarchy="primary">
                      {formatCurrency(
                        investmentBreakdown.preTaxIraContribution
                      )}
                    </Text>
                  </div>
                )}
              </Stack>
              <Stack gap="xs" className="min-w-0">
                <Text size="body2" hierarchy="primary" className="leading-tight">
                  Health Savings Account (HSA) Contributions
                </Text>
                <Text size="body2" hierarchy="secondary" className="leading-tight">
                  {HSA_CONTRIBUTION_DESCRIPTION}
                </Text>
                {canEditInvestAmount ? (
                  <EditableAmountCell
                    value={investmentBreakdown.hsaContribution}
                    onCommit={(value) =>
                      onCommitBreakdown("hsaContribution", value)
                    }
                    cellKey="hsaContribution"
                    registerCell={registerCell}
                  />
                ) : (
                  <div className="rounded border border-border-secondary bg-bg-secondary px-3 py-2">
                    <Text size="body1" hierarchy="primary">
                      {formatCurrency(investmentBreakdown.hsaContribution)}
                    </Text>
                  </div>
                )}
              </Stack>
              {(
                [
                  ["Roth Retirement", "rothRetirement"],
                  ["Taxable Investments", "taxableInvestments"],
                ] as const
              ).map(([label, key]) => (
                <Stack key={key} gap="xs" className="min-w-0">
                  <Text size="body2" hierarchy="primary" className="leading-tight">
                    {label}
                  </Text>
                  {canEditInvestAmount ? (
                    <EditableAmountCell
                      value={investmentBreakdown[key]}
                      onCommit={(value) => onCommitBreakdown(key, value)}
                      cellKey={key}
                      registerCell={registerCell}
                    />
                  ) : (
                    <div className="rounded border border-border-secondary bg-bg-secondary px-3 py-2">
                      <Text size="body1" hierarchy="primary">
                        {formatCurrency(investmentBreakdown[key])}
                      </Text>
                    </div>
                  )}
                </Stack>
              ))}
            </>
          ) : (
            <Button
              variant="secondary"
              size="md"
              disabled={!canCustomizeInvest}
              onClick={() => onToggleModify(true)}
            >
              Breakdown Investment
            </Button>
          )}
        </Stack>
      </div>

      <div className="min-w-0 rounded border border-border-secondary bg-bg-primary px-4 py-4">
        <Stack gap="sm" className="min-w-0">
          <Text size="body1" hierarchy="primary" className="leading-tight">
            Difference
          </Text>
          <div className="rounded border border-border-secondary bg-bg-secondary px-3 py-2">
            <Text
              size="body1"
              hierarchy="primary"
              className={`block text-right ${differenceClass}`.trim()}
            >
              {formatCurrency(investmentDifference)}
            </Text>
          </div>
        </Stack>
      </div>
    </Stack>
  );
}
