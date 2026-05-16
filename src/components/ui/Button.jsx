

import Spinner from "./Spinner";

const STYLES = {
  // ── Base shared across all variants ──────────────────────────────
  base: [
    "relative inline-flex items-center justify-center gap-2",
    "font-semibold rounded-xl border select-none",
    "transition-all duration-150 ease-out",
    "active:scale-[0.97]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
  ].join(" "),

  // ── Variants ─────────────────────────────────────────────────────
  variant: {
    primary: [
      "bg-gradient-to-br from-green-500 to-green-700",
      "border-green-700/30",
      "text-white",
      "shadow-[0_4px_14px_rgba(58,120,40,0.35)]",
      "hover:shadow-[0_6px_20px_rgba(58,120,40,0.45)] hover:-translate-y-px",
      "dark:from-green-600 dark:to-green-800",
    ].join(" "),

    secondary: [
      "bg-green-50 border-green-200",
      "text-green-800",
      "hover:bg-green-100 hover:border-green-300",
      "dark:bg-green-950 dark:border-green-800 dark:text-green-300",
      "dark:hover:bg-green-900 dark:hover:border-green-700",
    ].join(" "),

    ghost: [
      "bg-transparent border-transparent",
      "text-green-700",
      "hover:bg-green-50 hover:border-green-100",
      "dark:text-green-400",
      "dark:hover:bg-green-950 dark:hover:border-green-900",
    ].join(" "),

    danger: [
      "bg-gradient-to-br from-red-500 to-red-700",
      "border-red-700/30",
      "text-white",
      "shadow-[0_4px_14px_rgba(180,40,40,0.3)]",
      "hover:shadow-[0_6px_20px_rgba(180,40,40,0.4)] hover:-translate-y-px",
    ].join(" "),

    success: [
      "bg-gradient-to-br from-emerald-400 to-emerald-600",
      "border-emerald-700/20",
      "text-white",
      "shadow-[0_4px_14px_rgba(20,160,80,0.3)]",
      "hover:shadow-[0_6px_20px_rgba(20,160,80,0.4)] hover:-translate-y-px",
    ].join(" "),
  },

  // ── Sizes ─────────────────────────────────────────────────────────
  size: {
    sm:  "h-8  px-3.5 text-xs  gap-1.5",
    md:  "h-11 px-5   text-sm  gap-2",
    lg:  "h-14 px-7   text-base gap-2.5",
  },
};

export default function Button({
  variant   = "primary",
  size      = "md",
  fullWidth = false,
  loading   = false,
  disabled  = false,
  leftIcon  = null,
  rightIcon = null,
  onClick,
  className = "",
  children,
  ...rest
}) {
  const isDisabled = disabled || loading;

  const classes = [
    STYLES.base,
    STYLES.variant[variant] ?? STYLES.variant.primary,
    STYLES.size[size]       ?? STYLES.size.md,
    fullWidth ? "w-full" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      {...rest}
    >
      {/* Loading spinner replaces left icon */}
      {loading ? (
        <Spinner
          size={size === "sm" ? 14 : size === "lg" ? 20 : 16}
          color={variant === "secondary" || variant === "ghost" ? "green" : "white"}
        />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}

      {/* Label */}
      <span>{children}</span>

      {/* Right icon (hidden when loading) */}
      {!loading && rightIcon && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}