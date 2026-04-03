import { Button, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { CashflowSummaryNumbers } from "../../lib/cashflowSummary";
import EraPaneHelpButton from "./EraPaneHelpButton";

const DESCRIPTION_SOON = "description coming soon!";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function EraCashflowBreakdownRow({
  label,
  value,
  description = DESCRIPTION_SOON,
  isNegative = false,
}: {
  label: string;
  value: number;
  description?: string;
  isNegative?: boolean;
}) {
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
      <p
        className={[
          "shrink-0 text-right text-body-1",
          isNegative ? "text-[var(--text-error)]" : "text-text-primary",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ margin: 0 }}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}

export interface EraCashflowSummarySectionProps {
  summary: CashflowSummaryNumbers;
}

export default function EraCashflowSummarySection({
  summary,
}: EraCashflowSummarySectionProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const { headerTotal, expenses, incomeExPortfolio, pullingFromPortfolio } =
    summary;
  const isCashFlowShortfall = headerTotal < 0;

  return (
    <section className="mx-[4px] flex min-w-0 self-stretch flex-col gap-0 border-b border-border-secondary bg-bg-primary py-[24px]">
      <div className="flex w-full min-w-0 max-w-full items-start justify-between gap-4">
        <Text
          size="h5"
          hierarchy="primary"
          weight="heavy"
          className="min-w-0 flex-1 text-left"
        >
          Cash Flow Summary
        </Text>
        <div className="flex shrink-0 items-center gap-2">
          <div
            className="flex shrink-0 flex-col items-end text-right"
            style={{
              gap: 0,
              rowGap: 0,
              lineHeight: 1,
            }}
          >
            <Text
              size="h5"
              hierarchy="primary"
              weight="heavy"
              as="span"
              className={
                isCashFlowShortfall ? undefined : "text-text-primary"
              }
              style={{
                lineHeight: 1,
                margin: 0,
                paddingTop: "0.35em",
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                display: "block",
              }}
            >
              {isCashFlowShortfall ? (
                <span style={{ color: "var(--text-error)" }}>
                  {formatCurrency(headerTotal)}
                </span>
              ) : (
                formatCurrency(headerTotal)
              )}
            </Text>
            <p
              className={[
                "m-0 p-0 text-right text-body-2 leading-none",
                isCashFlowShortfall
                  ? "text-[var(--text-error)]"
                  : "text-text-primary",
              ].join(" ")}
              style={{ lineHeight: 1, marginTop: 0, marginBottom: 0 }}
            >
              {isCashFlowShortfall
                ? "Cash Flow Shortfall"
                : "Available to invest"}
            </p>
          </div>
          <div className="flex shrink-0 items-center">
            <EraPaneHelpButton
              label="Show explanation for Cash Flow Summary"
              description={DESCRIPTION_SOON}
            />
          </div>
        </div>
      </div>

      <div className="mt-2 flex w-full min-w-0 max-w-full items-center">
        <div className="inline-flex shrink-0 [&>button]:px-[2px]">
          <Button
            variant="tertiary"
            size="sm"
            onClick={() => setBreakdownOpen((o) => !o)}
            aria-expanded={breakdownOpen}
          >
            <span className="inline-flex items-center gap-1">
              <span>Breakdown</span>
              {breakdownOpen ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </span>
          </Button>
        </div>
      </div>

      {breakdownOpen ? (
        <div className="mt-2 flex min-w-0 flex-col">
          <EraCashflowBreakdownRow
            label="Expenses"
            value={expenses}
            description={DESCRIPTION_SOON}
          />
          <EraCashflowBreakdownRow
            label="Income"
            value={incomeExPortfolio}
            description={DESCRIPTION_SOON}
          />
          <EraCashflowBreakdownRow
            label="Pulling from Portfolio"
            value={pullingFromPortfolio}
            description={DESCRIPTION_SOON}
          />
        </div>
      ) : null}
    </section>
  );
}
