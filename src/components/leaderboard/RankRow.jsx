// ------------------------------------------------------------------
// RankRow.jsx
// Renders a single row in the leaderboard list.
// Handles #1 / #2 / #3 medals, "You" highlight, and school badge.
//
// Props:
//   rank         {number}  — 1-based rank
//   displayName  {string}
//   school       {string}  — "UI" | "UNILAG" | "OAU"
//   avgScore     {number}  — 0–100 percentage
//   bestScore    {number}  — highest single test score
//   totalTests   {number}
//   isCurrentUser {bool}   — highlights the row if it's "you"
//   animDelay    {number}  — ms delay for stagger entrance animation
//
// Usage:
//   {entries.map((e, i) => (
//     <RankRow
//       key={e.userId}
//       rank={e.rank}
//       displayName={e.displayName}
//       school={e.school}
//       avgScore={e.avgScore}
//       bestScore={e.bestScore}
//       totalTests={e.totalTests}
//       isCurrentUser={e.userId === user?.id}
//       animDelay={i * 40}
//     />
//   ))}
// ------------------------------------------------------------------

const MEDALS = {
  1: { emoji: "🥇", color: "#b8860b", bg: "rgba(212,175,55,0.12)", border: "rgba(212,175,55,0.35)", glow: "rgba(212,175,55,0.2)" },
  2: { emoji: "🥈", color: "#7a8a9a", bg: "rgba(192,192,210,0.12)", border: "rgba(192,192,210,0.35)", glow: "rgba(192,192,192,0.15)" },
  3: { emoji: "🥉", color: "#9a6b4b", bg: "rgba(205,127,50,0.12)", border: "rgba(205,127,50,0.3)",  glow: "rgba(205,127,50,0.15)" },
};

