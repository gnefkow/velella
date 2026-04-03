import { createPortal } from "react-dom";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { MODAL_PORTAL_BACKDROP_STYLE } from "../../lib/modalPortalBackdropStyle";

interface FilingStatusApplyModalProps {
  isOpen: boolean;
  selectionLabel: string;
  onApplyToAll: () => void;
  onApplyHereOnly: () => void;
  onCancel: () => void;
}

export default function FilingStatusApplyModal({
  isOpen,
  selectionLabel,
  onApplyToAll,
  onApplyHereOnly,
  onCancel,
}: FilingStatusApplyModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={MODAL_PORTAL_BACKDROP_STYLE}
      role="dialog"
      aria-modal="true"
      aria-label="Apply this filing status to all years and eras?"
    >
      <div className="mx-4 max-w-md rounded border border-border-secondary bg-bg-primary p-6 shadow-lg">
        <Stack gap="lg">
          <Text
            size="h3"
            hierarchy="primary"
            as="h2"
          >
            Apply this to all years and eras?
          </Text>
          <Text size="body1" hierarchy="secondary">
            Would you like to set all years and eras on your timeline to have{" "}
            {selectionLabel} as your tax filing status?
          </Text>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="tertiary" size="lg" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="tertiary" size="lg" onClick={onApplyHereOnly}>
              No, only apply here
            </Button>
            <Button variant="primary" size="lg" onClick={onApplyToAll}>
              Yes, apply to all
            </Button>
          </div>
        </Stack>
      </div>
    </div>,
    document.body
  );
}
