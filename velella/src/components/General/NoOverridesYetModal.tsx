import { createPortal } from "react-dom";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { MODAL_PORTAL_BACKDROP_STYLE } from "../../lib/modalPortalBackdropStyle";

interface NoOverridesYetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NoOverridesYetModal({
  isOpen,
  onClose,
}: NoOverridesYetModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={MODAL_PORTAL_BACKDROP_STYLE}
      role="dialog"
      aria-modal="true"
      aria-label="No overrides yet"
    >
      <div className="mx-4 max-w-md rounded border border-border-secondary bg-bg-primary p-6 shadow-lg">
        <Stack gap="lg">
          <Text size="h3" hierarchy="primary" as="h2">
            No overrides yet
          </Text>
          <Text size="body1" hierarchy="secondary">
            Year-level federal tax overrides are not implemented in this step yet.
          </Text>
          <div className="flex justify-end">
            <Button variant="primary" size="lg" onClick={onClose}>
              OK
            </Button>
          </div>
        </Stack>
      </div>
    </div>,
    document.body
  );
}
