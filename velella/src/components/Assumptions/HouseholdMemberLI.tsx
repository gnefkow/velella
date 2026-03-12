import {
  Button,
  CheckboxField,
  InputField,
  Inline,
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
      <Inline gap="m" align="end">
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
        <CheckboxField
          label="Income earner"
          checked={member.incomeEarner}
          onChange={(v: boolean) => onChange({ ...member, incomeEarner: v })}
        />
        <Button variant="destructive-secondary" onClick={onDelete}>
          Delete Member
        </Button>
      </Inline>
    </Stack>
  );
}
