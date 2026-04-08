import { createPortal } from "react-dom";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { Info, X } from "lucide-react";
import { MODAL_PORTAL_BACKDROP_STYLE } from "../../lib/modalPortalBackdropStyle";
import type { TaxEstimateResult } from "../../types/taxEstimate";

interface TaxEstimateBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  yearLabel: string;
  result: TaxEstimateResult | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full justify-between gap-4 border-b border-border-tertiary py-2 last:border-b-0">
      <Text size="body2" hierarchy="secondary" className="min-w-0 shrink">
        {label}
      </Text>
      <Text size="body2" hierarchy="primary" className="shrink-0 text-right tabular-nums">
        {value}
      </Text>
    </div>
  );
}

export default function TaxEstimateBreakdownModal({
  isOpen,
  onClose,
  yearLabel,
  result,
}: TaxEstimateBreakdownModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={MODAL_PORTAL_BACKDROP_STYLE}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tax-estimate-breakdown-title"
    >
      <div className="relative mx-[16px] flex max-h-[85vh] w-full max-w-[32rem] flex-col overflow-hidden rounded-[16px] border border-border-secondary bg-bg-primary shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06),0px_4px_8px_0px_rgba(0,0,0,0.1)]">
        <div className="flex items-start justify-between gap-4 border-b border-border-tertiary px-[24px] py-[20px]">
          <div className="min-w-0">
            <h2
              id="tax-estimate-breakdown-title"
              className="flex items-center gap-2 text-h3 text-text-primary"
            >
              <Info size={20} className="shrink-0 text-text-secondary" aria-hidden />
              Federal tax estimate
            </h2>
            <Text size="body2" hierarchy="secondary" className="pt-[4px]">
              {yearLabel}
            </Text>
          </div>
          <Button
            variant="tertiary"
            size="md"
            icon={<X size={16} />}
            aria-label="Close federal tax estimate details"
            onClick={onClose}
          />
        </div>

        <div className="min-h-0 overflow-y-auto px-[24px] py-[16px]">
          {!result ? (
            <Text size="body1" hierarchy="secondary">
              Tax reference data is not loaded yet.
            </Text>
          ) : (
            <Stack gap="m">
              <div>
                <Row
                  label="Estimated federal tax"
                  value={formatCurrency(result.estimatedFederalTaxExpense)}
                />
                <Row
                  label="Ordinary income (before Social Security)"
                  value={formatCurrency(result.ordinaryIncomeBeforeSS)}
                />
                <Row
                  label="Provisional income (SS worksheet)"
                  value={formatCurrency(result.provisionalIncome)}
                />
                <Row
                  label="Gross Social Security"
                  value={formatCurrency(result.grossSocialSecurity)}
                />
                <Row
                  label="Taxable Social Security"
                  value={formatCurrency(result.taxableSocialSecurity)}
                />
                <Row
                  label="Ordinary income (incl. taxable SS)"
                  value={formatCurrency(result.ordinaryIncome)}
                />
                <Row
                  label="Preferential income (QDIV + LTCG taxable)"
                  value={formatCurrency(result.preferentialIncome)}
                />
                <Row
                  label="Adjusted gross income"
                  value={formatCurrency(result.adjustedGrossIncome)}
                />
                <Row
                  label="Standard deduction"
                  value={formatCurrency(result.standardDeduction)}
                />
                <Row
                  label="Taxable income"
                  value={formatCurrency(result.taxableIncome)}
                />
                <Row
                  label="Ordinary tax"
                  value={formatCurrency(result.ordinaryTax)}
                />
                <Row
                  label="Preferential tax"
                  value={formatCurrency(result.preferentialTax)}
                />
                <Row
                  label="Gross federal liability"
                  value={formatCurrency(result.grossFederalTaxLiability)}
                />
              </div>
              {result.notes.length > 0 ? (
                <Stack gap="xs">
                  <Text size="body2" hierarchy="primary" weight="heavy">
                    Assumptions
                  </Text>
                  {result.notes.map((note) => (
                    <Text key={note} size="body2" hierarchy="secondary">
                      {note}
                    </Text>
                  ))}
                </Stack>
              ) : null}
            </Stack>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
