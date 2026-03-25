import type { CSSProperties } from "react";

/**
 * Inline layout for modal backdrops so overlays stay visible even when Tailwind
 * does not emit utilities for portal markup (e.g. dynamic class strings elsewhere).
 */
export const MODAL_PORTAL_BACKDROP_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
};
