import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

const INPUT_CLASS = [
  "w-full rounded",
  "bg-input-bg border border-input-border",
  "px-3 py-2",
  "text-right text-body-1 text-text-primary",
  "placeholder:text-input-placeholder",
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-input focus-visible:ring-offset-2",
  "disabled:opacity-60 disabled:cursor-not-allowed",
].join(" ");

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function formatPct1(p: number): string {
  return round1(p).toFixed(1);
}

/** Next half-integer (.0 / .5) strictly above `v` (after rounding to 0.1). */
function nextGridUp(v: number): number {
  const r = round1(v);
  let next = Math.ceil(r * 2 - 1e-9) / 2;
  if (next <= r) {
    next += 0.5;
  }
  return round1(next);
}

/** Next half-integer (.0 / .5) strictly below `v` (after rounding to 0.1). */
function nextGridDown(v: number): number {
  const r = round1(v);
  let next = Math.floor(r * 2 + 1e-9) / 2;
  if (next >= r) {
    next -= 0.5;
  }
  return round1(next);
}

function isSpinnerStepDelta(prev: number, next: number): "up" | "down" | null {
  const d = next - prev;
  if (Math.abs(d - 0.5) < 1e-4) {
    return "up";
  }
  if (Math.abs(d + 0.5) < 1e-4) {
    return "down";
  }
  return null;
}

interface AssumptionsSteppedPercentInputProps {
  /** Display percent, e.g. 7.1 for 7.1% */
  valuePercent: number;
  onCommitPercent: (pct: number) => void;
  ariaLabel: string;
}

export default function AssumptionsSteppedPercentInput({
  valuePercent,
  onCommitPercent,
  ariaLabel,
}: AssumptionsSteppedPercentInputProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(() => formatPct1(valuePercent));
  const lastCommittedRef = useRef(round1(valuePercent));

  useEffect(() => {
    lastCommittedRef.current = round1(valuePercent);
    if (!focused) {
      setDraft(formatPct1(valuePercent));
    }
  }, [valuePercent, focused]);

  const commitPercent = useCallback(
    (pct: number) => {
      const r = round1(pct);
      onCommitPercent(r);
      lastCommittedRef.current = r;
      setDraft(formatPct1(r));
    },
    [onCommitPercent]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const ie = e.nativeEvent as InputEvent;
    const inputType = ie.inputType ?? "";

    setDraft(raw);
    if (raw.endsWith(".") || raw === "-" || raw === "-.") {
      return;
    }
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) {
      return;
    }
    const prev = lastCommittedRef.current;

    if (inputType === "stepUp" || inputType === "stepForward") {
      commitPercent(nextGridUp(prev));
      return;
    }
    if (inputType === "stepDown" || inputType === "stepBackward") {
      commitPercent(nextGridDown(prev));
      return;
    }

    const stepKind = isSpinnerStepDelta(prev, round1(n));
    if (stepKind === "up") {
      commitPercent(nextGridUp(prev));
      return;
    }
    if (stepKind === "down") {
      commitPercent(nextGridDown(prev));
      return;
    }
  };

  const handleBlur = () => {
    setFocused(false);
    const n = parseFloat(draft);
    if (Number.isFinite(n)) {
      commitPercent(n);
    } else {
      setDraft(formatPct1(lastCommittedRef.current));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") {
      return;
    }
    e.preventDefault();
    const parsed = parseFloat(draft);
    const v = Number.isFinite(parsed) ? round1(parsed) : lastCommittedRef.current;
    if (e.key === "ArrowUp") {
      commitPercent(nextGridUp(v));
    } else {
      commitPercent(nextGridDown(v));
    }
  };

  const displayValue = focused ? draft : formatPct1(valuePercent);

  return (
    <div className="flex shrink-0 items-center gap-1">
      <div className="w-[10.1875rem] shrink-0">
        <input
          type="number"
          step={0.5}
          aria-label={ariaLabel}
          className={INPUT_CLASS}
          value={displayValue}
          onChange={handleChange}
          onFocus={() => {
            setFocused(true);
            setDraft(formatPct1(lastCommittedRef.current));
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </div>
      <span
        className="shrink-0 text-body-1 text-text-primary"
        aria-hidden
      >
        %
      </span>
    </div>
  );
}
