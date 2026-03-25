import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "../../../../../counterfoil-kit/src/index.ts";
import { RotateCcw, X } from "lucide-react";
import { MODAL_PORTAL_BACKDROP_STYLE } from "../../lib/modalPortalBackdropStyle";
import EraOverrideLinkedInputRow from "./EraOverrideLinkedInputRow";
import EraPaneAmountInput from "./EraPaneAmountInput";

export type EraOverridesModalSaveResult =
  | { enabled: true; valuesByYear: Record<number, number> }
  | { enabled: false; linkedValue: number };

interface EraOverridesModalProps {
  isOpen: boolean;
  fieldLabel: string;
  yearRowLabel: (year: number) => string;
  eraNickname: string;
  eraStartYear: number | null;
  eraEndYear: number | null;
  eraYears: number[];
  isInitiallyOverridden: boolean;
  initialYearValues: Record<number, number>;
  initialLinkedValue: number;
  onSave: (result: EraOverridesModalSaveResult) => void;
  onCancel: () => void;
}

function formatEraSubtitle(
  nickname: string,
  startYear: number | null,
  endYear: number | null
): string {
  const name = nickname.trim() || "Untitled";
  const years =
    startYear != null && endYear != null
      ? `${startYear} - ${endYear}`
      : "set years in header";
  return `${name} Era, ${years}`;
}

interface EraOverrideToggleProps {
  pressed: boolean;
  onPressedChange: (next: boolean) => void;
  labelledBy: string;
  describedBy: string;
}

function EraOverrideToggle({
  pressed,
  onPressedChange,
  labelledBy,
  describedBy,
}: EraOverrideToggleProps) {
  const toggle = useCallback(() => {
    onPressedChange(!pressed);
  }, [onPressedChange, pressed]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={pressed}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggle();
        }
      }}
      className={[
        "flex h-[24px] w-[44px] shrink-0 items-center rounded-full p-[2px] transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-input focus-visible:ring-offset-2",
        pressed ? "justify-end bg-accent-primary" : "justify-start bg-bg-tertiary",
      ].join(" ")}
    >
      <span
        className="pointer-events-none h-[20px] w-[20px] shrink-0 rounded-full bg-bg-primary shadow-[0px_1px_3px_0px_rgba(16,24,40,0.1),0px_1px_2px_0px_rgba(16,24,40,0.06)]"
        aria-hidden
      />
    </button>
  );
}

