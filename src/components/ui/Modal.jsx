import { useEffect, useRef } from "react";

const SHEET_STYLE = `
  @keyframes gradia-sheet-in {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
  @keyframes gradia-dialog-in {
    from { transform: translateY(8px) scale(0.98); opacity: 0; }
    to   { transform: translateY(0)    scale(1);    opacity: 1; }
  }
  @keyframes gradia-backdrop-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .gradia-backdrop {
    animation: gradia-backdrop-in 0.2s ease-out forwards;
  }
  .gradia-sheet {
    animation: gradia-sheet-in 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards;
  }
  @media (min-width: 640px) {
    .gradia-sheet {
      animation: gradia-dialog-in 0.2s ease-out forwards;
    }
  }
`;

const SIZE_MAX_HEIGHT = {
  sm:   "max-h-[35vh]",
  md:   "max-h-[60vh]",
  lg:   "max-h-[85vh]",
  full: "max-h-[96vh]",
};

export default function Modal({
  isOpen = false,
  onClose,
  title = "",
  size = "md",
  showClose = true,
  children,
  footer = null,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  function handleBackdropClick(e) {
    if (e.target === overlayRef.current) onClose?.();
  }

  if (!isOpen) return null;

  return (
    <>
      <style>{SHEET_STYLE}</style>

      <div
        ref={overlayRef}
        className="gradia-backdrop fixed inset-0 z-[100] flex items-end sm:items-center sm:justify-center p-0 sm:p-4"
        style={{ backgroundColor: "rgba(5, 15, 5, 0.7)", backdropFilter: "blur(8px)" }}
        onClick={handleBackdropClick}
        aria-modal="true"
        role="dialog"
      >
        <div
          className={[
            "gradia-sheet",
            "relative w-full bg-white dark:bg-[#0d1a0c]",
            "flex flex-col overflow-hidden",
            "rounded-t-[32px] sm:rounded-[28px]",
            "sm:max-w-md shadow-2xl",
            SIZE_MAX_HEIGHT[size] ?? SIZE_MAX_HEIGHT.md,
          ].join(" ")}
        >
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="h-1.5 w-12 rounded-full bg-green-900/10 dark:bg-white/10" />
          </div>

          {(title || showClose) && (
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              {title ? (
                <h2 className="text-lg font-black text-[#1a3312] dark:text-[#d8f0c8] font-serif tracking-tight">
                  {title}
                </h2>
              ) : <div />}

              {showClose && (
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full
                             bg-green-900/5 dark:bg-white/5 text-[#4a8c38] 
                             active:scale-90 transition-transform"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 text-sm leading-relaxed text-green-900/80 dark:text-green-100/70">
            {children}
          </div>

          {footer && (
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 px-6 py-5 bg-white dark:bg-[#0d1a0c]">
              {footer}
            </div>
          )}
          
          <div className="h-[env(safe-area-inset-bottom,0px)] bg-white dark:bg-[#0d1a0c]" />
        </div>
      </div>
    </>
  );
}