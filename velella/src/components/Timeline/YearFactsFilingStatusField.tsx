import { useRef, useState } from "react";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { HelpCircle, RotateCcw, Unlink } from "lucide-react";
import type { FilingStatus } from "../../types/scenario";
import {
  FILING_STATUS_SELECT_OPTIONS,
  labelForFilingStatus,
  TAX_FILING_STATUS_SELECT_CLASSNAME,
} from "../../lib/filingStatus";
import InfoBubble from "../General/InfoBubble";
import TertiaryNativeSelect from "../ui/TertiaryNativeSelect";

interface YearFactsFilingStatusFieldProps {
  title: string;
  description: string;
  value: FilingStatus;
  eraLocked?: boolean;
  eraOverride?: boolean;
  onOverride?: () => void;
  onRelink?: () => void;
  /** Fired when the user picks a different status from the dropdown. */
  onRequestChange: (next: FilingStatus) => void;
}

export default function YearFactsFilingStatusField({
  title,
  description,
  value,
  eraLocked,
  eraOverride,
  onOverride,
  onRelink,
  onRequestChange,
}: YearFactsFilingStatusFieldProps) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement | null>(null);

  const isEditable = !eraLocked;
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

          <div className="flex shrink-0 items-center gap-1">
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
          <TertiaryNativeSelect
            ariaLabel={title}
            value={value}
            placeholder="Status"
            options={FILING_STATUS_SELECT_OPTIONS}
            className={`${TAX_FILING_STATUS_SELECT_CLASSNAME} min-w-0 w-full max-w-full`}
            onValueChange={(next) => {
              if (next === value) return;
              onRequestChange(next as FilingStatus);
            }}
          />
        ) : (
          <div className="rounded border border-border-secondary bg-bg-secondary px-3 py-2">
            <Text size="body1" hierarchy="primary">
              {labelForFilingStatus(value)}
            </Text>
          </div>
        )}
      </Stack>
    </div>
  );
}
