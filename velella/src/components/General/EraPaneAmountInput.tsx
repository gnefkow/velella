import { useCallback, useEffect, useRef, useState } from "react";
import { Link2, Unlink } from "lucide-react";

interface EraPaneAmountInputProps {
  value: number;
  onCommit: (value: number) => void;
  label: string;
  onLinkClick?: () => void;
  /** Icon for year override action; default matches other era rows. */
  linkIcon?: "link" | "unlink";
  /** Overrides default "Year overrides for {label}" on the link button. */
  linkAriaLabel?: string;
}

function digitsFromNumber(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  return Math.floor(value).toString();
}

function parseMoneyValue(digits: string): number {
  if (!digits) {
    return 0;
  }

  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Whole dollars only — same rules as `EditableAmountCell` (no `.00` in the string). */
function formatMoneyDisplay(digits: string): string {
  if (!digits) {
    return "";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(digits));
}

export default function EraPaneAmountInput({
  value,
  onCommit,
  label,
  onLinkClick,
  linkIcon = "link",
  linkAriaLabel,
}: EraPaneAmountInputProps) {
  const [rawValue, setRawValue] = useState(digitsFromNumber(value));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const moveCaretToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input) {
        return;
      }
      const end = input.value.length;
      input.setSelectionRange(end, end);
    });
  }, []);

  useEffect(() => {
    setRawValue(digitsFromNumber(value));
  }, [value]);

  const syncedRawValue = digitsFromNumber(value);

  const commit = useCallback(() => {
    const nextValue = parseMoneyValue(rawValue);
    setRawValue(digitsFromNumber(nextValue));
    if (nextValue !== value) {
      onCommit(nextValue);
    }
  }, [onCommit, rawValue, value]);

  const displayValue = formatMoneyDisplay(
    isFocused ? rawValue : syncedRawValue
  );

  return (
    <div className="flex max-w-full shrink-0 items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        aria-label={label}
        value={displayValue}
        onChange={(event) => {
          const digitsOnly = event.target.value.replace(/\D/g, "");
          setRawValue(digitsOnly);
          moveCaretToEnd();
        }}
        onFocus={() => {
          setIsFocused(true);
          setRawValue(syncedRawValue);
          moveCaretToEnd();
        }}
        onBlur={() => {
          setIsFocused(false);
          commit();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
            event.currentTarget.blur();
          }

          if (event.key === "Escape") {
            event.preventDefault();
            setRawValue(digitsFromNumber(value));
            event.currentTarget.blur();
          }
        }}
        className="min-h-10 min-w-0 w-[11.6875rem] rounded-md text-right text-[16px] leading-6 text-text-placeholder"
      />
      {onLinkClick ? (
        <button
          type="button"
          aria-label={linkAriaLabel ?? `Year overrides for ${label}`}
          onClick={(e) => {
            e.preventDefault();
            onLinkClick();
          }}
          className={[
            "inline-flex size-5 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 shadow-none appearance-none",
            "text-text-secondary transition-colors hover:bg-bg-primary-hover hover:text-text-primary",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-input focus-visible:ring-offset-2",
          ].join(" ")}
        >
          {linkIcon === "unlink" ? (
            <Unlink size={16} aria-hidden />
          ) : (
            <Link2 size={16} aria-hidden />
          )}
        </button>
      ) : null}
    </div>
  );
}
