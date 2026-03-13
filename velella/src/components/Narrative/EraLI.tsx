import { Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import type { Era } from "../../types/era";

interface EraLIProps {
  era: Era;
  onClick: () => void;
}

export default function EraLI({ era, onClick }: EraLIProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded border border-border-secondary bg-bg-primary px-4 py-3 text-left transition-colors hover:bg-bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-input"
    >
      <Stack gap="xs">
        <Text size="body1" hierarchy="primary">
          {era.nickname || "Unnamed Era"}
        </Text>
        <Text size="body2" hierarchy="secondary">
          {era.startYear} – {era.endYear}
        </Text>
      </Stack>
    </button>
  );
}
