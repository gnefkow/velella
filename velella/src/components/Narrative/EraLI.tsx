import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Text } from "../../../../../counterfoil-kit/src/index.ts";
import type { Era } from "../../types/era";
import type { HouseholdMember } from "../../types/scenario";
import { ageInYear } from "../../lib/age";
import { getYearDropdownOptions } from "../../lib/eraHelpers";
import { sortHouseholdMembersIncomeEarnersFirst } from "../../lib/sortHouseholdMembers";
import DropdownYearSelector from "../ui/DropdownYearSelector";

interface EraLIProps {
  era: Era;
  yearStart: number;
  yearEnd: number;
  allEras: Era[];
  onEraDetails: () => void;
  onEraYearRangeChange: (
    eraId: string,
    startYear: number,
    endYear: number
  ) => void;
  onEraNicknameChange: (eraId: string, nickname: string) => void;
  householdMembers: HouseholdMember[];
}

export default function EraLI({
  era,
  yearStart,
  yearEnd,
  allEras,
  onEraDetails,
  onEraYearRangeChange,
  onEraNicknameChange,
  householdMembers,
}: EraLIProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditingName]);

  const startOptions = useMemo(
    () =>
      getYearDropdownOptions(
        yearStart,
        yearEnd,
        allEras,
        era.id,
        era.startYear,
        era.endYear,
        true
      ),
    [yearStart, yearEnd, allEras, era.id, era.startYear, era.endYear]
  );

  const membersForDisplay = useMemo(
    () => sortHouseholdMembersIncomeEarnersFirst(householdMembers),
    [householdMembers]
  );

  const endOptions = useMemo(
    () =>
      getYearDropdownOptions(
        yearStart,
        yearEnd,
        allEras,
        era.id,
        era.startYear,
        era.endYear,
        false
      ),
    [yearStart, yearEnd, allEras, era.id, era.startYear, era.endYear]
  );

  const displayName = era.nickname || "Unnamed Era";

  const commitName = () => {
    const next = nameDraft.trim();
    setIsEditingName(false);
    onEraNicknameChange(era.id, next);
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 rounded border border-border-secondary bg-bg-primary px-4 py-3">
      <div className="min-w-0 shrink-0 basis-[10rem]">
        {isEditingName ? (
          <input
            ref={nameInputRef}
            type="text"
            value={nameDraft}
            maxLength={80}
            aria-label="Era name"
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                nameInputRef.current?.blur();
              }
            }}
            className="w-full min-w-0 rounded border border-border-secondary bg-bg-primary px-2 py-1 text-body-1 text-text-primary outline-none ring-0 focus-visible:ring-2 focus-visible:ring-input"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setNameDraft(era.nickname);
              setIsEditingName(true);
            }}
            className="w-full min-w-0 rounded border border-transparent bg-transparent px-0 py-0.5 text-left text-body-1 text-text-primary outline-none transition-colors hover:bg-bg-secondary focus-visible:ring-2 focus-visible:ring-input"
          >
            {displayName}
          </button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <DropdownYearSelector
          ariaLabel="Start year"
          placeholder="Start"
          value={era.startYear}
          yearOptions={startOptions}
          householdMembers={householdMembers}
          onValueChange={(y) =>
            onEraYearRangeChange(era.id, y, era.endYear)
          }
          labelClassName="!pl-[2px]"
        />
        <div className="h-0 w-3.5 border-t border-border-secondary" />
        <DropdownYearSelector
          ariaLabel="End year"
          placeholder="End"
          value={era.endYear}
          yearOptions={endOptions}
          householdMembers={householdMembers}
          onValueChange={(y) =>
            onEraYearRangeChange(era.id, era.startYear, y)
          }
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-wrap items-end gap-[2em]">
        {membersForDisplay.map((member) => (
          <div
            key={member.id}
            className="flex min-w-0 flex-col gap-0.5 text-left"
          >
            <Text size="body2" hierarchy="secondary">
              {member.nickname || "Member"}
            </Text>
            <Text size="body2" hierarchy="secondary" className="tabular-nums">
              {ageInYear(member.birthday, era.startYear)} –{" "}
              {ageInYear(member.birthday, era.endYear)}
            </Text>
          </div>
        ))}
      </div>
      <Button
        variant="tertiary"
        size="md"
        className="ml-auto shrink-0"
        onClick={onEraDetails}
      >
        Era Details
      </Button>
    </div>
  );
}
