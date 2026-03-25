import EraPaneAmountInput from "./EraPaneAmountInput";

function formatEraRangeLine(
  startYear: number | null,
  endYear: number | null
): string {
  if (startYear != null && endYear != null) {
    return `${startYear} - ${endYear}`;
  }
  return "set years in header";
}

interface EraOverrideLinkedInputRowProps {
  fieldLabel: string;
  eraStartYear: number | null;
  eraEndYear: number | null;
  value: number;
  onCommit: (value: number) => void;
}

export default function EraOverrideLinkedInputRow({
  fieldLabel,
  eraStartYear,
  eraEndYear,
  value,
  onCommit,
}: EraOverrideLinkedInputRowProps) {
  const rangeLine = formatEraRangeLine(eraStartYear, eraEndYear);
  const inputLabel = `${fieldLabel}, ${rangeLine}`;

  return (
    <div className="flex w-full flex-col py-4">
      <div className="flex w-full min-w-0 items-center justify-between px-1">
        <div className="min-w-0 max-w-[155px] text-body-1 text-text-primary">
          <p className="m-0">
            {fieldLabel},
            <br aria-hidden />
            {rangeLine}
          </p>
        </div>
        <EraPaneAmountInput
          label={inputLabel}
          value={value}
          onCommit={onCommit}
        />
      </div>
    </div>
  );
}
