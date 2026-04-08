import { ChevronDown } from "lucide-react";

export type TertiaryNativeSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  title?: string;
};

export interface TertiaryNativeSelectProps {
  /** Selected value; `null` or `""` shows the placeholder row as selected. */
  value: string | null;
  options: TertiaryNativeSelectOption[];
  placeholder: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  /** Extra classes for the visible label row (e.g. `tabular-nums`). */
  labelClassName?: string;
}

const shellBaseClasses =
  "relative inline-flex min-w-[4.25rem] shrink-0 items-stretch " +
  "rounded-[var(--button-border-radius)] " +
  "outline-none [outline-style:none] " +
  "transition-colors duration-150 ";

const shellInteractiveClasses =
  "bg-[var(--button-tertiary-bg)] text-[var(--button-tertiary-text)] " +
  "hover:bg-[var(--button-tertiary-bg-hover)] " +
  "active:bg-[var(--button-tertiary-bg-active)] " +
  "focus-within:ring-2 focus-within:ring-button-tertiary focus-within:ring-offset-2 " +
  "active:ring-2 active:ring-button-tertiary active:ring-offset-2";

/** Same colors/hover as tertiary select, without rings (for `<button>` triggers — use `focus-visible:ring-*` on the button). */
const shellInteractiveMenuTriggerClasses =
  "bg-[var(--button-tertiary-bg)] text-[var(--button-tertiary-text)] " +
  "hover:bg-[var(--button-tertiary-bg-hover)] " +
  "active:bg-[var(--button-tertiary-bg-active)]";

const shellDisabledClasses =
  "cursor-not-allowed bg-[var(--button-tertiary-bg-disabled)] " +
  "text-[var(--button-tertiary-text-disabled)] pointer-events-none " +
  "hover:bg-[var(--button-tertiary-bg-disabled)] " +
  "active:bg-[var(--button-tertiary-bg-disabled)]";

const labelRowClasses =
  "pointer-events-none relative z-0 flex items-center justify-center " +
  "gap-[var(--button-icon-gap)] px-[var(--button-padding-x-md)] py-[var(--button-padding-y-md)] " +
  "text-button-md";

/**
 * Closed-state shell for controls that should match `TertiaryNativeSelect` (e.g. custom menu triggers).
 *
 * **Native `<button>` vs this component:** `TertiaryNativeSelect` wraps a `<div>` plus an invisible
 * `<select>`, so it never picks up the browser’s default button border / inner padding. If you reuse
 * this shell on a real `<button>`, you will often see a ~1–2px gray “outline” (UA border or Firefox
 * `::-moz-focus-inner`) unless you reset it. Prefer `variant: "menu-trigger"` and, on the `<button>`,
 * combine with something like: `border-0 p-0 appearance-none shadow-none`,
 * `[&::-moz-focus-inner]:border-0 [&::-moz-focus-inner]:p-0`,
 * `[-webkit-tap-highlight-color:transparent]`, `outline-none`, optional `focus:ring-0` when closed,
 * and `focus-visible:ring-2 focus-visible:ring-button-tertiary focus-visible:ring-offset-2` for
 * keyboard focus. See `GlobalNav` (⋯ menu trigger) for a working example.
 */
export function getTertiaryNativeSelectShellClassName(options?: {
  disabled?: boolean;
  className?: string;
  /**
   * `menu-trigger`: shell omits `focus-within` / `active` rings (use `focus-visible:ring-*` on the
   * `<button>` instead). Still apply the UA `<button>` resets described in the function JSDoc above.
   */
  variant?: "select" | "menu-trigger";
}): string {
  const disabled = options?.disabled ?? false;
  const interactive =
    options?.variant === "menu-trigger"
      ? shellInteractiveMenuTriggerClasses
      : shellInteractiveClasses;
  return [
    shellBaseClasses,
    disabled ? shellDisabledClasses : interactive,
    options?.className,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Inner row padding/typography for a clickable tertiary-style trigger (no `pointer-events-none`). */
export const tertiaryNativeSelectTriggerInnerClassName =
  "flex items-center justify-center gap-[var(--button-icon-gap)] " +
  "px-[var(--button-padding-x-md)] py-[var(--button-padding-y-md)] text-button-md";

const selectOverlayClasses =
  "absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none border-0 p-0 " +
  "opacity-0 outline-none [-webkit-tap-highlight-color:transparent] " +
  "focus:outline-none focus-visible:outline-none " +
  "disabled:cursor-not-allowed";

/**
 * Closed appearance matches counterfoil `Button` variant="tertiary" size="md".
 * Uses a native `<select>` so behavior stays accessible; the popup list is still
 * browser-native until a custom menu replaces it.
 */
export default function TertiaryNativeSelect({
  value,
  options,
  placeholder,
  onValueChange,
  ariaLabel,
  disabled = false,
  className = "",
  labelClassName = "",
}: TertiaryNativeSelectProps) {
  const controlledValue = value === null || value === "" ? "" : value;
  const selected = options.find((o) => o.value === controlledValue);
  const displayLabel =
    controlledValue !== "" ? (selected?.label ?? controlledValue) : placeholder;

  const shellClassName = getTertiaryNativeSelectShellClassName({
    disabled,
    className,
  });

  const visibleLabelClassName = [labelRowClasses, labelClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClassName}>
      <span className={visibleLabelClassName}>
        {displayLabel}
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="shrink-0 text-current"
        />
      </span>
      <select
        aria-label={ariaLabel}
        disabled={disabled}
        value={controlledValue}
        onChange={(event) => {
          const next = event.target.value;
          if (next !== "") {
            onValueChange(next);
          }
        }}
        className={selectOverlayClasses}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            title={option.title}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
