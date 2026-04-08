interface UseEstimatedFederalTaxControlProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
  /** Shown after the label; typically the current federal estimate for this context. */
  estimatedFederalAmount: number;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function UseEstimatedFederalTaxControl({
  checked,
  disabled = false,
  onChange,
  estimatedFederalAmount,
}: UseEstimatedFederalTaxControlProps) {
  return (
    <label className="inline-flex items-center gap-2 text-body-1 text-text-primary">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-border-secondary accent-accent-primary disabled:cursor-not-allowed disabled:opacity-60"
      />
      <span>
        Use Estimated Federal Tax Expense:{" "}
        {formatCurrency(estimatedFederalAmount)}
      </span>
    </label>
  );
}
