import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { showModalDebugToast } from "../../lib/modalDebugToast";
import { MODAL_PORTAL_BACKDROP_STYLE } from "../../lib/modalPortalBackdropStyle";

interface EraInvestmentBreakdownModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function EraInvestmentBreakdownModal({
  isOpen,
  onCancel,
  onConfirm,
}: EraInvestmentBreakdownModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    showModalDebugToast("Modal fired");
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={MODAL_PORTAL_BACKDROP_STYLE}
      role="dialog"
      aria-modal="true"
      aria-labelledby="remove-investment-breakdown-title"
    >
      <div className="mx-4 max-w-md rounded border border-border-secondary bg-bg-primary p-6 shadow-lg">
        <Stack gap="lg">
          <Stack gap="sm">
            <h2
              id="remove-investment-breakdown-title"
              className="text-h3 text-text-primary"
            >
              Remove investment breakdown?
            </h2>
            <Text size="body1" hierarchy="secondary">
              This will delete the Traditional Retirement, Roth Retirement, and
              Taxable Investments values and return Invest to the simple Income
              minus Expenses amount.
            </Text>
          </Stack>
          <div className="flex justify-end gap-2">
            <Button variant="tertiary" onClick={onCancel}>
              Keep breakdown
            </Button>
            <Button variant="primary" onClick={onConfirm}>
              Remove breakdown
            </Button>
          </div>
        </Stack>
      </div>
    </div>,
    document.body
  );
}
