import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { showModalDebugToast } from "../../lib/modalDebugToast";
import { MODAL_PORTAL_BACKDROP_STYLE } from "../../lib/modalPortalBackdropStyle";

interface EraDeleteModalProps {
  isOpen: boolean;
  eraName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function EraDeleteModal({
  isOpen,
  eraName,
  onConfirm,
  onCancel,
}: EraDeleteModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    showModalDebugToast("Modal fired");
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={MODAL_PORTAL_BACKDROP_STYLE}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
    >
      <div className="mx-4 max-w-md rounded border border-border-secondary bg-bg-primary p-6 shadow-lg">
        <Stack gap="lg">
          <Text size="h3" hierarchy="primary">
            Are you sure you want to delete {eraName || "this era"}?
          </Text>
          <div className="flex gap-2 justify-end">
            <Button variant="tertiary" onClick={onCancel}>
              Nevermind, don&apos;t delete it!
            </Button>
            <Button variant="destructive-secondary" onClick={onConfirm}>
              Yes, delete it
            </Button>
          </div>
        </Stack>
      </div>
    </div>,
    document.body
  );
}
