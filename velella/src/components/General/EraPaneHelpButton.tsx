import { HelpCircle } from "lucide-react";
import { useRef, useState } from "react";
import InfoBubble from "./InfoBubble";

interface EraPaneHelpButtonProps {
  label: string;
  description?: string;
  className?: string;
}

export default function EraPaneHelpButton({
  label,
  description = "explanation needed",
  className = "",
}: EraPaneHelpButtonProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        onClick={() => setIsOpen((open) => !open)}
        className={[
          "inline-flex size-5 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 shadow-none appearance-none",
          "text-text-secondary transition-colors hover:bg-bg-primary-hover hover:text-text-primary",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-input focus-visible:ring-offset-2",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <HelpCircle size={16} />
      </button>
      <InfoBubble
        isOpen={isOpen}
        anchorRef={triggerRef}
        onClose={() => setIsOpen(false)}
      >
        <p className="max-w-[16rem] text-body-2 text-text-secondary">
          {description}
        </p>
      </InfoBubble>
    </>
  );
}
