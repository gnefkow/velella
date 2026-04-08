import { Trash2 } from "lucide-react";
import {
  Button,
  CheckboxField,
  InputField,
  Stack,
} from "../../../../../counterfoil-kit/src/index.ts";
import type { HouseholdMember } from "../../types/scenario";

interface HouseholdMemberLIProps {
  member: HouseholdMember;
  onChange: (member: HouseholdMember) => void;
  onDelete: () => void;
}

export default function HouseholdMemberLI({
  member,
  onChange,
  onDelete,
}: HouseholdMemberLIProps) {
  return (
    <Stack gap="sm" className="border border-border-secondary rounded p-4">
      <div className="flex w-full min-w-0 flex-wrap items-end justify-between gap-4">
        <div
          className="flex min-w-0 flex-1 flex-wrap items-end"
          style={{ gap: "var(--gap-m)" }}
        >
          <InputField
            label="Nickname"
            value={member.nickname}
            onChange={(v: string) => onChange({ ...member, nickname: v })}
          />
          <InputField
            label="Birthday (MM/DD/YYYY)"
            value={member.birthday}
            onChange={(v: string) => onChange({ ...member, birthday: v })}
          />
        </div>
        <Button
          variant="tertiary"
          size="md"
          icon={<Trash2 size={18} strokeWidth={2} aria-hidden />}
          aria-label="Delete member"
          onClick={onDelete}
        />
      </div>
      <CheckboxField
        label="Income earner"
        checked={member.incomeEarner}
        onChange={(v: boolean) => onChange({ ...member, incomeEarner: v })}
      />
    </Stack>
  );
}
