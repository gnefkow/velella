import { InputField, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";

interface EraNarrativeFieldsProps {
  nickname: string;
  description: string;
  onNicknameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
}

export default function EraNarrativeFields({
  nickname,
  description,
  onNicknameChange,
  onDescriptionChange,
}: EraNarrativeFieldsProps) {
  return (
    <Stack gap="sm">
      <InputField
        label="Nickname"
        value={nickname}
        onChange={onNicknameChange}
      />
      <div>
        <label className="block text-body-2 text-text-secondary mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          maxLength={720}
          rows={4}
          className="w-full rounded border border-input-border bg-input-bg px-3 py-2 text-body-1 text-text-primary resize-y"
        />
      </div>
    </Stack>
  );
}
