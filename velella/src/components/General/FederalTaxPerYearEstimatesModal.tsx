import { createPortal } from "react-dom";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { X } from "lucide-react";
import { MODAL_PORTAL_BACKDROP_STYLE } from "../../lib/modalPortalBackdropStyle";

export interface FederalTaxYearEstimateRow {
  year: number;
  federalTax: number;
}

interface FederalTaxPerYearEstimatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  eraLabel: string;
  rows: FederalTaxYearEstimateRow[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function FederalTaxPerYearEstimatesModal({
  isOpen,
  onClose,
  eraLabel,
  rows,
}: FederalTaxPerYearEstimatesModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={MODAL_PORTAL_BACKDROP_STYLE}
      role="dialog"
      aria-modal="true"
      aria-labelledby="federal-tax-per-year-title"
    >
      <div className="relative mx-[16px] flex max-h-[85vh] w-full max-w-[28rem] flex-col overflow-hidden rounded-[16px] border border-border-secondary bg-bg-primary shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06),0px_4px_8px_0px_rgba(0,0,0,0.1)]">
        <div className="flex items-start justify-between gap-4 border-b border-border-tertiary px-[24px] py-[20px]">
          <div className="min-w-0">
            <h2 id="federal-tax-per-year-title" className="text-h3 text-text-primary">
              Federal estimate by year
            </h2>
            <Text size="body2" hierarchy="secondary" className="pt-[4px]">
              {eraLabel} — read-only; per-year overrides are not available yet.
            </Text>
          </div>
          <Button
            variant="tertiary"
            size="md"
            icon={<X size={16} />}
            aria-label="Close"
            onClick={onClose}
          />
        </div>

        <div className="min-h-0 overflow-y-auto px-[24px] py-[16px]">
          {rows.length === 0 ? (
            <Text size="body1" hierarchy="secondary">
              No years in this era range.
            </Text>
          ) : (
            <Stack gap="xs">
              {rows.map((r) => (
                <div
                  key={r.year}
                  className="flex w-full justify-between gap-4 border-b border-border-tertiary py-2 last:border-b-0"
                >
                  <Text size="body2" hierarchy="secondary">
                    {r.year}
                  </Text>
                  <Text
                    size="body2"
                    hierarchy="primary"
                    className="tabular-nums"
                  >
                    {formatCurrency(r.federalTax)}
                  </Text>
                </div>
              ))}
            </Stack>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
