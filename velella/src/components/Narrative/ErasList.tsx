import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import type { Era } from "../../types/era";
import type { HouseholdMember } from "../../types/scenario";
import { sortErasByStartYear } from "../../lib/eraHelpers";
import EraLI from "./EraLI";

interface ErasListProps {
  eras: Era[];
  yearStart: number;
  yearEnd: number;
  canCreateEra: boolean;
  onCreateEra: () => void;
  onSelectEra: (era: Era) => void;
  onEraYearRangeChange: (
    eraId: string,
    startYear: number,
    endYear: number
  ) => void;
  onEraNicknameChange: (eraId: string, nickname: string) => void;
  householdMembers: HouseholdMember[];
}

export default function ErasList({
  eras,
  yearStart,
  yearEnd,
  canCreateEra,
  onCreateEra,
  onSelectEra,
  onEraYearRangeChange,
  onEraNicknameChange,
  householdMembers,
}: ErasListProps) {
  const sortedEras = sortErasByStartYear(eras);

  return (
    <Stack gap="lg">
      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="md"
          disabled={!canCreateEra}
          onClick={onCreateEra}
        >
          Create Era
        </Button>
      </div>
      {eras.length === 0 ? (
        <Text size="body1" hierarchy="secondary">
          No eras, create one
        </Text>
      ) : (
        <Stack gap="sm" className="min-w-0">
          {sortedEras.map((era) => (
            <EraLI
              key={era.id}
              era={era}
              yearStart={yearStart}
              yearEnd={yearEnd}
              allEras={eras}
              onEraDetails={() => onSelectEra(era)}
              onEraYearRangeChange={onEraYearRangeChange}
              onEraNicknameChange={onEraNicknameChange}
              householdMembers={householdMembers}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
