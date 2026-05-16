

export default function GradiaLogo({ size = 40, wordmark = false, className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* ---- SVG Icon ---- */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* App icon rounded rect background — glassmorphic look */}
        <rect width="100" height="100" rx="22" fill="url(#grad-bg)" />
        <rect width="100" height="100" rx="22" fill="url(#grad-glass)" opacity="0.5" />

        {/* Mortarboard board (top flat part) */}
        <polygon
          points="50,22 88,40 50,57 12,40"
          fill="url(#grad-cap-top)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1"
        />

        {/* Cap shadow under the board */}
        <ellipse cx="50" cy="42" rx="25" ry="5" fill="rgba(0,0,0,0.12)" />

        {/* Cap body (cylinder) */}
        <path
          d="M34 45 Q34 66 50 68 Q66 66 66 45 L50 57 Z"
          fill="url(#grad-cap-body)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="0.8"
        />

        {/* Tassel string */}
        <line x1="88" y1="40" x2="88" y2="60" stroke="url(#grad-tassel)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Tassel end blob */}
        <circle cx="88" cy="63" r="4" fill="url(#grad-tassel-end)" />

        {/* Leaf on the cap (brand detail, matches logo) */}
        <path
          d="M48 54 C44 58 42 64 46 67 C50 70 54 65 52 60 C51 57 49 55 48 54Z"
          fill="url(#grad-leaf)"
          opacity="0.9"
        />

        {/* Shine overlay on board */}
        <ellipse cx="44" cy="35" rx="12" ry="4" fill="white" opacity="0.12" transform="rotate(-15 44 35)" />

        {/* ---- Defs ---- */}
        <defs>
          <linearGradient id="grad-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6a9e5e" />
            <stop offset="50%" stopColor="#4e7c45" />
            <stop offset="100%" stopColor="#8bac62" />
          </linearGradient>
          <linearGradient id="grad-glass" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="white" stopOpacity="0.25" />
            <stop offset="100%" stopColor="white" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="grad-cap-top" x1="12" y1="22" x2="88" y2="57" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d4e8a0" />
            <stop offset="50%" stopColor="#a8c96a" />
            <stop offset="100%" stopColor="#7aaa52" />
          </linearGradient>
          <linearGradient id="grad-cap-body" x1="34" y1="45" x2="66" y2="68" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8fbb60" />
            <stop offset="100%" stopColor="#5a8c42" />
          </linearGradient>
          <linearGradient id="grad-tassel" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#c8de88" />
            <stop offset="100%" stopColor="#7aaa52" />
          </linearGradient>
          <linearGradient id="grad-tassel-end" x1="84" y1="59" x2="92" y2="67" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d4e8a0" />
            <stop offset="100%" stopColor="#6a9e5e" />
          </linearGradient>
          <linearGradient id="grad-leaf" x1="42" y1="54" x2="52" y2="67" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#b8e06a" />
            <stop offset="100%" stopColor="#4e8c35" />
          </linearGradient>
        </defs>
      </svg>

      {/* ---- Wordmark ---- */}
      {wordmark && (
        <span
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white select-none"
        >
          Gradia
        </span>
      )}
    </div>
  );
}