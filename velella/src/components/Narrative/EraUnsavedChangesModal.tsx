import { createPortal } from "react-dom";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";

interface EraUnsavedChangesModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export default function EraUnsavedChangesModal({
  isOpen,
  onSave,
  onDiscard,
}: EraUnsavedChangesModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
    >
      <div className="mx-4 max-w-md rounded border border-border-secondary bg-bg-primary p-6 shadow-lg">
        <Stack gap="lg">
          <Text size="h3" hierarchy="primary">
            Do you want to save?
          </Text>
          <Text size="body1" hierarchy="secondary">
            You have unsaved changes. Save them before closing?
          </Text>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={onDiscard}>
              Discard Changes
            </Button>
            <Button variant="primary" onClick={onSave}>
              Save Changes
            </Button>
          </div>
        </Stack>
      </div>
    </div>,
    document.body
  );
}
