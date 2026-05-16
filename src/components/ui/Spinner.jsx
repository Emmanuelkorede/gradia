

const COLOR_MAP = {
  green: { track: "#d1fae5", head: "#16a34a" },
  white: { track: "rgba(255,255,255,0.3)", head: "#ffffff" },
  gray:  { track: "#e5e7eb", head: "#6b7280" },
  red:   { track: "#fee2e2", head: "#dc2626" },
};

export default function Spinner({ size = 20, color = "green", className = "" }) {
  const { track, head } = COLOR_MAP[color] ?? COLOR_MAP.green;
  const r  = (size - 3) / 2;          // radius (leave room for stroke)
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      style={{ animation: "gradia-spin 0.75s linear infinite" }}
    >
      {/* Inject keyframe once via a style tag that React de-dupes */}
      <style>{`
        @keyframes gradia-spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Track circle */}
      <circle
        cx={cx}
        cy={cx}
        r={r}
        stroke={track}
        strokeWidth="2.5"
      />

      {/* Spinning arc — 25% of circumference */}
      <circle
        cx={cx}
        cy={cx}
        r={r}
        stroke={head}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
        strokeDashoffset={circumference * 0.25}
        transform={`rotate(-90 ${cx} ${cx})`}
      />
    </svg>
  );
}