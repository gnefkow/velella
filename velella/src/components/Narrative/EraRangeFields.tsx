import { Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import type { YearDropdownOption } from "../../lib/eraHelpers";

interface EraRangeFieldsProps {
  startYear: number | null;
  endYear: number | null;
  startOptions: YearDropdownOption[];
  endOptions: YearDropdownOption[];
  onStartChange: (year: number) => void;
  onEndChange: (year: number) => void;
}

export default function EraRangeFields({
  startYear,
  endYear,
  startOptions,
  endOptions,
  onStartChange,
  onEndChange,
}: EraRangeFieldsProps) {
  return (
    <Stack gap="sm">
      <Text size="body2" hierarchy="primary">
        Date Range
      </Text>
      <div className="flex gap-2">
        <label className="flex-1 min-w-0">
          <span className="sr-only">Start year</span>
          <select
            value={startYear ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v) onStartChange(parseInt(v, 10));
            }}
            className="w-full rounded border border-input-border bg-input-bg px-3 py-2 text-body-1 text-text-primary"
          >
            <option value="">Select start</option>
            {startOptions.map((opt) => (
              <option
                key={opt.year}
                value={opt.year}
                disabled={opt.disabled}
                title={opt.disabledReason}
              >
                {opt.year}
                {opt.disabled && opt.disabledReason
                  ? ` — ${opt.disabledReason}`
                  : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 min-w-0">
          <span className="sr-only">End year</span>
          <select
            value={endYear ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v) onEndChange(parseInt(v, 10));
            }}
            className="w-full rounded border border-input-border bg-input-bg px-3 py-2 text-body-1 text-text-primary"
          >
            <option value="">Select end</option>
            {endOptions.map((opt) => (
              <option
                key={opt.year}
                value={opt.year}
                disabled={opt.disabled}
                title={opt.disabledReason}
              >
                {opt.year}
                {opt.disabled && opt.disabledReason
                  ? ` — ${opt.disabledReason}`
                  : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Stack>
  );
}
