import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import type { Era } from "../../types/era";
import { sortErasByStartYear } from "../../lib/eraHelpers";
import EraLI from "./EraLI";

interface ErasListProps {
  eras: Era[];
  onCreateEra: () => void;
  onSelectEra: (era: Era) => void;
}

export default function ErasList({
  eras,
  onCreateEra,
  onSelectEra,
}: ErasListProps) {
  const sortedEras = sortErasByStartYear(eras);

  return (
    <Stack gap="lg">
      <div className="flex justify-end">
        <Button variant="secondary" size="md" onClick={onCreateEra}>
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
            <EraLI key={era.id} era={era} onClick={() => onSelectEra(era)} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
