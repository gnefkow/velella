import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const VIEWPORT_PADDING_PX = 16;
const BUBBLE_OFFSET_PX = 16;
const ARROW_SIZE_PX = 10;

type BubblePosition = {
  top: number;
  left: number;
  arrowTop: number;
};

interface InfoBubbleProps {
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export default function InfoBubble({
  isOpen,
  anchorRef,
  onClose,
  children,
}: InfoBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<BubblePosition>({
    top: VIEWPORT_PADDING_PX,
    left: VIEWPORT_PADDING_PX,
    arrowTop: 12,
  });

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const updatePosition = () => {
      const anchorElement = anchorRef.current;
      const bubbleElement = bubbleRef.current;

      if (!anchorElement || !bubbleElement) {
        return;
      }

      const anchorRect = anchorElement.getBoundingClientRect();
      const bubbleRect = bubbleElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const unclampedTop = anchorRect.top;
      const minTop = VIEWPORT_PADDING_PX;
      const maxTop = Math.max(
        VIEWPORT_PADDING_PX,
        viewportHeight - VIEWPORT_PADDING_PX - bubbleRect.height
      );
      const top = clamp(unclampedTop, minTop, maxTop);

      const minLeft = VIEWPORT_PADDING_PX;
      const maxLeft = Math.max(
        VIEWPORT_PADDING_PX,
        viewportWidth - VIEWPORT_PADDING_PX - bubbleRect.width
      );
      const unclampedLeft = anchorRect.right + BUBBLE_OFFSET_PX;
      const left = clamp(unclampedLeft, minLeft, maxLeft);

      const anchorCenterY = anchorRect.top + anchorRect.height / 2;
      const arrowCenter = clamp(
        anchorCenterY - top,
        ARROW_SIZE_PX,
        Math.max(ARROW_SIZE_PX, bubbleRect.height - ARROW_SIZE_PX)
      );

      setPosition({
        top,
        left,
        arrowTop: arrowCenter - ARROW_SIZE_PX / 2,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRef, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const bubbleElement = bubbleRef.current;
      const anchorElement = anchorRef.current;

      if (!bubbleElement || !anchorElement) {
        return;
      }

      if (bubbleElement.contains(target) || anchorElement.contains(target)) {
        return;
      }

      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anchorRef, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      ref={bubbleRef}
      className="fixed z-50 max-w-[18em] rounded border border-border-tertiary bg-bg-primary p-3 shadow-md"
      style={{ top: position.top, left: position.left }}
      role="dialog"
      aria-modal={false}
    >
      <div
        className="pointer-events-none absolute -left-[6px] h-[12px] w-[12px] rotate-45 border-b border-l border-border-tertiary bg-bg-primary"
        style={{ top: position.arrowTop }}
        aria-hidden="true"
      />
      {children}
    </div>,
    document.body
  );
}
