import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { showModalDebugToast } from "../../lib/modalDebugToast";
import { MODAL_PORTAL_BACKDROP_STYLE } from "../../lib/modalPortalBackdropStyle";

interface ScenarioDetailsExitModalProps {
  isOpen: boolean;
  onSaveAndLeave: () => void | Promise<void>;
  onDiscardAndLeave: () => void;
  onCancel: () => void;
}

export default function ScenarioDetailsExitModal({
  isOpen,
  onSaveAndLeave,
  onDiscardAndLeave,
  onCancel,
}: ScenarioDetailsExitModalProps) {
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
      aria-label="Leave scenario details?"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="mx-4 max-w-md rounded border border-border-secondary bg-bg-primary p-6 shadow-lg">
        <Stack gap="lg">
          <Text size="h3" hierarchy="primary">
            Leave scenario details?
          </Text>
          <Text size="body1" hierarchy="secondary">
            You have unsaved changes on your scenario details. Would you like
            to save your changes?
          </Text>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={onDiscardAndLeave}>
              No, discard these changes.
            </Button>
            <Button variant="primary" onClick={() => void onSaveAndLeave()}>
              Yes, Update Scenario
            </Button>
          </div>
        </Stack>
      </div>
    </div>,
    document.body
  );
}
