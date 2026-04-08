import { ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { HouseholdMember } from "../../types/scenario";
import { ageInYear } from "../../lib/age";
import type { YearDropdownOption } from "../../lib/eraHelpers";
import { sortHouseholdMembersIncomeEarnersFirst } from "../../lib/sortHouseholdMembers";
import {
  getTertiaryNativeSelectShellClassName,
  tertiaryNativeSelectTriggerInnerClassName,
} from "./TertiaryNativeSelect";

export interface DropdownYearSelectorProps {
  value: number | null;
  yearOptions: YearDropdownOption[];
  householdMembers: HouseholdMember[];
  onValueChange: (year: number) => void;
  ariaLabel: string;
  placeholder: string;
  disabled?: boolean;
  className?: string;
  /** Extra classes for the visible year label (e.g. tabular-nums). */
  labelClassName?: string;
}

export default function DropdownYearSelector({
  value,
  yearOptions,
  householdMembers,
  onValueChange,
  ariaLabel,
  placeholder,
  disabled = false,
  className = "",
  labelClassName = "",
}: DropdownYearSelectorProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();
  const [menuBox, setMenuBox] = useState({
    top: 0,
    left: 0,
    minWidth: 280,
    maxHeight: 360,
  });

  const membersOrdered = useMemo(
    () => sortHouseholdMembersIncomeEarnersFirst(householdMembers),
    [householdMembers]
  );

  const computeMenuBox = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const maxH = Math.min(window.innerHeight * 0.55, 360);
    const vw = window.innerWidth;
    const minW = Math.max(r.width, 320);
    let left = r.left;
    if (left + minW > vw - 16) {
      left = Math.max(16, vw - 16 - minW);
    }
    setMenuBox({
      top: r.bottom + 4,
      left,
      minWidth: minW,
      maxHeight: maxH,
    });
  }, []);

  const scrollSelectedYearToTop = useCallback(() => {
    const menu = menuRef.current;
    if (!menu) return;
    if (value === null || value === undefined || Number.isNaN(value)) return;
    const row = menu.querySelector(
      `tbody tr[data-year="${value}"]`
    ) as HTMLElement | null;
    if (!row) return;

    const thead = menu.querySelector("thead");
    const headerH = thead?.getBoundingClientRect().height ?? 0;
    const rowTopInContent =
      row.getBoundingClientRect().top -
      menu.getBoundingClientRect().top +
      menu.scrollTop;
    menu.scrollTop = Math.max(0, rowTopInContent - headerH);
  }, [value]);

  /** Reset when menu closes so the next open scrolls to selection again. */
  const didScrollToSelectionOnOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      didScrollToSelectionOnOpenRef.current = false;
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!open || disabled) return;
    computeMenuBox();
  }, [open, disabled, computeMenuBox, yearOptions.length]);

  /**
   * Scroll the selected year into view once when the menu opens.
   * Must not depend on `menuBox` or run on reposition — that was resetting
   * `scrollTop` on every window scroll/resize and locked the list.
   */
  useLayoutEffect(() => {
    if (!open || disabled) return;
    if (didScrollToSelectionOnOpenRef.current) return;
    const id = requestAnimationFrame(() => {
      scrollSelectedYearToTop();
      didScrollToSelectionOnOpenRef.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, [open, disabled, scrollSelectedYearToTop]);

  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (event: MouseEvent) => {
      const t = event.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const handleReposition = () => computeMenuBox();

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, computeMenuBox]);

  const displayLabel =
    value !== null && value !== undefined && !Number.isNaN(value)
      ? String(value)
      : placeholder;

  const shellClassName = getTertiaryNativeSelectShellClassName({
    disabled,
    className: ["inline-flex", className].filter(Boolean).join(" "),
  });

  const triggerButtonClassName = [
    getTertiaryNativeSelectShellClassName({
      variant: "menu-trigger",
      className: [
        "!min-w-0 cursor-pointer appearance-none border-0 p-0 shadow-none",
        "[-webkit-tap-highlight-color:transparent]",
        "[&::-moz-focus-inner]:border-0 [&::-moz-focus-inner]:p-0",
        "outline-none focus:outline-none",
        !open ? "focus:ring-0 focus:ring-offset-0" : "",
        "focus-visible:ring-2 focus-visible:ring-button-tertiary focus-visible:ring-offset-2",
        open
          ? "ring-2 ring-button-tertiary ring-offset-2"
          : "ring-0 ring-offset-0",
      ]
        .filter(Boolean)
        .join(" "),
    }),
    disabled ? "pointer-events-none" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const visibleLabelClassName = [
    tertiaryNativeSelectTriggerInnerClassName,
    labelClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="relative inline-flex min-w-0 shrink-0">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        className={disabled ? shellClassName : triggerButtonClassName}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? listId : undefined}
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
        }}
      >
        <span className={visibleLabelClassName}>
          <span className="tabular-nums">{displayLabel}</span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="shrink-0 text-current"
          />
        </span>
      </button>

      {open && !disabled ? (
        <div
          ref={menuRef}
          id={listId}
          className="fixed z-[200] overflow-auto rounded-md border border-border-secondary bg-bg-primary shadow-md"
          style={{
            top: menuBox.top,
            left: menuBox.left,
            minWidth: menuBox.minWidth,
            maxHeight: menuBox.maxHeight,
          }}
        >
          <table
            role="grid"
            aria-label={`${ariaLabel} options`}
            className="w-full min-w-max border-collapse text-left text-body-2 text-text-primary"
          >
            <thead className="sticky top-0 z-10 border-b border-border-secondary bg-bg-secondary">
              <tr>
                <th
                  scope="col"
                  className="whitespace-nowrap px-2 py-1.5 font-medium tabular-nums"
                >
                  Year
                </th>
                {membersOrdered.map((m) => (
                  <th
                    key={m.id}
                    scope="col"
                    className="max-w-[8rem] whitespace-normal px-2 py-1.5 font-medium"
                  >
                    {m.nickname || "Member"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {yearOptions.map((opt) => (
                <tr
                  key={opt.year}
                  data-year={opt.year}
                  role="row"
                  aria-selected={value === opt.year}
                  aria-disabled={opt.disabled}
                  title={opt.disabled ? opt.disabledReason : undefined}
                  className={
                    opt.disabled
                      ? "cursor-not-allowed bg-bg-primary text-text-tertiary"
                      : "cursor-pointer bg-bg-primary text-text-primary hover:bg-bg-secondary"
                  }
                  onMouseDown={(e) => {
                    if (opt.disabled) return;
                    e.preventDefault();
                  }}
                  onClick={() => {
                    if (opt.disabled) return;
                    onValueChange(opt.year);
                    setOpen(false);
                  }}
                >
                  <td className="whitespace-nowrap px-2 py-1.5 tabular-nums">
                    {opt.year}
                  </td>
                  {membersOrdered.map((m) => (
                    <td
                      key={m.id}
                      className="whitespace-nowrap px-2 py-1.5 text-center tabular-nums"
                    >
                      {ageInYear(m.birthday, opt.year)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
