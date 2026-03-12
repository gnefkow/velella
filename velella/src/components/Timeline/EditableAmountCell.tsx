import { useState, useCallback, useRef, useEffect } from "react";

export type FocusAndEditHandle = { focusAndEdit: () => void };

interface EditableAmountCellProps {
  value: number;
  onCommit: (value: number) => Promise<void> | void;
  inputType?: "money" | "text";
  /** For keyboard navigation: register this cell so parent can focus it. */
  cellKey?: string;
  registerCell?: (key: string, handle: FocusAndEditHandle | null) => void;
  onFocusNext?: (direction: "down" | "right") => boolean | void;
}

function digitsFromNumber(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  return Math.floor(value).toString();
}

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

function parseMoneyValue(digits: string): number {
  if (!digits) {
    return 0;
  }

  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}

export default function EditableAmountCell({
  value,
  onCommit,
  inputType = "money",
  cellKey,
  registerCell,
  onFocusNext,
}: EditableAmountCellProps) {
  const [rawValue, setRawValue] = useState(
    inputType === "money" ? digitsFromNumber(value) : value.toString()
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const suppressBlurCommitRef = useRef(false);

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

  const handleRef = useRef<FocusAndEditHandle>({
    focusAndEdit: () => {
      inputRef.current?.focus();
      moveCaretToEnd();
    },
  });

  useEffect(() => {
    if (cellKey && registerCell) {
      registerCell(cellKey, handleRef.current);
      return () => registerCell(cellKey, null);
    }
  }, [cellKey, registerCell]);

  useEffect(() => {
    setRawValue(inputType === "money" ? digitsFromNumber(value) : value.toString());
  }, [inputType, value]);

  const commit = useCallback((direction?: "down" | "right") => {
    const n =
      inputType === "money"
        ? parseMoneyValue(rawValue)
        : Number.parseFloat(rawValue) || 0;
    if (inputType === "money") {
      setRawValue(digitsFromNumber(n));
    }
    if (n !== value) {
      void Promise.resolve(onCommit(n)).catch(() => undefined);
    }
    if (direction) {
      const didMoveFocus = onFocusNext?.(direction);
      if (!didMoveFocus) {
        inputRef.current?.blur();
      }
    }
  }, [inputType, onCommit, onFocusNext, rawValue, value]);

  const revert = useCallback(() => {
    setRawValue(inputType === "money" ? digitsFromNumber(value) : value.toString());
    inputRef.current?.blur();
  }, [inputType, value]);

  const handleBlur = useCallback(() => {
    if (suppressBlurCommitRef.current) {
      suppressBlurCommitRef.current = false;
      return;
    }
    commit();
  }, [commit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      suppressBlurCommitRef.current = true;
      commit("down");
    } else if (e.key === "Tab") {
      if (onFocusNext) {
        e.preventDefault();
        suppressBlurCommitRef.current = true;
        commit("right");
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      revert();
    }
  };

  const displayValue = inputType === "money" ? formatMoneyDisplay(rawValue) : rawValue;

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={(e) => {
        if (inputType === "money") {
          const digitsOnly = e.target.value.replace(/\D/g, "");
          setRawValue(digitsOnly);
          moveCaretToEnd();
          return;
        }

        setRawValue(e.target.value);
      }}
      onFocus={() => moveCaretToEnd()}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-full min-w-0 rounded border border-input-border bg-input-bg px-3 py-2 text-right text-body-1 text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-input focus-visible:ring-offset-2"
    />
  );
}
