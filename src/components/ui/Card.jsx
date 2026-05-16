

// ── Variant styles ──────────────────────────────────────────────────
const VARIANT_STYLES = {
  default: [
    "bg-white dark:bg-gray-900",
    "border border-green-100 dark:border-green-900/60",
    "shadow-sm",
  ].join(" "),

  elevated: [
    "bg-white dark:bg-gray-900",
    "border border-green-100/80 dark:border-green-900/40",
    "shadow-[0_4px_24px_rgba(40,100,20,0.08)]",
    "dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]",
  ].join(" "),

  outline: [
    "bg-transparent",
    "border-2 border-green-200 dark:border-green-800",
  ].join(" "),

  // Glassmorphic premium card — used for ActivationCard-style surfaces
  premium: [
    "relative overflow-hidden",
    "bg-gradient-to-br from-green-600 via-green-700 to-emerald-800",
    "border border-green-500/30",
    "shadow-[0_8px_32px_rgba(40,120,20,0.35)]",
    "text-white",
  ].join(" "),

  // Completely flat, no border — for nested surfaces
  flat: [
    "bg-green-50 dark:bg-green-950/50",
    "border-0",
  ].join(" "),
};

const PADDING_STYLES = {
  none: "p-0",
  sm:   "p-3",
  md:   "p-4",
  lg:   "p-5",
};

const INTERACTIVE_STYLES = [
  "cursor-pointer",
  "transition-transform duration-150 ease-out",
  "hover:-translate-y-0.5",
  "hover:shadow-[0_8px_28px_rgba(40,100,20,0.13)]",
  "active:scale-[0.985]",
  "dark:hover:shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
].join(" ");

// ── Main Card ───────────────────────────────────────────────────────
export default function Card({
  variant   = "default",
  onClick   = null,
  padding   = "md",
  className = "",
  children,
  ...rest
}) {
  const isClickable = Boolean(onClick);

  const classes = [
    "rounded-2xl",
    VARIANT_STYLES[variant] ?? VARIANT_STYLES.default,
    PADDING_STYLES[padding] ?? PADDING_STYLES.md,
    isClickable ? INTERACTIVE_STYLES : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div
      className={classes}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable
        ? (e) => (e.key === "Enter" || e.key === " ") && onClick(e)
        : undefined
      }
      {...rest}
    >
      {/* Premium sheen overlay (only for premium variant) */}
      {variant === "premium" && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -right-4 h-28 w-28 rounded-full bg-white/[0.07]"
          />
        </>
      )}
      {children}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

Card.Header = function CardHeader({ className = "", children }) {
  return (
    <div className={`mb-3 flex items-center justify-between gap-2 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ className = "", children }) {
  return (
    <div className={`text-sm text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ className = "", children }) {
  return (
    <div
      className={`mt-4 flex items-center gap-2 border-t border-green-100 dark:border-green-900/50 pt-3 ${className}`}
    >
      {children}
    </div>
  );
};

Card.Divider = function CardDivider() {
  return <hr className="my-3 border-green-100 dark:border-green-900/50" />;
};