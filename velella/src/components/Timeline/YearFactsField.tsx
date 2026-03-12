import { useRef, useState } from "react";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { HelpCircle } from "lucide-react";
import InfoBubble from "../General/InfoBubble";
import EditableAmountCell, { type FocusAndEditHandle } from "./EditableAmountCell";

interface YearFactsFieldProps {
  title: string;
  description: string;
  value: number;
  onCommit?: (value: number) => void;
  inputType?: "money" | "text";
  cellKey?: string;
  registerCell?: (key: string, handle: FocusAndEditHandle | null) => void;
  onFocusNext?: (direction: "down" | "right") => boolean | void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function YearFactsField({
  title,
  description,
  value,
  onCommit,
  inputType = "money",
  cellKey,
  registerCell,
  onFocusNext,
}: YearFactsFieldProps) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement | null>(null);

  return (
    <div className="min-w-0 rounded border border-border-secondary bg-bg-primary px-4 py-4">
      <Stack gap="sm" className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Text
            size="body1"
            hierarchy="primary"
            className="min-w-0 leading-tight"
          >
            {title}
          </Text>

          <span ref={triggerRef}>
            <Button
              variant="tertiary"
              size="sm"
              icon={<HelpCircle size={16} />}
              aria-label={`Show description for ${title}`}
              onClick={() => setIsDescriptionOpen((open) => !open)}
            />
          </span>

          <InfoBubble
            isOpen={isDescriptionOpen}
            anchorRef={triggerRef}
            onClose={() => setIsDescriptionOpen(false)}
          >
            <Text size="body2" hierarchy="secondary" className="leading-tight">
              {description}
            </Text>
          </InfoBubble>
        </div>

        {onCommit ? (
          <EditableAmountCell
            value={value}
            onCommit={onCommit}
            inputType={inputType}
            cellKey={cellKey}
            registerCell={registerCell}
            onFocusNext={onFocusNext}
          />
        ) : (
          <div className="rounded border border-border-secondary bg-bg-secondary px-3 py-2">
            <Text size="body1" hierarchy="primary">
              {formatCurrency(value)}
            </Text>
          </div>
        )}
      </Stack>
    </div>
  );
}
