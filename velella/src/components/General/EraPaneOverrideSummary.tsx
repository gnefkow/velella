import { PencilLine } from "lucide-react";

interface EraPaneOverrideSummaryProps {
  fieldLabel: string;
  summary: string;
  onEdit: () => void;
}

export default function EraPaneOverrideSummary({
  fieldLabel,
  summary,
  onEdit,
}: EraPaneOverrideSummaryProps) {
  return (
    <div className="flex shrink-0 items-center gap-1 pr-3">
      <p
        className="m-0 text-right text-body-1 text-text-quaternary"
        aria-label={`${fieldLabel} override summary`}
      >
        {summary}
      </p>
      <button
        type="button"
        aria-label={`Edit year overrides for ${fieldLabel}`}
        onClick={onEdit}
        className={[
          "inline-flex size-5 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 shadow-none appearance-none",
          "text-text-secondary transition-colors hover:bg-bg-primary-hover hover:text-text-primary",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-input focus-visible:ring-offset-2",
        ].join(" ")}
      >
        <PencilLine size={16} aria-hidden />
      </button>
    </div>
  );
}
