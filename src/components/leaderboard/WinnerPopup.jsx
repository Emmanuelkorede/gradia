// ------------------------------------------------------------------
// WinnerPopup.jsx
// Shown on login when the user is a top-10 weekly winner and
// hasn't claimed their popup yet (claimed_status = false).
//
// Features:
//   • Confetti particle animation (CSS only)
//   • Trophy + rank display
//   • WhatsApp share button
//   • Updates claimed_status in Supabase on close
//
// Props:
//   isOpen       {bool}
//   rank         {number}   — the user's weekly rank (1–10)
//   displayName  {string}
//   avgScore     {number}   — their average score this week
//   winnerId     {string}   — weekly_winners.id to mark claimed
//   onClose      {fn}
//
// Usage (in App.jsx or HomePage, check after login):
//   <WinnerPopup
//     isOpen={showWinnerPopup}
//     rank={weeklyRank}
//     displayName={profile.display_name}
//     avgScore={weeklyAvg}
//     winnerId={winnerRowId}
//     onClose={() => setShowWinnerPopup(false)}
//   />
// ------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

// ── Rank copy ─────────────────────────────────────────────────────
const RANK_COPY = {
  1: { trophy: "🏆", title: "You're #1 This Week!", sub: "Absolute legend. You topped every student on Gradia." },
  2: { trophy: "🥈", title: "Silver Finish! 🎉",   sub: "So close to the top. One more push next week!" },
  3: { trophy: "🥉", title: "Top 3 Finish! 🔥",    sub: "You're in the elite. Keep that momentum going." },
};
const DEFAULT_COPY = (r) => ({
  trophy: "⭐",
  title:  `Top ${r} This Week!`,
  sub:    "You cracked the top 10. Your grind is paying off!",
});

const WHATSAPP_MESSAGE = (name, rank, score) =>
  `🎓 I just ranked *#${rank}* on Gradia this week with a ${score}% average score!\n\nGradia is the smartest way to prep for Post-UTME (UI, UNILAG & OAU).\n\nJoin me 👉 https://gradia.app`;

// ── Confetti particle ────────────────────────────────────────────
const CONFETTI_COLORS = [
  "#5a9e48","#7ac86a","#c8e88a","#3d7830",
  "#f59e0b","#ef4444","#3b82f6","#a855f7","#ffffff",
];

