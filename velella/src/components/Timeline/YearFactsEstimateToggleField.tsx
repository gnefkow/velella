import { useRef, useState } from "react";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { HelpCircle, Unlink } from "lucide-react";
import InfoBubble from "../General/InfoBubble";
import UseEstimatedFederalTaxControl from "../General/UseEstimatedFederalTaxControl";

interface YearFactsEstimateToggleFieldProps {
  description: string;
  checked: boolean;
  disabled?: boolean;
  eraLocked?: boolean;
  onChange: (next: boolean) => void;
  onOverride?: () => void;
}

export default function YearFactsEstimateToggleField({
  description,
  checked,
  disabled = false,
  eraLocked = false,
  onChange,
  onOverride,
}: YearFactsEstimateToggleFieldProps) {
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
            Federal Tax Estimate
          </Text>

          <div className="flex items-center gap-1 shrink-0">
            {eraLocked && onOverride ? (
              <Button
                variant="tertiary"
                size="md"
                icon={<Unlink size={16} />}
                aria-label="Override Federal Tax Estimate from era"
                onClick={onOverride}
              />
            ) : null}
            <span ref={triggerRef}>
              <Button
                variant="tertiary"
                size="sm"
                icon={<HelpCircle size={16} />}
                aria-label="Show description for Federal Tax Estimate"
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

        <UseEstimatedFederalTaxControl
          checked={checked}
          disabled={disabled}
          onChange={onChange}
        />
      </Stack>
    </div>
  );
}
