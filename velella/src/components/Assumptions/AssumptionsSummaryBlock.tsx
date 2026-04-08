import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import type { Scenario } from "../../types/scenario";
import {
  ageAtYearEnd,
  ageAtYearStart,
  parseHouseholdBirthday,
} from "../../lib/ageAtYear";

interface AssumptionsSummaryBlockProps {
  scenario: Scenario;
  onRevert: () => void;
  onSave: () => void;
  saving: boolean;
}

function ageRangeLabel(
  birthday: string,
  yearStart: number,
  yearEnd: number
): string {
  const birth = parseHouseholdBirthday(birthday);
  if (!birth) {
    return "Age — – —";
  }
  const a0 = ageAtYearStart(birth, yearStart);
  const a1 = ageAtYearEnd(birth, yearEnd);
  return `Age ${a0} – ${a1}`;
}

export default function AssumptionsSummaryBlock({
  scenario,
  onRevert,
  onSave,
  saving,
}: AssumptionsSummaryBlockProps) {
  const { scenarioInfo, householdMembers } = scenario;
  const { scenarioTitle, yearStart, yearEnd } = scenarioInfo;

  return (
    <aside
      className="sticky top-[16px] w-[16em] shrink-0 self-start border border-border-tertiary bg-bg-primary p-[1em] shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.2),0_2px_4px_-2px_rgb(0_0_0_/_0.2)]"
      aria-label="Scenario summary"
    >
      <Stack gap="lg" className="w-full min-w-0">
        <Stack gap="xs" className="min-w-0">
          <Text
            size="h5"
            hierarchy="primary"
            weight="heavy"
            className="text-left"
          >
            {scenarioTitle.trim() || "Untitled scenario"}
          </Text>
          <Text size="body2" hierarchy="secondary" className="text-left">
            {yearStart} – {yearEnd}
          </Text>
        </Stack>

        <Stack gap="m" className="min-w-0">
          {householdMembers.map((member) => (
            <div key={member.id} className="min-w-0">
              <div className="flex w-full min-w-0 items-baseline justify-between gap-2">
                <Text
                  size="body1"
                  hierarchy="primary"
                  className="min-w-0 flex-1 text-left"
                >
                  {member.nickname.trim() || "Member"}
                </Text>
                <Text
                  size="body1"
                  hierarchy="primary"
                  className="shrink-0 text-right tabular-nums"
                >
                  {ageRangeLabel(member.birthday, yearStart, yearEnd)}
                </Text>
              </div>
              {member.incomeEarner ? (
                <Text
                  size="body2"
                  hierarchy="tertiary"
                  className="mt-1 text-left"
                >
                  (Income earner)
                </Text>
              ) : null}
            </div>
          ))}
        </Stack>

        <div className="grid w-full min-w-0 grid-cols-2 gap-[var(--gap-m)]">
          <Button variant="quaternary" onClick={onRevert} width="fill">
            Revert
          </Button>
          <Button
            variant="primary"
            onClick={onSave}
            disabled={saving}
            width="fill"
          >
            Update
          </Button>
        </div>
      </Stack>
    </aside>
  );
}