function Confetti() {
  const particles = Array.from({ length: 38 }, (_, i) => ({
    id:    i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left:  `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.2}s`,
    dur:   `${1.8 + Math.random() * 1.4}s`,
    size:  `${6 + Math.random() * 7}px`,
    rotate:`${Math.random() * 360}deg`,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit" }}>
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(320px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position:        "absolute",
            top:             "-10px",
            left:            p.left,
            width:           p.size,
            height:          p.size,
            borderRadius:    Math.random() > 0.5 ? "50%" : "2px",
            background:      p.color,
            animation:       `confetti-fall ${p.dur} ${p.delay} ease-in forwards`,
            transform:       `rotate(${p.rotate})`,
          }}
        />
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function WinnerPopup({
  isOpen      = false,
  rank        = 1,
  displayName = "Champion",
  avgScore    = 0,
  winnerId    = null,
  onClose,
}) {
  const copy        = RANK_COPY[rank] ?? DEFAULT_COPY(rank);
  const [claimed, setClaimed] = useState(false);
  const [sharing, setSharing] = useState(false);
  const hasClaimed  = useRef(false);

  // Lock scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else        document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const h = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen]); // eslint-disable-line

  async function handleClose() {
    // Mark claimed_status = true in weekly_winners (only once)
    if (winnerId && !hasClaimed.current) {
      hasClaimed.current = true;
      setClaimed(true);
      try {
        await supabase
          .from("weekly_winners")
          .update({ claimed_status: true })
          .eq("id", winnerId);
      } catch (err) {
        console.error("Failed to mark winner claimed:", err.message);
      }
    }
    onClose?.();
  }

  function handleWhatsApp() {
    setSharing(true);
    const msg     = encodeURIComponent(WHATSAPP_MESSAGE(displayName, rank, avgScore));
    const waUrl   = `https://wa.me/?text=${msg}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => setSharing(false), 1500);
  }

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        /* ── Backdrop ───────────────────────────────────────────── */
        .wp-backdrop {
          position: fixed; inset: 0; z-index: 80;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          background: rgba(5,20,5,0.7);
          backdrop-filter: blur(8px);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ── Card ───────────────────────────────────────────────── */
        @keyframes wp-in {
          0%   { transform: translateY(40px) scale(0.9); opacity: 0; }
          60%  { transform: translateY(-6px)  scale(1.02); opacity: 1; }
          100% { transform: translateY(0)     scale(1); }
        }
        .wp-card {
          position: relative;
          width: 100%;
          max-width: 360px;
          border-radius: 28px;
          overflow: hidden;
          animation: wp-in 0.6s cubic-bezier(.22,1,.36,1) forwards;
          background: linear-gradient(160deg, #0d2c08 0%, #1a4a10 40%, #0f3508 100%);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow:
            0 0 0 1px rgba(90,200,72,0.2),
            0 20px 60px rgba(0,0,0,0.5),
            0 0 80px rgba(90,158,72,0.15);
        }

        /* Mesh glow layers */
        .wp-glow-1 {
          position: absolute; top: -60px; left: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(90,200,72,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .wp-glow-2 {
          position: absolute; bottom: -40px; right: -40px;
          width: 180px; height: 180px; border-radius: 50%;
          background: radial-gradient(circle, rgba(61,120,48,0.3) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Close button ─────────────────────────────────────── */
        .wp-close {
          position: absolute;
          top: 14px; right: 14px; z-index: 10;
          width: 30px; height: 30px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: rgba(255,255,255,0.7);
          transition: background 0.2s;
        }
        .wp-close:hover { background: rgba(255,255,255,0.18); }

        /* ── Inner content ────────────────────────────────────── */
        .wp-inner {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 36px 24px 28px;
          text-align: center;
        }

        /* Trophy */
        @keyframes trophy-bounce {
          0%,100% { transform: translateY(0) rotate(-3deg); }
          50%     { transform: translateY(-8px) rotate(3deg); }
        }
        .wp-trophy {
          font-size: 62px;
          line-height: 1;
          margin-bottom: 4px;
          animation: trophy-bounce 2.2s ease-in-out infinite;
          display: block;
          filter: drop-shadow(0 4px 16px rgba(212,175,55,0.5));
        }

        /* Rank badge */
        .wp-rank-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 20px;
          padding: 3px 12px;
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.85);
          letter-spacing: .07em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .rank-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #7ac86a;
        }

        /* Title */
        .wp-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 24px;
          font-weight: 900;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .wp-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          line-height: 1.6;
          margin-bottom: 20px;
          max-width: 260px;
        }

        /* Score pill */
        .wp-score-pill {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 16px;
          padding: 12px 24px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .wp-score-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
        }
        .wp-score-val {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 36px;
          font-weight: 900;
          color: #7ac86a;
          line-height: 1;
        }
        .wp-score-unit {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          margin-left: 2px;
        }

        /* Buttons */
        .wp-btn-wa {
          width: 100%;
          background: #25d366;
          border: none;
          border-radius: 15px;
          padding: 15px;
          font-size: 14px;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #fff;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-bottom: 10px;
          box-shadow: 0 4px 20px rgba(37,211,102,0.35);
          transition: all 0.2s;
          letter-spacing: 0.01em;
        }
        .wp-btn-wa:hover { background: #20c05c; box-shadow: 0 6px 24px rgba(37,211,102,0.45); transform: translateY(-1px); }
        .wp-btn-wa:active { transform: scale(0.98); }
        .wp-btn-wa:disabled { opacity: 0.7; cursor: default; }

        .wp-btn-dismiss {
          width: 100%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 15px;
          padding: 13px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: background 0.2s;
        }
        .wp-btn-dismiss:hover { background: rgba(255,255,255,0.13); color: rgba(255,255,255,0.85); }

        /* Bottom name */
        .wp-name-line {
          position: absolute;
          top: 14px; left: 14px;
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.04em;
        }
      `}</style>

      <div className="wp-backdrop" onClick={(e) => { if (e.target.classList.contains("wp-backdrop")) handleClose(); }}>
        <div className="wp-card">
          {/* Background glows */}
          <div className="wp-glow-1" />
          <div className="wp-glow-2" />

          {/* Confetti */}
          <Confetti />

          {/* Close */}
          <button className="wp-close" onClick={handleClose} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Name watermark */}
          <span className="wp-name-line">{displayName}</span>

          <div className="wp-inner">
            {/* Trophy */}
            <span className="wp-trophy">{copy.trophy}</span>

            {/* Rank badge */}
            <div className="wp-rank-badge">
              <div className="rank-badge-dot" />
              Week #{rank} on Gradia
            </div>

            {/* Title */}
            <h2 className="wp-title">{copy.title}</h2>
            <p className="wp-sub">{copy.sub}</p>

            {/* Score pill */}
            <div className="wp-score-pill">
              <span className="wp-score-label">Weekly Average Score</span>
              <div>
                <span className="wp-score-val">{avgScore}</span>
                <span className="wp-score-unit">%</span>
              </div>
            </div>

            {/* WhatsApp share */}
            <button className="wp-btn-wa" onClick={handleWhatsApp} disabled={sharing}>
              {/* WhatsApp logo */}
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="16" fill="#25d366"/>
                <path fill="#fff" d="M22.5 9.5A9.4 9.4 0 006.7 20.6L5 27l6.6-1.7A9.4 9.4 0 0022.5 9.5zm-6.5 14.4a7.8 7.8 0 01-4-1.1l-.3-.2-3.9 1 1-3.8-.2-.3a7.8 7.8 0 1114.3-4.4 7.8 7.8 0 01-6.9 8.8zm4.3-5.8c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.8.9-.3.1-.5 0a6.3 6.3 0 01-1.9-1.2 7 7 0 01-1.3-1.6c-.1-.3 0-.4.1-.5l.4-.5.2-.3v-.3l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.8 11.9 11.9 0 004.5 4 5 5 0 002.1.5 2.7 2.7 0 001.8-.8 2.3 2.3 0 00.5-1.4c0-.2-.3-.4-.5-.5z"/>
              </svg>
              {sharing ? "Opening WhatsApp…" : "Share on WhatsApp 🎉"}
            </button>

            {/* Dismiss */}
            <button className="wp-btn-dismiss" onClick={handleClose}>
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </>
  );
}