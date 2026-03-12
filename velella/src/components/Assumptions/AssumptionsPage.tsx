import { Text } from "../../../../../counterfoil-kit/src/index.ts";
import AssumptionsForm from "./AssumptionsForm";

interface AssumptionsPageProps {
  scenario: import("../../types/scenario").Scenario | null;
  loading: boolean;
  error: string | null;
  onSave: (scenario: import("../../types/scenario").Scenario) => Promise<void>;
}

export default function AssumptionsPage({
  scenario,
  loading,
  error,
  onSave,
}: AssumptionsPageProps) {
  if (loading) {
    return (
      <Text size="body1" hierarchy="secondary">
        Loading…
      </Text>
    );
  }

  if (error) {
    return (
      <Text size="body1" hierarchy="primary">
        Error: {error}
      </Text>
    );
  }

  if (!scenario) {
    return null;
  }

  return (
    <div className="flex justify-center w-full min-h-full bg-bg-secondary">
      <div className="w-full max-w-[16em] bg-bg-primary px-4 py-4">
        <AssumptionsForm saved={scenario} onSave={onSave} />
      </div>
    </div>
  );
}
