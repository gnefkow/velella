import { useRef, useState } from "react";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { HelpCircle, RotateCcw, Unlink } from "lucide-react";
import InfoBubble from "../General/InfoBubble";
import EditableAmountCell, { type FocusAndEditHandle } from "./EditableAmountCell";
import UseEstimatedFederalTaxControl from "../General/UseEstimatedFederalTaxControl";

interface YearFactsFederalTaxFieldProps {
  title: string;
  description: string;
  value: number;
  useEstimate: boolean;
  onToggleEstimate: (next: boolean) => void;
  onCommit?: (value: number) => void;
  cellKey?: string;
  registerCell?: (key: string, handle: FocusAndEditHandle | null) => void;
  onFocusNext?: (direction: "down" | "right") => boolean | void;
  eraLocked?: boolean;
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

export default function YearFactsFederalTaxField({
  title,
  description,
  value,
  useEstimate,
  onToggleEstimate,
  onCommit,
  cellKey,
  registerCell,
  onFocusNext,
  eraLocked,
  eraOverride,
  onOverride,
  onRelink,
}: YearFactsFederalTaxFieldProps) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement | null>(null);

  const showOverrideButton = eraLocked && onOverride;
  const showRelinkButton = eraOverride && onRelink;
  const isEditable = Boolean(onCommit) && !useEstimate;

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
            {showOverrideButton ? (
              <Button
                variant="tertiary"
                size="md"
                icon={<Unlink size={16} />}
                aria-label={`Override ${title} from era`}
                onClick={onOverride}
              />
            ) : null}
            {showRelinkButton ? (
              <Button
                variant="tertiary"
                size="md"
                icon={<RotateCcw size={16} />}
                aria-label={`Re-link ${title} to era`}
                onClick={onRelink}
              />
            ) : null}
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
            inputType="money"
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

        <UseEstimatedFederalTaxControl
          checked={useEstimate}
          onChange={onToggleEstimate}
        />
      </Stack>
    </div>
  );
}