const SCHOOL_STYLES = {
  UI:     { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  UNILAG: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  OAU:    { bg: "#dcfce7", color: "#14532d", dot: "#16a34a" },
};

function ScoreBar({ value }) {
  return (
    <div style={{
      height: "4px", borderRadius: "4px",
      background: "rgba(90,158,72,0.12)",
      overflow: "hidden", width: "100%",
    }}>
      <div style={{
        height: "100%",
        width: `${Math.min(value, 100)}%`,
        borderRadius: "4px",
        background: value >= 70
          ? "linear-gradient(90deg,#5a9e48,#3d7830)"
          : value >= 50
          ? "linear-gradient(90deg,#f59e0b,#d97706)"
          : "linear-gradient(90deg,#ef4444,#dc2626)",
        transition: "width 0.8s cubic-bezier(.22,1,.36,1)",
      }} />
    </div>
  );
}

export default function RankRow({
  rank          = 0,
  displayName   = "Student",
  school        = "UI",
  avgScore      = 0,
  bestScore     = 0,
  totalTests    = 0,
  isCurrentUser = false,
  animDelay     = 0,
}) {
  const medal      = MEDALS[rank];
  const schoolStyle = SCHOOL_STYLES[school] ?? SCHOOL_STYLES.UI;
  const isMedal    = rank <= 3;

  // Avatar initials
  const initials = displayName
    .split(" ")
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  // Avatar background colour derived from name (consistent per user)
  const hue = (displayName.charCodeAt(0) * 37 + (displayName.charCodeAt(1) ?? 0) * 13) % 360;
  const avatarBg = `hsl(${hue}, 50%, ${isCurrentUser ? "38%" : "45%"})`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        @keyframes row-in {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .rank-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 16px;
          border: 1.5px solid transparent;
          position: relative;
          cursor: default;
          transition: box-shadow 0.2s, transform 0.15s;
          font-family: 'Plus Jakarta Sans', sans-serif;
          animation: row-in 0.4s ease both;
          background: #fff;
        }
        .rank-row:hover {
          transform: translateX(2px);
          box-shadow: 0 4px 18px rgba(40,100,20,0.08);
        }
        @media (prefers-color-scheme: dark) {
          .rank-row { background: #111e0f; }
        }

        /* Medal rows */
        .rank-row.rank-1 { box-shadow: 0 2px 16px rgba(212,175,55,0.15); }
        .rank-row.rank-2 { box-shadow: 0 2px 12px rgba(192,192,210,0.12); }
        .rank-row.rank-3 { box-shadow: 0 2px 12px rgba(205,127,50,0.12); }

        /* "You" row */
        .rank-row.is-me {
          border-color: rgba(90,158,72,0.5) !important;
          background: linear-gradient(135deg, rgba(90,158,72,0.06), rgba(61,120,48,0.04)) !important;
        }
        @media (prefers-color-scheme: dark) {
          .rank-row.is-me { background: rgba(90,158,72,0.1) !important; }
        }

        /* Rank number column */
        .rank-num-col {
          width: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .rank-medal-emoji { font-size: 20px; line-height: 1; }
        .rank-plain-num {
          font-size: 13px;
          font-weight: 700;
          color: #9ab88a;
          font-family: 'Playfair Display', serif;
        }

        /* Avatar */
        .rank-avatar {
          width: 38px; height: 38px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.03em;
          position: relative;
        }
        .rank-avatar.is-me::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          border: 2px solid #5a9e48;
        }

        /* Middle info */
        .rank-info { flex: 1; min-width: 0; }
        .rank-name {
          font-size: 13.5px;
          font-weight: 700;
          color: #1a3312;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
          margin-bottom: 3px;
        }
        @media (prefers-color-scheme: dark) { .rank-name { color: #d8f0c8; } }
        .rank-name.is-me { color: #2d6020; }
        @media (prefers-color-scheme: dark) { .rank-name.is-me { color: #7ac86a; } }

        .rank-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 4px;
        }
        .school-pill {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 9.5px;
          font-weight: 600;
          padding: 1px 7px;
          border-radius: 20px;
        }
        .school-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
        }
        .test-count {
          font-size: 10px;
          color: #9ab88a;
          font-weight: 500;
        }

        /* You tag */
        .you-tag {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .06em;
          background: linear-gradient(135deg, #5a9e48, #3d7830);
          color: #fff;
          padding: 1px 6px;
          border-radius: 20px;
        }

        /* Right score column */
        .rank-score-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
          flex-shrink: 0;
          min-width: 52px;
        }
        .rank-avg {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 18px;
          font-weight: 700;
          line-height: 1;
          color: #1a3312;
        }
        @media (prefers-color-scheme: dark) { .rank-avg { color: #d8f0c8; } }
        .rank-avg-unit {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          color: #9ab88a;
          margin-left: 1px;
        }
        .rank-best {
          font-size: 9.5px;
          color: #9ab88a;
          font-weight: 500;
        }
      `}</style>

      <div
        className={`rank-row rank-${rank} ${isCurrentUser ? "is-me" : ""}`}
        style={{
          animationDelay: `${animDelay}ms`,
          borderColor: isMedal ? medal.border : isCurrentUser ? undefined : "rgba(90,158,72,0.1)",
          background: isMedal && !isCurrentUser ? medal.bg : undefined,
        }}
      >
        {/* Rank number / medal */}
        <div className="rank-num-col">
          {isMedal
            ? <span className="rank-medal-emoji">{medal.emoji}</span>
            : <span className="rank-plain-num">#{rank}</span>
          }
        </div>

        {/* Avatar */}
        <div
          className={`rank-avatar ${isCurrentUser ? "is-me" : ""}`}
          style={{ background: avatarBg }}
          aria-hidden="true"
        >
          {initials || "?"}
        </div>

        {/* Info */}
        <div className="rank-info">
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <p className={`rank-name ${isCurrentUser ? "is-me" : ""}`}>
              {displayName}
            </p>
            {isCurrentUser && <span className="you-tag">You</span>}
          </div>

          <div className="rank-meta">
            <span
              className="school-pill"
              style={{ background: schoolStyle.bg, color: schoolStyle.color }}
            >
              <span className="school-dot" style={{ background: schoolStyle.dot }} />
              {school}
            </span>
            <span className="test-count">{totalTests} test{totalTests !== 1 ? "s" : ""}</span>
          </div>

          {/* Score bar */}
          <ScoreBar value={avgScore} />
        </div>

        {/* Score */}
        <div className="rank-score-col">
          <div>
            <span className="rank-avg">{avgScore}</span>
            <span className="rank-avg-unit">%</span>
          </div>
          <span className="rank-best">best {bestScore}%</span>
        </div>
      </div>
    </>
  );
}