export default function EraOverridesModal({
  isOpen,
  fieldLabel,
  yearRowLabel,
  eraNickname,
  eraStartYear,
  eraEndYear,
  eraYears,
  isInitiallyOverridden,
  initialYearValues,
  initialLinkedValue,
  onSave,
  onCancel,
}: EraOverridesModalProps) {
  const [draftEnabled, setDraftEnabled] = useState(isInitiallyOverridden);
  const [draftValuesByYear, setDraftValuesByYear] = useState<
    Record<number, number>
  >(initialYearValues);
  const [draftLinkedValue, setDraftLinkedValue] = useState(initialLinkedValue);
  const draftLinkedValueRef = useRef(draftLinkedValue);
  draftLinkedValueRef.current = draftLinkedValue;

  const overrideToggleLabelId = useId();
  const overrideToggleDescId = useId();

  const orderedYears = useMemo(
    () => [...eraYears].sort((a, b) => a - b),
    [eraYears]
  );

  const handleSave = useCallback(() => {
    if (draftEnabled) {
      onSave({
        enabled: true,
        valuesByYear: Object.fromEntries(
          orderedYears
            .filter((year) => draftValuesByYear[year] !== undefined)
            .map((year) => [year, draftValuesByYear[year]])
        ),
      });
      return;
    }

    onSave({
      enabled: false,
      linkedValue: draftLinkedValue,
    });
  }, [draftEnabled, draftLinkedValue, draftValuesByYear, onSave, orderedYears]);

  const handleToggleChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setDraftEnabled(false);
        setDraftLinkedValue(initialLinkedValue);
        return;
      }

      setDraftEnabled(true);
      setDraftValuesByYear((current) => {
        const hasCurrentYearValues = orderedYears.every(
          (year) => current[year] !== undefined
        );
        if (hasCurrentYearValues) {
          return current;
        }

        const seed = draftLinkedValueRef.current;
        return {
          ...Object.fromEntries(orderedYears.map((year) => [year, seed])),
          ...current,
        };
      });
    },
    [initialLinkedValue, orderedYears]
  );

  if (!isOpen) {
    return null;
  }

  const eraSubtitle = formatEraSubtitle(
    eraNickname,
    eraStartYear,
    eraEndYear
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      style={MODAL_PORTAL_BACKDROP_STYLE}
      role="dialog"
      aria-modal="true"
      aria-labelledby="era-overrides-modal-title"
    >
      <div className="relative mx-[16px] w-full max-w-[28rem] rounded-[16px] border border-border-secondary bg-bg-primary px-[36px] pt-[16px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06),0px_4px_8px_0px_rgba(0,0,0,0.1)]">
        <button
          type="button"
          aria-label="Close overrides dialog"
          onClick={onCancel}
          className={[
            "absolute right-[16px] top-[16px] inline-flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[6px] border-0 bg-transparent p-0",
            "text-text-secondary transition-colors hover:bg-bg-primary-hover hover:text-text-primary",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-input focus-visible:ring-offset-2",
          ].join(" ")}
        >
          <X size={20} aria-hidden />
        </button>

        <div className="flex w-full flex-col gap-[4px] py-[16px] pr-[40px]">
          <h2
            id="era-overrides-modal-title"
            className="m-0 text-left text-h3 font-bold text-text-primary"
          >
            {fieldLabel}
          </h2>
          <p className="m-0 text-body-2 text-text-tertiary">{eraSubtitle}</p>
        </div>

        <div className="flex w-full items-center gap-[36px] border-y border-border-tertiary py-[16px]">
          <div className="flex min-w-0 flex-1 flex-col gap-0 text-left">
            <p
              id={overrideToggleLabelId}
              className="m-0 w-full text-left text-body-1 font-semibold text-text-primary"
            >
              Override {fieldLabel}
            </p>
            <p
              id={overrideToggleDescId}
              className="m-0 pt-[2px] text-body-2 text-text-tertiary"
            >
              Enter specific {fieldLabel} values for years in this era.
            </p>
          </div>
          <EraOverrideToggle
            pressed={draftEnabled}
            onPressedChange={handleToggleChange}
            labelledBy={overrideToggleLabelId}
            describedBy={overrideToggleDescId}
          />
        </div>

        {draftEnabled ? (
          <div className="flex w-full flex-col gap-2 py-[16px]">
            {orderedYears.map((year) => (
              <div
                key={year}
                className="flex h-10 w-full items-center justify-between px-1"
              >
                <p className="m-0 text-body-1 text-text-primary">
                  {yearRowLabel(year)}
                </p>
                <EraPaneAmountInput
                  label={yearRowLabel(year)}
                  value={
                    draftValuesByYear[year] ?? initialLinkedValue
                  }
                  onCommit={(value) =>
                    setDraftValuesByYear((current) => ({
                      ...current,
                      [year]: value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <EraOverrideLinkedInputRow
            fieldLabel={fieldLabel}
            eraStartYear={eraStartYear}
            eraEndYear={eraEndYear}
            value={draftLinkedValue}
            onCommit={(value) => setDraftLinkedValue(value)}
          />
        )}

        <div className="flex w-full items-center justify-between border-t border-border-secondary py-[16px]">
          <Button variant="tertiary" size="lg" onClick={onCancel}>
            <span className="inline-flex items-center gap-[var(--button-icon-gap)]">
              <RotateCcw size={18} className="shrink-0" aria-hidden />
              Cancel
            </span>
          </Button>
          <Button variant="primary" size="lg" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
