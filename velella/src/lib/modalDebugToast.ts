/**
 * Debug-only toast: call when a modal is actually shown (isOpen === true).
 * Renders above modal overlays (z-50) so visibility can be confirmed while debugging.
 */
let toastSeq = 0;

export function showModalDebugToast(message = "Modal fired"): void {
  if (typeof document === "undefined") {
    return;
  }

  const id = `modal-debug-toast-${++toastSeq}`;
  const el = document.createElement("div");
  el.id = id;
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.textContent = message;
  el.className =
    "pointer-events-none fixed left-4 top-4 z-[100] max-w-sm rounded-md border border-border-secondary bg-bg-primary px-4 py-2 text-body-2 text-text-primary shadow-lg";
  document.body.appendChild(el);

  window.setTimeout(() => {
    el.remove();
  }, 3000);
}
