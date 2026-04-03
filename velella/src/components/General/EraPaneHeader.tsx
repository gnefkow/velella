import { ChevronsRight, MoreHorizontal, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../../../../counterfoil-kit/src/index.ts";
import type { YearDropdownOption } from "../../lib/eraHelpers";
import TertiaryNativeSelect, {
  type TertiaryNativeSelectOption,
} from "../ui/TertiaryNativeSelect";

interface EraPaneHeaderProps {
  nickname: string;
  description: string;
  startYear: number | null;
  endYear: number | null;
  startOptions: YearDropdownOption[];
  endOptions: YearDropdownOption[];
  onStartChange: (year: number) => void;
  onEndChange: (year: number) => void;
  onNicknameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onDelete?: () => void;
}

function mapYearOptionsToSelectOptions(
  options: YearDropdownOption[]
): TertiaryNativeSelectOption[] {
  return options.map((option) => ({
    value: String(option.year),
    label: String(option.year),
    disabled: option.disabled,
    title: option.disabledReason,
  }));
}

export default function EraPaneHeader({
  nickname,
  description,
  startYear,
  endYear,
  startOptions,
  endOptions,
  onStartChange,
  onEndChange,
  onNicknameChange,
  onDescriptionChange,
  onClose,
  onDelete,
}: EraPaneHeaderProps) {
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const nicknameInputRef = useRef<HTMLInputElement | null>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isEditingNickname) {
      nicknameInputRef.current?.focus();
      nicknameInputRef.current?.select();
    }
  }, [isEditingNickname]);

  useEffect(() => {
    if (isEditingDescription) {
      descriptionInputRef.current?.focus();
      descriptionInputRef.current?.select();
    }
  }, [isEditingDescription]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) {
        return;
      }

      setIsMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <div className="flex min-w-0 flex-col gap-3 border-b border-border-secondary bg-bg-primary pt-2 pb-6">
      <div className="flex items-center justify-start">
        <Button
          variant="quaternary"
          size="sm"
          icon={<ChevronsRight size={14} />}
          aria-label="Close era pane"
          onClick={onClose}
        />
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-0.5">
          <TertiaryNativeSelect
            ariaLabel="Start year"
            placeholder="Start"
            value={startYear != null ? String(startYear) : null}
            options={mapYearOptionsToSelectOptions(startOptions)}
            onValueChange={(v) => onStartChange(Number(v))}
            labelClassName="tabular-nums !pl-[2px]"
          />
          <div className="h-0 w-3.5 border-t border-border-secondary" />
          <TertiaryNativeSelect
            ariaLabel="End year"
            placeholder="End"
            value={endYear != null ? String(endYear) : null}
            options={mapYearOptionsToSelectOptions(endOptions)}
            onValueChange={(v) => onEndChange(Number(v))}
            labelClassName="tabular-nums"
          />
        </div>

        {onDelete ? (
          <div ref={menuRef} className="relative">
            <Button
              variant="quaternary"
              size="md"
              icon={<MoreHorizontal size={18} />}
              aria-label="Era actions"
              onClick={() => setIsMenuOpen((open) => !open)}
            />
            {isMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-[10rem] rounded-md border border-border-secondary bg-bg-primary p-1 shadow-md">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete();
                  }}
                  className="w-full rounded-md px-3 py-2 text-left text-body-2 text-text-primary transition-colors hover:bg-bg-primary-hover"
                >
                  Delete Era
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        {isEditingNickname ? (
          <input
            ref={nicknameInputRef}
            value={nickname}
            maxLength={80}
            onChange={(event) => onNicknameChange(event.target.value)}
            onBlur={() => setIsEditingNickname(false)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                setIsEditingNickname(false);
              }
              if (event.key === "Escape") {
                event.preventDefault();
                setIsEditingNickname(false);
              }
            }}
            className="era-pane-narrative-field era-pane-nickname-field w-full min-w-0 border-0 bg-bg-primary text-[24px] font-bold leading-none text-text-primary shadow-none outline-none ring-0 ring-offset-0 hover:bg-bg-primary-hover focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingNickname(true)}
            className="era-pane-nickname-field group relative w-fit rounded-md border-0 bg-bg-primary py-1 pl-2 pr-10 text-left text-[24px] font-bold leading-none text-text-primary shadow-none outline-none ring-0 ring-offset-0 transition-colors hover:bg-bg-primary-hover focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 active:outline-none"
          >
            <span className="min-w-0">
              {nickname.trim() || "Add nickname"}
            </span>
            <Pencil
              size={24}
              aria-hidden="true"
              className="pointer-events-none absolute right-2 top-1/2 shrink-0 -translate-y-1/2 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100"
            />
          </button>
        )}

        {isEditingDescription ? (
          <textarea
            ref={descriptionInputRef}
            value={description}
            maxLength={720}
            rows={4}
            onChange={(event) => onDescriptionChange(event.target.value)}
            onBlur={() => setIsEditingDescription(false)}
            className="era-pane-narrative-field min-h-[5.5rem] w-full min-w-0 resize-y text-body-2 text-text-secondary"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingDescription(true)}
            className="rounded-md px-2 py-1 text-left text-body-2 text-text-secondary transition-colors hover:bg-bg-primary-hover"
          >
            {description.trim() || "Add description"}
          </button>
        )}
      </div>
    </div>
  );
}
