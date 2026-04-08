import { createPortal } from "react-dom";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { MODAL_PORTAL_BACKDROP_STYLE } from "../../lib/modalPortalBackdropStyle";
interface UseFederalTaxEstimateModalProps {
  isOpen: boolean;
  currentManualAmountLabel: string;
  /** Federal estimate that will apply if the user confirms. */
  federalEstimateAmount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function UseFederalTaxEstimateModal({
  isOpen,
  currentManualAmountLabel,
  federalEstimateAmount,
  onConfirm,
  onCancel,
}: UseFederalTaxEstimateModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={MODAL_PORTAL_BACKDROP_STYLE}
      role="dialog"
      aria-modal="true"
      aria-label="Override tax amount with Velella estimate?"
    >
      <div className="mx-4 max-w-md rounded border border-border-secondary bg-bg-primary p-6 shadow-lg">
        <Stack gap="lg">
          <Text size="h3" hierarchy="primary" as="h2">
            Override tax amount with Velella Estimate?
          </Text>
          <Text size="body1" hierarchy="secondary">
            Switching to the estimate will replace the manual federal tax amount for
            now.
          </Text>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="tertiary" size="lg" onClick={onCancel}>
              No, Keep {currentManualAmountLabel}
            </Button>
            <Button variant="primary" size="lg" onClick={onConfirm}>
              Yes, use estimate: {formatCurrency(federalEstimateAmount)}
            </Button>
          </div>
        </Stack>
      </div>
    </div>,
    document.body
  );
}
