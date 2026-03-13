import { useRef, useState } from "react";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { HelpCircle, Unlink, RotateCcw } from "lucide-react";
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
  /** When true, field is disabled and shows override button. */
  eraLocked?: boolean;
  /** When true, field is editable and shows re-link button. */
  eraOverride?: boolean;
  onOverride?: () => void;
  onRelink?: () => void;
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
  eraLocked,
  eraOverride,
  onOverride,
  onRelink,
}: YearFactsFieldProps) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement | null>(null);

  const isEditable = Boolean(onCommit) && !eraLocked;
  const showOverrideButton = eraLocked && onOverride;
  const showRelinkButton = eraOverride && onRelink;

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

          <div className="flex items-center gap-1 shrink-0">
            {showOverrideButton && (
              <Button
                variant="tertiary"
                size="md"
                icon={<Unlink size={16} />}
                aria-label={`Override ${title} from era`}
                onClick={onOverride}
              />
            )}
            {showRelinkButton && (
              <Button
                variant="tertiary"
                size="md"
                icon={<RotateCcw size={16} />}
                aria-label={`Re-link ${title} to era`}
                onClick={onRelink}
              />
            )}
            <span ref={triggerRef}>
              <Button
                variant="tertiary"
                size="sm"
                icon={<HelpCircle size={16} />}
                aria-label={`Show description for ${title}`}
                onClick={() => setIsDescriptionOpen((open) => !open)}
              />
            </span>
          </div>

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

        {isEditable ? (
          <EditableAmountCell
            value={value}
            onCommit={onCommit!}
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
